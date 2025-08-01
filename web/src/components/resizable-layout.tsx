'use client';

import React, { useState, useRef, useCallback, ReactNode } from 'react';

interface ResizableLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
}

export function ResizableLayout({
  leftPanel,
  rightPanel,
  defaultLeftWidth = 320,
  minLeftWidth = 280,
  maxLeftWidth = 600
}: ResizableLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;

      // Constrain the width within min and max bounds
      const constrainedWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newWidth));
      setLeftWidth(constrainedWidth);
    },
    [isResizing, minLeftWidth, maxLeftWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add global mouse event listeners when resizing
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="flex-1 flex overflow-hidden">
      {/* Left Panel */}
      <div
        style={{ width: leftWidth }}
        className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        {leftPanel}
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`w-1 bg-slate-200 dark:bg-slate-700 hover:bg-blue-500 dark:hover:bg-blue-400 cursor-col-resize transition-colors ${
          isResizing ? 'bg-blue-500 dark:bg-blue-400' : ''
        }`}
        style={{ minWidth: '4px' }}
      />

      {/* Right Panel */}
      <div className="flex-1 flex flex-col min-w-0">{rightPanel}</div>
    </div>
  );
}
