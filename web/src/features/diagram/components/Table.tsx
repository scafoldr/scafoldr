'use client';

import React, { Fragment } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { ITable } from '../types';
import { COLUMN_HEIGHT, COLUMN_PADDING_LEFT, FONT_SIZE, HEADER_COLUMN_HEIGHT } from '../constants';

// Minimum gap to keep between tables while dragging
const MIN_TABLE_GAP = 60; // px

type RectLike = { left: number; top: number; right: number; bottom: number };

const rectFromTable = (t: ITable): RectLike => ({
  left: t.position.x,
  top: t.position.y,
  right: t.position.x + t.width,
  bottom: t.position.y + t.height
});

const expandRect = (r: RectLike, by: number): RectLike => ({
  left: r.left - by,
  top: r.top - by,
  right: r.right + by,
  bottom: r.bottom + by
});

const intersects = (a: RectLike, b: RectLike) =>
  Math.min(a.right, b.right) > Math.max(a.left, b.left) &&
  Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top);

// Theme-aware colors
const getThemeColors = () => {
  const isDark = document.documentElement.classList.contains('dark');

  if (isDark) {
    return {
      TABLE_BACKGROUND: '#1e293b', // slate-800
      TABLE_BORDER: '#334155', // slate-700
      HEADER_BACKGROUND: '#0f172a', // slate-900
      HEADER_TEXT: '#e2e8f0', // slate-200
      FIELD_NAME_COLOR: '#f1f5f9', // slate-100
      FIELD_TYPE_COLOR: '#94a3b8', // slate-400
      PK_HIGHLIGHT: 'rgba(245, 158, 11, 0.1)', // amber with opacity
      FK_HIGHLIGHT: 'rgba(59, 130, 246, 0.1)' // blue with opacity
    };
  } else {
    return {
      TABLE_BACKGROUND: '#ffffff', // white
      TABLE_BORDER: '#d1d5db', // gray-300
      HEADER_BACKGROUND: '#f8fafc', // slate-50
      HEADER_TEXT: '#1e293b', // slate-800
      FIELD_NAME_COLOR: '#374151', // gray-700
      FIELD_TYPE_COLOR: '#6b7280', // gray-500
      PK_HIGHLIGHT: 'rgba(245, 158, 11, 0.15)', // amber with opacity
      FK_HIGHLIGHT: 'rgba(59, 130, 246, 0.15)' // blue with opacity
    };
  }
};

const PK_ICON_COLOR = '#f59e0b'; // amber-500
const FK_ICON_COLOR = '#3b82f6'; // blue-500

const Table = ({
  table,
  allTables,
  stageScale,
  stageOffset,
  onDragMove
}: {
  table: ITable;
  allTables: ITable[];
  stageScale: number;
  stageOffset: { x: number; y: number };
  // eslint-disable-next-line no-unused-vars
  onDragMove: (tableId: string, x: number, y: number) => void;
}) => {
  const lastIdx = table.columns.length - 1;
  const colors = getThemeColors();

  const dragBoundFunc = (absPos: { x: number; y: number }) => {
    const toLocal = (ax: number, ay: number) => ({
      x: (ax - stageOffset.x) / stageScale,
      y: (ay - stageOffset.y) / stageScale
    });
    const toAbs = (lx: number, ly: number) => ({
      x: lx * stageScale + stageOffset.x,
      y: ly * stageScale + stageOffset.y
    });

    let { x, y } = toLocal(absPos.x, absPos.y);
    const width = table.width;
    const height = table.height;

    const me: RectLike = { left: x, top: y, right: x + width, bottom: y + height };

    // Precompute expanded obstacle rects
    const obstacles = allTables
      .filter((t) => t.id !== table.id)
      .map((t) => expandRect(rectFromTable(t), MIN_TABLE_GAP));

    // Check if dragged rect overlaps ALL possible gaps (no place to fit)
    const overlapsAll = obstacles.some((ob) => intersects(me, ob));
    if (overlapsAll) {
      // ❌ reject move – snap back
      return toAbs(table.position.x, table.position.y);
    }

    // ✅ otherwise do your normal overlap resolution
    let guard = 0;
    let moved = true;
    while (moved && guard < 50) {
      moved = false;
      for (const ob of obstacles) {
        if (!intersects(me, ob)) continue;
        const overlapX = Math.min(me.right, ob.right) - Math.max(me.left, ob.left);
        const overlapY = Math.min(me.bottom, ob.bottom) - Math.max(me.top, ob.top);
        if (overlapX <= 0 || overlapY <= 0) continue;

        if (overlapX <= overlapY) {
          const meCenterX = (me.left + me.right) / 2;
          const obCenterX = (ob.left + ob.right) / 2;
          if (meCenterX < obCenterX) x -= overlapX;
          else x += overlapX;
        } else {
          const meCenterY = (me.top + me.bottom) / 2;
          const obCenterY = (ob.top + ob.bottom) / 2;
          if (meCenterY < obCenterY) y -= overlapY;
          else y += overlapY;
        }
        me.left = x;
        me.top = y;
        me.right = x + width;
        me.bottom = y + height;
        moved = true;
      }
      guard++;
    }

    return toAbs(x, y);
  };

  return (
    <Group
      x={table.position.x}
      y={table.position.y}
      draggable
      dragBoundFunc={dragBoundFunc}
      onDragStart={(e) => {
        // ensure dragged table is on top, not hidden behind others
        e.target.moveToTop();
        const layer = e.target.getLayer();
        if (layer) layer.batchDraw();
      }}
      onDragMove={(e) => {
        onDragMove(table.id, e.target.x(), e.target.y());
      }}>
      {/* Table container with shadow effect */}
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

      {/* Header background */}
      <Rect
        width={table.width}
        height={HEADER_COLUMN_HEIGHT}
        fill={colors.HEADER_BACKGROUND}
        stroke={colors.TABLE_BORDER}
        strokeWidth={1}
        cornerRadius={[8, 8, 0, 0]}
      />

      {/* Table icon (database symbol) */}
      <Text text="🗃️" x={COLUMN_PADDING_LEFT} y={HEADER_COLUMN_HEIGHT / 2 - 8} fontSize={16} />

      {/* Table name */}
      <Text
        text={table.name}
        x={COLUMN_PADDING_LEFT + 25}
        y={HEADER_COLUMN_HEIGHT / 2 - 8}
        fontSize={FONT_SIZE}
        fill={colors.HEADER_TEXT}
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
                fill={colors.TABLE_BORDER}
              />
            )}

            {/* Highlight background for PK/FK */}
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

            {/* Key icon */}
            <Text
              text={isPK ? '🔑' : isFK ? '🔗' : ''}
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
              fill={isPK ? PK_ICON_COLOR : isFK ? FK_ICON_COLOR : colors.FIELD_NAME_COLOR}
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
