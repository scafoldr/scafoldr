from core.generators.base_generator import BaseGenerator
from core.agents.coordinator import AgentCoordinator
from models.request import GenerateRequest

class NodeJSExpressGenerator(BaseGenerator):
    def __init__(self):
        self.agent_coordinator = AgentCoordinator(api_key="your-openai-key")

    def generate(self, request: GenerateRequest) -> dict[str, str]:
        print("Generating Node.js Express code")
        # ai_code = self.agent_coordinator.generate_view_logic(request)
        return {
            f"{request.project_name}/index.js": "console.log('Hello from Express');"
        }
