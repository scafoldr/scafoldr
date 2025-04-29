from pydantic import BaseModel, Field

from core.chat.base_chat import BaseChat
from core.agents.coordinator import AgentCoordinator
from models.chat import ChatRequest, ChatResponse
from core.chat.chats.dbml_chat.prompt import PROMPT_TEMPLATE
from typing import Iterator, Literal


class DBMLChatResponseFormat(ChatResponse):
    response_type: Literal['question', 'dbml'] = Field(description="Type of response, dbml code or question")
    response: str = Field(description="Content of response, dbml code or question")

class DBMLChat(BaseChat):
    def __init__(self):
        super().__init__(prompt_instructions=PROMPT_TEMPLATE, agent_coordinator=AgentCoordinator(), response_format=DBMLChatResponseFormat)
    
    def get_DBML_stream(self, request: ChatRequest) -> Iterator[str]:
        history = self._get_history(request.conversation_id)
        # append the new user message
        history.append({"role": "user", "content": request.user_input})

        # call your streaming agent with the full history
        stream = self.agent_coordinator.ask_agent_interactively(history)

        full_resp = ""
        for chunk in stream:
            yield chunk
            full_resp += chunk

        # once done, record the assistant reply for next time
        history.append({"role": "assistant", "content": full_resp})

    
    def interactive_chat(self, request: ChatRequest) -> Iterator[str]:
        return self.get_DBML_stream(request)
