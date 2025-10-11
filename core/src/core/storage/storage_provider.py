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
    def __init__(self, redis_params):
        """
        Initialize with a Redis connection parameters, a new client will be created for each operation.
        """
        self.redis_params = redis_params
    
    async def _get_redis_client(self):
        """Get a Redis client that works with the current event loop"""
        import redis.asyncio as redis
        import logging
        
        # For safety, always create a new client for the current event loop
        # This is the most reliable way to avoid event loop conflicts
        if self.redis_params:
            return redis.Redis(**self.redis_params)
        else:
            # This should never happen, but just in case
            logging.error("No Redis parameters available")
            raise ValueError("No Redis client or parameters available")

    async def set_file(self, project_id: str, file_path: str, content: str):
        redis_client = await self._get_redis_client()
        key = f"project:{project_id}"
        await redis_client.hset(key, file_path, content)
        
        # Close the client
        await redis_client.close()

    async def get_file(self, project_id: str, file_path: str) -> Optional[str]:
        redis_client = await self._get_redis_client()
        key = f"project:{project_id}"
        result = await redis_client.hget(key, file_path)
        
        # Close the client
        await redis_client.close()

        return result.decode('utf-8') if result else None

    async def delete_file(self, project_id: str, file_path: str):
        redis_client = await self._get_redis_client()
        key = f"project:{project_id}"
        await redis_client.hdel(key, file_path)

        # Close the client
        await redis_client.close()

    async def get_project_files(self, project_id: str) -> Dict[str, str]:
        import logging
        
        # Always create a new Redis client for this operation to ensure it uses the current event loop
        redis_client = await self._get_redis_client()

        key = f"project:{project_id}"
        try:
            result = await redis_client.hgetall(key)
            
            # Close the client:
            await redis_client.close()
                
            return {k.decode('utf-8'): v.decode('utf-8') for k, v in result.items()}
        except Exception as e:
            logging.error(f"Error in get_project_files: {str(e)}")
            
            # Close the client
            await redis_client.close()
                
            raise

    async def delete_project(self, project_id: str):
        redis_client = await self._get_redis_client()
        key = f"project:{project_id}"
        await redis_client.delete(key)
        
        # Close the client
        await redis_client.close()
