import os
import threading
from typing import Optional

from strands.models import Model

from core.storage.storage_provider import RedisStorage
from core.storage.code_storage import CodeStorage


class SingletonMeta(type):
    """
    Thread-safe singleton metaclass implementation.
    This ensures only one instance of Config exists across all threads.
    """
    _instances = {}
    _lock: threading.Lock = threading.Lock()
    
    def __call__(cls, *args, **kwargs):
        # Double-checked locking pattern for thread safety
        if cls not in cls._instances:
            with cls._lock:
                # Check again after acquiring lock
                if cls not in cls._instances:
                    instance = super().__call__(*args, **kwargs)
                    cls._instances[cls] = instance
        return cls._instances[cls]


class Config(metaclass=SingletonMeta):
    """
    Configuration singleton class that reads from environment variables with proper defaults and validation.
    
    Usage:
        # First call initializes the singleton
        config = Config()
        
        # All subsequent calls return the same instance
        config2 = Config()
        assert config is config2  # True
        
        # Access the singleton from anywhere
        ai_provider = Config().ai_provider
        storage = Config().code_storage
    """
    
    def __init__(self):
        # Only initialize once
        if hasattr(self, '_initialized'):
            return
            
        self._initialized = True
        self._ai_provider = None
        self._code_storage = None
        
        # Initialize components
        self._setup_components()
    
    def _setup_components(self):
        """Initialize all components during singleton creation."""
        # Initialize in correct order to handle dependencies
        self._code_storage = self._create_code_storage()
        self._ai_provider = self._create_ai_provider()
    
    @property
    def ai_provider(self) -> Model:
        """Get AI provider instance (lazy initialization if needed)."""
        if self._ai_provider is None:
            self._ai_provider = self._create_ai_provider()
        return self._ai_provider
    
    @property
    def code_storage(self) -> CodeStorage:
        """Get code storage instance (lazy initialization if needed)."""
        if self._code_storage is None:
            self._code_storage = self._create_code_storage()
        return self._code_storage
    
    def _create_code_storage(self) -> CodeStorage:
        """
        Create code storage instance using Redis.
        Uses the get_code_storage singleton factory from code_storage module.
        """
        # Create Redis connection parameters instead of passing the client directly
        redis_params = {
            'host': self._get_env("REDIS_HOST", "redis"),
            'port': int(self._get_env("REDIS_PORT", "6379")),
            'db': int(self._get_env("REDIS_DB", "0")),
            'password': self._get_optional_env("REDIS_PASSWORD"),
            'decode_responses': False,
            'socket_connect_timeout': 5,
            'socket_timeout': 5,
            'retry_on_timeout': True,
            'health_check_interval': 30
        }
        
        # Pass connection parameters instead of client
        storage_provider = RedisStorage(redis_params)
        
        return CodeStorage(storage_provider)
    
    def _create_ai_provider(self) -> Model:
        """Create AI provider instance using configuration.

        To switch to a different AI provider, uncomment the desired provider below
        and comment out the current OpenAI provider. Make sure to set the required
        environment variables for your chosen provider.
        """

        from strands.models.openai import OpenAIModel
        return OpenAIModel(
            client_args={
                "api_key": self._get_required_env("OPENAI_API_KEY"),
            },
            model_id=self._get_env("OPENAI_API_MODEL", "gpt-4o-mini"),
            params={
                "max_tokens": 1000,
                "temperature": 0.7,
            }
        )

    def _get_env(self, key: str, default: str) -> str:
        """Get environment variable with default value."""
        return os.getenv(key, default)

    def _get_required_env(self, key: str) -> str:
        """Get required environment variable, raise error if missing."""
        value = os.getenv(key)
        if not value:
            raise ValueError(f"Required environment variable {key} is not set")
        return value

    def _get_optional_env(self, key: str) -> Optional[str]:
        """Get optional environment variable, return None if missing."""
        return os.getenv(key)
