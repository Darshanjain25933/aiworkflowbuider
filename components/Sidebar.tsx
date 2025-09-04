import React, { useState } from 'react';
import { NODE_CONFIG } from '../constants';
import { type NodeType } from '../types';
import { ChevronsLeft, ChevronsRight, Search, X } from 'lucide-react';
import Button from './ui/Button';

interface SidebarProps {
  onDragStart: (event: React.DragEvent, nodeType: NodeType) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onDragStart, isCollapsed, onToggle, isMobile, isMobileOpen, onMobileToggle }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNodes = Object.values(NODE_CONFIG).filter(node =>
    node.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sidebarContent = (
    <div className="bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
       <div className={`p-4 flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
        {(!isCollapsed || isMobile) && <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Nodes</h2>}
        {isMobile && (
            <Button onClick={onMobileToggle} size="icon" variant="ghost">
                <X className="h-5 w-5" />
            </Button>
        )}
      </div>
      
      {(!isCollapsed || isMobile) && (
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>
      )}

      <div className={`flex-grow overflow-y-auto space-y-3 ${isCollapsed && !isMobile ? 'px-2' : 'px-4'}`}>
        {filteredNodes.map((nodeConfig) => {
          const { type, label, description, Icon, color } = nodeConfig;
          return (
            <div
              key={type}
              className="border rounded-md cursor-grab bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow"
              onDragStart={(event) => onDragStart(event, type)}
              draggable
              title={isCollapsed && !isMobile ? label : ''}
              onClick={isMobile ? onMobileToggle : undefined} // Close sidebar on node selection on mobile
            >
              <div className={`flex items-center gap-3 ${isCollapsed && !isMobile ? 'justify-center p-2' : 'p-3'}`}>
                <div className={`p-2 rounded-md ${color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                {(!isCollapsed || isMobile) && (
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {!isMobile && (
        <div className="p-2 border-t border-gray-200 dark:border-gray-800">
          <Button onClick={onToggle} size="icon" variant="ghost" className="w-full">
            {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </Button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
        <div className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="w-64 max-w-[90vw] h-full">
                {sidebarContent}
            </div>
        </div>
    )
  }

  return (
    <aside className={`flex-shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {sidebarContent}
    </aside>
  );
};

export default Sidebar;