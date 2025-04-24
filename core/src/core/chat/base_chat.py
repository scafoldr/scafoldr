from abc import ABC, abstractmethod
from models.chat import ChatRequest, ChatResponse

class BaseChat(ABC):
    @abstractmethod
    def generate(self, request: ChatRequest) -> ChatResponse:
        """Generate dbml from user input"""
        pass
