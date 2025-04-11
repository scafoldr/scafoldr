from core.generators.generator_factory import get_generator
from models.generate import GenerateRequest, GenerateResponse

def generate_backend(request: GenerateRequest) -> GenerateResponse:
    generator = get_generator(request.backend_option)
    project_files = generator.generate(request)
    
    return project_files
