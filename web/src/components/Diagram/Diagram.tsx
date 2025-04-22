'use client';

import { Stage, Layer } from 'react-konva';
import Relationship from './components/Relationship';
import { IERDiagram } from './types';
import Table from './components/Table';
import { useEffect, useState } from 'react';

interface DiagramProps {
  initialDiagram: IERDiagram;
}

const Diagram = ({ initialDiagram }: DiagramProps) => {
  const [diagram, setDiagram] = useState<IERDiagram>(initialDiagram);

  useEffect(() => {
    setDiagram(initialDiagram);
  }, [initialDiagram]);

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

  const stageWidth = 905;
  const stageHeight = 900;

  return (
    <div
      tabIndex={0}
      className="diagram"
      style={{
        backgroundColor: 'rgb(68, 68, 76)',
        cursor: 'default',
        width: stageWidth,
        height: stageHeight
      }}>
      <Stage width={stageWidth} height={stageHeight} draggable>
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
