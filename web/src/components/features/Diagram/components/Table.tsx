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

const HEADER_FILL = '#2c3e50';
const HEADER_FONT_COLOR = '#f1c40f';

const PK_ROW_FILL = '#f8c1c1'; // пастельный розовый
const PK_TEXT_COLOR = '#8b3e3e'; // тёмно-бордовый

const FK_ROW_FILL = '#a8d0ff'; // пастельный голубой
const FK_TEXT_COLOR = '#2a4d8f'; // тёмно-синий

const DEFAULT_ROW_FILL = '#ecf0f1';
const DEFAULT_TEXT_COLOR = '#2c3e50';

const COLUMN_STROKE = '#bdc3c7';

const Table = ({
  table,
  onDragMove
}: {
  table: ITable;
  // eslint-disable-next-line no-unused-vars
  onDragMove: (tableId: string, x: number, y: number) => void;
}) => {
  const lastIdx = table.columns.length - 1;

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
        fill={HEADER_FILL}
        stroke="#34495e"
        strokeWidth={1}
        cornerRadius={[10, 10, 0, 0]}
      />
      <Text
        text={table.name}
        x={COLUMN_PADDING_LEFT}
        y={COLUMN_PADDING_TOP}
        fontSize={FONT_SIZE}
        fill={HEADER_FONT_COLOR}
        fontStyle="bold"
      />
      {table.columns.map((col, idx) => {
        const isPK = col.isPrimary;
        const isFK = col.isForeign;

        const fill = isPK ? PK_ROW_FILL : isFK ? FK_ROW_FILL : DEFAULT_ROW_FILL;
        const textColor = isPK ? PK_TEXT_COLOR : isFK ? FK_TEXT_COLOR : DEFAULT_TEXT_COLOR;

        return (
          <Fragment key={col.id}>
            <Rect
              width={table.width}
              height={COLUMN_HEIGHT}
              y={HEADER_COLUMN_HEIGHT + idx * COLUMN_HEIGHT}
              fill={fill}
              stroke={COLUMN_STROKE}
              strokeWidth={1}
              cornerRadius={idx === lastIdx ? [0, 0, 10, 10] : 0}
            />
            <Text
              text={`${col.name}: ${col.dataType}`}
              x={COLUMN_PADDING_LEFT}
              y={HEADER_COLUMN_HEIGHT + idx * COLUMN_HEIGHT + COLUMN_PADDING_TOP}
              fontSize={FONT_SIZE}
              fill={textColor}
              fontStyle={isPK ? 'bold' : 'normal'}
            />
          </Fragment>
        );
      })}
    </Group>
  );
};

export default Table;
