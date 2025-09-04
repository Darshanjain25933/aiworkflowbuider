import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronsLeft, ChevronsRight, UploadCloud, Trash2 } from 'lucide-react';
import { type CustomNode, type UserQueryData, type KnowledgeBaseData, type LLMEngineData, type CodeNodeData, type FileInfo, type DataLoaderData, type ImageGeneratorData, type RouterData, type TextFormatterData, type JoinData, type NoteData } from '../types';
import { NODE_CONFIG } from '../constants';
import Button from './ui/Button';

interface ConfigPanelProps {
  selectedNode: CustomNode | null;
  onClose: () => void;
  onNodeDataChange: <T>(nodeId: string, data: T) => void;
  onNodeDelete: (nodeId: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ selectedNode, onClose, onNodeDataChange, onNodeDelete, isCollapsed, onToggle, isMobile }) => {
  const [formData, setFormData] = useState<CustomNode['data'] | null>(null);

  // When a new node is selected, reset the local form data
  useEffect(() => {
    setFormData(selectedNode?.data ?? null);
  }, [selectedNode]);

  // This ref helps prevent the debounced update from firing on the initial load of a node's data
  const initialDataRef = useRef<string | null>(null);
  useEffect(() => {
    initialDataRef.current = JSON.stringify(selectedNode?.data);
  }, [selectedNode]);

  // Debounce the call to the parent component's update function
  useEffect(() => {
    if (!selectedNode || !formData || JSON.stringify(formData) === initialDataRef.current) {
      return;
    }

    const handler = setTimeout(() => {
      onNodeDataChange(selectedNode.id, formData);
    }, 400); // 400ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [formData, selectedNode, onNodeDataChange]);
  
  const handleDataChange = (field: string, value: any) => {
    // Update local state immediately for a responsive UI
    setFormData(prevData => {
        if (!prevData) return null;
        return { ...prevData, [field]: value };
    });
  };
  
  const KnowledgeBaseConfig = () => {
    const kbData = formData as KnowledgeBaseData;
    const [isDragging, setIsDragging] = useState(false);

    const processFile = (file: File): Promise<FileInfo> => {
      return new Promise((resolve) => {
        const fileInfo: FileInfo = {
          name: file.name,
          type: file.type,
          size: file.size,
        };

        if (file.type === 'application/pdf') {
          fileInfo.pages = Math.floor(Math.random() * 80) + 5;
          resolve(fileInfo);
        } else if (file.type === 'text/plain' || file.type === 'text/csv') {
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result as string;
            fileInfo.lines = text.split('\n').length;
            resolve(fileInfo);
          };
          reader.onerror = () => {
            resolve(fileInfo); 
          };
          reader.readAsText(file);
        } else {
          resolve(fileInfo);
        }
      });
    };

    const handleFileChange = async (files: FileList | null) => {
      if (files) {
        const newFilesPromises = Array.from(files).map(processFile);
        const newFiles = await Promise.all(newFilesPromises);
        handleDataChange('files', [...(kbData.files || []), ...newFiles]);
      }
    };

    const handleFileRemove = (indexToRemove: number) => {
      handleDataChange('files', kbData.files.filter((_, index) => index !== indexToRemove));
    };

    const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFileChange(e.dataTransfer.files);
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Documents</label>
        <div
          onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600'}`}
        >
          <div className="space-y-1 text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600 dark:text-gray-400">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-900 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                <span>Upload a file</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={(e) => handleFileChange(e.target.files)} />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">PDF, TXT, CSV up to 10MB</p>
          </div>
        </div>
        <div className="space-y-1 pt-2 max-h-32 overflow-y-auto pr-1">
          {kbData.files.map((file, index) => (
            <div key={index} className="flex items-center justify-between text-xs p-2 bg-gray-200 dark:bg-gray-700 rounded">
              <span className="truncate pr-2">{file.name}</span>
              <button
                onClick={() => handleFileRemove(index)}
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 flex-shrink-0"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderConfig = () => {
    if (!selectedNode || !formData) return null;
    switch (selectedNode.type) {
      case 'userQuery':
        const uqData = formData as UserQueryData;
        return ( <div> <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Query</label> <textarea value={uqData.query} onChange={(e) => handleDataChange('query', e.target.value)} rows={4} className="mt-1 block w-full rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" /> </div> );
      case 'knowledgeBase': return <KnowledgeBaseConfig />;
      case 'llmEngine':
        const llmData = formData as LLMEngineData;
        return ( <div className="space-y-4"> <div> <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model</label> <select id="model" value={llmData.model} onChange={(e) => handleDataChange('model', e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" > <option>gemini-2.5-flash</option> </select> </div> <div className="flex items-center"> <input id="webSearch" type="checkbox" checked={llmData.useWebSearch} onChange={(e) => handleDataChange('useWebSearch', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /> <label htmlFor="webSearch" className="ml-2 block text-sm text-gray-900 dark:text-gray-200"> Use Web Search </label> </div> </div> );
      case 'code':
        const codeData = formData as CodeNodeData;
        return ( <div> <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">JavaScript Snippet</label> <textarea value={codeData.script} onChange={(e) => handleDataChange('script', e.target.value)} rows={10} className="mt-1 block w-full rounded-md bg-gray-900 text-gray-200 font-mono text-xs border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" spellCheck="false" /> <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">The output of the previous node is available in the `input` variable.</p></div> );
      case 'dataLoader':
        const dlData = formData as DataLoaderData;
        return ( <div> <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Source URL</label> <input type="text" value={dlData.sourceUrl} onChange={(e) => handleDataChange('sourceUrl', e.target.value)} className="mt-1 block w-full rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" /> </div> );
      case 'imageGenerator':
        const igData = formData as ImageGeneratorData;
        return ( <div className="space-y-4"> <div> <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prompt</label> <textarea value={igData.prompt} onChange={(e) => handleDataChange('prompt', e.target.value)} rows={4} className="mt-1 block w-full rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Leave blank to use input from previous node" /> </div> <div> <label htmlFor="ig-model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model</label> <select id="ig-model" value={igData.model} onChange={(e) => handleDataChange('model', e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" > <option>imagen-4.0-generate-001</option> </select> </div> </div> );
      case 'router':
        const routerData = formData as RouterData;
        return ( <div> <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Condition</label> <textarea value={routerData.condition} onChange={(e) => handleDataChange('condition', e.target.value)} rows={3} placeholder="e.g., input.sentiment === 'positive'" className="mt-1 block w-full rounded-md bg-gray-900 text-gray-200 font-mono text-xs border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" spellCheck="false" /> <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Define routing logic. The output will be available in the `input` variable.</p> </div> );
      case 'textFormatter':
        const tfData = formData as TextFormatterData;
        return ( <div> <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Template</label> <textarea value={tfData.template} onChange={(e) => handleDataChange('template', e.target.value)} rows={4} className="mt-1 block w-full rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" /> <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Use `{'{{input}}'}` as a placeholder for the text from the connected node.</p></div> );
      case 'join':
        const joinData = formData as JoinData;
        return ( <div> <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Separator</label> <input type="text" value={joinData.separator} onChange={(e) => handleDataChange('separator', e.target.value)} className="mt-1 block w-full rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" /> <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Character(s) to join inputs with. Use `\n` for a new line.</p></div> );
      case 'note':
        const noteData = formData as NoteData;
        return ( <div> <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Note Content</label> <textarea value={noteData.text} onChange={(e) => handleDataChange('text', e.target.value)} rows={6} className="mt-1 block w-full rounded-md bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-600/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" /> </div> );
      case 'distributor':
        return <p className="text-sm text-gray-500 dark:text-gray-400">This node sends its input to multiple outputs. No configuration needed.</p>;
      case 'output': return <p className="text-sm text-gray-500 dark:text-gray-400">This node displays the output. No configuration available.</p>;
      default: return null;
    }
  };

  const panelContent = (
     <div className="bg-gray-100 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col h-full">
        {selectedNode ? (
          <>
            <div className={`p-4 flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
              {(!isCollapsed || isMobile) && <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Configuration</h3>}
              {(!isCollapsed || isMobile) && (
                <Button onClick={onClose} size="icon" variant="ghost">
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </Button>
              )}
            </div>

            {(!isCollapsed || isMobile) && (
                <div className="px-4 pb-4 flex-grow flex flex-col overflow-y-auto">
                    <div className="flex-grow space-y-4">
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{NODE_CONFIG[selectedNode.type as keyof typeof NODE_CONFIG]?.label}</div>
                        {renderConfig()}
                    </div>
                    <div className="flex-shrink-0 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            onClick={() => onNodeDelete(selectedNode.id)}
                            variant="secondary"
                            className="w-full !bg-red-600/10 !text-red-600 hover:!bg-red-600/20 dark:!text-red-400 dark:!bg-red-400/10 dark:hover:!bg-red-400/20"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Node
                        </Button>
                    </div>
                </div>
            )}
            
            {!isMobile && (
                 <div className="p-2 border-t border-gray-200 dark:border-gray-800 mt-auto">
                    <Button onClick={onToggle} size="icon" variant="ghost" className="w-full">
                        {isCollapsed ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />}
                    </Button>
                </div>
            )}
          </>
        ) : (
             <div className="flex-grow flex items-center justify-center p-2">
                {!isMobile && (
                     <Button onClick={onToggle} size="icon" variant="ghost" className="w-full">
                        {isCollapsed ? <ChevronsLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" /> : <ChevronsRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                    </Button>
                )}
            </div>
        )}
     </div>
  );

  if (isMobile) {
    return (
        <div className={`fixed inset-0 z-30 transform transition-transform duration-300 ease-in-out ${selectedNode ? 'translate-x-0' : 'translate-x-full'}`}>
             <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
             <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm sm:w-80">
                {panelContent}
            </div>
        </div>
    )
  }

  return (
    <aside className={`flex-shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-80'}`}>
        {panelContent}
    </aside>
  );
};

export default ConfigPanel;