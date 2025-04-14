'use client';

import React from 'react';
import { Group, Rect, Text } from 'react-konva';
import { ITable } from '../types';

const Table = ({
  table,
  onDragMove
}: {
  table: ITable;
  // eslint-disable-next-line no-unused-vars
  onDragMove: (tableId: string, x: number, y: number) => void;
}) => {
  return (
    <Group
      x={table.position.x}
      y={table.position.y}
      draggable
      onDragMove={(e) => {
        onDragMove(table.id, e.target.x(), e.target.y());
      }}>
      <Rect
        width={table.width}
        height={table.height}
        fill="white"
        stroke="#2b6cb0"
        strokeWidth={2}
        cornerRadius={4}
      />
      <Text text={table.name} x={10} y={10} fontSize={14} fill="blue" />
      {table.columns.map((col, idx) => (
        <Text
          key={col.id}
          text={`${col.name}: ${col.dataType}${col.isPrimary ? ' [pk]' : ''} ${col.isForeign ? ' [fk]' : ''}`}
          x={10}
          y={30 + idx * 20} // header height (30) plus an increment per column
          fontSize={12}
          fill="#333"
        />
      ))}
    </Group>
  );
};

export default Table;
