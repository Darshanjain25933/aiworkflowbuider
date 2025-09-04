import { type Node, type Edge } from '@reactflow/react';
import { type LucideIcon } from 'lucide-react';

export enum NodeType {
  UserQuery = 'userQuery',
  KnowledgeBase = 'knowledgeBase',
  LLMEngine = 'llmEngine',
  Output = 'output',
  Code = 'code',
  Router = 'router',
  ImageGenerator = 'imageGenerator',
  DataLoader = 'dataLoader',
  TextFormatter = 'textFormatter',
  Distributor = 'distributor',
  Join = 'join',
  Note = 'note',
}

export interface UserQueryData {
  query: string;
}

export interface FileInfo {
  name: string;
  type: string;
  size: number;
  pages?: number; // For PDFs
  lines?: number; // For TXT/CSV
}

export interface KnowledgeBaseData {
  files: FileInfo[];
}

export interface LLMEngineData {
  model: string;
  useWebSearch: boolean;
}

export interface Message {
  sender: 'user' | 'ai';
  text: string;
  imageUrl?: string;
  timestamp: string;
}

export interface OutputData {
  messages: Message[];
}

export interface CodeNodeData {
  script: string;
}

export interface RouterData {
  condition: string;
}

export interface ImageGeneratorData {
  prompt: string;
  model: 'imagen-4.0-generate-001';
}

export interface DataLoaderData {
  sourceUrl: string;
}

export interface TextFormatterData {
  template: string;
}

export interface DistributorData {}

export interface JoinData {
    separator: string;
}

export interface NoteData {
    text: string;
}


export type CustomNodeData = UserQueryData | KnowledgeBaseData | LLMEngineData | OutputData | CodeNodeData | RouterData | ImageGeneratorData | DataLoaderData | TextFormatterData | DistributorData | JoinData | NoteData;
export type CustomNode = Node<CustomNodeData, NodeType>;

export interface NodeConfig {
  type: NodeType;
  label: string;
  description: string;
  Icon: LucideIcon;
  color: string;
  initialData: CustomNodeData;
}

export interface Workflow {
  name: string;
  nodes: CustomNode[];
  edges: Edge[];
}

export interface HistoryEntry {
  name: string;
  nodes: CustomNode[];
  edges: Edge[];
}

export interface WorkflowTemplate {
  name: string;
  description: string;
  workflow: Workflow;
}

// Types for User Authentication
export interface User {
  name: string;
  email: string;
}

// Types for Execution Log
export type LogStatus = 'running' | 'success' | 'failed';

export interface ExecutionLog {
  id: string;
  nodeId: string;
  nodeLabel: string;
  status: LogStatus;
  message: string;
  timestamp: string;
}

// Types for Help Chat
export interface HelpMessage {
    sender: 'user' | 'ai';
    text: string;
}