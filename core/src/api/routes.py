# src/api/routes.py
from fastapi import APIRouter
from core.orchestrator import generate_backend, chat
from models.generate import GenerateRequest, GenerateResponse
from models.chat import ChatRequest, ChatResponse

router = APIRouter()

@router.post("/generate", response_model=GenerateResponse)
def generate_backend_route(request: GenerateRequest):
    project_files = generate_backend(request)
    return project_files

@router.post("/chat", response_model=ChatResponse)
def chat_route(request: ChatRequest):
    response = chat(request)
    return response
