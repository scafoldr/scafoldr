'use client';

import { Stage, Layer, Line } from 'react-konva';
import Relationship from './Relationship';
import { IERDiagram } from '../types';
import Table from './Table';
import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

interface DiagramProps {
  initialDiagram: IERDiagram;
}

export interface DiagramRef {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  fitToScreen: () => void;
}

const Diagram = forwardRef<DiagramRef, DiagramProps>(({ initialDiagram }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [diagram, setDiagram] = useState<IERDiagram>(initialDiagram);

  useEffect(() => {
    setDiagram(initialDiagram);
  }, [initialDiagram]);

  const [sceneWidth, setSceneWidth] = useState(710);
  const [sceneHeight, setSceneHeight] = useState(626);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const MIN_SCALE = 0.25; // Prevent zooming out below 25%
  const MAX_SCALE = 3;
  const SCALE_FACTOR = 1.2;

  useEffect(() => {
    if (containerRef.current) {
      const bounds = containerRef.current.getBoundingClientRect();
      setSceneWidth(bounds.width);
      setSceneHeight(bounds.height);
    }
  }, []);

  // Zoom functions
  const zoomIn = () => {
    const newScale = Math.min(scale * SCALE_FACTOR, MAX_SCALE);
    setScale(newScale);
  };

  const zoomOut = () => {
    const newScale = Math.max(scale / SCALE_FACTOR, MIN_SCALE);
    setScale(newScale);
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const fitToScreen = () => {
    if (!diagram.tables.length) return;

    // Calculate bounding box of all tables
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    diagram.tables.forEach(table => {
      minX = Math.min(minX, table.position.x);
      minY = Math.min(minY, table.position.y);
      maxX = Math.max(maxX, table.position.x + table.width);
      maxY = Math.max(maxY, table.position.y + table.height);
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    // Add padding
    const padding = 50;
    const scaleX = (sceneWidth - padding * 2) / contentWidth;
    const scaleY = (sceneHeight - padding * 2) / contentHeight;
    const newScale = Math.min(scaleX, scaleY, MAX_SCALE);
    
    // Center the content
    const centerX = (sceneWidth - contentWidth * newScale) / 2 - minX * newScale;
    const centerY = (sceneHeight - contentHeight * newScale) / 2 - minY * newScale;
    
    setScale(newScale);
    setPosition({ x: centerX, y: centerY });
  };

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
  }));

  // Handle wheel zoom
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.02;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    
    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    
    setScale(newScale);
    setPosition(newPos);
  };

  const handleDragMove = (tableId: string, x: number, y: number) => {
    setDiagram((prevDiagram) => {
      const updatedTables = prevDiagram.tables.map((table) => {
        if (table.id === tableId) {
          return { ...table, position: { x, y } };
        }
        return table;
      });

      return { ...prevDiagram, tables: updatedTables };
    });
  };

  // Infinite grid background component with dark theme
  const GridBackground = () => {
    const gridSize = 20;
    const gridLines = [];
    
    // Create a much larger grid that extends beyond the visible area
    const gridExtension = 2000; // Extra space around the visible area
    const startX = -gridExtension;
    const endX = sceneWidth + gridExtension;
    const startY = -gridExtension;
    const endY = sceneHeight + gridExtension;
    
    // Vertical lines
    for (let i = startX; i <= endX; i += gridSize) {
      gridLines.push(
        <Line
          key={`v-${i}`}
          points={[i, startY, i, endY]}
          stroke="#334155"
          strokeWidth={0.5}
          opacity={0.4}
        />
      );
    }
    
    // Horizontal lines
    for (let i = startY; i <= endY; i += gridSize) {
      gridLines.push(
        <Line
          key={`h-${i}`}
          points={[startX, i, endX, i]}
          stroke="#334155"
          strokeWidth={0.5}
          opacity={0.4}
        />
      );
    }
    
    return <>{gridLines}</>;
  };

  return (
    <div tabIndex={0} className="diagram w-full h-full overflow-hidden cursor-move" ref={containerRef}>
      <Stage 
        width={sceneWidth} 
        height={sceneHeight} 
        pixelRatio={window.devicePixelRatio} 
        draggable
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onWheel={handleWheel}
        ref={stageRef}
      >
        <Layer>
          {/* Grid Background */}
          <GridBackground />
          
          {diagram.tables.map((table) => {
            return <Table key={table.id} table={table} onDragMove={handleDragMove} />;
          })}

          {diagram.relationships.map((rel) => {
            return <Relationship key={rel.id} relationship={rel} tables={diagram.tables} />;
          })}
        </Layer>
      </Stage>
    </div>
  );
});

Diagram.displayName = 'Diagram';

export default Diagram;