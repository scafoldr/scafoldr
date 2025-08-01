'use client';

import React from 'react';
import { Line, Circle } from 'react-konva';
import { IRelationship, ITable } from '../types';
import { COLUMN_HEIGHT, HEADER_COLUMN_HEIGHT } from '../constants';

interface RelationshipProps {
  relationship: IRelationship;
  tables: ITable[];
}

const Relationship = ({ relationship, tables }: RelationshipProps) => {
  const sourceTable = tables.find((table) => table.id === relationship.sourceTableId);
  const sourceColumn = sourceTable?.columns.find((col) => col.id === relationship.sourceColumnId);
  const targetTable = tables.find((table) => table.id === relationship.targetTableId);
  const targetColumn = targetTable?.columns.find((col) => col.id === relationship.targetColumnId);

  if (!sourceTable || !sourceColumn || !targetTable || !targetColumn) {
    return null;
  }

  // Calculate connection points on the table edges
  const sourceY =
    sourceTable.position.y +
    HEADER_COLUMN_HEIGHT +
    COLUMN_HEIGHT * sourceColumn.index +
    COLUMN_HEIGHT / 2;
  const targetY =
    targetTable.position.y +
    HEADER_COLUMN_HEIGHT +
    COLUMN_HEIGHT * targetColumn.index +
    COLUMN_HEIGHT / 2;

  const padding = 40;

  // Determine connection sides and points
  const sourceIsLeft = sourceTable.position.x < targetTable.position.x;
  const sourceX = sourceIsLeft
    ? sourceTable.position.x + sourceTable.width
    : sourceTable.position.x;
  const targetX = sourceIsLeft
    ? targetTable.position.x
    : targetTable.position.x + targetTable.width;

  // Get obstacle tables (all tables except source and target)
  const obstacles = tables.filter(
    (table) => table.id !== sourceTable.id && table.id !== targetTable.id
  );

  // Function to check if a line segment intersects with a table
  const lineIntersectsTable = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    table: ITable
  ): boolean => {
    const tableLeft = table.position.x - padding;
    const tableRight = table.position.x + table.width + padding;
    const tableTop = table.position.y - padding;
    const tableBottom = table.position.y + table.height + padding;

    // Check if line is horizontal
    if (y1 === y2) {
      const lineY = y1;
      const lineLeft = Math.min(x1, x2);
      const lineRight = Math.max(x1, x2);

      return (
        lineY >= tableTop &&
        lineY <= tableBottom &&
        lineRight >= tableLeft &&
        lineLeft <= tableRight
      );
    }

    // Check if line is vertical
    if (x1 === x2) {
      const lineX = x1;
      const lineTop = Math.min(y1, y2);
      const lineBottom = Math.max(y1, y2);

      return (
        lineX >= tableLeft &&
        lineX <= tableRight &&
        lineBottom >= tableTop &&
        lineTop <= tableBottom
      );
    }

    return false;
  };

  // Function to check if a path intersects with any obstacles
  const pathIntersectsObstacles = (points: number[]): boolean => {
    for (let i = 0; i < points.length - 2; i += 2) {
      const x1 = points[i];
      const y1 = points[i + 1];
      const x2 = points[i + 2];
      const y2 = points[i + 3];

      for (const obstacle of obstacles) {
        if (lineIntersectsTable(x1, y1, x2, y2, obstacle)) {
          return true;
        }
      }
    }
    return false;
  };

  // Try different routing strategies until we find one that doesn't intersect
  let routingPoints: number[] = [];
  let pathFound = false;

  // Strategy 1: Simple L-shaped connection
  if (!pathFound) {
    const midX = sourceX + (sourceIsLeft ? padding : -padding);
    const testPath = [sourceX, sourceY, midX, sourceY, midX, targetY, targetX, targetY];

    if (!pathIntersectsObstacles(testPath)) {
      routingPoints = testPath;
      pathFound = true;
    }
  }

  // Strategy 2: Route above all tables
  if (!pathFound) {
    const allTables = [sourceTable, targetTable, ...obstacles];
    const minY = Math.min(...allTables.map((t) => t.position.y));
    const routeY = minY - padding * 2;

    const testPath = [
      sourceX,
      sourceY,
      sourceX + (sourceIsLeft ? padding : -padding),
      sourceY,
      sourceX + (sourceIsLeft ? padding : -padding),
      routeY,
      targetX + (sourceIsLeft ? -padding : padding),
      routeY,
      targetX + (sourceIsLeft ? -padding : padding),
      targetY,
      targetX,
      targetY
    ];

    if (!pathIntersectsObstacles(testPath)) {
      routingPoints = testPath;
      pathFound = true;
    }
  }

  // Strategy 3: Route below all tables
  if (!pathFound) {
    const allTables = [sourceTable, targetTable, ...obstacles];
    const maxY = Math.max(...allTables.map((t) => t.position.y + t.height));
    const routeY = maxY + padding * 2;

    const testPath = [
      sourceX,
      sourceY,
      sourceX + (sourceIsLeft ? padding : -padding),
      sourceY,
      sourceX + (sourceIsLeft ? padding : -padding),
      routeY,
      targetX + (sourceIsLeft ? -padding : padding),
      routeY,
      targetX + (sourceIsLeft ? -padding : padding),
      targetY,
      targetX,
      targetY
    ];

    if (!pathIntersectsObstacles(testPath)) {
      routingPoints = testPath;
      pathFound = true;
    }
  }

  // Strategy 4: Route around the left side
  if (!pathFound) {
    const allTables = [sourceTable, targetTable, ...obstacles];
    const minX = Math.min(...allTables.map((t) => t.position.x));
    const routeX = minX - padding * 2;

    const testPath = [
      sourceX,
      sourceY,
      sourceX + (sourceIsLeft ? padding : -padding),
      sourceY,
      routeX,
      sourceY,
      routeX,
      targetY,
      targetX + (sourceIsLeft ? -padding : padding),
      targetY,
      targetX,
      targetY
    ];

    if (!pathIntersectsObstacles(testPath)) {
      routingPoints = testPath;
      pathFound = true;
    }
  }

  // Strategy 5: Route around the right side
  if (!pathFound) {
    const allTables = [sourceTable, targetTable, ...obstacles];
    const maxX = Math.max(...allTables.map((t) => t.position.x + t.width));
    const routeX = maxX + padding * 2;

    const testPath = [
      sourceX,
      sourceY,
      sourceX + (sourceIsLeft ? padding : -padding),
      sourceY,
      routeX,
      sourceY,
      routeX,
      targetY,
      targetX + (sourceIsLeft ? -padding : padding),
      targetY,
      targetX,
      targetY
    ];

    routingPoints = testPath; // Use this as fallback even if it intersects
    pathFound = true;
  }

  return (
    <>
      {/* Main connection line */}
      <Line
        points={routingPoints}
        stroke="#64748b"
        strokeWidth={1.5}
        lineCap="round"
        lineJoin="round"
      />

      {/* Source connection point */}
      <Circle x={sourceX} y={sourceY} radius={3} fill="#f59e0b" stroke="#ffffff" strokeWidth={1} />

      {/* Target connection point */}
      <Circle x={targetX} y={targetY} radius={3} fill="#3b82f6" stroke="#ffffff" strokeWidth={1} />
    </>
  );
};

export default Relationship;
