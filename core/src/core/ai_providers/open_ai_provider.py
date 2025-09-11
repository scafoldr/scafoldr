from core.ai_providers.base_ai_provider import BaseAiProvider
from strands.models.openai import OpenAIModel

class OpenAiProvider(BaseAiProvider):

    def __init__(self, api_key, model_id = 'gpt-4o-mini', max_tokens = 1000, temperature = 0.7):
        model = OpenAIModel(
            client_args={
                "api_key": api_key,
            },
            # **model_config
            model_id=model_id,
            params={
                "max_tokens": max_tokens,
                "temperature": temperature,
            }
        )
        super().__init__(model=model)