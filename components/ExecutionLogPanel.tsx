import React from 'react';
import { type ExecutionLog } from '../types';
import { CheckCircle2, XCircle, Loader, ChevronDown, Trash2 } from 'lucide-react';

interface ExecutionLogPanelProps {
  logs: ExecutionLog[];
  onClose: () => void;
  onClear: () => void;
  isMobile: boolean;
}

const LogStatusIcon = ({ status }: { status: ExecutionLog['status'] }) => {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'running':
      return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
    default:
      return null;
  }
};

const ExecutionLogPanel: React.FC<ExecutionLogPanelProps> = ({ logs, onClose, onClear, isMobile }) => {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState(250);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const newHeight = window.innerHeight - e.clientY;
    if (newHeight > 100 && newHeight < window.innerHeight - 100) {
      setHeight(newHeight);
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={panelRef}
      className="absolute bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col"
      style={{ height: isMobile ? '40vh' : `${height}px` }}
    >
      {!isMobile && (
        <div
          className="w-full h-2 cursor-row-resize bg-gray-100 dark:bg-gray-800 hover:bg-indigo-500 transition-colors"
          onMouseDown={handleMouseDown}
        ></div>
      )}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <h3 className="font-semibold text-sm">Execution Logs</h3>
        <div className="flex items-center gap-2">
            <button onClick={onClear} className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" title="Clear Logs">
                <Trash2 className="h-4 w-4 text-gray-500" />
            </button>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" title="Hide Panel">
                <ChevronDown className="h-5 w-5 text-gray-500" />
            </button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-2 font-mono text-[11px] sm:text-xs">
        {logs.length === 0 ? (
          <div className="text-gray-400">Run a workflow to see logs...</div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="flex items-start gap-2 p-1 border-b border-gray-100 dark:border-gray-800/50">
              <LogStatusIcon status={log.status} />
              <span className="text-gray-400">{log.timestamp}</span>
              <span className="font-semibold w-28 truncate">{log.nodeLabel}</span>
              <span className="flex-1 text-gray-700 dark:text-gray-300">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExecutionLogPanel;