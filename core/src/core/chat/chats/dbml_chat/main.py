from core.chat.base_chat import BaseChat
from core.agents.coordinator import AgentCoordinator
from models.chat import ChatRequest, ChatResponse

class DBMLChat(BaseChat):
    def __init__(self):
        self.agent_coordinator = AgentCoordinator()

    def generate(self, request: ChatRequest) -> ChatResponse:
        print("Generating DBML code")
        response = 'generated dbml code'

        return ChatResponse(
            response=response
        )
