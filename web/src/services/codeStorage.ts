/**
 * CodeStorage Service
 *
 * A singleton class for managing file operations with:
 * - In-memory cache with TTL (5 minutes)
 * - Update queue for batching changes
 * - Optimistic updates with rollback on failure
 * - Cancellable requests using AbortController
 */

// Types for file operations
export interface FileContent {
  content: string;
  metadata: {
    hash: string;
    size: number;
    timestamp: string;
  };
}

export interface FileMetadata {
  hash: string;
  size: number;
  timestamp: string;
  preview?: string;
}

export interface ProjectFiles {
  project_id: string;
  file_count: number;
  files: Record<string, FileMetadata>;
}

export interface UpdateOperation {
  projectId: string;
  filePath: string;
  content: string;
  timestamp: number;
  // eslint-disable-next-line no-unused-vars
  resolve: (value: unknown) => void;
  // eslint-disable-next-line no-unused-vars
  reject: (reason: unknown) => void;
  abortController: AbortController;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

// Batch update interval in milliseconds (100ms)
const BATCH_INTERVAL = 100;

/**
 * CodeStorage Service
 */
class CodeStorageService {
  private static instance: CodeStorageService;

  // In-memory cache with TTL
  private fileCache: Map<string, CacheEntry<FileContent>> = new Map();
  private projectCache: Map<string, CacheEntry<ProjectFiles>> = new Map();

  // Update queue for batching changes
  private updateQueue: UpdateOperation[] = [];
  private updateTimer: ReturnType<typeof setTimeout> | null = null;

  // Optimistic updates tracking
  private optimisticUpdates: Map<string, { original: string | null; updated: string }> = new Map();

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Initialize the service
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): CodeStorageService {
    if (!CodeStorageService.instance) {
      CodeStorageService.instance = new CodeStorageService();
    }
    return CodeStorageService.instance;
  }

  /**
   * Generate a cache key for a file
   */
  private getFileCacheKey(projectId: string, filePath: string): string {
    return `${projectId}:${filePath}`;
  }

  /**
   * Get a file from the cache or fetch it from the API
   */
  public async getFile(
    projectId: string,
    filePath: string,
    options: {
      forceRefresh?: boolean;
      signal?: AbortSignal;
    } = {}
  ): Promise<FileContent> {
    const cacheKey = this.getFileCacheKey(projectId, filePath);

    // Check cache first (unless force refresh is requested)
    if (!options.forceRefresh) {
      const cached = this.fileCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }
    }

    // Create abort controller if not provided
    const abortController = options.signal
      ? { signal: options.signal }
      : { signal: new AbortController().signal };

    try {
      // Fetch from API
      const response = await fetch(`/api/code/${projectId}/${filePath}`, abortController);

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache the result
      this.fileCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_TTL
      });

      return data;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log(`Request for file ${filePath} was cancelled`);
      } else {
        console.error(`Error fetching file ${filePath}:`, error);
      }
      throw error;
    }
  }

  /**
   * Get all files for a project
   */
  public async getProjectFiles(
    projectId: string,
    options: {
      forceRefresh?: boolean;
      signal?: AbortSignal;
    } = {}
  ): Promise<ProjectFiles> {
    // Check cache first (unless force refresh is requested)
    if (!options.forceRefresh) {
      const cached = this.projectCache.get(projectId);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }
    }

    // Create abort controller if not provided
    const abortController = options.signal
      ? { signal: options.signal }
      : { signal: new AbortController().signal };

    try {
      // Fetch from API
      const response = await fetch(`/api/code/${projectId}`, abortController);

      if (!response.ok) {
        throw new Error(`Failed to fetch project files: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache the result
      this.projectCache.set(projectId, {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_TTL
      });

      return data;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log(`Request for project ${projectId} files was cancelled`);
      } else {
        console.error(`Error fetching project ${projectId} files:`, error);
      }
      throw error;
    }
  }

  /**
   * Save a file with optimistic updates and rollback on failure
   */
  public async saveFile(
    projectId: string,
    filePath: string,
    content: string,
    options: {
      signal?: AbortSignal;
      immediate?: boolean;
    } = {}
  ): Promise<unknown> {
    const cacheKey = this.getFileCacheKey(projectId, filePath);

    // Store original content for potential rollback
    let originalContent: string | null = null;
    try {
      const cachedFile = this.fileCache.get(cacheKey);
      if (cachedFile) {
        originalContent = cachedFile.data.content;
      }
    } catch {
      console.log(`No cached content found for ${filePath}`);
    }

    // Create abort controller
    const abortController = new AbortController();
    if (options.signal) {
      // If the parent signal aborts, abort our controller too
      options.signal.addEventListener('abort', () => {
        abortController.abort();
      });
    }

    // Apply optimistic update to cache
    this.applyOptimisticUpdate(projectId, filePath, content, originalContent);

    // If immediate is requested, save right away
    if (options.immediate) {
      return this.performSave(projectId, filePath, content, abortController.signal);
    }

    // Otherwise, queue the update
    return new Promise((resolve, reject) => {
      this.updateQueue.push({
        projectId,
        filePath,
        content,
        timestamp: Date.now(),
        resolve,
        reject,
        abortController
      });

      // Start the batch timer if not already running
      this.startBatchTimer();
    });
  }

  /**
   * Apply an optimistic update to the cache
   */
  private applyOptimisticUpdate(
    projectId: string,
    filePath: string,
    content: string,
    originalContent: string | null
  ): void {
    const cacheKey = this.getFileCacheKey(projectId, filePath);

    // Store the original and updated content for potential rollback
    this.optimisticUpdates.set(cacheKey, {
      original: originalContent,
      updated: content
    });

    // Calculate new metadata
    const encoder = new TextEncoder();
    const contentBytes = encoder.encode(content);
    const hash = this.calculateHash(content);

    // Update file cache optimistically
    const now = new Date().toISOString();
    this.fileCache.set(cacheKey, {
      data: {
        content,
        metadata: {
          hash,
          size: contentBytes.length,
          timestamp: now
        }
      },
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_TTL
    });

    // Update project cache if it exists
    const projectCached = this.projectCache.get(projectId);
    if (projectCached) {
      const projectFiles = { ...projectCached.data };

      // Update or add the file metadata
      if (projectFiles.files) {
        projectFiles.files[filePath] = {
          hash,
          size: contentBytes.length,
          timestamp: now,
          preview: content.length > 100 ? content.substring(0, 100) + '...' : content
        };
      }

      // Update the cache
      this.projectCache.set(projectId, {
        data: projectFiles,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_TTL
      });
    }

    console.log(`Optimistically updated ${filePath} in cache`);
  }

  /**
   * Roll back an optimistic update if the save fails
   */
  private rollbackOptimisticUpdate(projectId: string, filePath: string): void {
    const cacheKey = this.getFileCacheKey(projectId, filePath);
    const update = this.optimisticUpdates.get(cacheKey);

    if (!update) {
      console.log(`No optimistic update found for ${filePath}`);
      return;
    }

    if (update.original === null) {
      // If there was no original content, remove from cache
      this.fileCache.delete(cacheKey);
      console.log(`Rolled back optimistic update for ${filePath} (removed from cache)`);
    } else {
      // Otherwise, restore the original content
      const cachedFile = this.fileCache.get(cacheKey);
      if (cachedFile) {
        // Calculate original metadata
        const encoder = new TextEncoder();
        const contentBytes = encoder.encode(update.original);
        const hash = this.calculateHash(update.original);

        // Restore original in file cache
        this.fileCache.set(cacheKey, {
          data: {
            content: update.original,
            metadata: {
              hash,
              size: contentBytes.length,
              timestamp: cachedFile.data.metadata.timestamp
            }
          },
          timestamp: cachedFile.timestamp,
          expiresAt: cachedFile.expiresAt
        });

        // Restore in project cache if it exists
        const projectCached = this.projectCache.get(projectId);
        if (projectCached && projectCached.data.files && projectCached.data.files[filePath]) {
          const projectFiles = { ...projectCached.data };

          projectFiles.files[filePath] = {
            hash,
            size: contentBytes.length,
            timestamp: projectCached.data.files[filePath].timestamp,
            preview:
              update.original.length > 100
                ? update.original.substring(0, 100) + '...'
                : update.original
          };

          this.projectCache.set(projectId, {
            data: projectFiles,
            timestamp: projectCached.timestamp,
            expiresAt: projectCached.expiresAt
          });
        }

        console.log(`Rolled back optimistic update for ${filePath}`);
      }
    }

    // Remove from optimistic updates
    this.optimisticUpdates.delete(cacheKey);
  }

  /**
   * Start the batch timer for processing the update queue
   */
  private startBatchTimer(): void {
    if (this.updateTimer === null) {
      this.updateTimer = setTimeout(() => {
        this.processBatch();
      }, BATCH_INTERVAL);
    }
  }

  /**
   * Process a batch of updates
   */
  private async processBatch(): Promise<void> {
    // Clear the timer
    this.updateTimer = null;

    // Get the current batch
    const batch = [...this.updateQueue];
    this.updateQueue = [];

    if (batch.length === 0) {
      return;
    }

    console.log(`Processing batch of ${batch.length} updates`);

    // Group by project for bulk updates where possible
    const projectBatches = new Map<string, UpdateOperation[]>();

    for (const operation of batch) {
      const { projectId } = operation;
      if (!projectBatches.has(projectId)) {
        projectBatches.set(projectId, []);
      }
      projectBatches.get(projectId)!.push(operation);
    }

    // Process each project batch
    for (const [projectId, operations] of Array.from(projectBatches.entries())) {
      // If there's only one operation, use the single file API
      if (operations.length === 1) {
        const operation = operations[0];
        try {
          const result = await this.performSave(
            operation.projectId,
            operation.filePath,
            operation.content,
            operation.abortController.signal
          );
          operation.resolve(result);
        } catch (error) {
          // Rollback the optimistic update
          this.rollbackOptimisticUpdate(operation.projectId, operation.filePath);
          operation.reject(error);
        }
      } else {
        // Otherwise, use the bulk API
        try {
          // Create a map of file paths to content
          const files: Record<string, string> = {};
          for (const operation of operations) {
            files[operation.filePath] = operation.content;
          }

          // Perform the bulk save
          const result = await this.performBulkSave(
            projectId,
            files,
            operations[0].abortController.signal
          );

          // Resolve all operations
          const typedResult = result as { files: Record<string, unknown> };
          for (const operation of operations) {
            const fileResult = typedResult.files[operation.filePath];
            operation.resolve(fileResult);
          }
        } catch (error) {
          // Rollback all optimistic updates
          for (const operation of operations) {
            this.rollbackOptimisticUpdate(operation.projectId, operation.filePath);
            operation.reject(error);
          }
        }
      }
    }

    // If there are more updates in the queue, start the timer again
    if (this.updateQueue.length > 0) {
      this.startBatchTimer();
    }
  }

  /**
   * Perform a save operation
   */
  private async performSave(
    projectId: string,
    filePath: string,
    content: string,
    signal: AbortSignal
  ): Promise<unknown> {
    try {
      console.log(`Saving file ${filePath}`);
      const response = await fetch(`/api/code/${projectId}/${filePath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content }),
        signal
      });

      if (!response.ok) {
        throw new Error(`Failed to save file: ${response.statusText}`);
      }

      const result = await response.json();

      // Remove from optimistic updates as the save was successful
      const cacheKey = this.getFileCacheKey(projectId, filePath);
      this.optimisticUpdates.delete(cacheKey);

      return result;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log(`Save request for file ${filePath} was cancelled`);
      } else {
        console.error(`Error saving file ${filePath}:`, error);
      }
      throw error;
    }
  }

  /**
   * Perform a bulk save operation
   */
  private async performBulkSave(
    projectId: string,
    files: Record<string, string>,
    signal: AbortSignal
  ): Promise<unknown> {
    try {
      console.log(`Bulk saving ${Object.keys(files).length} files`);
      const response = await fetch(`/api/code/${projectId}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(files),
        signal
      });

      if (!response.ok) {
        throw new Error(`Failed to bulk save files: ${response.statusText}`);
      }

      const result = await response.json();

      // Remove from optimistic updates as the save was successful
      for (const filePath of Object.keys(files)) {
        const cacheKey = this.getFileCacheKey(projectId, filePath);
        this.optimisticUpdates.delete(cacheKey);
      }

      return result;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log(`Bulk save request was cancelled`);
      } else {
        console.error(`Error bulk saving files:`, error);
      }
      throw error;
    }
  }

  /**
   * Delete a file
   */
  public async deleteFile(
    projectId: string,
    filePath: string,
    options: {
      signal?: AbortSignal;
    } = {}
  ): Promise<unknown> {
    const cacheKey = this.getFileCacheKey(projectId, filePath);

    // Create abort controller if not provided
    const abortController = options.signal
      ? { signal: options.signal }
      : { signal: new AbortController().signal };

    try {
      // Remove from cache immediately (optimistic delete)
      this.fileCache.delete(cacheKey);

      // Update project cache if it exists
      const projectCached = this.projectCache.get(projectId);
      if (projectCached && projectCached.data.files) {
        const projectFiles = { ...projectCached.data };

        if (projectFiles.files[filePath]) {
          delete projectFiles.files[filePath];
          projectFiles.file_count = Object.keys(projectFiles.files).length;

          this.projectCache.set(projectId, {
            data: projectFiles,
            timestamp: Date.now(),
            expiresAt: Date.now() + CACHE_TTL
          });
        }
      }

      // Delete from API
      console.log(`Deleting file ${filePath}`);
      const response = await fetch(`/api/code/${projectId}/${filePath}`, {
        method: 'DELETE',
        ...abortController
      });

      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log(`Delete request for file ${filePath} was cancelled`);
      } else {
        console.error(`Error deleting file ${filePath}:`, error);
      }
      throw error;
    }
  }

  /**
   * Clear the cache for a specific file
   */
  public clearFileCache(projectId: string, filePath: string): void {
    const cacheKey = this.getFileCacheKey(projectId, filePath);
    this.fileCache.delete(cacheKey);
    console.log(`Cleared cache for file ${filePath}`);
  }

  /**
   * Clear the cache for a project
   */
  public clearProjectCache(projectId: string): void {
    this.projectCache.delete(projectId);

    // Also clear all file caches for this project
    for (const cacheKey of Array.from(this.fileCache.keys())) {
      if (cacheKey.startsWith(`${projectId}:`)) {
        this.fileCache.delete(cacheKey);
      }
    }

    console.log(`Cleared cache for project ${projectId}`);
  }

  /**
   * Clear all caches
   */
  public clearAllCaches(): void {
    this.fileCache.clear();
    this.projectCache.clear();
    console.log('Cleared all caches');
  }

  /**
   * Calculate a hash for a string
   */
  private calculateHash(content: string): string {
    // Simple hash function for demo purposes
    // In a real app, you'd use a proper hash function
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  /**
   * Cancel all pending operations
   */
  public cancelAllOperations(): void {
    // Abort all operations in the queue
    for (const operation of this.updateQueue) {
      operation.abortController.abort();
      operation.reject(new Error('Operation cancelled'));
    }

    // Clear the queue
    this.updateQueue = [];

    // Clear the timer
    if (this.updateTimer !== null) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }

    console.log('Cancelled all pending operations');
  }

  public isFileInCache(projectId: string, filePath: string): boolean {
    const cacheKey = this.getFileCacheKey(projectId, filePath);
    const cached = this.fileCache.get(cacheKey);
    return !!(cached && cached.expiresAt > Date.now());
  }
}

// Export the singleton instance
export const codeStorage = CodeStorageService.getInstance();
