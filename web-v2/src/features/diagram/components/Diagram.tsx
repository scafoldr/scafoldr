'use client';

import { Stage, Layer, Line } from 'react-konva';
import Relationship from './Relationship';
import { IERDiagram } from '../types';
import Table from './Table';
import { useEffect, useRef, useState } from 'react';

interface DiagramProps {
  initialDiagram: IERDiagram;
}

const Diagram = ({ initialDiagram }: DiagramProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [diagram, setDiagram] = useState<IERDiagram>(initialDiagram);

  useEffect(() => {
    setDiagram(initialDiagram);
  }, [initialDiagram]);

  const [sceneWidth, setSceneWidth] = useState(710);
  const [sceneHeight, setSceneHeight] = useState(626);

  useEffect(() => {
    if (ref.current) {
      const bounds = ref.current.getBoundingClientRect();
      setSceneWidth(bounds.width);
      setSceneHeight(bounds.height);
    }
  }, []);

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
    <div tabIndex={0} className="diagram w-full h-full overflow-hidden cursor-move" ref={ref}>
      <Stage width={sceneWidth} height={sceneHeight} pixelRatio={window.devicePixelRatio} draggable>
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
};

export default Diagram;