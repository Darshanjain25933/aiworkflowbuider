import React from 'react';
import { Handle, Position, type NodeProps } from '@reactflow/react';
import { Share2 } from 'lucide-react';
import { type DistributorData } from '../../types';

const DistributorNode: React.FC<NodeProps<DistributorData>> = ({ data, selected }) => {
  const { isFailed, isDangling, runAttempted } = data as any;
  return (
    <div className={`border rounded-lg w-56 md:w-64 shadow-md bg-white dark:bg-gray-800 transition-all
      ${isFailed ? 'border-red-500/80' : 'border-cyan-500/50'}
      ${selected ? (isFailed ? 'shadow-red-500/50' : 'shadow-cyan-500/50') : ''}
      ${isDangling && !selected ? 'dangling-node' : ''}
      ${runAttempted ? 'shake' : ''}
    `}>
      <div className={`p-3 border-b flex items-center gap-2
        ${isFailed ? 'bg-red-500/20 border-red-500/50' : 'bg-cyan-500/10 dark:bg-cyan-500/20 border-cyan-500/50'}
      `}>
        <Share2 className={`h-5 w-5 ${isFailed ? 'text-red-500' : 'text-cyan-500'}`} />
        <span className="font-semibold text-sm">Distributor</span>
      </div>
      <div className="p-3 text-sm text-gray-700 dark:text-gray-300 relative min-h-[68px] flex items-center justify-center">
        <p className="text-xs text-gray-400">1 input to 3 outputs</p>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-5 text-xs font-semibold">
           <span className="text-gray-500">1</span>
           <span className="text-gray-500">2</span>
           <span className="text-gray-500">3</span>
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      <Handle type="source" id="1" position={Position.Right} style={{ top: '35%' }} className="!bg-cyan-500" />
      <Handle type="source" id="2" position={Position.Right} style={{ top: '55%' }} className="!bg-cyan-500" />
      <Handle type="source" id="3" position={Position.Right} style={{ top: '75%' }} className="!bg-cyan-500" />
    </div>
  );
};

export default DistributorNode;