import React from 'react';
import { Handle, Position, type NodeProps } from '@reactflow/react';
import { Database } from 'lucide-react';
import { type KnowledgeBaseData } from '../../types';

const KnowledgeBaseNode: React.FC<NodeProps<KnowledgeBaseData>> = ({ data, selected }) => {
  const { isFailed, isDangling, runAttempted } = data as any;
  const fileCount = data.files.length;
  const firstFile = fileCount > 0 ? data.files[0] : null;

  const renderFileDetails = () => {
    if (!firstFile) {
      return <p>No files uploaded</p>;
    }

    let details = '';
    if (firstFile.type === 'application/pdf' && firstFile.pages) {
      details = `${firstFile.pages} pages`;
    } else if ((firstFile.type === 'text/plain' || firstFile.type === 'text/csv') && firstFile.lines) {
      details = `${firstFile.lines} lines`;
    } else {
      details = `${(firstFile.size / 1024).toFixed(1)} KB`;
    }

    return (
      <div className="space-y-1">
        <p className="font-medium truncate" title={firstFile.name}>{firstFile.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{details}</p>
        {fileCount > 1 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            + {fileCount - 1} more file(s)
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={`border rounded-lg w-56 md:w-64 shadow-md bg-white dark:bg-gray-800 transition-all
      ${isFailed ? 'border-red-500/80' : 'border-yellow-500/50'}
      ${selected ? (isFailed ? 'shadow-red-500/50' : 'shadow-yellow-500/50') : ''}
      ${isDangling && !selected ? 'dangling-node' : ''}
      ${runAttempted ? 'shake' : ''}
    `}>
      <div className={`p-3 border-b flex items-center gap-2
        ${isFailed ? 'bg-red-500/20 border-red-500/50' : 'bg-yellow-500/10 dark:bg-yellow-500/20 border-yellow-500/50'}
      `}>
        <Database className={`h-5 w-5 ${isFailed ? 'text-red-500' : 'text-yellow-500'}`} />
        <span className="font-semibold text-sm">Knowledge Base</span>
      </div>
      <div className="p-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 min-h-[68px]">
        {renderFileDetails()}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-yellow-500" />
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
    </div>
  );
};

export default KnowledgeBaseNode;