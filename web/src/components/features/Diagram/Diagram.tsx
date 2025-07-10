'use client';

import { Stage, Layer } from 'react-konva';
import Relationship from './components/Relationship';
import { IERDiagram } from './types';
import Table from './components/Table';
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

  return (
    <div tabIndex={0} className="diagram w-full h-full overflow-hidden cursor-pointer" ref={ref}>
      <Stage width={sceneWidth} height={sceneHeight} pixelRatio={window.devicePixelRatio} draggable>
        <Layer>
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
