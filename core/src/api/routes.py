from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from core.chat.chats.dbml_chat.main import DBMLChatResponseFormat
from core.orchestrator import generate_backend, dbml_chat, stream_dbml_chat
from models.generate import GenerateRequest, GenerateResponse
from models.chat import ChatRequest

router = APIRouter()

@router.post("/generate", response_model=GenerateResponse)
def generate_backend_route(request: GenerateRequest):
    project_files = generate_backend(request)
    return project_files

@router.post("/generate-dbml-chat", response_model=DBMLChatResponseFormat)
def dbml_chat_route(request: ChatRequest):
    response = dbml_chat(request)
    return response

@router.post("/generate-dbml-chat-stream")
def chat_interactive_route(request: ChatRequest):
    print("Starting interactive chat")
    return StreamingResponse(stream_dbml_chat(request), media_type="text/plain")
