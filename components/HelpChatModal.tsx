import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot } from 'lucide-react';
import Button from './ui/Button';
import { type HelpMessage } from '../types';
import { getHelpResponse } from '../services/helpChatService';

interface HelpChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpChatModal: React.FC<HelpChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<HelpMessage[]>([
    { sender: 'ai', text: "Hello! I'm the AI Assistant. How can I help you build your workflow today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: HelpMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const aiResponseText = await getHelpResponse(input);
    const aiMessage: HelpMessage = { sender: 'ai', text: aiResponseText };
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };
  
  const quickQuestions = [
    "How to connect nodes?",
    "How do I run a workflow?",
    "How do I save?",
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg h-full max-h-[70vh] flex flex-col p-6 transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b pb-4 mb-4 border-gray-200 dark:border-gray-700">
            <Bot className="h-8 w-8 text-indigo-500" />
            <div>
                <h3 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    AI Help Assistant
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ask me anything about using the builder.</p>
            </div>
        </div>
        
        <div ref={scrollRef} className="flex-grow overflow-y-auto pr-2 space-y-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">AI</div>}
                <div className={`max-w-xs md:max-w-md rounded-lg px-3 py-2 ${
                    msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                    <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                </div>
                </div>
            ))}
            {isLoading && (
                 <div className="flex items-end gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">AI</div>
                    <div className="max-w-xs md:max-w-md rounded-lg px-3 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                       <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce"></div>
                       </div>
                    </div>
                </div>
            )}
        </div>

        <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700">
             <div className="flex gap-2 mb-2">
                {quickQuestions.map(q => (
                    <button key={q} onClick={() => { setInput(q); }} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">{q}</button>
                ))}
            </div>
            <div className="relative">
                <input
                type="text"
                placeholder="Ask a question..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isLoading && handleSend()}
                disabled={isLoading}
                className="w-full pr-12 pl-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button onClick={handleSend} disabled={isLoading} size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 !rounded-full h-8 w-8">
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HelpChatModal;