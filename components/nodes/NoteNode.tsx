import React from 'react';
import { type NodeProps } from '@reactflow/react';
import { StickyNote } from 'lucide-react';
import { type NoteData } from '../../types';

const NoteNode: React.FC<NodeProps<NoteData>> = ({ data, selected }) => {
  return (
    <div className={`border rounded-lg w-56 md:w-64 shadow-sm bg-yellow-50 dark:bg-gray-800/50 transition-all border-dashed border-yellow-400 dark:border-yellow-700
      ${selected ? 'shadow-yellow-500/50' : ''}
    `}>
      <div className="p-3 text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
        <p className="whitespace-pre-wrap">{data.text}</p>
      </div>
    </div>
  );
};

export default NoteNode;