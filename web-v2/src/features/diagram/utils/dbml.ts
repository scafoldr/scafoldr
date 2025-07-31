import { Parser } from '@dbml/core';
import { IColumn, IERDiagram, IRelationship, ITable } from '../types';
import Database from '@dbml/core/types/model_structure/database';
import Table from '@dbml/core/types/model_structure/table';
import Ref from '@dbml/core/types/model_structure/ref';
import Field from '@dbml/core/types/model_structure/field';
import {
  COLUMN_HEIGHT,
  DEFAULT_TABLE_SPACING,
  HEADER_COLUMN_HEIGHT,
  TABLE_WIDTH
} from '../constants';

export function parseDbmlToDiagram(dbml: string): IERDiagram {
  const parser = new Parser();
  const db: Database = parser.parse(dbml, 'dbml');

  if (db.schemas.length === 0) {
    return { tables: [], relationships: [] };
  }
  const schema = db.schemas[0];

  const tables = schema.tables.map((table: Table, index) => ({
    id: table.name,
    name: table.name,
    columns: table.fields.map(
      (f: Field, index): IColumn => ({
        id: `${table.name}.${f.name}`,
        name: f.name,
        dataType: f.type.type_name,
        isPrimary: f.pk,
        isForeign: !f.pk && f.endpoints.length > 0,
        index
      })
    ),
    position: { x: index * (TABLE_WIDTH + DEFAULT_TABLE_SPACING), y: 20 },
    width: TABLE_WIDTH,
    height: HEADER_COLUMN_HEIGHT + table.fields.length * COLUMN_HEIGHT
  })) as ITable[];

  const relationships: IRelationship[] = schema.refs.map((ref: Ref) => {
    const sourceEndpoint = ref.endpoints.find((ep) => ep.relation == '1') ?? ref.endpoints[0];
    const targetEndpoint = ref.endpoints.find((ep) => ep.relation == '*') ?? ref.endpoints[1];

    return {
      id: `${sourceEndpoint.tableName}.${sourceEndpoint.fieldNames[0]}.${targetEndpoint.tableName}.${targetEndpoint.fieldNames[0]}`,
      sourceTableId: `${sourceEndpoint.tableName}`,
      sourceColumnId: `${sourceEndpoint.tableName}.${sourceEndpoint.fieldNames[0]}`,
      targetTableId: `${targetEndpoint.tableName}`,
      targetColumnId: `${targetEndpoint.tableName}.${targetEndpoint.fieldNames[0]}`
    };
  });

  return { tables, relationships };
}
