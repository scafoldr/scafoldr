'use client';

import React, { Fragment, useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { ITable } from '../types';
import { COLUMN_HEIGHT, COLUMN_PADDING_LEFT, FONT_SIZE, HEADER_COLUMN_HEIGHT } from '../constants';

// Theme-aware colors
const getThemeColors = () => {
  const isDark = document.documentElement.classList.contains('dark');

  if (isDark) {
    return {
      TABLE_BACKGROUND: '#1e293b',
      TABLE_BORDER: '#334155',
      HEADER_BACKGROUND: '#0f172a',
      HEADER_TEXT: '#e2e8f0',
      FIELD_NAME_COLOR: '#f1f5f9',
      FIELD_TYPE_COLOR: '#94a3b8',
      PK_HIGHLIGHT: 'rgba(245, 158, 11, 0.1)',
      FK_HIGHLIGHT: 'rgba(59, 130, 246, 0.1)'
    };
  } else {
    return {
      TABLE_BACKGROUND: '#ffffff',
      TABLE_BORDER: '#d1d5db',
      HEADER_BACKGROUND: '#f8fafc',
      HEADER_TEXT: '#1e293b',
      FIELD_NAME_COLOR: '#374151',
      FIELD_TYPE_COLOR: '#6b7280',
      PK_HIGHLIGHT: 'rgba(245, 158, 11, 0.15)',
      FK_HIGHLIGHT: 'rgba(59, 130, 246, 0.15)'
    };
  }
};

const PK_ICON_COLOR = '#f59e0b';
const FK_ICON_COLOR = '#3b82f6';

// overlap check
const intersects = (a: ITable, b: ITable) =>
  Math.min(a.position.x + a.width, b.position.x + b.width) > Math.max(a.position.x, b.position.x) &&
  Math.min(a.position.y + a.height, b.position.y + b.height) > Math.max(a.position.y, b.position.y);

// ✅ Extract props interface (fixes ESLint warnings)
interface TableProps {
  table: ITable;
  allTables: ITable[];
  stageScale: number;
  stageOffset: { x: number; y: number };
  onDragMove: (tableId: string, x: number, y: number) => void; // <-- fix here
}

const Table = ({ table, allTables, onDragMove }: TableProps) => {
  const lastIdx = table.columns.length - 1;
  const colors = getThemeColors();

  const [isDragging, setIsDragging] = useState(false);
  const [isOverlapping, setIsOverlapping] = useState(false);

  return (
    <Group
      x={table.position.x}
      y={table.position.y}
      draggable
      opacity={isDragging && isOverlapping ? 0.6 : 1} // only while dragging + overlap
      onDragStart={(e) => {
        setIsDragging(true);
        e.target.moveToTop();
        const layer = e.target.getLayer();
        if (layer) layer.batchDraw();
      }}
      onDragMove={(e) => {
        const newX = e.target.x();
        const newY = e.target.y();

        // temporary rect for current drag position
        const me = {
          ...table,
          position: { x: newX, y: newY }
        };

        const overlap = allTables.some((t) => t.id !== table.id && intersects(me, t));

        setIsOverlapping(overlap);
        onDragMove(table.id, newX, newY);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        setIsOverlapping(false);
      }}>
      {/* Table container */}
      <Rect
        width={table.width}
        height={table.height}
        fill={colors.TABLE_BACKGROUND}
        stroke={colors.TABLE_BORDER}
        strokeWidth={1}
        cornerRadius={8}
        shadowColor="rgba(0, 0, 0, 0.15)"
        shadowBlur={8}
        shadowOffset={{ x: 0, y: 2 }}
        shadowOpacity={0.2}
      />

      {/* Header */}
      <Rect
        width={table.width}
        height={HEADER_COLUMN_HEIGHT}
        fill={colors.HEADER_BACKGROUND}
        stroke={colors.TABLE_BORDER}
        strokeWidth={1}
        cornerRadius={[8, 8, 0, 0]}
      />

      <Text text="🗃️" x={COLUMN_PADDING_LEFT} y={HEADER_COLUMN_HEIGHT / 2 - 8} fontSize={16} />

      <Text
        text={table.name}
        x={COLUMN_PADDING_LEFT + 25}
        y={HEADER_COLUMN_HEIGHT / 2 - 8}
        fontSize={FONT_SIZE}
        fill={colors.HEADER_TEXT}
        fontStyle="bold"
        fontFamily="system-ui, -apple-system, sans-serif"
      />

      {/* Columns */}
      {table.columns.map((col, idx) => {
        const isPK = col.isPrimary;
        const isFK = col.isForeign;
        const yPos = HEADER_COLUMN_HEIGHT + idx * COLUMN_HEIGHT;

        return (
          <Fragment key={col.id}>
            {idx > 0 && (
              <Rect
                x={COLUMN_PADDING_LEFT}
                y={yPos}
                width={table.width - COLUMN_PADDING_LEFT * 2}
                height={0.5}
                fill={colors.TABLE_BORDER}
              />
            )}

            {(isPK || isFK) && (
              <Rect
                x={0}
                y={yPos}
                width={table.width}
                height={COLUMN_HEIGHT}
                fill={isPK ? colors.PK_HIGHLIGHT : colors.FK_HIGHLIGHT}
                cornerRadius={idx === lastIdx ? [0, 0, 8, 8] : 0}
              />
            )}

            <Text
              text={isPK ? '🔑' : isFK ? '🔗' : ''}
              x={COLUMN_PADDING_LEFT}
              y={yPos + COLUMN_HEIGHT / 2 - 6}
              fontSize={12}
            />

            <Text
              text={col.name}
              x={COLUMN_PADDING_LEFT + (isPK || isFK ? 22 : 0)}
              y={yPos + COLUMN_HEIGHT / 2 - 7}
              fontSize={FONT_SIZE - 1}
              fill={isPK ? PK_ICON_COLOR : isFK ? FK_ICON_COLOR : colors.FIELD_NAME_COLOR}
              fontFamily="system-ui, -apple-system, sans-serif"
              fontStyle={isPK ? 'bold' : 'normal'}
            />

            {(isPK || col.name.includes('_id')) && (
              <Text
                text="*"
                x={COLUMN_PADDING_LEFT + (isPK || isFK ? 22 : 0) + col.name.length * 8}
                y={yPos + COLUMN_HEIGHT / 2 - 7}
                fontSize={FONT_SIZE - 1}
                fill="#ef4444"
                fontFamily="system-ui, -apple-system, sans-serif"
              />
            )}

            <Text
              text={col.dataType.toUpperCase()}
              x={table.width - COLUMN_PADDING_LEFT - col.dataType.length * 7}
              y={yPos + COLUMN_HEIGHT / 2 - 7}
              fontSize={FONT_SIZE - 3}
              fill={colors.FIELD_TYPE_COLOR}
              fontFamily="system-ui, -apple-system, monospace"
            />
          </Fragment>
        );
      })}
    </Group>
  );
};

export default Table;
