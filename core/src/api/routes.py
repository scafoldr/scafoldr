# src/api/routes.py
from fastapi import APIRouter
from core.orchestrator import generate_backend
from models.generate import GenerateRequest, GenerateResponse
router = APIRouter()

@router.post("/generate", response_model=GenerateResponse)
def generate_backend_route(request: GenerateRequest):
    project_files = generate_backend(request)
    return project_files
