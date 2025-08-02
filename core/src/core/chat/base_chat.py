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
        history = self._get_history(conversation_id)
        history.append({"role": "user", "content": message})
        ai_response = self.agent_coordinator.ask_agent_with_response_format(history, self.response_format.model_json_schema())
        history.append({"role": "assistant", "content": ai_response.model_dump(mode="json").__str__()})

        return ai_response

    def stream_talk(self, message: str, conversation_id: str) -> Iterator[str]:
        history = self._get_history(conversation_id)
        # append the new user message
        history.append({"role": "user", "content": message})

        stream = self.agent_coordinator.stream_ask_agent(history)

        full_resp = ""
        for chunk in stream:
            yield chunk
            full_resp += chunk

        # once done, record the assistant reply for next time
        history.append({"role": "assistant", "content": full_resp})
