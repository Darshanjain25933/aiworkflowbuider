import React, { useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@reactflow/react';
import { Play } from 'lucide-react';
import { type OutputData } from '../../types';

const OutputNode: React.FC<NodeProps<OutputData>> = ({ data, selected }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isDangling, runAttempted } = data as any;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data.messages]);

  return (
    <div className={`border rounded-lg w-72 md:w-96 shadow-md bg-white dark:bg-gray-800 flex flex-col h-80 md:h-96
      ${isDangling && !selected ? 'dangling-node' : 'border-green-500/50'}
      ${selected ? 'shadow-green-500/50' : ''}
      ${runAttempted ? 'shake' : ''}
    `}>
      <div className="p-3 border-b border-green-500/50 flex items-center gap-2 bg-green-500/10 dark:bg-green-500/20 flex-shrink-0">
        <Play className="h-5 w-5 text-green-500" />
        <span className="font-semibold text-sm">Output</span>
      </div>
      <div ref={scrollRef} className="p-3 text-sm flex-grow overflow-y-auto space-y-4">
        {data.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Run a workflow to see the output.
          </div>
        ) : (
          data.messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">AI</div>}
              <div className={`max-w-xs md:max-w-sm rounded-lg px-3 py-2 ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {msg.imageUrl ? (
                  <img src={msg.imageUrl} alt="Generated Content" className="rounded-md max-w-full h-auto" />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}
                <div className="text-xs text-right mt-1 opacity-70">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          ))
        )}
      </div>
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
    </div>
  );
};

export default OutputNode;