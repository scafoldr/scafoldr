from core.agents.openai_agent import OpenAIAgent
from dotenv import load_dotenv
import os
from typing import Iterator

from models.chat import ChatRequest


class AgentCoordinator:
    def __init__(self):
        load_dotenv()
        self.agent = OpenAIAgent(os.getenv("OPENAI_API_KEY"), os.getenv("OPENAI_API_MODEL"))

    def ask_agent(self, prompt: str) -> str:
        return self.agent.ask(prompt)

    def ask_agent_with_response_format(self, prompt, response_format):
        return self.agent.ask_with_response_format(prompt, response_format)
    
    def stream_ask_agent(self, prompt) -> Iterator[str]:
        return self.agent.stream_ask(prompt)
