import React from 'react';
import { Handle, Position, type NodeProps } from '@reactflow/react';
import { Link } from 'lucide-react';
import { type DataLoaderData } from '../../types';

const DataLoaderNode: React.FC<NodeProps<DataLoaderData>> = ({ data, selected }) => {
  const { isFailed, isDangling, runAttempted } = data as any;
  return (
    <div className={`border rounded-lg w-56 md:w-64 shadow-md bg-white dark:bg-gray-800 transition-all
      ${isFailed ? 'border-red-500/80' : 'border-orange-500/50'}
      ${selected ? (isFailed ? 'shadow-red-500/50' : 'shadow-orange-500/50') : ''}
      ${isDangling && !selected ? 'dangling-node' : ''}
      ${runAttempted ? 'shake' : ''}
    `}>
      <div className={`p-3 border-b flex items-center gap-2
        ${isFailed ? 'bg-red-500/20 border-red-500/50' : 'bg-orange-500/10 dark:bg-orange-500/20 border-orange-500/50'}
      `}>
        <Link className={`h-5 w-5 ${isFailed ? 'text-red-500' : 'text-orange-500'}`} />
        <span className="font-semibold text-sm">Data Loader</span>
      </div>
      <div className="p-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
        <p className="truncate" title={data.sourceUrl}>URL: {data.sourceUrl}</p>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-orange-500" />
    </div>
  );
};

export default DataLoaderNode;