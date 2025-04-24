from core.generators.generator_factory import get_generator
from core.chat.chat_factory import get_chat
from models.generate import GenerateRequest, GenerateResponse
from models.chat import ChatRequest, ChatResponse
from typing import Iterator

def generate_backend(request: GenerateRequest) -> GenerateResponse:
    generator = get_generator(request.backend_option)
    project_files = generator.generate(request)
    
    return project_files

def chat(request: ChatRequest) -> ChatResponse:
    chat = get_chat(request.chat_key)
    response = chat.generate(request)
    
    return response

def chat_interactive(request: ChatRequest) -> Iterator[str]:
    chat = get_chat(request.chat_key)
    response = chat.interactive_chat(request)
    
    return response
