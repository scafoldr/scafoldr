import os
import asyncio
from typing import Optional

from strands.models import Model

import redis.asyncio as redis
from core.storage.storage_provider import InMemoryStorage, RedisStorage
from core.storage.code_storage import CodeStorage


class Config:
    """Configuration class that reads from environment variables with proper defaults and validation."""
    def __init__(self):
        self.ai_provider = self.create_ai_provider()
        self.code_storage = self.create_code_storage()

    def create_redis_client(self):
        """Create Redis client instance using configuration."""
        redis_host = self._get_env("REDIS_HOST", "redis")
        redis_port = int(self._get_env("REDIS_PORT", "6379"))
        redis_db = int(self._get_env("REDIS_DB", "0"))
        
        return redis.Redis(
            host=redis_host,
            port=redis_port,
            db=redis_db,
            decode_responses=False  # Keep as bytes for proper handling
        )

    def create_code_storage(self) -> CodeStorage:
        """Create code storage instance using Redis."""
        redis_client = self.create_redis_client()
        storage_provider = RedisStorage(redis_client)
        return CodeStorage(storage_provider)

    def create_ai_provider(self) -> Model:
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

        # Alternative AI provider example (commented out)

        # Amazon Bedrock - https://strandsagents.com/latest/documentation/docs/user-guide/concepts/model-providers/amazon-bedrock/
        # import boto3
        # from strands.models import BedrockModel

        # # Create a custom boto3 session
        # session = boto3.Session(
        #     aws_access_key_id='your_access_key',
        #     aws_secret_access_key='your_secret_key',
        #     aws_session_token='your_session_token',  # If using temporary credentials
        #     region_name='us-west-2',
        #     profile_name='your-profile'  # Optional: Use a specific profile
        # )

        # # Create a Bedrock model with the custom session
        # return BedrockModel(
        #     model_id="anthropic.claude-sonnet-4-20250514-v1:0",
        #     boto_session=session
        # )


        # Ollama - https://strandsagents.com/latest/documentation/docs/user-guide/concepts/model-providers/ollama/
        # from strands.models.ollama import OllamaModel

        # # Create an Ollama model instance
        # return OllamaModel(
        #     host="http://localhost:11434",  # Ollama server address
        #     model_id="llama3.1"               # Specify which model to use
        # )

        # Anthropic - https://strandsagents.com/latest/documentation/docs/user-guide/concepts/model-providers/anthropic/
        # from strands.models.anthropic import AnthropicModel
        # from strands_tools import calculator

        # return AnthropicModel(
        #     client_args={
        #         "api_key": "<KEY>",
        #     },
        #     # **model_config
        #     max_tokens=1028,
        #     model_id="claude-sonnet-4-20250514",
        #     params={
        #         "temperature": 0.7,
        #     }
        # )



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
