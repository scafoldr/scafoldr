from abc import ABC, abstractmethod
from models.chat import ChatRequest, ChatResponse
from typing import Iterator

class BaseChat(ABC):
    @abstractmethod
    def generate(self, request: ChatRequest) -> ChatResponse:
        """Generate dbml from user input"""
        pass

    @abstractmethod
    def interactive_chat(self, request: ChatRequest) -> Iterator[str]:
        """Get dbml stream from user input"""
        pass
