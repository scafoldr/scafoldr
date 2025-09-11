from core.ai_providers.base_ai_provider import BaseAiProvider
from strands.models.anthropic import AnthropicModel

class AnthropicProvider(BaseAiProvider):

    def __init__(self, api_key, model_id = 'claude-sonnet-4-20250514', max_tokens = 1028, temperature = 0.7):
        model = AnthropicModel(
            client_args={
                "api_key": api_key,
            },
            max_tokens=max_tokens,
            model_id=model_id,
            params={
                "temperature": temperature,
            }
        )
        super().__init__(model=model)