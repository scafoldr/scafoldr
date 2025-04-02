from core.agents.openai_agent import OpenAIAgent
from dotenv import load_dotenv
import os

class AgentCoordinator:
    def __init__(self):
        load_dotenv()
        self.agent = OpenAIAgent(os.getenv("OPENAI_API_KEY"), os.getenv("OPENAI_API_MODEL"))

    def generate_view_logic(self, request) -> str:
        prompt = self._build_prompt(request)
        print (prompt)
        # return self.agent.ask(prompt)

    def _build_prompt(self, request) -> str:
        return (
            f"Generate backend view logic for a {request.backend_option} project "
            f"using {request.framework}. Features: {', '.join(request.features)}."
        )
