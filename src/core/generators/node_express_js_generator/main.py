from core.generators.base_generator import BaseGenerator
from core.agents.coordinator import AgentCoordinator
from models.request import GenerateRequest
from core.generators.node_express_js_generator.prompt import PROMPT_TEMPLATE
class NodeExpressJSGenerator(BaseGenerator):
    def __init__(self):
        self.agent_coordinator = AgentCoordinator()

    def get_ai_code(self, dbml_schema: str) -> dict[str, str]:
        prompt = PROMPT_TEMPLATE.format(dbml=dbml_schema)
        ai_response = self.agent_coordinator.ask_agent(prompt)
        sections = ai_response.split("### FILE:")[1:]

        result = {}
        for section in sections:
            lines = section.strip().splitlines()
            filepath = lines[0].strip()
            file_content = '\n'.join(lines[1:]).strip()
            result[filepath] = file_content
        return result
    
    def get_predefined_code(self, request: GenerateRequest) -> dict[str, str]:
        return {
            "index2.js": "console.log('Hello from Express');"
        }

    def generate(self, request: GenerateRequest) -> dict[str, str]:
        print("Generating Node.js Express code")

        ai_code = self.get_ai_code(request.user_input)
        predefined_code = self.get_predefined_code(request);

        combined_code = {**ai_code, **predefined_code}
        return combined_code
