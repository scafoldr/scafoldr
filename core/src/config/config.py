import os
from typing import Optional
from core.ai_providers.base_ai_provider import BaseAiProvider



class Config:
    """Configuration class that reads from environment variables with proper defaults and validation."""
    def __init__(self):
        self.ai_provider = self.create_ai_provider()

    def create_ai_provider(self) -> BaseAiProvider:
        """Create AI provider instance using configuration.

        To switch to a different AI provider, uncomment the desired provider below
        and comment out the current OpenAI provider. Make sure to set the required
        environment variables for your chosen provider.
        """

        # Current provider: OpenAI
        from core.ai_providers.open_ai_provider import OpenAiProvider
        return OpenAiProvider(
            api_key=self._get_required_env("OPENAI_API_KEY"),
            model_id=self._get_env("OPENAI_API_MODEL", "gpt-4o-mini")
        )

        # Alternative providers (uncomment to use):

        # Anthropic Claude (requires ANTHROPIC_API_KEY)
        # from core.ai_providers.anthropic_provider import AnthropicProvider
        # return AnthropicProvider(
        #     api_key=config._get_required_env("ANTHROPIC_API_KEY"),
        #     model_id="claude-sonnet-4-20250514",  # or claude-haiku-3-20240307, claude-opus-3-20240229
        #     max_tokens=1028,
        #     temperature=0.7
        # )

        # Ollama (local models, requires Ollama server running)
        # from core.ai_providers.ollama_provider import OllamaProvider
        # return OllamaProvider(
        #     model_id="llama3.1",  # or any other Ollama model you have installed
        #     host="http://localhost:11434"  # default Ollama server address
        # )

        # AWS Bedrock (requires AWS credentials and boto3 session)
        # from core.ai_providers.bedrock_provider import BedrockProvider
        # from boto3 import Session
        # aws_session = Session(
        #     aws_access_key_id=config._get_required_env("AWS_ACCESS_KEY_ID"),
        #     aws_secret_access_key=config._get_required_env("AWS_SECRET_ACCESS_KEY"),
        #     region_name=config._get_env("AWS_REGION", "us-east-1")
        # )
        # return BedrockProvider(
        #     session=aws_session,
        #     model_id="anthropic.claude-sonnet-4-20250514-v1:0"
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
