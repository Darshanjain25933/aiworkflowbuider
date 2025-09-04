import React from 'react';
import { X, Bot, Zap, Move, Settings, Play } from 'lucide-react';
import Button from './ui/Button';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl transform transition-all p-6 sm:p-8"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4">
                 <Bot className="h-10 w-10 text-indigo-500" />
            </div>
            <h3 id="modal-title" className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                Welcome to the AI Workflow Builder!
            </h3>
            <p className="mt-2 max-w-md text-sm md:text-base text-gray-500 dark:text-gray-400">
                Here's a quick guide to get you started on building powerful AI-driven automations.
            </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-left">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                    <Move className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">1. Drag & Drop Nodes</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Start by dragging nodes from the sidebar on the left onto the canvas.</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/50">
                    <Zap className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">2. Connect Your Workflow</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Connect nodes by dragging from the handles on their sides to form a logical flow.</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                    <Settings className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">3. Configure Node Settings</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Click on a node to open the configuration panel on the right and customize it.</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50">
                    <Play className="h-6 w-6 text-green-500" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">4. Run & See the Magic!</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Once your workflow is ready, press the "Run" button in the toolbar to see the AI in action.</p>
                </div>
            </div>
        </div>

        <div className="mt-8 text-center">
            <Button onClick={onClose} variant="primary">
                Let's Get Building!
            </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;