from core.chat.base_chat import BaseChat
from core.agents.coordinator import AgentCoordinator
from models.chat import ChatRequest, ChatResponse
from core.chat.chats.dbml_chat.prompt import PROMPT_TEMPLATE
from typing import Iterator

class DBMLChat(BaseChat):
    def __init__(self):
        self.agent_coordinator = AgentCoordinator()

    def get_DBML_schema(self, request: ChatRequest):
        prompt = PROMPT_TEMPLATE.format(user_description=request.user_input)
        ai_response = self.agent_coordinator.ask_agent(prompt)
        return ai_response
    
    def get_DBML_stream(self, request: ChatRequest) -> Iterator[str]:
        prompt = PROMPT_TEMPLATE.format(user_description=request.user_input)
        for chunk in self.agent_coordinator.ask_agent_interactively(prompt):
            yield chunk

    def generate(self, request: ChatRequest) -> ChatResponse:
        print("Generating DBML code")
        response = self.get_DBML_schema(request)

        return ChatResponse(
            response=response
        )
    
    def interactive_chat(self, request: ChatRequest) -> Iterator[str]:
        return self.get_DBML_stream(request)
