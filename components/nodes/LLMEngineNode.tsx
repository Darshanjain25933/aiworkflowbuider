import React from 'react';
import { Handle, Position, type NodeProps } from '@reactflow/react';
import { BrainCircuit } from 'lucide-react';
import { type LLMEngineData } from '../../types';

const LLMEngineNode: React.FC<NodeProps<LLMEngineData>> = ({ data, selected }) => {
  const { isFailed, isDangling, runAttempted } = data as any;
  return (
    <div className={`border rounded-lg w-56 md:w-64 shadow-md bg-white dark:bg-gray-800 transition-all
      ${isFailed ? 'border-red-500/80' : 'border-purple-500/50'}
      ${selected ? (isFailed ? 'shadow-red-500/50' : 'shadow-purple-500/50') : ''}
      ${isDangling && !selected ? 'dangling-node' : ''}
      ${runAttempted ? 'shake' : ''}
    `}>
      <div className={`p-3 border-b flex items-center gap-2
        ${isFailed ? 'bg-red-500/20 border-red-500/50' : 'bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/50'}
      `}>
        <BrainCircuit className={`h-5 w-5 ${isFailed ? 'text-red-500' : 'text-purple-500'}`} />
        <span className="font-semibold text-sm">LLM Engine</span>
      </div>
      <div className="p-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 space-y-1">
        <p>Model: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{data.model}</span></p>
        <p>Web Search: <span className={data.useWebSearch ? 'text-green-500' : 'text-red-500'}>{data.useWebSearch ? 'Enabled' : 'Disabled'}</span></p>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-purple-500" />
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
    </div>
  );
};

export default LLMEngineNode;