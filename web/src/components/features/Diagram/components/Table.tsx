'use client';

import React, { Fragment } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { ITable } from '../types';
import {
  COLUMN_HEIGHT,
  COLUMN_PADDING_LEFT,
  COLUMN_PADDING_TOP,
  FONT_SIZE,
  HEADER_COLUMN_HEIGHT
} from '../constants';

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
        height={HEADER_COLUMN_HEIGHT}
        fill="#333652"
        stroke="#2b6cb0"
        strokeWidth={0}
        cornerRadius={0}
      />
      <Text
        text={table.name}
        x={COLUMN_PADDING_LEFT}
        y={COLUMN_PADDING_TOP}
        fontSize={FONT_SIZE}
        fill="#FAD02C"
      />
      {table.columns.map((col, idx) => (
        <Fragment key={col.id}>
          <Rect
            width={table.width}
            height={COLUMN_HEIGHT}
            y={HEADER_COLUMN_HEIGHT + idx * COLUMN_HEIGHT} // header height (30) plus an increment per column
            fill="#90ADC6"
            stroke="#2b6cb0"
            strokeWidth={0}
            cornerRadius={0}
          />
          <Text
            text={`${col.name}: ${col.dataType}${col.isPrimary ? ' [pk]' : ''} ${col.isForeign ? ' [fk]' : ''}`}
            x={COLUMN_PADDING_LEFT}
            y={HEADER_COLUMN_HEIGHT + idx * COLUMN_HEIGHT + COLUMN_PADDING_TOP} // header height (30) plus an increment per column
            fontSize={FONT_SIZE}
            fill="#333652"
          />
        </Fragment>
      ))}
    </Group>
  );
};

export default Table;
