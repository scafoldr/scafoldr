'use client';

import React, { useState, useRef, useCallback, ReactNode } from 'react';

interface ResizableLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  showLeftPanel?: boolean;
}

export function ResizableLayout({
  leftPanel,
  rightPanel,
  defaultLeftWidth = 320,
  minLeftWidth = 280,
  maxLeftWidth = 600,
  showLeftPanel = true
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
        style={{
          width: showLeftPanel ? leftWidth : 0
        }}
        className={`
          border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col
          transition-all duration-300 ease-in-out
          ${showLeftPanel ? '' : 'overflow-hidden'}
        `}>
        {showLeftPanel && leftPanel}
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={showLeftPanel ? handleMouseDown : undefined}
        className={`
          bg-slate-200 dark:bg-slate-700 cursor-col-resize transition-all duration-300 ease-in-out
          ${showLeftPanel ? 'w-1 hover:bg-blue-500 dark:hover:bg-blue-400' : 'w-0'}
          ${isResizing ? 'bg-blue-500 dark:bg-blue-400' : ''}
          ${!showLeftPanel ? 'pointer-events-none' : ''}
        `}
        style={{ minWidth: showLeftPanel ? '4px' : '0px' }}
      />

      {/* Right Panel */}
      <div className="flex-1 flex flex-col min-w-0">{rightPanel}</div>
    </div>
  );
}
