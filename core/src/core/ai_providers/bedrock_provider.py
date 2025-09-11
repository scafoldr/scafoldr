from boto3 import Session

from core.ai_providers.base_ai_provider import BaseAiProvider
from strands.models import BedrockModel


class BedrockProvider(BaseAiProvider):

    def __init__(self, session: Session, model_id='anthropic.claude-sonnet-4-20250514-v1:0'):
        # Create a Bedrock model with the custom session
        bedrock_model = BedrockModel(
            model_id=model_id,
            boto_session=session
        )
        super().__init__(model=bedrock_model)