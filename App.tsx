import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  MiniMap,
  Background,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type OnNodesDelete,
  type OnEdgesDelete,
} from '@reactflow/react';
import { Toaster, toast } from 'react-hot-toast';
import { ChevronUp, AlertTriangle } from 'lucide-react';

import Sidebar from './components/Sidebar';
import ConfigPanel from './components/ConfigPanel';
import Toolbar from './components/Toolbar';
import SignInModal from './components/SignInModal';
import ExecutionLogPanel from './components/ExecutionLogPanel';
import HelpChatModal from './components/HelpChatModal';
import WelcomeModal from './components/WelcomeModal';
import ApiConfigErrorModal from './components/ApiConfigErrorModal';
import EmptyCanvas from './components/EmptyCanvas';
import Button from './components/ui/Button';
import { runWorkflowApi } from './services/apiService';
import { exportToJson, exportToPng } from './utils/flowUtils';
import { NODE_CONFIG, WORKFLOW_TEMPLATES } from './constants';
import { NodeType, type CustomNode, type OutputData, type Message, type UserQueryData, type WorkflowTemplate, type ExecutionLog, type User, type HistoryEntry } from './types';

import UserQueryNode from './components/nodes/UserQueryNode';
import KnowledgeBaseNode from './components/nodes/KnowledgeBaseNode';
import LLMEngineNode from './components/nodes/LLMEngineNode';
import OutputNode from './components/nodes/OutputNode';
import CodeNode from './components/nodes/CodeNode';
import DataLoaderNode from './components/nodes/DataLoaderNode';
import ImageGeneratorNode from './components/nodes/ImageGeneratorNode';
import RouterNode from './components/nodes/RouterNode';
import TextFormatterNode from './components/nodes/TextFormatterNode';
import DistributorNode from './components/nodes/DistributorNode';
import JoinNode from './components/nodes/JoinNode';
import NoteNode from './components/nodes/NoteNode';

const initialWorkflow = WORKFLOW_TEMPLATES[0].workflow;

const useResponsiveLayout = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
};

const AppContent: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialWorkflow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialWorkflow.edges);
  const [workflowName, setWorkflowName] = useState(initialWorkflow.name);
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isWelcomeModalOpen, setWelcomeModalOpen] = useState(false);
  const [apiConfigError, setApiConfigError] = useState<string | null>(null);

  // Undo/Redo state
  const [history, setHistory] = useState<HistoryEntry[]>([{ ...initialWorkflow }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Responsive and collapsible states
  const isMobile = useResponsiveLayout();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isConfigPanelCollapsed, setConfigPanelCollapsed] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [isLogPanelOpen, setLogPanelOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runAttempted, setRunAttempted] = useState(false);

  const { screenToFlowPosition, setViewport, getViewport, fitView, deleteElements, getNodes, getEdges } = useReactFlow();
  
  const API_KEY = process.env.API_KEY;

  const nodeTypes = useMemo(() => ({
    userQuery: UserQueryNode, 
    knowledgeBase: KnowledgeBaseNode, 
    llmEngine: LLMEngineNode, 
    output: OutputNode, 
    code: CodeNode,
    dataLoader: DataLoaderNode,
    imageGenerator: ImageGeneratorNode,
    router: RouterNode,
    textFormatter: TextFormatterNode,
    distributor: DistributorNode,
    join: JoinNode,
    note: NoteNode,
  }), []);

  const takeSnapshot = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, { name: workflowName, nodes: getNodes(), edges: getEdges() }]);
    setHistoryIndex(newHistory.length);
  }, [history, historyIndex, getNodes, getEdges, workflowName]);

  const handleWorkflowNameChange = (newName: string) => {
    setWorkflowName(newName);
  };

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const { name, nodes: pastNodes, edges: pastEdges } = history[newIndex];
      setWorkflowName(name);
      setNodes(pastNodes);
      setEdges(pastEdges);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex, setNodes, setEdges]);
  
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const { name, nodes: futureNodes, edges: futureEdges } = history[newIndex];
      setWorkflowName(name);
      setNodes(futureNodes);
      setEdges(futureEdges);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex, setNodes, setEdges]);
  
  const danglingNodeIds = useMemo(() => {
    if (nodes.length === 0) return new Set<string>();
    const sourceIds = new Set(edges.map(e => e.source));
    const targetIds = new Set(edges.map(e => e.target));
    const dangling = new Set<string>();

    for (const node of nodes) {
        if (node.type === NodeType.Note) continue; // Notes don't need connections

        const hasIncomingEdge = targetIds.has(node.id);
        const hasOutgoingEdge = sourceIds.has(node.id);
        
        const config = NODE_CONFIG[node.type as keyof typeof NODE_CONFIG];
        const hasTarget = reactFlowWrapper.current?.querySelector(`.react-flow__handle-target[data-nodeid="${node.id}"]`) !== null;
        const hasSource = reactFlowWrapper.current?.querySelector(`.react-flow__handle-source[data-nodeid="${node.id}"]`) !== null;

        if (hasTarget && !hasIncomingEdge) dangling.add(node.id);
        if (hasSource && !hasOutgoingEdge) dangling.add(node.id);
    }
    return dangling;
  }, [nodes, edges]);
  
  const nodesWithStatus = useMemo(() => 
    nodes.map(node => ({
        ...node,
        data: {
            ...node.data,
            isDangling: danglingNodeIds.has(node.id),
            runAttempted: runAttempted && danglingNodeIds.has(node.id)
        }
    })), 
    [nodes, danglingNodeIds, runAttempted]
  );

  const isWorkflowValid = useMemo(() => danglingNodeIds.size === 0 && nodes.some(n => n.type !== 'note'), [danglingNodeIds, nodes]);

  useEffect(() => { document.documentElement.classList.toggle('dark', isDarkMode); }, [isDarkMode]);

  // Debounced Autosave
  useEffect(() => {
    const handler = setTimeout(() => {
      if (currentUser) {
        const key = `workflow_${currentUser.email}`;
        localStorage.setItem(key, JSON.stringify({ name: workflowName, nodes, edges, viewport: getViewport() }));
        console.log("Workflow autosaved.");
      }
    }, 1500);
    return () => clearTimeout(handler);
  }, [nodes, edges, workflowName, currentUser, getViewport]);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
    setTimeout(takeSnapshot, 0);
  }, [setEdges, takeSnapshot]);
  
  const onDragOver = useCallback((event: React.DragEvent) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!reactFlowWrapper.current) return;
    const type = event.dataTransfer.getData('application/reactflow') as NodeType;
    if (!type || !Object.values(NodeType).includes(type)) return;
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const newNode: CustomNode = { id: `${type}-${+new Date()}`, type, position, data: { ...NODE_CONFIG[type].initialData } };
    setNodes((nds) => nds.concat(newNode));
    setTimeout(takeSnapshot, 0);
  }, [screenToFlowPosition, setNodes, takeSnapshot]);
  
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  
  const onNodeClick = useCallback((_: React.MouseEvent, node: CustomNode) => {
    setSelectedNode(node);
    if (!isMobile) {
        setConfigPanelCollapsed(false);
    }
  }, [isMobile]);

  const onPaneClick = useCallback(() => { setSelectedNode(null); }, []);

  const onNodeDataChange = useCallback(<T,>(nodeId: string, data: T) => {
    setNodes((nds) => nds.map((node) => (node.id === nodeId ? { ...node, data: data as typeof node.data } : node)));
    setSelectedNode(prev => (prev && prev.id === nodeId) ? ({ ...prev, data: data as typeof prev.data }) : prev);
  }, [setNodes]);
  
   // Take snapshot AFTER data change has settled
  useEffect(() => {
     const handler = setTimeout(takeSnapshot, 100);
     return () => clearTimeout(handler);
  }, [nodes, edges]);


  const onNodesDelete: OnNodesDelete = useCallback((deletedNodes) => {
    if (deletedNodes.some(n => n.id === selectedNode?.id)) {
      setSelectedNode(null);
    }
    setTimeout(takeSnapshot, 0);
  }, [selectedNode, takeSnapshot]);
  
  const onEdgesDelete: OnEdgesDelete = useCallback(() => {
    setTimeout(takeSnapshot, 0);
  }, [takeSnapshot]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (nodeToDelete) {
        deleteElements({ nodes: [nodeToDelete], edges: [] });
        toast.success('Node deleted.');
    }
  }, [nodes, deleteElements]);

  // FIX: Moved function definitions before the useEffect that uses them to fix block-scoped variable usage errors.
  // Wrapped in useCallback for performance and to provide stable references to the useEffect hooks.
  const addLog = useCallback((log: Omit<ExecutionLog, 'id' | 'timestamp'>) => {
    setLogs(prev => [...prev, { ...log, id: `${log.nodeId}-${Date.now()}`, timestamp: new Date().toLocaleTimeString() }]);
  }, []);

  const handleRunWorkflow = useCallback(async () => {
    if (isRunning) return;
    if (!isWorkflowValid) {
        toast.error("Cannot run workflow. Please connect all required nodes.");
        setRunAttempted(true);
        setTimeout(() => setRunAttempted(false), 820);
        return;
    }
    
    setIsRunning(true);
    setLogPanelOpen(true);
    setLogs([]);
    setNodes(nds => nds.map(n => ({...n, data: {...n.data, isFailed: false}})));

    const outputNodes = nodes.filter(n => n.type === NodeType.Output);
    if (outputNodes.length === 0) { 
        toast.error('Workflow must contain at least one Output node.'); 
        setLogPanelOpen(false);
        setIsRunning(false);
        return; 
    }
    
    addLog({ nodeId: 'workflow', nodeLabel: 'Workflow', status: 'running', message: 'Starting execution...' });
    
    const userQueryNodes = nodes.filter(n => n.type === NodeType.UserQuery);
    const userMessages: Message[] = userQueryNodes.map(uqn => ({
      sender: 'user', text: (uqn.data as UserQueryData).query, timestamp: new Date().toISOString()
    }));
    
    setNodes(nds => nds.map(n => {
        if (n.type === NodeType.Output) {
            const existingUserMessages = (n.data as OutputData).messages.filter(m => m.sender === 'user');
            return { ...n, data: { messages: [...existingUserMessages, ...userMessages] } };
        }
        return n;
    }));

    for (const node of nodes) { addLog({ nodeId: node.id, nodeLabel: NODE_CONFIG[node.type as keyof typeof NODE_CONFIG].label, status: 'running', message: 'Processing...' }); }
    
    try {
        const response = await runWorkflowApi({ name: workflowName, nodes, edges });
        if (response.error) {
           const error = new Error(response.error);
           (error as any).cause = response.failedNodeId;
           throw error;
        }

        nodes.forEach(node => setLogs(prev => prev.map(l => l.nodeId === node.id ? {...l, status: 'success', message: 'Completed successfully.'} : l)));
        
        setNodes(currentNodes => currentNodes.map(node => {
            if (node.type === NodeType.Output && response.results[node.id]) {
                const result = response.results[node.id];
                const aiMessage: Message = { sender: 'ai', text: result.answer ?? '', imageUrl: result.imageUrl, timestamp: new Date().toISOString() };
                const currentMessages = (node.data as OutputData).messages;
                return { ...node, data: { messages: [...currentMessages, aiMessage] } };
            }
            return node;
        }));

        addLog({ nodeId: 'workflow', nodeLabel: 'Workflow', status: 'success', message: 'Execution finished successfully!' });
        toast.success('Workflow finished successfully!');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';

        // Check for the specific API configuration error
        if (errorMessage.includes('Generative Language API has not been used')) {
            setApiConfigError(errorMessage);
        }

        const failedNodeId = error instanceof Error ? (error as any).cause : undefined;
        let failedNode = failedNodeId ? nodes.find(n => n.id === failedNodeId) : null;
        toast.error(`Workflow failed: ${errorMessage}`);
        
        if (failedNode) {
            setNodes(nds => nds.map(n => n.id === failedNode!.id ? {...n, data: {...n.data, isFailed: true}} : n));
            setLogs(prevLogs => prevLogs.map(log => {
                if (log.nodeId === failedNode!.id) return { ...log, status: 'failed', message: errorMessage };
                if (log.nodeId === 'workflow') return { ...log, status: 'failed', message: `Execution failed at ${failedNode?.type}.` };
                return log.status === 'running' ? {...log, status: 'success', message: 'Completed successfully.'} : log;
            }));
        } else {
            addLog({ nodeId: 'workflow', nodeLabel: 'Workflow', status: 'failed', message: errorMessage });
        }
    } finally {
        setIsRunning(false);
    }
  }, [isRunning, isWorkflowValid, nodes, edges, workflowName, addLog, setRunAttempted, setIsRunning, setLogPanelOpen, setLogs, setNodes]);

  const handleSave = useCallback(() => {
    if (!currentUser) { toast.error('Please sign in to save your workflow.'); return; }
    const key = `workflow_${currentUser.email}`;
    localStorage.setItem(key, JSON.stringify({ name: workflowName, nodes, edges, viewport: getViewport() }));
    toast.success(`Workflow "${workflowName}" saved!`);
  }, [currentUser, workflowName, nodes, edges, getViewport]);
  
  const handleLoad = useCallback(() => {
    if (!currentUser) { toast.error('Please sign in to load a workflow.'); return; }
    const key = `workflow_${currentUser.email}`;
    const flowString = localStorage.getItem(key);
    if (flowString) {
      const flow = JSON.parse(flowString);
      const loadedNodes = flow.nodes || initialWorkflow.nodes;
      const loadedEdges = flow.edges || initialWorkflow.edges;
      const loadedName = flow.name || "Loaded Workflow";
      
      setWorkflowName(loadedName);
      setNodes(loadedNodes);
      setEdges(loadedEdges);
      const newHistory = [{ name: loadedName, nodes: loadedNodes, edges: loadedEdges }];
      setHistory(newHistory);
      setHistoryIndex(0);
      
      if (flow.viewport) {
        setViewport(flow.viewport);
      } else {
        setTimeout(() => fitView({ padding: 0.2 }), 50);
      }
      toast.success(`Workflow "${loadedName}" loaded!`);
    } else {
      toast.error('No saved workflow found for your account.');
      setWorkflowName(initialWorkflow.name);
      setNodes(initialWorkflow.nodes);
      setEdges(initialWorkflow.edges);
      setHistory([{ ...initialWorkflow }]);
      setHistoryIndex(0);
      setTimeout(() => fitView({ padding: 0.2 }), 50);
    }
  }, [currentUser, setWorkflowName, setNodes, setEdges, setHistory, setHistoryIndex, setViewport, fitView]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;

        if ((event.key === 'Backspace' || event.key === 'Delete')) {
            const selectedNodes = getNodes().filter((n) => n.selected);
            const selectedEdges = getEdges().filter((e) => e.selected);
            if (selectedNodes.length > 0 || selectedEdges.length > 0) {
              deleteElements({ nodes: selectedNodes, edges: selectedEdges });
            }
        }
        if ((event.ctrlKey || event.metaKey) && event.key === 'z') { event.preventDefault(); handleUndo(); }
        if ((event.ctrlKey || event.metaKey) && event.key === 'y') { event.preventDefault(); handleRedo(); }
        if ((event.ctrlKey || event.metaKey) && event.key === 's') { event.preventDefault(); handleSave(); }
        if ((event.ctrlKey || event.metaKey) && event.key === 'o') { event.preventDefault(); handleLoad(); }
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); handleRunWorkflow(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [getNodes, getEdges, deleteElements, handleUndo, handleRedo, handleSave, handleLoad, handleRunWorkflow]);

  const handleLoadTemplate = useCallback((template: WorkflowTemplate) => {
    const workflowClone = JSON.parse(JSON.stringify(template.workflow));
    setWorkflowName(workflowClone.name);
    setNodes(workflowClone.nodes);
    setEdges(workflowClone.edges);
    setHistory([{ name: workflowClone.name, nodes: workflowClone.nodes, edges: workflowClone.edges }]);
    setHistoryIndex(0);
    setSelectedNode(null);

    setTimeout(() => { fitView({ padding: 0.2, duration: 200 }); }, 50);
    toast.success(`Template "${template.name}" loaded!`);
  }, [setWorkflowName, setNodes, setEdges, setHistory, setSelectedNode, fitView]);

  const handleSignIn = (user: User) => { 
    setCurrentUser(user);
    toast.success(`Welcome, ${user.name}!`);
    
    if (localStorage.getItem('hasSeenWelcomeModal')) {
      handleLoad();
    } else {
      setWelcomeModalOpen(true);
      localStorage.setItem('hasSeenWelcomeModal', 'true');
    }
  };
  
  const handleSignOut = () => { 
    setCurrentUser(null);
    setWorkflowName(initialWorkflow.name);
    setNodes(initialWorkflow.nodes); // Reset to initial state on sign out
    setEdges(initialWorkflow.edges);
    setHistory([{ ...initialWorkflow }]);
    setHistoryIndex(0);
    toast('You have been signed out.'); 
  };
  
  if (!API_KEY) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <div className="max-w-2xl p-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-red-500/50">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="mt-4 text-2xl font-bold">Configuration Error</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The Google Gemini API key is missing. The application cannot connect to the AI service without it.
          </p>
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-900/50 rounded-md text-left">
            <h3 className="font-semibold text-lg">How to Fix</h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              You need to set the API key as an environment variable in your deployment service (e.g., Netlify, Vercel).
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-2 text-sm">
              <li>Go to your project's settings on your deployment platform.</li>
              <li>Find the "Environment Variables" or "Deploy" settings section.</li>
              <li>Create a new variable with the following name and value:</li>
            </ol>
            <div className="mt-3 font-mono text-xs bg-gray-200 dark:bg-gray-700 p-3 rounded">
              <span className="font-bold">Name:</span> API_KEY<br/>
              <span className="font-bold">Value:</span> your_actual_google_api_key
            </div>
            <p className="mt-4 text-xs text-red-600 dark:text-red-400 font-semibold">
              <span className="font-bold">Important:</span> Do NOT save your API key in the source code or commit a <code>.env</code> file to your repository.
            </p>
          </div>
          <p className="mt-4 text-xs text-gray-500">After setting the variable, you must re-deploy your project for the change to take effect.</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <SignInModal isOpen={true} onSignIn={handleSignIn} />;
  }

  return (
    <div className="flex h-screen w-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans overflow-hidden">
      <Toaster position="bottom-right" toastOptions={{ style: { background: isDarkMode ? '#1e2b3b' : '#ffffff', color: isDarkMode ? '#f1f5f9' : '#0f172a' } }} />
      <ApiConfigErrorModal isOpen={!!apiConfigError} errorMessage={apiConfigError} onClose={() => setApiConfigError(null)} />
      <HelpChatModal isOpen={isHelpModalOpen} onClose={() => setHelpModalOpen(false)} />
      <WelcomeModal isOpen={isWelcomeModalOpen} onClose={() => setWelcomeModalOpen(false)} />

      <Sidebar 
        onDragStart={onDragStart} 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
        isMobile={isMobile}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
      />
      <main className="flex-1 h-screen flex flex-col relative react-flow-wrapper" ref={reactFlowWrapper}>
        <Toolbar 
          workflowName={workflowName}
          onWorkflowNameChange={handleWorkflowNameChange}
          onRun={handleRunWorkflow} onSave={handleSave} onLoad={handleLoad} 
          onExportJson={() => exportToJson({ name: workflowName, nodes, edges })} onExportPng={exportToPng}
          isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          currentUser={currentUser} onSignOut={handleSignOut}
          onLoadTemplate={handleLoadTemplate}
          isMobile={isMobile}
          onToggleSidebar={() => setMobileSidebarOpen(true)}
          onToggleConfigPanel={() => { if(selectedNode) setSelectedNode(selectedNode) /* re-trigger to open */ }}
          onHelpClick={() => setHelpModalOpen(true)}
          isWorkflowValid={isWorkflowValid}
          isRunning={isRunning}
          onUndo={handleUndo} onRedo={handleRedo}
          canUndo={historyIndex > 0} canRedo={historyIndex < history.length - 1}
        />
        <ReactFlow
          nodes={nodesWithStatus} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect} onNodeClick={onNodeClick} onPaneClick={onPaneClick}
          onDrop={onDrop} onDragOver={onDragOver} nodeTypes={nodeTypes} fitView
          onNodesDelete={onNodesDelete} onEdgesDelete={onEdgesDelete}
          className="bg-gray-50 dark:bg-gray-950 pt-16"
        >
          {nodes.length === 0 && <EmptyCanvas />}
          <Controls />
          <MiniMap />
          <Background gap={16} />
        </ReactFlow>
        {isLogPanelOpen ? (
          <ExecutionLogPanel logs={logs} onClose={() => setLogPanelOpen(false)} onClear={() => setLogs([])} isMobile={isMobile} />
        ) : (
          <Button
            onClick={() => setLogPanelOpen(true)}
            size="icon"
            variant="secondary"
            className="absolute bottom-4 right-4 z-20 !rounded-full !h-12 !w-12 shadow-lg"
            title="Show Logs"
          >
            <ChevronUp className="h-6 w-6" />
          </Button>
        )}
      </main>
      <ConfigPanel 
        selectedNode={selectedNode} onClose={() => setSelectedNode(null)} onNodeDataChange={onNodeDataChange}
        isCollapsed={isConfigPanelCollapsed} onToggle={() => setConfigPanelCollapsed(!isConfigPanelCollapsed)}
        onNodeDelete={handleNodeDelete}
        isMobile={isMobile}
      />
    </div>
  );
};

const App: React.FC = () => (
  <ReactFlowProvider>
    <AppContent />
  </ReactFlowProvider>
);

export default App;