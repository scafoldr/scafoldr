from abc import ABC, abstractmethod
from models.request import GenerateRequest

class BaseGenerator(ABC):
    @abstractmethod
    def generate(self, request: GenerateRequest) -> dict[str, str]:
        """Generate files and return a dict of {path: content}"""
        pass
