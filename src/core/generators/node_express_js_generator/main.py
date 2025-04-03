from core.generators.base_generator import BaseGenerator
from core.agents.coordinator import AgentCoordinator
from models.generate import GenerateRequest, GenerateResponse
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
    
    def get_ai_commands(self, dbml_schema: str) -> list[str]:
        # TODO: Alternative wy to generate ai code, using cli commands instead of files (WORK IN PROGRESS)
        # TODO: specify prompt that will generate cli commands, can be useful for libraries like: sequelize-cli
        # TODO: cli command could generate files, or execute commands on the terminal
        return []
    
    def get_predefined_code(self, request: GenerateRequest) -> dict[str, str]:
        # TODO: Implement this
        return {
            "index.js": "console.log('Hello from Express');"
        }
    
    def get_predefined_commands(self, request: GenerateRequest) -> list[str]:
        # TODO: Implement this
        return [
            "npm init -y",
            "npm install express",
            "npm install pg",
        ]

    def generate(self, request: GenerateRequest) -> GenerateResponse:
        print("Generating Node.js Express code")

        ai_code = self.get_ai_code(request.user_input)
        predefined_code = self.get_predefined_code(request);

        combined_code = {**ai_code, **predefined_code}

        ai_commands = self.get_ai_commands(request.user_input)
        predefined_commands = self.get_predefined_commands(request)

        combined_commands = [*ai_commands, *predefined_commands]

        print(ai_commands)
        print(predefined_commands)
        return GenerateResponse(
            files=combined_code,
            commands=combined_commands
        )
