from abc import ABC, abstractmethod
from typing import Dict, Optional

class BaseStorageProvider(ABC):
    @abstractmethod
    async def set_file(self, project_id: str, file_path: str, content: str):
        pass

    @abstractmethod
    async def get_file(self, project_id: str, file_path: str) -> Optional[str]:
        pass

    @abstractmethod
    async def delete_file(self, project_id: str, file_path: str):
        pass

    @abstractmethod
    async def get_project_files(self, project_id: str) -> Dict[str, str]:
        pass

    @abstractmethod
    async def delete_project(self, project_id: str):
        pass


class InMemoryStorage(BaseStorageProvider):
    def __init__(self):
        self.storage: Dict[str, Dict[str, str]] = {}

    async def set_file(self, project_id: str, file_path: str, content: str):
        if project_id not in self.storage:
            self.storage[project_id] = {}
        self.storage[project_id][file_path] = content

    async def get_file(self, project_id: str, file_path: str) -> Optional[str]:
        return self.storage.get(project_id, {}).get(file_path)

    async def delete_file(self, project_id: str, file_path: str):
        if project_id in self.storage and file_path in self.storage[project_id]:
            del self.storage[project_id][file_path]

    async def get_project_files(self, project_id: str) -> Dict[str, str]:
        return self.storage.get(project_id, {}).copy()

    async def delete_project(self, project_id: str):
        if project_id in self.storage:
            del self.storage[project_id]


class RedisStorage(BaseStorageProvider):
    def __init__(self, redis_client):
        self.redis = redis_client

    async def set_file(self, project_id: str, file_path: str, content: str):
        key = f"project:{project_id}"
        await self.redis.hset(key, file_path, content)

    async def get_file(self, project_id: str, file_path: str) -> Optional[str]:
        key = f"project:{project_id}"
        result = await self.redis.hget(key, file_path)
        return result.decode('utf-8') if result else None

    async def delete_file(self, project_id: str, file_path: str):
        key = f"project:{project_id}"
        await self.redis.hdel(key, file_path)

    async def get_project_files(self, project_id: str) -> Dict[str, str]:
        key = f"project:{project_id}"
        result = await self.redis.hgetall(key)
        return {k.decode('utf-8'): v.decode('utf-8') for k, v in result.items()}

    async def delete_project(self, project_id: str):
        key = f"project:{project_id}"
        await self.redis.delete(key)
