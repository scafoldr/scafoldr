from core.chat.base_chat import BaseChat
from core.agents.coordinator import AgentCoordinator
from models.chat import ChatRequest, ChatResponse
from core.chat.chats.dbml_chat.prompt import PROMPT_TEMPLATE
from typing import Iterator

class DBMLChat(BaseChat):
    # a simple in-memory store; replace with Redis/db in prod
    _history: dict[str, list[dict]] = {}

    def _get_history(self, key: str):
        return self._history.setdefault(
            key,
            # seed with your system prompt so it’s always first
            [{"role": "system", "content": PROMPT_TEMPLATE.split("Conversation:")[0]}],
        )


    def __init__(self):
        self.agent_coordinator = AgentCoordinator()

    def get_DBML_schema(self, request: ChatRequest):
        prompt = PROMPT_TEMPLATE.format(user_description=request.user_input)
        ai_response = self.agent_coordinator.ask_agent(prompt)
        return ai_response
    
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

    def generate(self, request: ChatRequest) -> ChatResponse:
        print("Generating DBML code")
        response = self.get_DBML_schema(request)

        return ChatResponse(
            response=response
        )
    
    def interactive_chat(self, request: ChatRequest) -> Iterator[str]:
        return self.get_DBML_stream(request)
