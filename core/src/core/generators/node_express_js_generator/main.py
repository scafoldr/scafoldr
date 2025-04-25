from core.generators.base_generator import BaseGenerator
from models.generate import GenerateRequest, GenerateResponse
from pydbml import PyDBML
from pydbml.database import Database
import os

class NodeExpressJSGenerator(BaseGenerator):
    def get_static_files(self, request: GenerateRequest) -> dict[str, str]:
        template_dir = "./templates/node_express_js"
        predefined_code = {}
        for root, _, files in os.walk(template_dir):
            for file in files:
                file_path = os.path.join(root, file)
                with open(file_path, 'r') as f:
                    relative_path = os.path.relpath(file_path, template_dir)
                    predefined_code[relative_path] = f.read()

        return predefined_code

    def generate_models(self, request: GenerateRequest, schema: Database) -> dict[str, str]:
        # Generate models based on the schema
        return {}
    
    def generate_repositories(self, request: GenerateRequest, schema: Database) -> dict[str, str]:
        # Generate repositories based on the schema
        return {}

    def generate_services(self, request: GenerateRequest, schema: Database) -> dict[str, str]:
        # Generate services based on the schema
        return {}

    def generate_controllers(self, request: GenerateRequest, schema: Database) -> dict[str, str]:
        # Generate controllers based on the schema
        return {}

    def generate_routes(self, request: GenerateRequest, schema: Database) -> dict[str, str]:
        # Generate routes based on the schema
        return {}

    def generate(self, request: GenerateRequest) -> GenerateResponse:
        print("Generating Node.js Express code")
        schema = PyDBML(request.user_input)
        files: dict[str,str] = {
            **self.get_static_files(request)
            **self.generate_models(request, schema),
            **self.generate_repositories(request, schema),
            **self.generate_services(request, schema),
            **self.generate_controllers(request, schema),
            **self.generate_routes(request, schema),
        }


        return GenerateResponse(files=files, commands=[])

