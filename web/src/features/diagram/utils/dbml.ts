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

// Compute a smart auto-layout for tables based on their relationships.
// Strategy:
// - Build an undirected graph of tables via relationships.
// - Split into connected components.
// - For each component:
//   - Choose a root with the highest degree.
//   - BFS to assign levels (columns) left-to-right.
//   - Within each column, stack tables vertically with spacing and center the column
//     against the tallest column in the component.
// - Place components left-to-right with generous spacing between them.
function layoutTables(tables: ITable[], relationships: IRelationship[]): ITable[] {
  if (!tables.length) return tables;

  const SPACING_X = DEFAULT_TABLE_SPACING; // horizontal gap between columns in a component
  const SPACING_Y = DEFAULT_TABLE_SPACING; // vertical gap between tables in a column
  const COMPONENT_GAP_X = DEFAULT_TABLE_SPACING * 3; // gap between components
  const TOP_MARGIN = 20;
  const LEFT_MARGIN = 20;

  const idToIndex = new Map<string, number>();
  tables.forEach((t, idx) => idToIndex.set(t.id, idx));

  // Build adjacency map
  const adj = new Map<string, Set<string>>();
  for (const t of tables) adj.set(t.id, new Set());
  for (const r of relationships) {
    if (adj.has(r.sourceTableId) && adj.has(r.targetTableId)) {
      adj.get(r.sourceTableId)!.add(r.targetTableId);
      adj.get(r.targetTableId)!.add(r.sourceTableId);
    }
  }

  const visited = new Set<string>();
  const components: string[][] = [];

  // Find connected components
  for (const t of tables) {
    if (visited.has(t.id)) continue;
    const queue: string[] = [t.id];
    const comp: string[] = [];
    visited.add(t.id);
    while (queue.length) {
      const u = queue.shift()!;
      comp.push(u);
      for (const v of adj.get(u) ?? []) {
        if (!visited.has(v)) {
          visited.add(v);
          queue.push(v);
        }
      }
    }
    components.push(comp);
  }

  // For deterministic outcome, sort components by size desc (bigger first)
  components.sort((a, b) => b.length - a.length);

  // Helper to compute total height of a column (stack of tables)
  const columnHeight = (ids: string[]) => {
    if (ids.length === 0) return 0;
    let h = 0;
    for (let i = 0; i < ids.length; i++) {
      const t = tables[idToIndex.get(ids[i])!];
      h += t.height;
      if (i < ids.length - 1) h += SPACING_Y;
    }
    return h;
  };

  // Layout result: clone positions to avoid mutating input
  const out = tables.map((t) => ({ ...t, position: { ...t.position } }));

  let cursorX = LEFT_MARGIN;
  const cursorY = TOP_MARGIN;

  for (const comp of components) {
    // Choose a root with highest degree (fallback to first if all isolated)
    let root = comp[0];
    let bestDeg = -1;
    for (const id of comp) {
      const deg = (adj.get(id) ?? new Set()).size;
      if (deg > bestDeg) {
        bestDeg = deg;
        root = id;
      }
    }

    // BFS levels from root
    const level = new Map<string, number>();
    const q: string[] = [root];
    level.set(root, 0);
    for (let qi = 0; qi < q.length; qi++) {
      const u = q[qi];
      for (const v of adj.get(u) ?? []) {
        if (!level.has(v)) {
          level.set(v, (level.get(u) || 0) + 1);
          q.push(v);
        }
      }
    }

    // Any nodes not reached (e.g., isolates inside comp when bestDeg == 0)
    for (const id of comp) {
      if (!level.has(id)) level.set(id, 0);
    }

    // Group nodes by level index
    const maxLevel = Math.max(...Array.from(level.values()));
    const columns: string[][] = Array.from({ length: maxLevel + 1 }, () => []);
    for (const [id, lv] of level.entries()) {
      columns[lv].push(id);
    }

    // Sort each column by degree desc to place hubs earlier (visual grouping)
    for (const col of columns) {
      col.sort((a, b) => (adj.get(b)?.size || 0) - (adj.get(a)?.size || 0));
    }

    // Compute component height as max column height
    const colHeights = columns.map((ids) => columnHeight(ids));
    const compHeight = colHeights.length ? Math.max(...colHeights) : 0;

    // Position columns
    let compWidth = 0;
    for (let lv = 0; lv < columns.length; lv++) {
      const ids = columns[lv];
      const x = cursorX + lv * (TABLE_WIDTH + SPACING_X);
      const h = colHeights[lv] || 0;
      const yStart = cursorY + (compHeight - h) / 2; // center this column
      let y = yStart;
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const idx = idToIndex.get(id)!;
        out[idx].position.x = x;
        out[idx].position.y = y;
        y += out[idx].height + SPACING_Y;
      }
      compWidth = Math.max(compWidth, lv * (TABLE_WIDTH + SPACING_X) + TABLE_WIDTH);
    }

    // If the component had no columns (shouldn't happen), place any orphans
    if (columns.length === 0) {
      const id = comp[0];
      const idx = idToIndex.get(id)!;
      out[idx].position.x = cursorX;
      out[idx].position.y = cursorY;
      compWidth = TABLE_WIDTH;
    }

    // Advance cursor for next component
    cursorX += compWidth + COMPONENT_GAP_X;
  }

  return out;
}

export function parseDbmlToDiagram(dbml: string): IERDiagram {
  const parser = new Parser();
  const db: Database = parser.parse(dbml, 'dbml');

  if (db.schemas.length === 0) {
    return { tables: [], relationships: [] };
  }
  const schema = db.schemas[0];

  // Build tables first (width/height known for layout)
  const tables = schema.tables.map((table: Table) => ({
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
    position: { x: 0, y: 0 },
    width: TABLE_WIDTH,
    height: HEADER_COLUMN_HEIGHT + table.fields.length * COLUMN_HEIGHT
  })) as ITable[];

  // Build relationships
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

  // Compute smart layout positions
  const laidOutTables = layoutTables(tables, relationships);

  return { tables: laidOutTables, relationships };
}
