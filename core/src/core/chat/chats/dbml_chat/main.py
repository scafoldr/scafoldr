from pydantic import Field

from core.chat.base_chat import BaseChat
from core.agents.coordinator import AgentCoordinator
from models.chat import ChatResponse
from core.chat.chats.dbml_chat.prompt import PROMPT_TEMPLATE
from typing import Literal


class DBMLChatResponseFormat(ChatResponse):
    response_type: Literal['question', 'dbml'] = Field(description="Type of response, dbml code or question")
    response: str = Field(description="Content of response, dbml code or question")

class DBMLChat(BaseChat):
    def __init__(self):
        super().__init__(
            prompt_instructions=PROMPT_TEMPLATE,
            agent_coordinator=AgentCoordinator(),
            response_format=DBMLChatResponseFormat
        )
