import React from 'react';
import { Handle, Position, type NodeProps } from '@reactflow/react';
import { Code } from 'lucide-react';
import { type CodeNodeData } from '../../types';

const CodeNode: React.FC<NodeProps<CodeNodeData>> = ({ data, selected }) => {
  const { isFailed, isDangling, runAttempted } = data as any;
  return (
    <div className={`border rounded-lg w-56 md:w-64 shadow-md bg-white dark:bg-gray-800 transition-all
      ${isFailed ? 'border-red-500/80' : 'border-gray-500/50'}
      ${selected ? (isFailed ? 'shadow-red-500/50' : 'shadow-gray-500/50') : ''}
      ${isDangling && !selected ? 'dangling-node' : ''}
      ${runAttempted ? 'shake' : ''}
    `}>
      <div className={`p-3 border-b flex items-center gap-2
        ${isFailed ? 'bg-red-500/20 border-red-500/50' : 'bg-gray-500/10 dark:bg-gray-500/20 border-gray-500/50'}
      `}>
        <Code className={`h-5 w-5 ${isFailed ? 'text-red-500' : 'text-gray-500'}`} />
        <span className="font-semibold text-sm">Code Snippet</span>
      </div>
      <div className="p-3 text-sm text-gray-700 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-900">
        <pre className="overflow-x-auto text-xs">
          <code>{data.script.split('\n').slice(0, 3).join('\n')}</code>
          {data.script.split('\n').length > 3 && '...'}
        </pre>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-gray-500" />
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
    </div>
  );
};

export default CodeNode;