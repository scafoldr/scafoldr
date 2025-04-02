from core.generators.generator_factory import get_generator
from models.request import GenerateRequest
import os

def generate_backend(request: GenerateRequest) -> dict[str, str]:
    generator = get_generator(request.backend_option)
    project_files = generator.generate(request)
    
    return project_files

