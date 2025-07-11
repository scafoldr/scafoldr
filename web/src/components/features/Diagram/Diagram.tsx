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

  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);

  const sceneWidth = 710;
  const sceneHeight = 626;

  useEffect(() => {
    setDiagram(initialDiagram);
  }, [initialDiagram]);

  useEffect(() => {
    if (!ref.current) return;

    setScaleX(ref.current.offsetWidth / sceneWidth);
    setScaleY(ref.current.offsetHeight / sceneHeight);
  }, [ref?.current]);

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

  // const scaleX = (ref?.current?.getBoundingClientRect().width ?? sceneWidth) / sceneWidth;
  // const scaleY = (ref?.current?.getBoundingClientRect().height ?? sceneHeight) / sceneHeight;

  return (
    <div tabIndex={0} className="diagram w-full h-full overflow-hidden cursor-pointer" ref={ref}>
      <Stage
        // quick fix for glitching issue on tabs switching
        width={sceneWidth * scaleX - 8}
        height={sceneHeight * scaleY}
        scale={{ x: scaleX * 0.7, y: scaleY }}
        draggable>
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
