import React from 'react';
import { Handle, Position, type NodeProps } from '@reactflow/react';
import { CaseSensitive } from 'lucide-react';
import { type TextFormatterData } from '../../types';

const TextFormatterNode: React.FC<NodeProps<TextFormatterData>> = ({ data, selected }) => {
  const { isFailed, isDangling, runAttempted } = data as any;
  return (
    <div className={`border rounded-lg w-56 md:w-64 shadow-md bg-white dark:bg-gray-800 transition-all
      ${isFailed ? 'border-red-500/80' : 'border-indigo-500/50'}
      ${selected ? (isFailed ? 'shadow-red-500/50' : 'shadow-indigo-500/50') : ''}
      ${isDangling && !selected ? 'dangling-node' : ''}
      ${runAttempted ? 'shake' : ''}
    `}>
      <div className={`p-3 border-b flex items-center gap-2
        ${isFailed ? 'bg-red-500/20 border-red-500/50' : 'bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500/50'}
      `}>
        <CaseSensitive className={`h-5 w-5 ${isFailed ? 'text-red-500' : 'text-indigo-500'}`} />
        <span className="font-semibold text-sm">Text Formatter</span>
      </div>
      <div className="p-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
        <p className="font-mono text-xs bg-gray-100 dark:bg-gray-700 p-1 rounded truncate" title={data.template}>
          {data.template}
        </p>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-indigo-500" />
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
    </div>
  );
};

export default TextFormatterNode;