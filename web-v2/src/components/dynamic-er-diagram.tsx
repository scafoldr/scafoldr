"use client"

import React, { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Maximize, Download } from "lucide-react"

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
}

export function DynamicERDiagram({ dbmlCode }: DynamicERDiagramProps) {
  const [diagram, setDiagram] = useState<any>({ tables: [], relationships: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [DiagramComponent, setDiagramComponent] = useState<any>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const MIN_SCALE = 0.25; // Prevent zooming out below 25%
  const MAX_SCALE = 3;
  const SCALE_FACTOR = 1.2;

  useEffect(() => {
    // Load both the parser and component dynamically
    Promise.all([
      import('@/features/diagram')
    ]).then(([diagramModule]) => {
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

  // Direct zoom handlers that manage state locally
  const handleZoomIn = () => {
    const newScale = Math.min(scale * SCALE_FACTOR, MAX_SCALE);
    setScale(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale / SCALE_FACTOR, MIN_SCALE);
    setScale(newScale);
  };

  const handleFitToScreen = () => {
    if (!diagram.tables.length) return;

    // Calculate bounding box of all tables
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    diagram.tables.forEach((table: any) => {
      minX = Math.min(minX, table.position.x);
      minY = Math.min(minY, table.position.y);
      maxX = Math.max(maxX, table.position.x + table.width);
      maxY = Math.max(maxY, table.position.y + table.height);
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    // Add padding and calculate scale
    const padding = 50;
    const sceneWidth = 800; // Approximate viewport width
    const sceneHeight = 600; // Approximate viewport height
    const scaleX = (sceneWidth - padding * 2) / contentWidth;
    const scaleY = (sceneHeight - padding * 2) / contentHeight;
    const newScale = Math.min(scaleX, scaleY, MAX_SCALE);
    
    // Center the content
    const centerX = (sceneWidth - contentWidth * newScale) / 2 - minX * newScale;
    const centerY = (sceneHeight - contentHeight * newScale) / 2 - minY * newScale;
    
    setScale(newScale);
    setPosition({ x: centerX, y: centerY });
  };

  if (isLoading || !DiagramComponent) {
    return (
      <div className="h-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-500">Loading diagram...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-900 relative">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleFitToScreen}
          title="Fit to Screen"
        >
          <Maximize className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" title="Download">
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {/* Interactive Diagram with controlled scale and position */}
      <div className="w-full h-full" style={{ transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`, transformOrigin: 'top left' }}>
        <DiagramComponent initialDiagram={diagram} />
      </div>

      {/* Scale indicator */}
      <div className="absolute top-4 left-4 z-10 bg-slate-800/90 border-slate-700 backdrop-blur-sm rounded px-2 py-1 text-xs text-slate-300">
        Zoom: {Math.round(scale * 100)}%
      </div>

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 p-3 bg-slate-800/90 border-slate-700 backdrop-blur-sm">
        <h4 className="font-semibold text-sm mb-2 text-slate-200">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-sm">🔑</span>
            <span className="text-slate-300">Primary Key</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm">🔗</span>
            <span className="text-slate-300">Foreign Key</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-1 bg-slate-500 rounded" />
            <span className="text-slate-300">Relationship Line</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full" />
            <span className="text-slate-300">Source (PK)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-slate-300">Target (FK)</span>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="absolute bottom-4 right-4 p-3 bg-slate-800/90 border-slate-700 backdrop-blur-sm max-w-xs">
        <h4 className="font-semibold text-sm mb-2 text-slate-200">Instructions</h4>
        <div className="space-y-1 text-xs text-slate-400">
          <p>• Drag tables to reposition them</p>
          <p>• Drag the canvas to pan around</p>
          <p>• Grid shows draggable area</p>
          <p>• Use toolbar buttons for zoom controls</p>
          <p>• Mouse wheel to zoom in/out</p>
        </div>
      </Card>
    </div>
  )
}