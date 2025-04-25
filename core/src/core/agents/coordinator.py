from core.agents.openai_agent import OpenAIAgent
from dotenv import load_dotenv
import os
from typing import Iterator

class AgentCoordinator:
    def __init__(self):
        load_dotenv()
        self.agent = OpenAIAgent(os.getenv("OPENAI_API_KEY"), os.getenv("OPENAI_API_MODEL"))

    def ask_agent(self, prompt: str) -> str:
        return self.agent.ask(prompt)
    
    def ask_agent_interactively(self, prompt: str) -> Iterator[str]:
        return self.agent.ask_interactively(prompt)
