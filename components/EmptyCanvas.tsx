import React from 'react';
import { ArrowLeft, MousePointer } from 'lucide-react';

const EmptyCanvas: React.FC = () => {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 text-gray-400 dark:text-gray-600 pointer-events-none">
      <div className="relative">
        <MousePointer className="h-24 w-24" strokeWidth={1} />
        <ArrowLeft className="absolute -left-12 top-1/2 -translate-y-1/2 h-10 w-10 animate-pulse" strokeWidth={1} />
      </div>
      <p className="text-lg font-medium">The canvas is empty.</p>
      <p className="text-sm">Drag a node from the left sidebar to get started!</p>
    </div>
  );
};

export default EmptyCanvas;