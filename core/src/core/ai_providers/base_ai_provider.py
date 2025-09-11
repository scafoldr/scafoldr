from abc import ABC

from strands.models import Model


class BaseAiProvider(ABC):
    def __init__(self, model: Model):
        self.model = model

    def get_model(self) -> Model:
        return self.model
