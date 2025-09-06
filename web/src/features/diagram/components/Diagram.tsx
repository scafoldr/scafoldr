'use client';

import { Stage, Layer, Line } from 'react-konva';
import Relationship from './Relationship';
import { IERDiagram, ITable } from '../types';
import Table from './Table';
import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

interface DiagramProps {
  initialDiagram: IERDiagram;
}

export interface DiagramRef {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  fitToScreen: () => void;
}

const Diagram = forwardRef<DiagramRef, DiagramProps>(({ initialDiagram }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [diagram, setDiagram] = useState<IERDiagram>(initialDiagram);

  // Resolve initial overlaps between tables when a diagram is loaded
  const MIN_TABLE_GAP_INIT = 24; // px; should mirror Table.tsx MIN_TABLE_GAP

  type Rect = { left: number; top: number; right: number; bottom: number };
  const rectFromTable = (t: ITable): Rect => ({
    left: t.position.x,
    top: t.position.y,
    right: t.position.x + t.width,
    bottom: t.position.y + t.height,
  });
  const expandRectHalf = (r: Rect, gap: number): Rect => {
    const h = gap / 2;
    return { left: r.left - h, top: r.top - h, right: r.right + h, bottom: r.bottom + h };
  };
  const resolveInitialCollisions = (tables: ITable[], gap: number): ITable[] => {
    const res = tables.map((t) => ({ ...t, position: { ...t.position } }));
    const maxIter = 200;
    for (let iter = 0; iter < maxIter; iter++) {
      let movedAny = false;
      for (let i = 0; i < res.length; i++) {
        for (let j = i + 1; j < res.length; j++) {
          const a = res[i];
          const b = res[j];
          const ar = expandRectHalf(rectFromTable(a), gap);
          const br = expandRectHalf(rectFromTable(b), gap);
          const overlapX = Math.min(ar.right, br.right) - Math.max(ar.left, br.left);
          const overlapY = Math.min(ar.bottom, br.bottom) - Math.max(ar.top, br.top);
          if (overlapX > 0 && overlapY > 0) {
            // Push apart along the axis with smaller overlap
            if (overlapX < overlapY) {
              const push = overlapX / 2 + 0.5;
              const aCenter = (ar.left + ar.right) / 2;
              const bCenter = (br.left + br.right) / 2;
              if (aCenter <= bCenter) {
                a.position.x -= push;
                b.position.x += push;
              } else {
                a.position.x += push;
                b.position.x -= push;
              }
            } else {
              const push = overlapY / 2 + 0.5;
              const aCenter = (ar.top + ar.bottom) / 2;
              const bCenter = (br.top + br.bottom) / 2;
              if (aCenter <= bCenter) {
                a.position.y -= push;
                b.position.y += push;
              } else {
                a.position.y += push;
                b.position.y -= push;
              }
            }
            movedAny = true;
          }
        }
      }
      if (!movedAny) break;
    }
    return res;
  };


  useEffect(() => {
    const resolved = resolveInitialCollisions(initialDiagram.tables, MIN_TABLE_GAP_INIT);
    setDiagram({ ...initialDiagram, tables: resolved });
  }, [initialDiagram]);

  const [sceneWidth, setSceneWidth] = useState(710);
  const [sceneHeight, setSceneHeight] = useState(626);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const MIN_SCALE = 0.5; // Prevent zooming out below 50%
  const MAX_SCALE = 3;
  const SCALE_FACTOR = 1.2;
  const didAutoFit = useRef(false);
  const didCenterTables = useRef(false);


  useEffect(() => {
    if (containerRef.current) {
      const bounds = containerRef.current.getBoundingClientRect();
      setSceneWidth(bounds.width);
      setSceneHeight(bounds.height);
    }
  }, []);

  // Zoom functions
  const zoomIn = () => {
    const newScale = Math.min(scale * SCALE_FACTOR, MAX_SCALE);
    setScale(newScale);
  };

  const zoomOut = () => {
    const newScale = Math.max(scale / SCALE_FACTOR, MIN_SCALE);
    setScale(newScale);
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const fitToScreen = () => {
    if (!diagram.tables.length) return;

    // Calculate bounding box of all tables
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    diagram.tables.forEach((table) => {
      minX = Math.min(minX, table.position.x);
      minY = Math.min(minY, table.position.y);
      maxX = Math.max(maxX, table.position.x + table.width);
      maxY = Math.max(maxY, table.position.y + table.height);
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // No padding: fit exactly to tables' bounding box
    const padding = 0;
    const scaleX = (sceneWidth - padding * 2) / contentWidth;
    const scaleY = (sceneHeight - padding * 2) / contentHeight;
    const newScale = Math.min(scaleX, scaleY, MAX_SCALE);

    // Center the content
    const centerX = (sceneWidth - contentWidth * newScale) / 2 - minX * newScale;
    const centerY = (sceneHeight - contentHeight * newScale) / 2 - minY * newScale;

    setScale(newScale);
    setPosition({ x: centerX, y: centerY });
  };

  // Center content without changing scale
  const centerContent = () => {
    if (!diagram.tables.length) return;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    diagram.tables.forEach((table) => {
      minX = Math.min(minX, table.position.x);
      minY = Math.min(minY, table.position.y);
      maxX = Math.max(maxX, table.position.x + table.width);
      maxY = Math.max(maxY, table.position.y + table.height);
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    const centerX = (sceneWidth - contentWidth * scale) / 2 - minX * scale;
    const centerY = (sceneHeight - contentHeight * scale) / 2 - minY * scale;
    setPosition({ x: centerX, y: centerY });
  };

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen
  }));

  // Auto fit to screen after initial collision resolution and measuring container
  useEffect(() => {
    if (didAutoFit.current) return;
    if (!diagram.tables.length) return;
    if (!sceneWidth || !sceneHeight) return;
    didAutoFit.current = true;
    requestAnimationFrame(() => {
      fitToScreen();
    });
  }, [diagram.tables, sceneWidth, sceneHeight]);

  // After auto-fit centers the view, shift tables so their bounding box center aligns
  // exactly with the canvas center (in world coordinates). Runs once.
  useEffect(() => {
    if (!didAutoFit.current) return; // wait until we have centered view
    if (didCenterTables.current) return;
    if (!diagram.tables.length) return;
    if (!sceneWidth || !sceneHeight) return;

    // Compute world-space center corresponding to the screen center
    const worldCenterX = (sceneWidth / 2 - position.x) / scale;
    const worldCenterY = (sceneHeight / 2 - position.y) / scale;

    // Compute current tables bounding box center
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    diagram.tables.forEach((t) => {
      minX = Math.min(minX, t.position.x);
      minY = Math.min(minY, t.position.y);
      maxX = Math.max(maxX, t.position.x + t.width);
      maxY = Math.max(maxY, t.position.y + t.height);
    });
    if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) return;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const dx = worldCenterX - cx;
    const dy = worldCenterY - cy;

    // If already centered (within subpixel), do nothing
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
      didCenterTables.current = true;
      return;
    }

    const shifted: IERDiagram = {
      ...diagram,
      tables: diagram.tables.map((t) => ({
        ...t,
        position: { x: t.position.x + dx, y: t.position.y + dy },
      })),
    };
    didCenterTables.current = true;
    setDiagram(shifted);
    // After tables moved, re-fit once to ensure perfect centering with current settings
    requestAnimationFrame(() => {
      fitToScreen();
    });
  }, [diagram, sceneWidth, sceneHeight, scale, position]);

  // Handle wheel zoom
  const handleWheel = (e: any) => {
    e.evt.preventDefault();

    const scaleBy = 1.02;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale
    };

    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale
    };

    setScale(newScale);
    setPosition(newPos);
  };

  const handleDragMove = (tableId: string, x: number, y: number) => {
    setDiagram((prevDiagram) => {
      const updatedTables = prevDiagram.tables.map((table) => {
        if (table.id === tableId) {
          return { ...table, position: { x, y } };
        }
        return table;
      });

      return { ...prevDiagram, tables: updatedTables };
    });
  };

  // Infinite grid background component with theme support
  const GridBackground = () => {
    const gridSize = 20;
    const gridLines = [];

    // Create a much larger grid that extends beyond the visible area
    const gridExtension = 2000; // Extra space around the visible area
    const startX = -gridExtension;
    const endX = sceneWidth + gridExtension;
    const startY = -gridExtension;
    const endY = sceneHeight + gridExtension;

    // Use lighter grid color for light mode, darker for dark mode
    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? '#334155' : '#e2e8f0'; // slate-700 for dark, slate-200 for light
    const gridOpacity = isDark ? 0.4 : 0.6;

    // Vertical lines
    for (let i = startX; i <= endX; i += gridSize) {
      gridLines.push(
        <Line
          key={`v-${i}`}
          points={[i, startY, i, endY]}
          stroke={gridColor}
          strokeWidth={0.5}
          opacity={gridOpacity}
        />
      );
    }

    // Horizontal lines
    for (let i = startY; i <= endY; i += gridSize) {
      gridLines.push(
        <Line
          key={`h-${i}`}
          points={[startX, i, endX, i]}
          stroke={gridColor}
          strokeWidth={0.5}
          opacity={gridOpacity}
        />
      );
    }

    return <>{gridLines}</>;
  };

  return (
    <div
      tabIndex={0}
      className="diagram w-full h-full overflow-hidden cursor-move"
      ref={containerRef}>
      <Stage
        width={sceneWidth}
        height={sceneHeight}
        pixelRatio={window.devicePixelRatio}
        draggable
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onWheel={handleWheel}
        ref={stageRef}>
        <Layer>
          {/* Grid Background */}
          <GridBackground />

          {diagram.tables.map((table) => {
            return (
              <Table
                key={table.id}
                table={table}
                allTables={diagram.tables}
                stageScale={scale}
                stageOffset={position}
                onDragMove={handleDragMove}
              />
            );
          })}

          {diagram.relationships.map((rel) => {
            return <Relationship key={rel.id} relationship={rel} tables={diagram.tables} />;
          })}
        </Layer>
      </Stage>
    </div>
  );
});

Diagram.displayName = 'Diagram';

export default Diagram;
