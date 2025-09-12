'use client';

import React, { useState } from 'react';
import { Arrow, Circle } from 'react-konva';
import { IRelationship, ITable } from '../types';
import { COLUMN_HEIGHT, HEADER_COLUMN_HEIGHT } from '../constants';

interface RelationshipProps {
  relationship: IRelationship;
  tables: ITable[];
}

// Grid routing constants
const GRID_SIZE = 16;
const MARGIN = GRID_SIZE * 10;
const CLEARANCE = 20;
const EXIT_OFFSET = 24;
const END_INSET = 6;

type Rect = { left: number; top: number; right: number; bottom: number };

const rectFromTable = (t: ITable): Rect => ({
  left: t.position.x,
  top: t.position.y,
  right: t.position.x + t.width,
  bottom: t.position.y + t.height
});

const expandRect = (r: Rect, by: number): Rect => ({
  left: r.left - by,
  top: r.top - by,
  right: r.right + by,
  bottom: r.bottom + by
});

const boundsFromTables = (tables: ITable[]): Rect => {
  const xs = tables.flatMap((t) => [t.position.x, t.position.x + t.width]);
  const ys = tables.flatMap((t) => [t.position.y, t.position.y + t.height]);
  return {
    left: Math.min(...xs),
    top: Math.min(...ys),
    right: Math.max(...xs),
    bottom: Math.max(...ys)
  };
};

const alignToGrid = (x: number, y: number, originX: number, originY: number) => {
  const gx = Math.round((x - originX) / GRID_SIZE);
  const gy = Math.round((y - originY) / GRID_SIZE);
  return {
    i: gx,
    j: gy,
    x: originX + gx * GRID_SIZE,
    y: originY + gy * GRID_SIZE
  };
};

const gridToWorld = (i: number, j: number, originX: number, originY: number) => ({
  x: originX + i * GRID_SIZE,
  y: originY + j * GRID_SIZE
});

const Relationship: React.FC<RelationshipProps> = ({ relationship, tables }) => {
  const [hover, setHover] = useState(false);

  const sourceTable = tables.find((t) => t.id === relationship.sourceTableId);
  const sourceColumn = sourceTable?.columns.find((c) => c.id === relationship.sourceColumnId);
  const targetTable = tables.find((t) => t.id === relationship.targetTableId);
  const targetColumn = targetTable?.columns.find((c) => c.id === relationship.targetColumnId);

  if (!sourceTable || !sourceColumn || !targetTable || !targetColumn) return null;

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

  const sourceIsLeft = sourceTable.position.x < targetTable.position.x;
  const sourceX = sourceIsLeft
    ? sourceTable.position.x + sourceTable.width
    : sourceTable.position.x;
  const targetX = sourceIsLeft
    ? targetTable.position.x
    : targetTable.position.x + targetTable.width;

  const allTables = tables;
  const obstacles: Rect[] = allTables.map((t) => expandRect(rectFromTable(t), CLEARANCE));

  const segmentIntersectsRect = (x1: number, y1: number, x2: number, y2: number, r: Rect) => {
    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const top = Math.min(y1, y2);
    const bottom = Math.max(y1, y2);

    if (y1 === y2) return y1 >= r.top && y1 <= r.bottom && right >= r.left && left <= r.right;
    if (x1 === x2) return x1 >= r.left && x1 <= r.right && bottom >= r.top && top <= r.bottom;
    return false;
  };

  const intersectsAny = (x1: number, y1: number, x2: number, y2: number) => {
    return allTables.some((t) => {
      if (t.id === sourceTable.id || t.id === targetTable.id) return false;
      const r = expandRect(rectFromTable(t), CLEARANCE);
      return segmentIntersectsRect(x1, y1, x2, y2, r);
    });
  };

  // Grid setup
  const layoutBounds = boundsFromTables(allTables);
  const minX =
    Math.floor((Math.min(layoutBounds.left, Math.min(sourceX, targetX)) - MARGIN) / GRID_SIZE) *
    GRID_SIZE;
  const minY =
    Math.floor((Math.min(layoutBounds.top, Math.min(sourceY, targetY)) - MARGIN) / GRID_SIZE) *
    GRID_SIZE;
  const maxX =
    Math.ceil((Math.max(layoutBounds.right, Math.max(sourceX, targetX)) + MARGIN) / GRID_SIZE) *
    GRID_SIZE;
  const maxY =
    Math.ceil((Math.max(layoutBounds.bottom, Math.max(sourceY, targetY)) + MARGIN) / GRID_SIZE) *
    GRID_SIZE;

  const originX = minX;
  const originY = minY;
  const cols = Math.max(1, Math.round((maxX - minX) / GRID_SIZE) + 1);
  const rows = Math.max(1, Math.round((maxY - minY) / GRID_SIZE) + 1);

  const idx = (i: number, j: number) => j * cols + i;
  const blocked = new Uint8Array(cols * rows);

  const markBlocked = (r: Rect) => {
    const iMin = Math.floor((r.left - originX) / GRID_SIZE) - 1;
    const iMax = Math.ceil((r.right - originX) / GRID_SIZE) + 1;
    const jMin = Math.floor((r.top - originY) / GRID_SIZE) - 1;
    const jMax = Math.ceil((r.bottom - originY) / GRID_SIZE) + 1;

    for (let j = Math.max(0, jMin); j <= Math.min(rows - 1, jMax); j++) {
      for (let i = Math.max(0, iMin); i <= Math.min(cols - 1, iMax); i++) {
        const { x, y } = gridToWorld(i, j, originX, originY);
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) blocked[idx(i, j)] = 1;
      }
    }
  };
  obstacles.forEach(markBlocked);

  const inBounds = (i: number, j: number) => i >= 0 && j >= 0 && i < cols && j < rows;
  const isPassable = (i: number, j: number) => inBounds(i, j) && blocked[idx(i, j)] === 0;

  const sourceDir: 1 | -1 = sourceIsLeft ? 1 : -1;
  const targetDir: 1 | -1 = sourceIsLeft ? -1 : 1;

  const computeStub = (edgeX: number, edgeY: number, dirX: 1 | -1) => {
    const {
      i: startI,
      j,
      x: startX,
      y: startY
    } = alignToGrid(edgeX + dirX * EXIT_OFFSET, edgeY, originX, originY);

    let i = startI;
    let x = startX;
    let y = startY;
    let guard = 0;

    while (!isPassable(i, j) && guard < 200) {
      const next = gridToWorld(i + dirX, j, originX, originY);
      i += dirX;
      x = next.x;
      y = next.y;
      guard++;
      if (!inBounds(i, j)) break;
    }

    return { i, j, x, y };
  };

  const sStub = computeStub(sourceX, sourceY, sourceDir);
  const tStub = computeStub(targetX, targetY, targetDir);

  // BFS routing
  const bfsRoute = (): number[] | null => {
    const qI = new Int32Array(cols * rows);
    const qJ = new Int32Array(cols * rows);
    let qh = 0,
      qt = 0;
    const visited = new Uint8Array(cols * rows);
    const parent = new Int32Array(cols * rows).fill(-1);

    if (!isPassable(sStub.i, sStub.j) || !isPassable(tStub.i, tStub.j)) return null;

    const startIndex = idx(sStub.i, sStub.j);
    qI[qt] = sStub.i;
    qJ[qt] = sStub.j;
    qt++;
    visited[startIndex] = 1;

    const dirs: [number, number][] = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ];

    let foundIndex = -1;

    while (qh < qt) {
      const ci = qI[qh];
      const cj = qJ[qh];
      qh++;
      const cindex = idx(ci, cj);

      if (ci === tStub.i && cj === tStub.j) {
        foundIndex = cindex;
        break;
      }

      for (const [di, dj] of dirs) {
        const ni = ci + di;
        const nj = cj + dj;
        if (!isPassable(ni, nj)) continue;
        const nindex = idx(ni, nj);
        if (visited[nindex]) continue;
        visited[nindex] = 1;
        parent[nindex] = cindex;
        qI[qt] = ni;
        qJ[qt] = nj;
        qt++;
      }
    }

    if (foundIndex === -1) return null;

    const pathGrid: { i: number; j: number }[] = [];
    let cur = foundIndex;
    while (cur !== -1) {
      const ci = cur % cols;
      const cj = Math.floor(cur / cols);
      pathGrid.push({ i: ci, j: cj });
      cur = parent[cur];
    }
    pathGrid.reverse();

    const pts: number[] = [];
    for (const p of pathGrid) {
      const { x, y } = gridToWorld(p.i, p.j, originX, originY);
      pts.push(x, y);
    }
    return pts;
  };

  const simplify = (pts: number[]) => {
    if (pts.length <= 4) return pts.slice();
    const out: number[] = [];
    let prevDx = 0;
    let prevDy = 0;
    for (let k = 0; k < pts.length; k += 2) {
      const x = pts[k];
      const y = pts[k + 1];
      if (out.length < 2) {
        out.push(x, y);
        continue;
      }
      const lx = out[out.length - 2];
      const ly = out[out.length - 1];
      const dx = Math.sign(x - lx);
      const dy = Math.sign(y - ly);
      // keep only if direction changed or it's the last point
      const isLast = k >= pts.length - 2;
      if (dx !== prevDx || dy !== prevDy || isLast) {
        // If collinear and not last, we skip adding the intermediate point
        out.push(x, y);
        prevDx = dx;
        prevDy = dy;
      } else {
        // replace last point
        out[out.length - 2] = x;
        out[out.length - 1] = y;
      }
    }

    // remove redundant consecutive duplicates
    const dedup: number[] = [];
    for (let i = 0; i < out.length; i += 2) {
      if (i === 0) {
        dedup.push(out[i], out[i + 1]);
      } else {
        const px = dedup[dedup.length - 2];
        const py = dedup[dedup.length - 1];
        if (out[i] !== px || out[i + 1] !== py) {
          dedup.push(out[i], out[i + 1]);
        }
      }
    }
    return dedup;
  };

  // Post-optimization: delay turns as far as safely possible to avoid early bends
  const optimizeCorners = (pts: number[]) => {
    if (!pts || pts.length < 6) return pts;
    let out = pts.slice();
    const MAX_PASSES = 3;
    for (let pass = 0; pass < MAX_PASSES; pass++) {
      let modified = false;
      for (let i = 2; i <= out.length - 4; i += 2) {
        const ax = out[i - 2],
          ay = out[i - 1];
        const bx = out[i],
          by = out[i + 1];
        const cx = out[i + 2],
          cy = out[i + 3];

        const abHorizontal = ay === by;
        const bcVertical = bx === cx;
        const abVertical = ax === bx;
        const bcHorizontal = by === cy;

        // Try to collapse A->B->C into a single straight segment if A and C align
        if (ay === cy && !intersectsAny(ax, ay, cx, cy)) {
          out[i] = cx;
          out[i + 1] = cy;
          modified = true;
          continue;
        }
        if (ax === cx && !intersectsAny(ax, ay, cx, cy)) {
          out[i] = cx;
          out[i + 1] = cy;
          modified = true;
          continue;
        }

        // Case 1: AB horizontal, BC vertical -> move corner horizontally to x=cx (delay the turn)
        if (abHorizontal && bcVertical) {
          const bpx = cx,
            bpy = by;
          if (!intersectsAny(ax, ay, bpx, bpy) && !intersectsAny(bpx, bpy, cx, cy)) {
            out[i] = bpx;
            out[i + 1] = bpy;
            modified = true;
            continue;
          }
        }
        // Case 2: AB vertical, BC horizontal -> move corner vertically to y=cy
        if (abVertical && bcHorizontal) {
          const bpx = bx,
            bpy = cy;
          if (!intersectsAny(ax, ay, bpx, bpy) && !intersectsAny(bpx, bpy, cx, cy)) {
            out[i] = bpx;
            out[i + 1] = bpy;
            modified = true;
            continue;
          }
        }
      }
      const simplified = simplify(out);
      if (simplified.length !== out.length) modified = true;
      out = simplified;
      if (!modified) break;
    }
    return out;
  };

  // Shorten the last segment by a small inset so the arrow does not overrun the target
  const shortenTail = (pts: number[], inset: number) => {
    if (pts.length < 4) return pts;
    const out = pts.slice();
    const l = out.length;
    const x2 = out[l - 2];
    const y2 = out[l - 1];
    const x1 = out[l - 4];
    const y1 = out[l - 3];
    if (y1 === y2) {
      const segLen = Math.abs(x2 - x1);
      const d = Math.min(inset, Math.max(0, segLen - 1));
      if (d > 0) {
        const dir = Math.sign(x2 - x1) || 1;
        out[l - 2] = x2 - dir * d;
      }
    } else if (x1 === x2) {
      const segLen = Math.abs(y2 - y1);
      const d = Math.min(inset, Math.max(0, segLen - 1));
      if (d > 0) {
        const dir = Math.sign(y2 - y1) || 1;
        out[l - 1] = y2 - dir * d;
      }
    }
    return out;
  };

  // Build full path: start stub -> BFS path -> end stub
  let routingPoints: number[] | null = null;

  const bfsPoints = bfsRoute();
  if (bfsPoints) {
    const pts: number[] = [];
    // from source edge towards path; try to avoid an unnecessary initial 90° jog
    pts.push(sourceX, sourceY);

    let startIndex = 0;
    if (bfsPoints.length >= 4) {
      const s0y = bfsPoints[1];
      const s1x = bfsPoints[2];
      const s1y = bfsPoints[3];

      const initialHorizontal = s1y === s0y;
      const ySnappedDiffers = s0y !== sourceY;

      // If the path starts with a horizontal move and we can go straight to s1x at sourceY without hitting obstacles,
      // skip the small vertical jog caused by grid snapping at the start.
      if (initialHorizontal && ySnappedDiffers && !intersectsAny(sourceX, sourceY, s1x, sourceY)) {
        // go horizontally to the second point's x at the true sourceY
        pts.push(s1x, sourceY);
        // then go vertical to the grid row if needed
        if (s1y !== sourceY) pts.push(s1x, s1y);
        startIndex = 2;
      }
    }

    if (startIndex === 0) {
      if (!(sStub.x === sourceX && sStub.y === sourceY)) {
        // horizontal out
        pts.push(sStub.x, sourceY);
        // vertical to stub center only if needed
        if (sStub.y !== sourceY) pts.push(sStub.x, sStub.y);
      }
    }

    // BFS path centers
    for (let i = startIndex; i < bfsPoints.length; i += 2) {
      pts.push(bfsPoints[i], bfsPoints[i + 1]);
    }
    // from last grid point to target edge (orthogonal)
    const lastX = pts[pts.length - 2];
    const lastY = pts[pts.length - 1];
    if (!(lastX === tStub.x && lastY === tStub.y)) {
      // ensure we pass through tStub before entering target
      pts.push(tStub.x, tStub.y);
    }
    // vertical to target Y then horizontal to target X
    pts.push(tStub.x, targetY);
    pts.push(targetX, targetY);

    routingPoints = optimizeCorners(simplify(pts));
    routingPoints = shortenTail(routingPoints, END_INSET);
  }

  // Fallback: simple L-shaped connection if routing failed (rare)
  if (!routingPoints) {
    const midX = sourceX + (sourceIsLeft ? EXIT_OFFSET : -EXIT_OFFSET);
    routingPoints = [sourceX, sourceY, midX, sourceY, midX, targetY, targetX, targetY];
    routingPoints = optimizeCorners(routingPoints);
    routingPoints = shortenTail(routingPoints, END_INSET);
  }

  return (
    <>
      {/* Main connection line (orthogonal path) */}
      <Arrow
        points={routingPoints}
        stroke={hover ? '#0ea5e9' : '#64748b'}
        strokeWidth={hover ? 2.5 : 1.5}
        lineCap="round"
        lineJoin="round"
        pointerLength={8}
        pointerWidth={8}
        fill={hover ? '#0ea5e9' : '#64748b'}
        hitStrokeWidth={12}
        strokeScaleEnabled={false}
        onMouseEnter={(e) => {
          setHover(true);
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = 'pointer';
        }}
        onMouseLeave={(e) => {
          setHover(false);
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = 'default';
        }}
      />

      {/* Source connection point */}
      <Circle x={sourceX} y={sourceY} radius={4} fill="#f59e0b" stroke="#ffffff" strokeWidth={1} />

      {/* Target connection point */}
      <Circle x={targetX} y={targetY} radius={4} fill="#3b82f6" stroke="#ffffff" strokeWidth={1} />
    </>
  );
};

export default Relationship;
