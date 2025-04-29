from abc import ABC, abstractmethod

from pydantic import BaseModel

from core.agents.coordinator import AgentCoordinator
from models.chat import ChatRequest, ChatResponse
from typing import Iterator

class BaseChat(ABC):
    _history: dict[str, list[dict]] = {}
    def __init__(self, prompt_instructions: str, agent_coordinator: AgentCoordinator, response_format: type[BaseModel]):
        self.prompt_instructions = prompt_instructions
        self.agent_coordinator = agent_coordinator
        self.response_format = response_format

    def _get_history(self, key: str):
        return self._history.setdefault(
            key,
            # seed with your system prompt so it’s always first
            [{"role": "system", "content": self.prompt_instructions.split("Conversation:")[0]}],
        )

    def talk(self, message: str, conversation_id: str) -> ChatResponse:
        print('_history', self._history)
        print('message:', message)
        print('conversation_id:', conversation_id)
        history = self._get_history(conversation_id)
        print(history)
        history.append({"role": "user", "content": message})
        ai_response = self.agent_coordinator.ask_agent_with_response_format(history, self.response_format)
        history.append({"role": "assistant", "content": ai_response.model_dump(mode="json").__str__()})

        return ai_response

    @abstractmethod
    def interactive_chat(self, request: ChatRequest) -> Iterator[str]:
        """Get dbml stream from user input"""
        pass
