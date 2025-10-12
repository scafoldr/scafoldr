'use client';

/**
 * ProjectManagerContext
 *
 * A React context for managing project-related state across the application.
 * Currently stores and provides access to the current activeProjectId.
 */

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

// State structure for the context
interface ProjectManagerState {
  activeProjectId: string;
  selectedFramework: string;
}

// Context interface
interface ProjectManagerContextType extends ProjectManagerState {
  // eslint-disable-next-line no-unused-vars
  setActiveProjectId: (value: string) => void;
  // eslint-disable-next-line no-unused-vars
  setSelectedFramework: (value: string) => void;
}

// Define initial state

// Create the context
const ProjectManagerContext = createContext<ProjectManagerContextType | undefined>(undefined);

// Provider props
export interface ProjectManagerProviderProps {
  children: ReactNode;
  initialActiveProjectId?: string;
}

export function ProjectManagerProvider({
  children,
  initialActiveProjectId = Math.random().toString(36).substring(2, 15)
}: ProjectManagerProviderProps) {
  const [activeProjectId, setActiveProjectIdState] = useState<string>(initialActiveProjectId);
  const [selectedFramework, setSelectedFrameworkState] = useState<string>('next-js-typescript');

  const setActiveProjectId = useCallback((value: string) => {
    setActiveProjectIdState(value);
  }, []);

  const setSelectedFramework = useCallback((value: string) => {
    setSelectedFrameworkState(value);
  }, []);

  // Memoize context value to prevent unnecessary rerenders
  const contextValue = useMemo(
    () => ({
      // State
      activeProjectId,
      selectedFramework,

      // Methods
      setActiveProjectId,
      setSelectedFramework
    }),
    [activeProjectId, selectedFramework, setActiveProjectId, setSelectedFramework]
  );

  return (
    <ProjectManagerContext.Provider value={contextValue}>{children}</ProjectManagerContext.Provider>
  );
}

// Custom hook to use the context
export function useProjectManager() {
  const context = useContext(ProjectManagerContext);

  if (context === undefined) {
    throw new Error('useProjectManager must be used within a ProjectManagerProvider');
  }

  return context;
}
