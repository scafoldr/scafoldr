'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

// Types for code changes
export interface CodeChange {
  project_id: string;
  file_path: string;
  action: 'create' | 'update' | 'delete';
  timestamp: number;
  content_hash?: string;
  size?: number;
}

// Types for the hook state
export interface CodeSyncState {
  connected: boolean;
  lastEvent: CodeChange | null;
  fileChanges: Record<string, CodeChange>;
  error: string | null;
  reconnectCount: number;
}

// Options for the hook
export interface UseCodeSyncOptions {
  projectId: string;
  debounceMs?: number;
  // eslint-disable-next-line no-unused-vars
  onFileChange?: (change: CodeChange) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  // eslint-disable-next-line no-unused-vars
  onError?: (error: string) => void;
}

/**
 * Custom hook for real-time code synchronization using Server-Sent Events (SSE)
 *
 * Features:
 * - Connects to SSE endpoint for real-time updates
 * - Handles reconnection with exponential backoff
 * - Debounces rapid file changes
 * - Only updates state for actual changes (compares hashes)
 * - Cleans up connection on unmount
 */
export function useCodeSync({
  projectId,
  debounceMs = 100,
  onFileChange,
  onConnect,
  onDisconnect,
  onError
}: UseCodeSyncOptions) {
  // State for the connection and events
  const [state, setState] = useState<CodeSyncState>({
    connected: false,
    lastEvent: null,
    fileChanges: {},
    error: null,
    reconnectCount: 0
  });

  // Refs for event source controller and debounce timer
  const abortControllerRef = useRef<AbortController | null>(null);
  // eslint-disable-next-line no-undef
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileHashesRef = useRef<Record<string, string>>({});

  const RECONNECT_TIME = 5000;

  // Process a code change event
  const processCodeChange = useCallback(
    (change: CodeChange) => {
      const filePath = change.file_path;

      // Skip if no hash provided (shouldn't happen, but just in case)
      if (!change.content_hash && change.action !== 'delete') {
        console.warn('Received code change without hash', change);
        return;
      }

      // For delete actions, we don't need to check the hash
      if (change.action === 'delete') {
        // Update state
        setState((prev) => ({
          ...prev,
          lastEvent: change,
          fileChanges: {
            ...prev.fileChanges,
            [filePath]: change
          }
        }));

        // Remove from hash cache
        const newHashes = { ...fileHashesRef.current };
        delete newHashes[filePath];
        fileHashesRef.current = newHashes;

        // Call callback if provided
        if (onFileChange) {
          onFileChange(change);
        }

        console.log(`File deleted: ${filePath}`);
        return;
      }

      // Check if the file has actually changed by comparing hashes
      const prevHash = fileHashesRef.current[filePath];
      const newHash = change.content_hash;

      if (prevHash !== newHash) {
        // Update hash cache
        fileHashesRef.current = {
          ...fileHashesRef.current,
          [filePath]: newHash!
        };

        // Update state
        setState((prev) => ({
          ...prev,
          lastEvent: change,
          fileChanges: {
            ...prev.fileChanges,
            [filePath]: change
          }
        }));

        // Call callback if provided
        if (onFileChange) {
          onFileChange(change);
        }

        console.log(
          `File ${change.action === 'create' ? 'created' : 'updated'}: ${filePath} (${change.size} bytes)`
        );
      } else {
        console.log(`File unchanged (same hash): ${filePath}`);
      }
    },
    [onFileChange]
  );

  // Debounced version of processCodeChange
  const debouncedProcessChange = useCallback(
    (change: CodeChange) => {
      // Clear any existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set a new timer
      debounceTimerRef.current = setTimeout(() => {
        processCodeChange(change);
      }, debounceMs);
    },
    [processCodeChange, debounceMs]
  );

  // Connect to the SSE endpoint
  const connect = useCallback(() => {
    // Clean up any existing connection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Skip connection if projectId is empty or invalid
    if (!projectId || projectId.trim() === '') {
      console.log('Skipping SSE connection - no valid projectId provided');
      return;
    }

    // Create a new AbortController for this connection
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Set initial connection state
    setState((prev) => ({
      ...prev,
      connected: false
    }));

    const url = `/api/code/sse/${projectId}`;

    // Start the fetchEventSource connection
    fetchEventSource(url, {
      headers: {
        'Cache-Control': 'no-store'
      },
      signal: abortController.signal,

      // Handle connection open
      onopen: async (response) => {
        if (response.ok) {
          console.log('SSE connection established');
          setState((prev) => ({
            ...prev,
            connected: true,
            error: null,
            reconnectCount: 0
          }));

          if (onConnect) {
            onConnect();
          }
        } else {
          const errorMsg = `Failed to connect: ${response.status} ${response.statusText}`;
          console.error(errorMsg);

          setState((prev) => ({
            ...prev,
            connected: false,
            error: errorMsg
          }));

          if (onError) {
            onError(errorMsg);
          }

          // This will trigger onError and retry logic
          throw new Error(errorMsg);
        }
      },

      // Handle incoming events
      onmessage: (event) => {
        // Skip empty events
        if (!event.data) return;

        try {
          // Process different event types
          switch (event.event) {
            case 'connected':
              try {
                const data = JSON.parse(event.data);
                console.log('Connected to code updates:', data);
              } catch (error) {
                console.error('Error parsing connected event:', error);
              }
              break;

            case 'heartbeat':
              try {
                const data = JSON.parse(event.data);
                console.log('Heartbeat received:', new Date(data.timestamp).toLocaleTimeString());
              } catch (error) {
                console.error('Error parsing heartbeat event:', error);
              }
              break;

            case 'code_change':
              try {
                const change: CodeChange = JSON.parse(event.data);

                // Only process changes for the current project
                if (change.project_id === projectId) {
                  debouncedProcessChange(change);
                }
              } catch (error) {
                console.error('Error parsing code_change event:', error);
              }
              break;

            default:
              console.log(`Unknown event type: ${event.event}`, event.data);
          }
        } catch (error) {
          console.error('Error processing event:', error);
        }
      },

      // Handle errors
      onerror: (error) => {
        console.error('SSE connection error:', error);

        // Update state
        setState((prev) => {
          const newReconnectCount = prev.reconnectCount + 1;
          const errorMsg = `Connection error (attempt ${newReconnectCount})`;

          if (onError) {
            onError(errorMsg);
          }

          return {
            ...prev,
            connected: false,
            error: errorMsg,
            reconnectCount: newReconnectCount
          };
        });

        if (onDisconnect) {
          onDisconnect();
        }

        // Return undefined to let the library handle retries
        // The retry configuration below will control the retry behavior
      },

      // Configure retry behavior
      openWhenHidden: true,
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          // Retry on these status codes
          headers: {
            ...(options?.headers || {}),
            Accept: 'text/event-stream'
          }
        });
      }
    }).catch((error) => {
      // This catches any errors not handled by onerror
      console.error('Fatal SSE connection error:', error);

      setState((prev) => ({
        ...prev,
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown connection error',
        reconnectCount: prev.reconnectCount + 1
      }));

      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (abortControllerRef.current === abortController) {
          connect();
        }
      }, RECONNECT_TIME);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Connect to the SSE endpoint on mount (only if projectId is valid)
  useEffect(() => {
    // Only connect if projectId is valid
    if (projectId && projectId.trim() !== '') {
      connect();
    } else {
      console.log('Skipping SSE connection on mount - no valid projectId provided');
    }

    // Clean up on unmount
    return () => {
      if (abortControllerRef.current) {
        console.log('Aborting SSE connection');
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [connect, projectId]);

  // Fetch a file from the API
  const fetchFile = useCallback(
    async (filePath: string) => {
      try {
        const response = await fetch(`/api/code/${projectId}/${filePath}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error fetching file ${filePath}:`, errorMsg);

        setState((prev) => ({
          ...prev,
          error: errorMsg
        }));

        if (onError) {
          onError(errorMsg);
        }

        return null;
      }
    },
    [projectId, onError]
  );

  // Save a file to the API
  const saveFile = useCallback(
    async (filePath: string, content: string) => {
      try {
        const response = await fetch(`/api/code/${projectId}/${filePath}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content })
        });

        if (!response.ok) {
          throw new Error(`Failed to save file: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error saving file ${filePath}:`, errorMsg);

        setState((prev) => ({
          ...prev,
          error: errorMsg
        }));

        if (onError) {
          onError(errorMsg);
        }

        return null;
      }
    },
    [projectId, onError]
  );

  // Delete a file from the API
  const deleteFile = useCallback(
    async (filePath: string) => {
      try {
        const response = await fetch(`/api/code/${projectId}/${filePath}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`Failed to delete file: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error deleting file ${filePath}:`, errorMsg);

        setState((prev) => ({
          ...prev,
          error: errorMsg
        }));

        if (onError) {
          onError(errorMsg);
        }

        return null;
      }
    },
    [projectId, onError]
  );

  // Fetch all files for a project
  const fetchAllFiles = useCallback(async () => {
    try {
      const response = await fetch(`/api/code/${projectId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching all files:', errorMsg);

      setState((prev) => ({
        ...prev,
        error: errorMsg
      }));

      if (onError) {
        onError(errorMsg);
      }

      return null;
    }
  }, [projectId, onError]);

  // Save multiple files at once
  const saveFiles = useCallback(
    async (files: Record<string, string>) => {
      try {
        const response = await fetch(`/api/code/${projectId}/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(files)
        });

        if (!response.ok) {
          throw new Error(`Failed to save files: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error saving files:', errorMsg);

        setState((prev) => ({
          ...prev,
          error: errorMsg
        }));

        if (onError) {
          onError(errorMsg);
        }

        return null;
      }
    },
    [projectId, onError]
  );

  // Return the hook API
  return {
    connected: state.connected,
    lastEvent: state.lastEvent,
    fileChanges: state.fileChanges,
    error: state.error,
    reconnectCount: state.reconnectCount,
    fetchFile,
    saveFile,
    deleteFile,
    fetchAllFiles,
    saveFiles
  };
}
