from core.ai_providers.base_ai_provider import BaseAiProvider
from strands.models.ollama import OllamaModel

class OllamaProvider(BaseAiProvider):
    def __init__(self, model_id= 'llama3.1', host = 'http://localhost:11434'):
        # Create an Ollama model instance
        ollama_model = OllamaModel(
            host=host,  # Ollama server address
            model_id=model_id  # Specify which model to use
        )

        super().__init__(model=ollama_model)
