'use client';

import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize, Download } from 'lucide-react';
import { Diagram, parseDbmlToDiagram, IERDiagram, type DiagramRef } from '@/features/diagram';

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

export function EnhancedERDiagram() {
  const [diagram, setDiagram] = useState<IERDiagram>({ tables: [], relationships: [] });
  const [isLoading, setIsLoading] = useState(true);
  const diagramRef = useRef<DiagramRef>(null);

  useEffect(() => {
    try {
      const parsedDiagram = parseDbmlToDiagram(sampleDbml);
      setDiagram(parsedDiagram);
    } catch (error) {
      console.error('Error parsing DBML:', error);
      // Fallback to empty diagram
      setDiagram({ tables: [], relationships: [] });
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="h-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-500">Loading diagram...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 relative">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => diagramRef.current?.zoomOut()}
          title="Zoom Out">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => diagramRef.current?.zoomIn()}
          title="Zoom In">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => diagramRef.current?.fitToScreen()}
          title="Fit to Screen">
          <Maximize className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" title="Download">
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {/* Interactive Diagram */}
      <div className="w-full h-full">
        <Diagram ref={diagramRef} initialDiagram={diagram} />
      </div>

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
        <h4 className="font-semibold text-sm mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-200 border border-red-400 rounded-sm" />
            <span>Primary Key</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-200 border border-blue-400 rounded-sm" />
            <span>Foreign Key</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-1 bg-yellow-500" />
            <span>Relationship</span>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="absolute bottom-4 right-4 p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm max-w-xs">
        <h4 className="font-semibold text-sm mb-2">Instructions</h4>
        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
          <p>• Drag tables to reposition them</p>
          <p>• Scroll to pan around the diagram</p>
          <p>• Use toolbar buttons for zoom controls</p>
          <p>• Mouse wheel to zoom in/out</p>
        </div>
      </Card>
    </div>
  );
}
