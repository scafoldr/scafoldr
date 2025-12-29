'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize, Download } from 'lucide-react';

// Sample DBML for demonstration
const sampleDbml = `
Table users {
  id integer [primary key]
  email varchar [unique, not null]
  name varchar [not null]
  created_at timestamp [default: \`now()\`]
  updated_at timestamp [default: \`now()\`]
}

Table projects {
  id integer [primary key]
  name varchar [not null]
  description text
  owner_id integer [ref: > users.id]
  created_at timestamp [default: \`now()\`]
}

Table tasks {
  id integer [primary key]
  title varchar [not null]
  description text
  status varchar [default: 'pending']
  project_id integer [ref: > projects.id]
  assignee_id integer [ref: > users.id]
  created_at timestamp [default: \`now()\`]
}

Table comments {
  id integer [primary key]
  content text [not null]
  task_id integer [ref: > tasks.id]
  user_id integer [ref: > users.id]
  parent_id integer [ref: > comments.id]
  created_at timestamp [default: \`now()\`]
}
`;

interface DynamicERDiagramProps {
  dbmlCode?: string;
  projectName?: string;
}

export function DynamicERDiagram({ dbmlCode, projectName }: DynamicERDiagramProps) {
  const [diagram, setDiagram] = useState<any>({ tables: [], relationships: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [DiagramComponent, setDiagramComponent] = useState<any>(null);
  const diagramRef = useRef<any>(null);

  useEffect(() => {
    // Load both the parser and component dynamically
    Promise.all([import('@/features/diagram')]).then(([diagramModule]) => {
      try {
        // Use provided DBML code or fall back to sample
        const dbmlToUse = dbmlCode || sampleDbml;
        const parsedDiagram = diagramModule.parseDbmlToDiagram(dbmlToUse);
        setDiagram(parsedDiagram);
        setDiagramComponent(() => diagramModule.Diagram);
      } catch (error) {
        console.error('Error parsing DBML:', error);
        // Fallback to empty diagram
        setDiagram({ tables: [], relationships: [] });
        setDiagramComponent(() => diagramModule.Diagram);
      } finally {
        setIsLoading(false);
      }
    });
  }, [dbmlCode]);

  // Zoom handlers that use the diagram's ref methods
  const handleZoomIn = () => {
    if (diagramRef.current) {
      diagramRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (diagramRef.current) {
      diagramRef.current.zoomOut();
    }
  };

  const handleFitToScreen = () => {
    if (diagramRef.current) {
      diagramRef.current.fitToScreen();
    }
  };

  const handleDownload = () => {
    if (diagramRef.current) {
      diagramRef.current.downloadDiagram(projectName);
    }
  };

  if (isLoading || !DiagramComponent) {
    return (
      <div className="h-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-500">Loading diagram...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 relative">
      {/* Toolbar - Now on the left and horizontal */}
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        <Button variant="outline" size="sm" onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleZoomIn} title="Zoom In">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleFitToScreen} title="Fit to Screen">
          <Maximize className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload} title="Download as PNG">
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {/* Interactive Diagram */}
      <div className="w-full h-full">
        <DiagramComponent ref={diagramRef} initialDiagram={diagram} />
      </div>

      {/* Right sidebar with Legend and Instructions */}
      <div className="absolute right-4 top-4 z-10 flex flex-col space-y-4 max-w-xs">
        {/* Legend */}
        <Card className="p-3 bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 backdrop-blur-sm">
          <h4 className="font-semibold text-sm mb-2 text-slate-800 dark:text-slate-200">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-sm">🔑</span>
              <span className="text-slate-600 dark:text-slate-300">Primary Key</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">🔗</span>
              <span className="text-slate-600 dark:text-slate-300">Foreign Key</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-slate-400 dark:bg-slate-500 rounded" />
              <span className="text-slate-600 dark:text-slate-300">Relationship Line</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <span className="text-slate-600 dark:text-slate-300">Source (PK)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-slate-600 dark:text-slate-300">Target (FK)</span>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-3 bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 backdrop-blur-sm">
          <h4 className="font-semibold text-sm mb-2 text-slate-800 dark:text-slate-200">
            Instructions
          </h4>
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
            <p>• Drag tables to reposition them</p>
            <p>• Drag the canvas to pan around</p>
            <p>• Grid shows draggable area</p>
            <p>• Use toolbar buttons for zoom controls</p>
            <p>• Mouse wheel to zoom in/out</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
