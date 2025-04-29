# src/api/routes.py
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from core.chat.chats.dbml_chat.main import DBMLChatResponseFormat
from core.orchestrator import generate_backend, chat, chat_interactive
from models.generate import GenerateRequest, GenerateResponse
from models.chat import ChatRequest, ChatResponse

router = APIRouter()

@router.post("/generate", response_model=GenerateResponse)
def generate_backend_route(request: GenerateRequest):
    project_files = generate_backend(request)
    return project_files

@router.post("/chat", response_model=DBMLChatResponseFormat)
def chat_route(request: ChatRequest):
    response = chat(request)
    return response

@router.post("/chat-interactive")
def chat_interactive_route(request: ChatRequest):
    print("Starting interactive chat")
    return StreamingResponse(chat_interactive(request), media_type="text/plain")
