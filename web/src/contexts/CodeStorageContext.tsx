'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  ReactNode
} from 'react';
import { codeStorage } from '@/services/codeStorage';
import { useCodeSync, CodeChange } from '@/hooks/useCodeSync';
import { ProjectFiles, FileContent, FileMetadata } from '@/services/codeStorage';
import { useProjectManager } from './project-manager-context';

// State structure for the context
interface CodeStorageState {
  projects: Map<string, ProjectFiles>;
  activeProjectId: string | null;
  isConnected: boolean;
  lastUpdate: Date | null;
  error: string | null;
}

// Action types for the reducer
type CodeStorageAction =
  | { type: 'SET_ACTIVE_PROJECT'; projectId: string }
  | { type: 'SET_CONNECTION_STATUS'; isConnected: boolean }
  | { type: 'SET_PROJECT_FILES'; projectId: string; files: ProjectFiles }
  | { type: 'UPDATE_FILE'; projectId: string; filePath: string; metadata: FileMetadata }
  | { type: 'DELETE_FILE'; projectId: string; filePath: string }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'CLEAR_PROJECT'; projectId: string }
  | { type: 'CLEAR_ALL' };

// Context interface
interface CodeStorageContextType extends CodeStorageState {
  // Project operations
  // eslint-disable-next-line no-unused-vars
  setActiveProject: (projectId: string) => void;
  // eslint-disable-next-line no-unused-vars
  clearProject: (projectId: string) => void;
  clearAllProjects: () => void;

  // File operations
  getFile: (
    // eslint-disable-next-line no-unused-vars
    projectId: string,
    // eslint-disable-next-line no-unused-vars
    filePath: string,
    // eslint-disable-next-line no-unused-vars
    forceRefresh?: boolean
  ) => Promise<FileContent | null>;
  // eslint-disable-next-line no-unused-vars
  getProjectFiles: (projectId: string, forceRefresh?: boolean) => Promise<ProjectFiles | null>;
  saveFile: (
    // eslint-disable-next-line no-unused-vars
    projectId: string,
    // eslint-disable-next-line no-unused-vars
    filePath: string,
    // eslint-disable-next-line no-unused-vars
    content: string,
    // eslint-disable-next-line no-unused-vars
    immediate?: boolean
  ) => Promise<unknown>;
  // eslint-disable-next-line no-unused-vars
  deleteFile: (projectId: string, filePath: string) => Promise<unknown>;

  // Utility methods
  // eslint-disable-next-line no-unused-vars
  getFileMetadata: (projectId: string, filePath: string) => FileMetadata | null;
  // eslint-disable-next-line no-unused-vars
  getProjectFilesList: (projectId: string) => string[];
  // eslint-disable-next-line no-unused-vars
  isFileLoaded: (projectId: string, filePath: string) => boolean;
}

// Initial state
const initialState: CodeStorageState = {
  projects: new Map<string, ProjectFiles>(),
  activeProjectId: null,
  isConnected: false,
  lastUpdate: null,
  error: null
};

// Create the context
const CodeStorageContext = createContext<CodeStorageContextType | undefined>(undefined);

// Reducer function
function codeStorageReducer(state: CodeStorageState, action: CodeStorageAction): CodeStorageState {
  switch (action.type) {
    case 'SET_ACTIVE_PROJECT':
      return {
        ...state,
        activeProjectId: action.projectId
      };

    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        isConnected: action.isConnected,
        lastUpdate: new Date()
      };

    case 'SET_PROJECT_FILES': {
      // Create a new Map to avoid mutating the original
      const newProjects = new Map(state.projects);
      newProjects.set(action.projectId, action.files);

      return {
        ...state,
        projects: newProjects,
        lastUpdate: new Date()
      };
    }

    case 'UPDATE_FILE': {
      const newProjects = new Map(state.projects);
      const project = newProjects.get(action.projectId);

      if (project) {
        // Create a new project files object with the updated file
        const updatedProject = {
          ...project,
          files: {
            ...project.files,
            [action.filePath]: action.metadata
          }
        };

        newProjects.set(action.projectId, updatedProject);
      }

      return {
        ...state,
        projects: newProjects,
        lastUpdate: new Date()
      };
    }

    case 'DELETE_FILE': {
      const newProjects = new Map(state.projects);
      const project = newProjects.get(action.projectId);

      if (project && project.files[action.filePath]) {
        // Create a new files object without the deleted file
        // Using object destructuring to remove the file path while keeping the rest
        const newFiles = { ...project.files };
        delete newFiles[action.filePath];
        const remainingFiles = newFiles;

        const updatedProject = {
          ...project,
          files: remainingFiles,
          file_count: project.file_count - 1
        };

        newProjects.set(action.projectId, updatedProject);
      }

      return {
        ...state,
        projects: newProjects,
        lastUpdate: new Date()
      };
    }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        lastUpdate: new Date()
      };

    case 'CLEAR_PROJECT': {
      const newProjects = new Map(state.projects);
      newProjects.delete(action.projectId);

      // If the active project is being cleared, set it to null
      const newActiveProjectId =
        state.activeProjectId === action.projectId ? null : state.activeProjectId;

      return {
        ...state,
        projects: newProjects,
        activeProjectId: newActiveProjectId,
        lastUpdate: new Date()
      };
    }

    case 'CLEAR_ALL':
      return {
        ...initialState,
        lastUpdate: new Date()
      };

    default:
      return state;
  }
}

// Provider props
export interface CodeStorageProviderProps {
  children: ReactNode;
  initialProjectId?: string;
}

// Provider component
export function CodeStorageProvider({ children, initialProjectId }: CodeStorageProviderProps) {
  const { activeProjectId } = useProjectManager();
  // Use reducer for state management
  const [state, dispatch] = useReducer(codeStorageReducer, {
    ...initialState,
    activeProjectId
  });

  // Set up SSE connection for real-time updates
  useCodeSync({
    projectId: activeProjectId,
    onConnect: () => {
      dispatch({ type: 'SET_CONNECTION_STATUS', isConnected: true });
    },
    onDisconnect: () => {
      dispatch({ type: 'SET_CONNECTION_STATUS', isConnected: false });
    },
    onError: (error) => {
      dispatch({ type: 'SET_ERROR', error });
    },
    onFileChange: (change) => {
      handleFileChange(change);
    }
  });

  // Handle file changes from SSE
  const handleFileChange = useCallback((change: CodeChange) => {
    const { project_id, file_path, action, content_hash, size } = change;

    if (action === 'delete') {
      dispatch({
        type: 'DELETE_FILE',
        projectId: project_id,
        filePath: file_path
      });

      // Also clear from the cache
      codeStorage.clearFileCache(project_id, file_path);
    } else {
      // For create or update, add/update the file metadata
      dispatch({
        type: 'UPDATE_FILE',
        projectId: project_id,
        filePath: file_path,
        metadata: {
          hash: content_hash || '',
          size: size || 0,
          timestamp: new Date().toISOString()
        }
      });

      // Also clear from the cache
      codeStorage.clearFileCache(project_id, file_path);
      // Refresh the project files to get the updated list
      getProjectFiles(project_id, true).catch(console.error);
    }
  }, []);

  // Set active project
  const setActiveProject = useCallback((projectId: string) => {
    dispatch({ type: 'SET_ACTIVE_PROJECT', projectId });

    // Load project files when active project changes
    getProjectFiles(projectId).catch(console.error);
  }, []);

  // Clear a project
  const clearProject = useCallback((projectId: string) => {
    dispatch({ type: 'CLEAR_PROJECT', projectId });
    codeStorage.clearProjectCache(projectId);
  }, []);

  // Clear all projects
  const clearAllProjects = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
    codeStorage.clearAllCaches();
  }, []);

  // Get a file
  const getFile = useCallback(
    async (
      projectId: string,
      filePath: string,
      forceRefresh = false
    ): Promise<FileContent | null> => {
      try {
        const fileContent = await codeStorage.getFile(projectId, filePath, { forceRefresh });
        // Update the file metadata in the state
        if (fileContent) {
          dispatch({
            type: 'UPDATE_FILE',
            projectId,
            filePath,
            metadata: fileContent.metadata
            // content: fileContent.content
          });
        }

        return fileContent;
      } catch (error) {
        console.error(`Error getting file ${filePath}:`, error);
        dispatch({ type: 'SET_ERROR', error: (error as Error).message });
        return null;
      }
    },
    []
  );

  // Get all files for a project
  const getProjectFiles = useCallback(
    async (projectId: string, forceRefresh = false): Promise<ProjectFiles | null> => {
      try {
        const projectFiles = await codeStorage.getProjectFiles(projectId, { forceRefresh });

        if (projectFiles) {
          dispatch({
            type: 'SET_PROJECT_FILES',
            projectId,
            files: projectFiles
          });
        }

        return projectFiles;
      } catch (error) {
        console.error(`Error getting project files for ${projectId}:`, error);
        dispatch({ type: 'SET_ERROR', error: (error as Error).message });
        return null;
      }
    },
    []
  );

  // Save a file
  const saveFile = useCallback(
    async (
      projectId: string,
      filePath: string,
      content: string,
      immediate = false
    ): Promise<unknown> => {
      try {
        const result = await codeStorage.saveFile(projectId, filePath, content, { immediate });

        if (result) {
          // Update the file metadata in the state
          dispatch({
            type: 'UPDATE_FILE',
            projectId,
            filePath,
            metadata: (result as { metadata: FileMetadata }).metadata
          });
        }

        return result;
      } catch (error) {
        console.error(`Error saving file ${filePath}:`, error);
        dispatch({ type: 'SET_ERROR', error: (error as Error).message });
        throw error;
      }
    },
    []
  );

  // Delete a file
  const deleteFile = useCallback(async (projectId: string, filePath: string): Promise<unknown> => {
    try {
      const result = await codeStorage.deleteFile(projectId, filePath);

      if (result) {
        // Remove the file from the state
        dispatch({
          type: 'DELETE_FILE',
          projectId,
          filePath
        });
      }

      return result;
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
      dispatch({ type: 'SET_ERROR', error: (error as Error).message });
      throw error;
    }
  }, []);

  // Get file metadata
  const getFileMetadata = useCallback(
    (projectId: string, filePath: string): FileMetadata | null => {
      const project = state.projects.get(projectId);
      return project && project.files[filePath] ? project.files[filePath] : null;
    },
    [state.projects]
  );

  // Get list of files in a project
  const getProjectFilesList = useCallback(
    (projectId: string): string[] => {
      const project = state.projects.get(projectId);
      return project ? Object.keys(project.files) : [];
    },
    [state.projects]
  );

  // Check if a file is loaded
  const isFileLoaded = useCallback((projectId: string, filePath: string): boolean => {
    return codeStorage.isFileInCache(projectId, filePath);
  }, []);

  // Load initial project files if initialProjectId is provided
  useEffect(() => {
    if (initialProjectId) {
      getProjectFiles(initialProjectId).catch(console.error);
    }
  }, [initialProjectId, getProjectFiles]);

  // Memoize context value to prevent unnecessary rerenders
  const contextValue = useMemo(
    () => ({
      // State
      projects: state.projects,
      activeProjectId: state.activeProjectId,
      isConnected: state.isConnected,
      lastUpdate: state.lastUpdate,
      error: state.error,

      // Methods
      setActiveProject,
      clearProject,
      clearAllProjects,
      getFile,
      getProjectFiles,
      saveFile,
      deleteFile,
      getFileMetadata,
      getProjectFilesList,
      isFileLoaded
    }),
    [
      state.projects,
      state.activeProjectId,
      state.isConnected,
      state.lastUpdate,
      state.error,
      setActiveProject,
      clearProject,
      clearAllProjects,
      getFile,
      getProjectFiles,
      saveFile,
      deleteFile,
      getFileMetadata,
      getProjectFilesList,
      isFileLoaded
    ]
  );

  return <CodeStorageContext.Provider value={contextValue}>{children}</CodeStorageContext.Provider>;
}

// Custom hook to use the context
export function useCodeStorage() {
  const context = useContext(CodeStorageContext);

  if (context === undefined) {
    throw new Error('useCodeStorage must be used within a CodeStorageProvider');
  }

  return context;
}
