from abc import ABC, abstractmethod

class BaseAgent(ABC):
    @abstractmethod
    def ask(self, prompt: str) -> str:
        """Given a prompt, return generated code."""
        pass
