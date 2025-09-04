import React from 'react';
import { Play, Save, FolderOpen, Download, UserCircle, LogOut, LayoutTemplate, PanelLeft, PanelRight, HelpCircle, Undo, Redo, Edit2, Loader, Sun, Moon } from 'lucide-react';
import Button from './ui/Button';
import Dropdown from './ui/Dropdown';
import { WORKFLOW_TEMPLATES } from '../constants';
import { type WorkflowTemplate, type User } from '../types';
import ToggleSwitch from './ui/ToggleSwitch';

interface ToolbarProps {
  workflowName: string;
  onWorkflowNameChange: (newName: string) => void;
  onRun: () => void;
  onSave: () => void;
  onLoad: () => void;
  onExportJson: () => void;
  onExportPng: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentUser: User | null;
  onSignOut: () => void;
  onLoadTemplate: (template: WorkflowTemplate) => void;
  isMobile: boolean;
  onToggleSidebar: () => void;
  onToggleConfigPanel: () => void;
  onHelpClick: () => void;
  isWorkflowValid: boolean;
  isRunning: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  workflowName, onWorkflowNameChange, onRun, onSave, onLoad, onExportJson, onExportPng, isDarkMode, toggleDarkMode, currentUser, onSignOut, onLoadTemplate, isMobile, onToggleSidebar, onToggleConfigPanel, onHelpClick, isWorkflowValid, isRunning, onUndo, onRedo, canUndo, canRedo
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 p-2 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-shrink-0">
            {isMobile && (
                <Button onClick={onToggleSidebar} size="icon" variant="ghost" title="Toggle Nodes Panel">
                    <PanelLeft className="h-5 w-5" />
                </Button>
            )}
            <h1 className="text-lg md:text-xl font-extrabold text-gray-800 dark:text-gray-200 truncate hidden sm:block">AI Builder</h1>
        </div>

        <div className="flex-1 flex justify-center items-center px-4">
             <div className="relative w-full max-w-xs md:max-w-sm">
                 <Edit2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                 <input 
                    type="text"
                    value={workflowName}
                    onChange={(e) => onWorkflowNameChange(e.target.value)}
                    placeholder="Untitled Workflow"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base font-semibold text-center"
                    title="Workflow Name"
                 />
             </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <Button 
                onClick={onRun} 
                size="sm" 
                variant="primary"
                disabled={isRunning}
                className={(!isWorkflowValid && !isRunning) ? 'opacity-50 cursor-not-allowed' : ''}
                title={isRunning ? "Workflow is running..." : !isWorkflowValid ? "Connect all required nodes to run" : "Run Workflow (Ctrl+Enter)"}
            >
                {isRunning ? (
                    <Loader className="h-4 w-4 animate-spin md:mr-2" />
                ) : (
                    <Play className="h-4 w-4 md:mr-2" />
                )}
                <span className="hidden md:inline">{isRunning ? 'Running...' : 'Run'}</span>
            </Button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1"></div>
            
            <Button onClick={onUndo} size="sm" variant="secondary" disabled={!canUndo} title="Undo (Ctrl+Z)">
                <Undo className="h-4 w-4" />
            </Button>
            <Button onClick={onRedo} size="sm" variant="secondary" disabled={!canRedo} title="Redo (Ctrl+Y)">
                <Redo className="h-4 w-4" />
            </Button>
            
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1"></div>

            <Button onClick={onSave} size="sm" variant="secondary" disabled={!currentUser} title={!currentUser ? "Sign in to save" : "Save Workflow (Ctrl+S)"}>
                <Save className="h-4 w-4" />
            </Button>
            <Button onClick={onLoad} size="sm" variant="secondary" disabled={!currentUser} title={!currentUser ? "Sign in to load" : "Load Workflow (Ctrl+O)"}>
                <FolderOpen className="h-4 w-4" />
            </Button>

            <Dropdown
                items={WORKFLOW_TEMPLATES}
                onSelect={onLoadTemplate}
                trigger={<Button size="sm" variant="secondary" title="Load a template"><LayoutTemplate className="h-4 w-4" /></Button>}
            />
          
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1 hidden md:block"></div>

            <Button onClick={onExportJson} size="icon" variant="ghost" title="Export as JSON" className="hidden md:inline-flex">
                <Download className="h-5 w-5" />
            </Button>
            <ToggleSwitch isChecked={isDarkMode} onChange={toggleDarkMode} title="Toggle Dark Mode" />
            <Button onClick={onHelpClick} size="icon" variant="ghost" title="Help">
                <HelpCircle className="h-5 w-5" />
            </Button>
          
          {currentUser ? (
            <div className="flex items-center">
              <span className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300" title={`Signed in as ${currentUser.name} (${currentUser.email})`}>
                <UserCircle className="h-6 w-6" />
                <span className="hidden lg:inline">Hello, {currentUser.name}</span>
              </span>
              <Button onClick={onSignOut} size="icon" variant="ghost" title="Sign Out">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <span className="text-sm">Not signed in</span>
          )}

          {isMobile && (
                <Button onClick={onToggleConfigPanel} size="icon" variant="ghost" title="Toggle Configuration Panel">
                    <PanelRight className="h-5 w-5" />
                </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Toolbar;