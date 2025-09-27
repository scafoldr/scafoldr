from typing import Dict, Any, Optional, Callable, List
import asyncio
from dataclasses import dataclass
import time

from core.storage.storage_provider import BaseStorageProvider

class EventManager:
    def __init__(self):
        self.subscribers: Dict[str, List[Callable]] = {}
    
    def subscribe(self, event_type: str, callback: Callable):
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(callback)
    
    async def publish(self, event_type: str, data: Any):
        if event_type in self.subscribers:
            for callback in self.subscribers[event_type]:
                if asyncio.iscoroutinefunction(callback):
                    await callback(data)
                else:
                    callback(data)

@dataclass
class CodeChange:
    project_id: str
    file_path: str
    action: str  # 'create', 'update', 'delete'
    content: Optional[str] = None
    timestamp: float = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = time.time()

class CodeStorage:
    def __init__(self, backend: BaseStorageProvider):
        self.backend = backend
        self.event_manager = EventManager()
    
    async def save_file(self, project_id: str, file_path: str, content: str):
        """Save generated code file"""
        await self.backend.set_file(project_id, file_path, content)
        
        change = CodeChange(
            project_id=project_id,
            file_path=file_path,
            action='update',
            content=content
        )
        
        await self.event_manager.publish('file_changed', change)
    
    async def get_file(self, project_id: str, file_path: str) -> Optional[str]:
        """Get file content"""
        return await self.backend.get_file(project_id, file_path)
    
    async def delete_file(self, project_id: str, file_path: str):
        """Delete file"""
        await self.backend.delete_file(project_id, file_path)
        
        change = CodeChange(
            project_id=project_id,
            file_path=file_path,
            action='delete'
        )
        
        await self.event_manager.publish('file_changed', change)
    
    async def get_project_files(self, project_id: str) -> Dict[str, str]:
        """Get all files for a project"""
        return await self.backend.get_project_files(project_id)
    
    async def delete_project(self, project_id: str):
        """Delete entire project"""
        await self.backend.delete_project(project_id)
        
        change = CodeChange(
            project_id=project_id,
            file_path='',
            action='project_deleted'
        )
        
        await self.event_manager.publish('project_changed', change)

    async def save_files_bulk(self, project_id: str, files: Dict[str, str]):
        """Save multiple files in bulk"""
        for file_path, content in files.items():
            await self.backend.set_file(project_id, file_path, content)
            
            change = CodeChange(
                project_id=project_id,
                file_path=file_path,
                action='update',
                content=content
            )
            
            self.event_manager.publish('file_changed', change)

    def on_file_change(self, callback: Callable):
        """Subscribe to file changes"""
        self.event_manager.subscribe('file_changed', callback)
    
    def on_project_change(self, callback: Callable):
        """Subscribe to project changes"""
        self.event_manager.subscribe('project_changed', callback)