from core.agents.openai_agent import OpenAIAgent
from dotenv import load_dotenv
import os

class AgentCoordinator:
    def __init__(self):
        load_dotenv()
        self.agent = OpenAIAgent(os.getenv("OPENAI_API_KEY"), os.getenv("OPENAI_API_MODEL"))

    def ask_agent(self, prompt: str) -> str:
        return self.agent.ask(prompt)
