from abc import ABC, abstractmethod
from typing import Iterator

class BaseAgent(ABC):
    @abstractmethod
    def ask(self, prompt: str) -> str:
        """Given a prompt, return generated code."""
        pass

    @abstractmethod
    def ask_with_response_format(self, prompt: str, response_format) -> str:
        """Given a prompt, return generated response in specific format"""
        pass

    @abstractmethod
    def ask_interactively(self, prompt: str) ->  Iterator[str]:
        """Given a prompt, return interactive response."""
        pass
