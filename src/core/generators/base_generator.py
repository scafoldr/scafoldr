from abc import ABC, abstractmethod
from models.generate import GenerateRequest, GenerateResponse

class BaseGenerator(ABC):
    @abstractmethod
    def generate(self, request: GenerateRequest) -> GenerateResponse:
        """Generate files and return a dict of {path: content}"""
        pass
