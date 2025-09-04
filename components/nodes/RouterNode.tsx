import React from 'react';
import { Handle, Position, type NodeProps } from '@reactflow/react';
import { GitFork } from 'lucide-react';
import { type RouterData } from '../../types';

const RouterNode: React.FC<NodeProps<RouterData>> = ({ data, selected }) => {
  const { isFailed, isDangling, runAttempted } = data as any;
  return (
    <div className={`border rounded-lg w-56 md:w-64 shadow-md bg-white dark:bg-gray-800 transition-all
      ${isFailed ? 'border-red-500/80' : 'border-teal-500/50'}
      ${selected ? (isFailed ? 'shadow-red-500/50' : 'shadow-teal-500/50') : ''}
      ${isDangling && !selected ? 'dangling-node' : ''}
      ${runAttempted ? 'shake' : ''}
    `}>
      <div className={`p-3 border-b flex items-center gap-2
        ${isFailed ? 'bg-red-500/20 border-red-500/50' : 'bg-teal-500/10 dark:bg-teal-500/20 border-teal-500/50'}
      `}>
        <GitFork className={`h-5 w-5 ${isFailed ? 'text-red-500' : 'text-teal-500'}`} />
        <span className="font-semibold text-sm">Router</span>
      </div>
      <div className="p-3 text-sm text-gray-700 dark:text-gray-300 relative">
        <p className="font-mono text-xs bg-gray-100 dark:bg-gray-700 p-1 rounded truncate" title={data.condition}>
          {data.condition}
        </p>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-5 text-xs font-semibold">
           <span className="text-green-500">True</span>
           <span className="text-red-500">False</span>
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      <Handle type="source" id="true" position={Position.Right} style={{ top: '45%' }} className="!bg-green-500" />
      <Handle type="source" id="false" position={Position.Right} style={{ top: '70%' }} className="!bg-red-500" />
    </div>
  );
};

export default RouterNode;