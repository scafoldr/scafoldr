"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Maximize, Download } from "lucide-react"
import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with Konva
const DynamicDiagram = dynamic(
  () => import('@/features/diagram').then(mod => ({ default: mod.Diagram })),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full">Loading diagram...</div>
  }
)

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

  useEffect(() => {
    // Load the parser dynamically
    import('@/features/diagram').then(mod => {
      try {
        // Use provided DBML code or fall back to sample
        const dbmlToUse = dbmlCode || sampleDbml;
        const parsedDiagram = mod.parseDbmlToDiagram(dbmlToUse);
        setDiagram(parsedDiagram);
      } catch (error) {
        console.error('Error parsing DBML:', error);
        // Fallback to empty diagram
        setDiagram({ tables: [], relationships: [] });
      } finally {
        setIsLoading(false);
      }
    });
  }, [dbmlCode]);

  if (isLoading) {
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
        <Button variant="outline" size="sm">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm">
          <Maximize className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {/* Interactive Diagram */}
      <div className="w-full h-full">
        <DynamicDiagram initialDiagram={diagram} />
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
        </div>
      </Card>
    </div>
  )
}