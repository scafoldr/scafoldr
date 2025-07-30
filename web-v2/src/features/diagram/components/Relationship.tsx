'use client';

import React from 'react';
import { Arrow } from 'react-konva';
import { IRelationship, ITable } from '../types';
import { COLUMN_HEIGHT, HEADER_COLUMN_HEIGHT, TABLE_WIDTH } from '../constants';

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

  const startX =
    sourceTable.position.x < targetTable.position.x
      ? sourceTable.position.x + TABLE_WIDTH
      : sourceTable.position.x;
  const startY =
    sourceTable.position.y +
    HEADER_COLUMN_HEIGHT +
    COLUMN_HEIGHT * sourceColumn.index +
    COLUMN_HEIGHT / 2;

  const endX =
    targetTable.position.x < sourceTable.position.x
      ? targetTable.position.x + TABLE_WIDTH
      : targetTable.position.x;
  const endY =
    targetTable.position.y +
    HEADER_COLUMN_HEIGHT +
    COLUMN_HEIGHT * targetColumn.index +
    COLUMN_HEIGHT / 2;

  return (
    <Arrow
      points={[startX, startY, endX, endY]}
      stroke="#a855f7"
      fill="#a855f7"
      strokeWidth={2}
      pointerLength={8}
      pointerWidth={8}
      shadowColor="rgba(168, 85, 247, 0.3)"
      shadowBlur={4}
      shadowOffset={{ x: 0, y: 2 }}
      shadowOpacity={0.5}
    />
  );
};

export default Relationship;