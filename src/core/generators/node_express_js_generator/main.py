from core.generators.base_generator import BaseGenerator
from core.agents.coordinator import AgentCoordinator
from models.generate import GenerateRequest, GenerateResponse
from core.generators.node_express_js_generator.prompt import PROMPT_TEMPLATE
import os
class NodeExpressJSGenerator(BaseGenerator):
    def __init__(self):
        self.agent_coordinator = AgentCoordinator()

    def get_ai_code(self, request: GenerateRequest) -> dict[str, str]:
        prompt = PROMPT_TEMPLATE.format(dbml=request.user_input)
        ai_response = self.agent_coordinator.ask_agent(prompt)

        sections = ai_response.split("### FILE:")[1:]

        result = {}
        for section in sections:
            lines = section.strip().splitlines()
            filepath = lines[0].strip()
            file_content = '\n'.join(lines[1:]).strip()

            result[filepath] = file_content
        return result
    
    def get_ai_commands(self, request: GenerateRequest) -> list[str]:
        # TODO: Alternative wy to generate ai code, using cli commands instead of files (WORK IN PROGRESS)
        # TODO: specify prompt that will generate cli commands, can be useful for libraries like: sequelize-cli
        # TODO: cli command could generate files, or execute commands on the terminal
        return []
    
    def get_predefined_code(self, request: GenerateRequest) -> dict[str, str]:
        template_dir = "./templates/node_express_ts"
        predefined_code = {}

        for root, _, files in os.walk(template_dir):
            for file in files:
                file_path = os.path.join(root, file)
                with open(file_path, 'r') as f:
                    relative_path = os.path.relpath(file_path, template_dir)
                    predefined_code[relative_path] = f.read()

        return predefined_code
    
    def get_predefined_commands(self, request: GenerateRequest) -> list[str]:
        commands = [
            "npm install"
        ]
        return commands

    def generate(self, request: GenerateRequest) -> GenerateResponse:
        print("Generating Node.js Express code")

        ai_code = self.get_ai_code(request)
    
        predefined_code = self.get_predefined_code(request);

        combined_code = {**ai_code, **predefined_code}

        ai_commands = self.get_ai_commands(request)
        predefined_commands = self.get_predefined_commands(request)

        combined_commands = [*ai_commands, *predefined_commands]

        return GenerateResponse(
            files=combined_code,
            commands=combined_commands
        )
