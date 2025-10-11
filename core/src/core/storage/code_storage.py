import asyncio
import threading
from typing import Dict, Any, Optional, Callable, List, Set
from dataclasses import dataclass
import time
import logging
from concurrent.futures import ThreadPoolExecutor
from weakref import WeakSet

from core.storage.storage_provider import BaseStorageProvider

logger = logging.getLogger(__name__)


class ThreadSafeEventManager:
    """Thread-safe event manager that handles async/sync callbacks properly"""
    
    def __init__(self):
        self.subscribers: Dict[str, List[Callable]] = {}
        self._lock = threading.RLock()
        # Track which callbacks are async vs sync to avoid checking every time
        self._async_callbacks: Dict[str, Set[Callable]] = {}
        # Thread pool for sync callbacks
        self._executor = ThreadPoolExecutor(max_workers=5)
        # Keep track of active tasks to prevent orphaned coroutines
        self._active_tasks: WeakSet = WeakSet()
    
    def subscribe(self, event_type: str, callback: Callable):
        """Subscribe to an event type"""
        with self._lock:
            if event_type not in self.subscribers:
                self.subscribers[event_type] = []
                self._async_callbacks[event_type] = set()
            
            self.subscribers[event_type].append(callback)
            
            # Cache whether callback is async
            if asyncio.iscoroutinefunction(callback):
                self._async_callbacks[event_type].add(callback)
                
    def unsubscribe(self, event_type: str, callback: Callable):
        """Unsubscribe from an event type"""
        with self._lock:
            if event_type in self.subscribers and callback in self.subscribers[event_type]:
                self.subscribers[event_type].remove(callback)
                if callback in self._async_callbacks.get(event_type, set()):
                    self._async_callbacks[event_type].remove(callback)
    
    async def publish(self, event_type: str, data: Any):
        """Publish an event to all subscribers"""
        # Get callbacks in thread-safe manner
        callbacks_to_run = []
        async_callbacks = set()
        
        with self._lock:
            if event_type in self.subscribers:
                callbacks_to_run = self.subscribers[event_type].copy()
                async_callbacks = self._async_callbacks.get(event_type, set()).copy()
        
        if not callbacks_to_run:
            return
        
        # Separate sync and async callbacks
        sync_callbacks = [cb for cb in callbacks_to_run if cb not in async_callbacks]
        async_callbacks_list = [cb for cb in callbacks_to_run if cb in async_callbacks]
        
        tasks = []
        
        # Handle async callbacks
        for callback in async_callbacks_list:
            task = asyncio.create_task(self._call_async_callback(callback, data))
            self._active_tasks.add(task)
            tasks.append(task)
        
        # Handle sync callbacks in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        for callback in sync_callbacks:
            task = loop.run_in_executor(
                self._executor,
                self._call_sync_callback,
                callback,
                data
            )
            tasks.append(task)
        
        # Wait for all callbacks to complete
        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Log any exceptions
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    callback_name = (callbacks_to_run[i].__name__ 
                                   if i < len(callbacks_to_run) else "unknown")
                    logger.error(f"Error in callback {callback_name}: {result}")
    
    async def _call_async_callback(self, callback: Callable, data: Any):
        """Safely call an async callback"""
        try:
            await callback(data)
        except Exception as e:
            logger.error(f"Error in async callback {callback.__name__}: {e}", exc_info=True)
            raise
    
    def _call_sync_callback(self, callback: Callable, data: Any):
        """Safely call a sync callback"""
        try:
            callback(data)
        except Exception as e:
            logger.error(f"Error in sync callback {callback.__name__}: {e}", exc_info=True)
            raise
    
    def __del__(self):
        """Cleanup executor on deletion"""
        self._executor.shutdown(wait=False)


@dataclass
class CodeChange:
    project_id: str
    file_path: str
    action: str  # 'create', 'update', 'delete', 'project_deleted'
    content: Optional[str] = None
    timestamp: float = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = time.time()


class CodeStorage:
    """Code storage with thread-safe event management"""
    
    def __init__(self, backend: BaseStorageProvider):
        self.backend = backend
        self.event_manager = ThreadSafeEventManager()
        # File-level locks to prevent race conditions
        self._file_locks: Dict[str, asyncio.Lock] = {}
        self._lock_registry = asyncio.Lock()
    
    async def _get_file_lock(self, key: str) -> asyncio.Lock:
        """Get or create a lock for a specific file"""
        async with self._lock_registry:
            if key not in self._file_locks:
                self._file_locks[key] = asyncio.Lock()
            return self._file_locks[key]
    
    async def save_file(self, project_id: str, file_path: str, content: str):
        """Save generated code file"""
        lock_key = f"{project_id}:{file_path}"
        file_lock = await self._get_file_lock(lock_key)
        
        async with file_lock:
            try:
                # Check if file exists to determine action
                existing = await self.backend.get_file(project_id, file_path)
                action = 'update' if existing is not None else 'create'
                
                # Save the file
                await self.backend.set_file(project_id, file_path, content)
                
                # Create and publish change event
                change = CodeChange(
                    project_id=project_id,
                    file_path=file_path,
                    action=action,
                    content=content
                )
                
                await self.event_manager.publish('file_changed', change)
                
            except Exception as e:
                logger.error(f"Error saving file {project_id}/{file_path}: {e}")
                raise
    
    async def get_file(self, project_id: str, file_path: str) -> Optional[str]:
        """Get file content"""
        lock_key = f"{project_id}:{file_path}"
        file_lock = await self._get_file_lock(lock_key)
        
        async with file_lock:
            try:
                return await self.backend.get_file(project_id, file_path)
            except Exception as e:
                logger.error(f"Error getting file {project_id}/{file_path}: {e}")
                raise
    
    async def delete_file(self, project_id: str, file_path: str):
        """Delete file"""
        lock_key = f"{project_id}:{file_path}"
        file_lock = await self._get_file_lock(lock_key)
        
        async with file_lock:
            try:
                await self.backend.delete_file(project_id, file_path)
                
                change = CodeChange(
                    project_id=project_id,
                    file_path=file_path,
                    action='delete'
                )
                
                await self.event_manager.publish('file_changed', change)
                
            except Exception as e:
                logger.error(f"Error deleting file {project_id}/{file_path}: {e}")
                raise
    
    async def get_project_files(self, project_id: str) -> Dict[str, str]:
        """Get all files for a project"""
        try:
            return await self.backend.get_project_files(project_id)
        except Exception as e:
            logger.error(f"Error getting project files for {project_id}: {e}")
            raise
    
    async def delete_project(self, project_id: str):
        """Delete entire project"""
        try:
            await self.backend.delete_project(project_id)
            
            change = CodeChange(
                project_id=project_id,
                file_path='',
                action='project_deleted'
            )
            
            await self.event_manager.publish('project_changed', change)
            
        except Exception as e:
            logger.error(f"Error deleting project {project_id}: {e}")
            raise

    async def save_files_bulk(self, project_id: str, files: Dict[str, str]):
        """Save multiple files in bulk"""
        changes = []
        errors = []
        
        for file_path, content in files.items():
            try:
                lock_key = f"{project_id}:{file_path}"
                file_lock = await self._get_file_lock(lock_key)
                
                async with file_lock:
                    # Check if file exists
                    existing = await self.backend.get_file(project_id, file_path)
                    action = 'update' if existing is not None else 'create'
                    
                    # Save file
                    await self.backend.set_file(project_id, file_path, content)
                    
                    # Collect change for bulk notification
                    change = CodeChange(
                        project_id=project_id,
                        file_path=file_path,
                        action=action,
                        content=content
                    )
                    changes.append(change)
                    
            except Exception as e:
                logger.error(f"Error saving file {file_path} in bulk operation: {e}")
                errors.append((file_path, str(e)))
        
        # Publish all changes
        for change in changes:
            await self.event_manager.publish('file_changed', change)
        
        # Optionally publish a bulk change event
        if changes:
            bulk_change = {
                'project_id': project_id,
                'action': 'bulk_update',
                'files': [c.file_path for c in changes],
                'timestamp': time.time()
            }
            await self.event_manager.publish('bulk_changed', bulk_change)
        
        if errors:
            logger.warning(f"Bulk save completed with {len(errors)} errors")


    def on_file_change(self, callback: Callable):
        """Subscribe to file changes"""
        self.event_manager.subscribe('file_changed', callback)
    
    def on_project_change(self, callback: Callable):
        """Subscribe to project changes"""
        self.event_manager.subscribe('project_changed', callback)
    
    def on_bulk_change(self, callback: Callable):
        """Subscribe to bulk changes"""
        self.event_manager.subscribe('bulk_changed', callback)
    
    def off_file_change(self, callback: Callable):
        """Unsubscribe from file changes"""
        self.event_manager.unsubscribe('file_changed', callback)
    
    def off_project_change(self, callback: Callable):
        """Unsubscribe from project changes"""
        self.event_manager.unsubscribe('project_changed', callback)
