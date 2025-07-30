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

// Modern dark theme colors matching the design
const TABLE_BACKGROUND = '#1e293b'; // slate-800
const TABLE_BORDER = '#334155'; // slate-700
const HEADER_BACKGROUND = '#0f172a'; // slate-900
const HEADER_TEXT = '#e2e8f0'; // slate-200
const TABLE_ICON_COLOR = '#a855f7'; // purple-500

const FIELD_NAME_COLOR = '#f1f5f9'; // slate-100
const FIELD_TYPE_COLOR = '#94a3b8'; // slate-400
const PK_ICON_COLOR = '#f59e0b'; // amber-500
const FK_ICON_COLOR = '#3b82f6'; // blue-500

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
      
      {/* Table container with shadow effect */}
      <Rect
        width={table.width}
        height={table.height}
        fill={TABLE_BACKGROUND}
        stroke={TABLE_BORDER}
        strokeWidth={1}
        cornerRadius={8}
        shadowColor="rgba(0, 0, 0, 0.3)"
        shadowBlur={10}
        shadowOffset={{ x: 0, y: 4 }}
        shadowOpacity={0.3}
      />
      
      {/* Header background */}
      <Rect
        width={table.width}
        height={HEADER_COLUMN_HEIGHT}
        fill={HEADER_BACKGROUND}
        stroke={TABLE_BORDER}
        strokeWidth={1}
        cornerRadius={[8, 8, 0, 0]}
      />
      
      {/* Table icon (database symbol) */}
      <Text
        text="🗃️"
        x={COLUMN_PADDING_LEFT}
        y={HEADER_COLUMN_HEIGHT / 2 - 8}
        fontSize={16}
      />
      
      {/* Table name */}
      <Text
        text={table.name}
        x={COLUMN_PADDING_LEFT + 25}
        y={HEADER_COLUMN_HEIGHT / 2 - 8}
        fontSize={FONT_SIZE}
        fill={HEADER_TEXT}
        fontStyle="bold"
        fontFamily="system-ui, -apple-system, sans-serif"
      />
      
      {/* Column rows */}
      {table.columns.map((col, idx) => {
        const isPK = col.isPrimary;
        const isFK = col.isForeign;
        const yPos = HEADER_COLUMN_HEIGHT + idx * COLUMN_HEIGHT;

        return (
          <Fragment key={col.id}>
            {/* Column separator line */}
            {idx > 0 && (
              <Rect
                x={COLUMN_PADDING_LEFT}
                y={yPos}
                width={table.width - COLUMN_PADDING_LEFT * 2}
                height={0.5}
                fill={TABLE_BORDER}
              />
            )}
            
            {/* Highlight background for PK/FK */}
            {(isPK || isFK) && (
              <Rect
                x={0}
                y={yPos}
                width={table.width}
                height={COLUMN_HEIGHT}
                fill={isPK ? "rgba(245, 158, 11, 0.1)" : "rgba(59, 130, 246, 0.1)"} // amber-500 or blue-500 with low opacity
                cornerRadius={idx === lastIdx ? [0, 0, 8, 8] : 0}
              />
            )}
            
            {/* Key icon */}
            <Text
              text={isPK ? "🔑" : isFK ? "🔗" : ""}
              x={COLUMN_PADDING_LEFT}
              y={yPos + COLUMN_HEIGHT / 2 - 6}
              fontSize={12}
            />
            
            {/* Field name */}
            <Text
              text={col.name}
              x={COLUMN_PADDING_LEFT + (isPK || isFK ? 22 : 0)}
              y={yPos + COLUMN_HEIGHT / 2 - 7}
              fontSize={FONT_SIZE - 1}
              fill={isPK ? "#f59e0b" : isFK ? "#3b82f6" : FIELD_NAME_COLOR} // amber-500 for PK, blue-500 for FK
              fontFamily="system-ui, -apple-system, sans-serif"
              fontStyle={isPK ? 'bold' : 'normal'}
            />
            
            {/* Required indicator */}
            {(isPK || col.name.includes('_id')) && (
              <Text
                text="*"
                x={COLUMN_PADDING_LEFT + (isPK || isFK ? 22 : 0) + col.name.length * 8}
                y={yPos + COLUMN_HEIGHT / 2 - 7}
                fontSize={FONT_SIZE - 1}
                fill="#ef4444" // red-500
                fontFamily="system-ui, -apple-system, sans-serif"
              />
            )}
            
            {/* Data type */}
            <Text
              text={col.dataType.toUpperCase()}
              x={table.width - COLUMN_PADDING_LEFT - col.dataType.length * 7}
              y={yPos + COLUMN_HEIGHT / 2 - 7}
              fontSize={FONT_SIZE - 3}
              fill={FIELD_TYPE_COLOR}
              fontFamily="system-ui, -apple-system, monospace"
            />
          </Fragment>
        );
      })}
    </Group>
  );
};

export default Table;