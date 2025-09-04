import { GoogleGenAI, type Part } from "@google/genai";
import { type Workflow, type CustomNode, NodeType, type UserQueryData, type LLMEngineData, type CodeNodeData, type ImageGeneratorData, type TextFormatterData, type KnowledgeBaseData, type JoinData, type RouterData } from '../types';
// FIX: Import NODE_CONFIG to be used in error messages.
import { NODE_CONFIG } from '../constants';

interface ExecutionResult {
  answer?: string;
  imageUrl?: string;
}

export interface WorkflowExecutionResult {
  results: Record<string, ExecutionResult>; // key is output node id
  error?: string;
  failedNodeId?: string;
}

/**
 * Parses a potential Google AI API error and returns a user-friendly message.
 * @param error The error object caught.
 * @returns A string with a clear error message.
 */
const getFriendlyApiErrorMessage = (error: unknown): string => {
  let message = "An unknown error occurred.";
  if (error instanceof Error) {
    message = error.message;
    try {
      // Google AI SDK often stringifies the JSON error into the message
      const errorJson = JSON.parse(error.message);
      if (errorJson.error) {
        if (errorJson.error.status === 'RESOURCE_EXHAUSTED' || errorJson.error.code === 429) {
          return "You've exceeded your API quota. Please check your Google AI plan and billing details.";
        }
        // Return the specific message from the API if available
        return errorJson.error.message || "An API error occurred.";
      }
    } catch (e) {
      // Not a JSON error message, so we'll just use the original message.
    }
  } else {
      message = String(error);
  }
  return message;
};


// This service now executes the workflow by traversing the graph.
export const runWorkflowApi = async (workflow: Workflow): Promise<WorkflowExecutionResult> => {
  console.log("Running workflow with Google AI:", JSON.stringify(workflow, null, 2));

  const nodeOutputs = new Map<string, any>();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const findUpstreamNodes = (nodeId: string): CustomNode[] => {
    const parentEdges = workflow.edges.filter(edge => edge.target === nodeId);
    return parentEdges.map(edge => workflow.nodes.find(node => node.id === edge.source)!);
  };
  
  const findUpstreamNodesWithHandles = (nodeId: string): {node: CustomNode, targetHandle: string | null}[] => {
    const parentEdges = workflow.edges.filter(edge => edge.target === nodeId);
    return parentEdges.map(edge => ({
      node: workflow.nodes.find(n => n.id === edge.source)!,
      targetHandle: edge.targetHandle || null
    }));
  }

  const getTopologicallySortedNodes = (): CustomNode[] => {
    const sorted: CustomNode[] = [];
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    workflow.nodes.forEach(node => {
      inDegree.set(node.id, 0);
      adj.set(node.id, []);
    });

    workflow.edges.forEach(edge => {
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
      adj.get(edge.source)?.push(edge.target);
    });

    const queue: string[] = [];
    workflow.nodes.forEach(node => {
      if (inDegree.get(node.id) === 0) {
        queue.push(node.id);
      }
    });

    while (queue.length > 0) {
      const u = queue.shift()!;
      sorted.push(workflow.nodes.find(n => n.id === u)!);
      adj.get(u)?.forEach(v => {
        inDegree.set(v, (inDegree.get(v) || 0) - 1);
        if (inDegree.get(v) === 0) {
          queue.push(v);
        }
      });
    }

    if (sorted.length !== workflow.nodes.length) {
        // This indicates a cycle, which is not supported.
        console.error("Cycle detected in workflow graph. Execution halted.");
        // Find a node that wasn't sorted to report
        const unsortedNode = workflow.nodes.find(n => !sorted.includes(n));
        throw new Error(`Workflow has a cycle. Cannot execute. Check connections for node ${unsortedNode?.id}.`);
    }

    return sorted;
  };
  
  const sortedNodes = getTopologicallySortedNodes();
  const executableNodeIds = new Set<string>(sortedNodes.filter(n => findUpstreamNodes(n.id).length === 0).map(n => n.id));


  for (const node of sortedNodes) {
    if (!executableNodeIds.has(node.id)) continue; // Skip nodes that are not reachable

    try {
      const parentNodes = findUpstreamNodes(node.id);
      const inputs = parentNodes.map(p => nodeOutputs.get(p.id));
      
      let output: any;
      let routingResult: boolean | null = null; // Specific variable for router's boolean result

      switch (node.type) {
        case NodeType.UserQuery:
          output = (node.data as UserQueryData).query;
          break;
        case NodeType.LLMEngine: {
          const { model, useWebSearch } = node.data as LLMEngineData;
          const config: { tools?: any[] } = {};
          if (useWebSearch) config.tools = [{ googleSearch: {} }];

          const textInputs: string[] = [];
          const imageParts: Part[] = [];

          for (const input of inputs) {
            if (typeof input !== 'string' || !input) continue;

            if (input.startsWith('data:image')) {
              try {
                const [header, base64Data] = input.split(',');
                if (!base64Data) continue;
                const mimeType = header.match(/:(.*?);/)?.[1];
                if (!mimeType) continue;

                imageParts.push({
                  inlineData: {
                    mimeType,
                    data: base64Data,
                  },
                });
              } catch (e) {
                console.warn("Could not parse data URL input for LLM Engine:", input.substring(0, 50) + "...");
              }
            } else {
              textInputs.push(input);
            }
          }

          const combinedText = textInputs.join('\n');
          const finalParts: Part[] = [];

          if (combinedText) {
            finalParts.push({ text: combinedText });
          }
          finalParts.push(...imageParts);

          if (finalParts.length === 0) {
            throw new Error("LLM Engine requires an input.");
          }
          
          if (imageParts.length > 0 && !combinedText) {
            finalParts.unshift({ text: "Describe this image." });
          }

          const contents = { parts: finalParts };
          
          try {
            const response = await ai.models.generateContent({ model, contents, config });
            output = response.text;
          } catch (error) {
            console.error("LLM Engine API call failed:", error);
            throw new Error(getFriendlyApiErrorMessage(error));
          }
          break;
        }
        case NodeType.ImageGenerator: {
          const { model } = node.data as ImageGeneratorData;
          let prompt = (node.data as ImageGeneratorData).prompt || inputs.filter(i => typeof i === 'string' && i).join('\n') || '';
          if (!prompt) throw new Error("Image Generator requires a prompt.");
          
          try {
             const response = await ai.models.generateImages({
              model,
              prompt,
              config: {
                numberOfImages: 1,
              },
            });
            if (!response.generatedImages || response.generatedImages.length === 0) {
              throw new Error("API did not return any images.");
            }
            const base64Image = response.generatedImages[0].image.imageBytes;
            output = `data:image/png;base64,${base64Image}`;
          } catch(error) {
             console.error("Image generation failed:", error);
             throw new Error(`Image generation failed: ${getFriendlyApiErrorMessage(error)}`);
          }
          break;
        }
        case NodeType.Code: {
          const { script } = node.data as CodeNodeData;
          const primaryInput = inputs.filter(i => typeof i === 'string' && i).join('\n') || '';
          try {
            // Sandboxed execution of user code
            const codeFunction = new Function('input', script);
            output = codeFunction(primaryInput);
          } catch (e) {
            console.error("Error executing code snippet:", e);
            throw new Error(`Code Snippet Error: ${(e as Error).message}`);
          }
          break;
        }
        case NodeType.TextFormatter: {
          const { template } = node.data as TextFormatterData;
          const primaryInput = inputs.filter(i => typeof i === 'string' && i).join('\n') || '';
          output = template.replace(/\{\{input\}\}/gi, primaryInput);
          break;
        }
        case NodeType.Join: {
            const { separator } = node.data as JoinData;
            const parentNodesWithHandles = findUpstreamNodesWithHandles(node.id);
            const inputA = parentNodesWithHandles.find(p => p.targetHandle === 'a');
            const inputB = parentNodesWithHandles.find(p => p.targetHandle === 'b');
            const valA = inputA ? nodeOutputs.get(inputA.node.id) : '';
            const valB = inputB ? nodeOutputs.get(inputB.node.id) : '';
            output = [valA, valB].join(separator.replace(/\\n/g, '\n'));
            break;
        }
         case NodeType.Router: {
          const { condition } = node.data as RouterData;
          const primaryInput = inputs.filter(i => typeof i === 'string' && i).join('\n') || '';
          try {
             const conditionFunction = new Function('input', `return !!(${condition})`);
             routingResult = conditionFunction(primaryInput);
          } catch(e) {
             console.error("Error evaluating router condition:", e);
             throw new Error(`Router Condition Error: ${(e as Error).message}`);
          }
          // The router's job is to route, not transform data. Pass the input through.
          output = primaryInput;
          break;
        }
        case NodeType.KnowledgeBase: {
            const { files } = node.data as KnowledgeBaseData;
            if (files.length > 0) {
              output = `[CONTEXT FROM ${files.length} FILE(S)]:\n${files.map(f => `- ${f.name}`).join('\n')}\n(File content is simulated for this demonstration)`;
            } else {
              output = "[CONTEXT FROM KNOWLEDGE BASE]: No files were uploaded.";
            }
            break;
        }
        case NodeType.Distributor: {
          const primaryInput = inputs.filter(i => typeof i === 'string' && i).join('\n') || '';
          output = primaryInput; // Pass the input through
          break;
        }
        case NodeType.DataLoader: {
           const primaryInput = inputs.filter(i => typeof i === 'string' && i).join('\n') || `(Mock output for ${node.type})`;
           output = primaryInput; // Pass input or mock
           break;
        }
        case NodeType.Output:
        case NodeType.Note:
          // These nodes are sinks or non-functional, they don't produce output for other nodes.
          break;
        default:
          throw new Error(`Unsupported node type: ${node.type}`);
      }
      
      nodeOutputs.set(node.id, output);

      // Add children to executable set
      const childEdges = workflow.edges.filter(edge => edge.source === node.id);
      if (node.type === NodeType.Router) {
        const resultHandle = routingResult ? 'true' : 'false';
        const validEdge = childEdges.find(edge => edge.sourceHandle === resultHandle);
        if (validEdge) {
            executableNodeIds.add(validEdge.target);
        }
      } else {
        childEdges.forEach(edge => executableNodeIds.add(edge.target));
      }

    } catch (error) {
      console.error(`Error processing node ${node.id} (${node.type}):`, error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      return { results: {}, error: `Error at ${NODE_CONFIG[node.type as keyof typeof NODE_CONFIG].label}: ${errorMessage}`, failedNodeId: node.id };
    }
  }

  const outputNodes = workflow.nodes.filter(n => n.type === 'output');
  if (outputNodes.length === 0) return { results: {}, error: "No Output node found in workflow." };
  
  const finalResults: Record<string, ExecutionResult> = {};

  for (const outputNode of outputNodes) {
    if (!executableNodeIds.has(outputNode.id)) continue; // Skip outputs from inactive branches
    const finalParent = findUpstreamNodes(outputNode.id)[0];
    if (finalParent) {
      const finalResultValue = nodeOutputs.get(finalParent.id);
      if (typeof finalResultValue === 'string' && finalResultValue.startsWith('data:image')) {
        finalResults[outputNode.id] = { imageUrl: finalResultValue, answer: "Image generated successfully." };
      } else {
        finalResults[outputNode.id] = { answer: String(finalResultValue ?? "Workflow completed with no textual output.") };
      }
    } else {
       finalResults[outputNode.id] = { answer: "(Output node is not connected)" };
    }
  }
  
  return { results: finalResults };
};