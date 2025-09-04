import { type NodeConfig, NodeType, type WorkflowTemplate } from './types';
import { MessageSquare, Database, BrainCircuit, Play, Code, Link, GitFork, Image, CaseSensitive, Share2, Combine, StickyNote } from 'lucide-react';

export const NODE_CONFIG: Record<NodeType, NodeConfig> = {
  [NodeType.UserQuery]: {
    type: NodeType.UserQuery,
    label: 'User Query',
    description: 'Input for the user\'s question.',
    Icon: MessageSquare,
    color: 'bg-blue-500',
    initialData: { query: 'What is the capital of France?' },
  },
  [NodeType.DataLoader]: {
    type: NodeType.DataLoader,
    label: 'Data Loader',
    description: 'Load data from a URL or source.',
    Icon: Link,
    color: 'bg-orange-500',
    initialData: { sourceUrl: 'https://example.com/data.txt' },
  },
  [NodeType.KnowledgeBase]: {
    type: NodeType.KnowledgeBase,
    label: 'Knowledge Base',
    description: 'Upload documents for context.',
    Icon: Database,
    color: 'bg-yellow-500',
    initialData: { files: [] },
  },
  [NodeType.LLMEngine]: {
    type: NodeType.LLMEngine,
    label: 'LLM Engine',
    description: 'The AI model to process the query.',
    Icon: BrainCircuit,
    color: 'bg-purple-500',
    initialData: { model: 'gemini-2.5-flash', useWebSearch: false },
  },
  [NodeType.ImageGenerator]: {
    type: NodeType.ImageGenerator,
    label: 'Image Generator',
    description: 'Generate an image from a prompt.',
    Icon: Image,
    color: 'bg-pink-500',
    initialData: { prompt: 'A cute cat wearing a wizard hat.', model: 'imagen-4.0-generate-001' },
  },
  [NodeType.TextFormatter]: {
    type: NodeType.TextFormatter,
    label: 'Text Formatter',
    description: 'Formats text using a template.',
    Icon: CaseSensitive,
    color: 'bg-indigo-500',
    initialData: { template: 'Result: {{input}}' },
  },
  [NodeType.Join]: {
    type: NodeType.Join,
    label: 'Join',
    description: 'Merges multiple text inputs into one.',
    Icon: Combine,
    color: 'bg-sky-500',
    initialData: { separator: '\\n' },
  },
   [NodeType.Distributor]: {
    type: NodeType.Distributor,
    label: 'Distributor',
    description: 'Sends the same input to multiple outputs.',
    Icon: Share2,
    color: 'bg-cyan-500',
    initialData: {},
  },
  [NodeType.Code]: {
    type: NodeType.Code,
    label: 'Code Snippet',
    description: 'Run custom JavaScript code.',
    Icon: Code,
    color: 'bg-gray-500',
    initialData: { script: 'console.log(input);' },
  },
  [NodeType.Router]: {
    type: NodeType.Router,
    label: 'Router',
    description: 'Branch workflow based on a condition.',
    Icon: GitFork,
    color: 'bg-teal-500',
    initialData: { condition: 'input.includes("success")' },
  },
   [NodeType.Note]: {
    type: NodeType.Note,
    label: 'Note',
    description: 'Add a comment to your workflow.',
    Icon: StickyNote,
    color: 'bg-amber-400',
    initialData: { text: 'This is a note.' },
  },
  [NodeType.Output]: {
    type: NodeType.Output,
    label: 'Output',
    description: 'Displays the chat response.',
    Icon: Play,
    color: 'bg-green-500',
    initialData: { messages: [] },
  },
};

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    name: 'Simple Q&A',
    description: 'A basic question-answering workflow.',
    workflow: {
      name: 'Simple Q&A',
      nodes: [
        { id: '1', type: NodeType.UserQuery, position: { x: 50, y: 100 }, data: { query: 'Explain quantum computing in simple terms.' } },
        { id: '2', type: NodeType.LLMEngine, position: { x: 400, y: 100 }, data: { model: 'gemini-2.5-flash', useWebSearch: true } },
        { id: '3', type: NodeType.Output, position: { x: 750, y: 50 }, data: { messages: [] } },
      ],
      edges: [{ id: 'e1-2', source: '1', target: '2' }, { id: 'e2-3', source: '2', target: '3' }],
    }
  },
  {
    name: 'RAG Pipeline',
    description: 'Answer questions using a knowledge base.',
    workflow: {
       name: 'RAG Pipeline',
       nodes: [
        { id: '1', type: NodeType.UserQuery, position: { x: 50, y: 50 }, data: { query: 'Based on the context provided, what is the main conclusion?' } },
        { id: '2', type: NodeType.KnowledgeBase, position: { x: 50, y: 200 }, data: { files: [] } },
        { id: '3', type: NodeType.LLMEngine, position: { x: 400, y: 125 }, data: { model: 'gemini-2.5-flash', useWebSearch: true } },
        { id: '4', type: NodeType.Output, position: { x: 750, y: 75 }, data: { messages: [] } },
      ],
      edges: [
        { id: 'e1-3', source: '1', target: '3' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' },
      ],
    }
  },
   {
    name: 'Web Search Assistant',
    description: 'Get up-to-date answers from the web.',
    workflow: {
      name: 'Web Search Assistant',
      nodes: [
        { id: '1', type: NodeType.UserQuery, position: { x: 50, y: 100 }, data: { query: 'What are the latest developments in AI?' } },
        { id: '2', type: NodeType.LLMEngine, position: { x: 400, y: 100 }, data: { model: 'gemini-2.5-flash', useWebSearch: true } },
        { id: '3', type: NodeType.Output, position: { x: 750, y: 50 }, data: { messages: [] } },
      ],
      edges: [{ id: 'e1-2', source: '1', target: '2' }, { id: 'e2-3', source: '2', target: '3' }],
    }
  },
  {
    name: 'Text-to-Image Generation',
    description: 'Generate an image from a text prompt.',
    workflow: {
       name: 'Text-to-Image Generation',
       nodes: [
        { id: '1', type: NodeType.UserQuery, position: { x: 50, y: 100 }, data: { query: 'A photorealistic image of a majestic lion in the savanna at sunset.' } },
        { id: '2', type: NodeType.ImageGenerator, position: { x: 400, y: 100 }, data: { prompt: '', model: 'imagen-4.0-generate-001' } },
        { id: '3', type: NodeType.Output, position: { x: 750, y: 50 }, data: { messages: [] } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
      ],
    }
  },
   {
    name: 'Conditional Response',
    description: 'Route the workflow based on input.',
    workflow: {
      name: 'Conditional Response',
      nodes: [
        { id: '1', type: NodeType.UserQuery, position: { x: 50, y: 150 }, data: { query: 'I had a wonderful day today!' } },
        { id: '2', type: NodeType.Router, position: { x: 350, y: 150 }, data: { condition: "input.toLowerCase().includes('wonderful') || input.toLowerCase().includes('happy') || input.toLowerCase().includes('great')" } },
        { id: '3', type: NodeType.TextFormatter, position: { x: 650, y: 50 }, data: { template: 'That\'s great to hear! I am glad you had a good day. 😊' } },
        { id: '4', type: NodeType.TextFormatter, position: { x: 650, y: 250 }, data: { template: 'I\'m sorry to hear that. I hope things get better soon. 🙁' } },
        { id: '5', type: NodeType.Output, position: { x: 950, y: 50 }, data: { messages: [] } },
        { id: '6', type: NodeType.Output, position: { x: 950, y: 250 }, data: { messages: [] } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3', sourceHandle: 'true' },
        { id: 'e2-4', source: '2', target: '4', sourceHandle: 'false' },
        { id: 'e3-5', source: '3', target: '5' },
        { id: 'e4-6', source: '4', target: '6' },
      ],
    }
  },
   {
    name: 'Multi-Analysis',
    description: 'Use a Distributor to perform multiple tasks on one input.',
    workflow: {
       name: 'Multi-Analysis',
       nodes: [
        { id: '1', type: NodeType.UserQuery, position: { x: 0, y: 150 }, data: { query: 'Write a short story about a space explorer named Kaelen who discovers an ancient alien artifact.' } },
        { id: '2', type: NodeType.LLMEngine, position: { x: 300, y: 150 }, data: { model: 'gemini-2.5-flash', useWebSearch: true } },
        { id: '3', type: NodeType.Distributor, position: { x: 600, y: 150 }, data: {} },
        { id: '4', type: NodeType.TextFormatter, position: { x: 850, y: 50 }, data: { template: 'Summarize the following story in one paragraph:\n\n{{input}}' } },
        { id: '5', type: NodeType.TextFormatter, position: { x: 850, y: 250 }, data: { template: 'List the main characters in the following story:\n\n{{input}}' } },
        { id: '6', type: NodeType.LLMEngine, position: { x: 1150, y: 50 }, data: { model: 'gemini-2.5-flash', useWebSearch: true } },
        { id: '7', type: NodeType.LLMEngine, position: { x: 1150, y: 250 }, data: { model: 'gemini-2.5-flash', useWebSearch: true } },
        { id: '8', type: NodeType.Output, position: { x: 1450, y: 0 }, data: { messages: [] } },
        { id: '9', type: NodeType.Output, position: { x: 1450, y: 200 }, data: { messages: [] } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4', sourceHandle: '1' },
        { id: 'e3-5', source: '3', target: '5', sourceHandle: '2' },
        { id: 'e4-6', source: '4', target: '6' },
        { id: 'e5-7', source: '5', target: '7' },
        { id: 'e6-8', source: '6', target: '8' },
        { id: 'e7-9', source: '7', target: '9' },
      ],
    }
  },
  {
    name: 'JSON Data Extraction',
    description: 'Extract structured JSON from text and process it.',
    workflow: {
       name: 'JSON Data Extraction',
       nodes: [
        { id: '1', type: NodeType.UserQuery, position: { x: 50, y: 150 }, data: { query: "From the text below, extract the user's name, email, and company. Respond with ONLY a valid JSON object with the keys \"name\", \"email\", and \"company\".\n\nText: 'Contact Jane Smith, the project manager at Quantum Solutions, at j.smith@quantum-solutions.dev for a follow-up.'" } },
        { id: '2', type: NodeType.LLMEngine, position: { x: 350, y: 100 }, data: { model: 'gemini-2.5-flash', useWebSearch: true } },
        { id: '3', type: NodeType.Code, position: { x: 600, y: 150 }, data: { script: "// Parses the JSON from the input and returns the user's email.\n// The 'input' variable holds the text from the previous node.\ntry {\n  const cleanInput = input.replace(/```json|```/g, '');\n  const data = JSON.parse(cleanInput);\n  return `User Email: ${data.email}`;\n} catch (e) {\n  return 'Error processing JSON: ' + e.message;\n}" } },
        { id: '4', type: NodeType.Output, position: { x: 850, y: 100 }, data: { messages: [] } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' },
      ],
    }
  },
  {
    name: 'Process and Combine',
    description: 'Use the Join node to merge two inputs.',
     workflow: {
       name: 'Process and Combine',
       nodes: [
        { id: '1', type: NodeType.UserQuery, position: { x: 50, y: 50 }, data: { query: 'Part 1: The brave knight' } },
        { id: '2', type: NodeType.UserQuery, position: { x: 50, y: 200 }, data: { query: 'Part 2: rode a valiant steed.' } },
        { id: '3', type: NodeType.Join, position: { x: 350, y: 125 }, data: { separator: ' ' } },
        { id: '4', type: NodeType.LLMEngine, position: { x: 650, y: 125 }, data: { model: 'gemini-2.5-flash', useWebSearch: true } },
        { id: '5', type: NodeType.Output, position: { x: 950, y: 125 }, data: { messages: [] } },
      ],
      edges: [
        { id: 'e1-3', source: '1', target: '3', targetHandle: 'a' },
        { id: 'e2-3', source: '2', target: '3', targetHandle: 'b' },
        { id: 'e3-4', source: '3', target: '4' },
        { id: 'e4-5', source: '4', target: '5' },
      ],
    }
  },
  {
    name: 'Creative Story & Image',
    description: 'Generate a story and then create a detailed prompt to generate a matching image.',
    workflow: {
      name: 'Creative Story & Image',
      nodes: [
        { id: '1', type: NodeType.UserQuery, position: { x: 0, y: 150 }, data: { query: 'A mysterious, glowing forest at midnight' } },
        { id: '2', type: NodeType.TextFormatter, position: { x: 250, y: 150 }, data: { template: 'Generate a short, one-paragraph story based on this theme: {{input}}' } },
        { id: '3', type: NodeType.LLMEngine, position: { x: 500, y: 150 }, data: { model: 'gemini-2.5-flash', useWebSearch: true } },
        { id: '4', type: NodeType.Distributor, position: { x: 750, y: 150 }, data: {} },
        { id: '5', type: NodeType.Output, position: { x: 1000, y: 0 }, data: { messages: [] } },
        { id: '6', type: NodeType.TextFormatter, position: { x: 1000, y: 225 }, data: { template: 'Create a visually striking and descriptive prompt for an image generator based on the following story: {{input}}' } },
        { id: '7', type: NodeType.LLMEngine, position: { x: 1250, y: 225 }, data: { model: 'gemini-2.5-flash', useWebSearch: true } },
        { id: '8', type: NodeType.ImageGenerator, position: { x: 1500, y: 225 }, data: { prompt: '', model: 'imagen-4.0-generate-001' } },
        { id: '9', type: NodeType.Output, position: { x: 1750, y: 150 }, data: { messages: [] } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' },
        { id: 'e4-5', source: '4', target: '5', sourceHandle: '1' },
        { id: 'e4-6', source: '4', target: '6', sourceHandle: '2' },
        { id: 'e6-7', source: '6', target: '7' },
        { id: 'e7-8', source: '7', target: '8' },
        { id: 'e8-9', source: '8', target: '9' },
      ],
    }
  },
  {
    name: 'Job Application Customizer',
    description: 'Generates a professional summary based on a resume and a target job role.',
    workflow: {
       name: 'Job Application Customizer',
       nodes: [
        { id: '1', type: NodeType.UserQuery, position: { x: 50, y: 50 }, data: { query: 'Senior Frontend Engineer' } },
        { id: '2', type: NodeType.KnowledgeBase, position: { x: 50, y: 200 }, data: { files: [] } },
        { id: '3', type: NodeType.Join, position: { x: 350, y: 125 }, data: { separator: '\\n---\\n' } },
        { id: '4', type: NodeType.TextFormatter, position: { x: 600, y: 125 }, data: { template: "Based on the resume context and target role provided below, write a 2-3 sentence professional summary for a job application.\n\n{{input}}" } },
        { id: '5', type: NodeType.LLMEngine, position: { x: 850, y: 125 }, data: { model: 'gemini-2.5-flash', useWebSearch: true } },
        { id: '6', type: NodeType.Output, position: { x: 1100, y: 75 }, data: { messages: [] } },
      ],
      edges: [
        { id: 'e1-3', source: '1', target: '3', targetHandle: 'a' },
        { id: 'e2-3', source: '2', target: '3', targetHandle: 'b' },
        { id: 'e3-4', source: '3', target: '4' },
        { id: 'e4-5', source: '4', target: '5' },
        { id: 'e5-6', source: '5', target: '6' },
      ],
    }
  }
];