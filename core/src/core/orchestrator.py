from core.chat.chats.dbml_chat.main import DBMLChat
from core.generators.generator_factory import get_generator
from models.generate import GenerateRequest, GenerateResponse
from models.chat import ChatRequest, ChatResponse
from typing import Iterator

def generate_backend(request: GenerateRequest) -> GenerateResponse:
    generator = get_generator(request.backend_option)
    project_files = generator.generate(request)
    
    return project_files

def dbml_chat(request: ChatRequest) -> ChatResponse:
    chat = DBMLChat()
    response = chat.talk(request.user_input, request.conversation_id)
    
    return response

def stream_dbml_chat(request: ChatRequest) -> Iterator[str]:
    chat = DBMLChat()
    response = chat.stream_talk(request.user_input, request.conversation_id)

    return response
