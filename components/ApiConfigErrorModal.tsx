import React from 'react';
import { X, AlertTriangle, ExternalLink } from 'lucide-react';
import Button from './ui/Button';

interface ApiConfigErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string | null;
}

const ApiConfigErrorModal: React.FC<ApiConfigErrorModalProps> = ({ isOpen, onClose, errorMessage }) => {
  if (!isOpen || !errorMessage) return null;

  const urlMatch = errorMessage.match(/https?:\/\/[^\s]+/);
  const enableUrl = urlMatch ? urlMatch[0] : '#';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg transform transition-all p-6 sm:p-8"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
          </div>
          <div className="mt-0 text-left">
            <h3 id="modal-title" className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Action Required: Enable Google AI API
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your workflow failed because the necessary Google AI service (Generative Language API) is not enabled in your Google Cloud project. This is a one-time setup step.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md">
            <h4 className="font-semibold text-md">How to Fix</h4>
            <ol className="list-decimal list-inside mt-2 space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li>
                Click the button below to go to the Google Cloud Console.
                <a 
                  href={enableUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button variant="secondary" className="w-full mt-2">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Enable API in Google Cloud
                  </Button>
                </a>
              </li>
              <li>On that page, click the blue <span className="font-bold">"Enable"</span> button.</li>
              <li>Wait about a minute for the setting to take effect.</li>
              <li>Close this window and run your workflow again.</li>
            </ol>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="primary">
            Got it, I'll enable it
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApiConfigErrorModal;