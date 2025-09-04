import React from 'react';
import { Handle, Position, type NodeProps } from '@reactflow/react';
import { Combine } from 'lucide-react';
import { type JoinData } from '../../types';

const JoinNode: React.FC<NodeProps<JoinData>> = ({ data, selected }) => {
  const { isFailed, isDangling, runAttempted } = data as any;
  return (
    <div className={`border rounded-lg w-56 md:w-64 shadow-md bg-white dark:bg-gray-800 transition-all
      ${isFailed ? 'border-red-500/80' : 'border-sky-500/50'}
      ${selected ? (isFailed ? 'shadow-red-500/50' : 'shadow-sky-500/50') : ''}
      ${isDangling && !selected ? 'dangling-node' : ''}
      ${runAttempted ? 'shake' : ''}
    `}>
      <div className={`p-3 border-b flex items-center gap-2
        ${isFailed ? 'bg-red-500/20 border-red-500/50' : 'bg-sky-500/10 dark:bg-sky-500/20 border-sky-500/50'}
      `}>
        <Combine className={`h-5 w-5 ${isFailed ? 'text-red-500' : 'text-sky-500'}`} />
        <span className="font-semibold text-sm">Join</span>
      </div>
      <div className="p-3 text-sm text-gray-700 dark:text-gray-300 relative min-h-[68px] flex items-center justify-center">
        <p className="text-xs text-gray-400">Merge 2 inputs into 1</p>
         <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex flex-col gap-5 text-xs font-semibold">
           <span className="text-gray-500">A</span>
           <span className="text-gray-500">B</span>
        </div>
      </div>
      <Handle type="target" id="a" position={Position.Left} style={{ top: '35%' }} className="!bg-gray-400" />
      <Handle type="target" id="b" position={Position.Left} style={{ top: '65%' }} className="!bg-gray-400" />
      <Handle type="source" position={Position.Right} className="!bg-sky-500" />
    </div>
  );
};

export default JoinNode;