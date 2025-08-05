from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import pyparsing

from core.chat.chats.dbml_chat.main import DBMLChatResponseFormat
from core.orchestrator import generate_backend, dbml_chat, stream_dbml_chat
from models.generate import GenerateRequest, GenerateResponse
from models.chat import ChatRequest

router = APIRouter()

@router.post("/generate", response_model=GenerateResponse)
def generate_backend_route(request: GenerateRequest):
    try:
        project_files = generate_backend(request)
        return project_files
    except pyparsing.exceptions.ParseException as e:
        # Extract helpful information from the DBML parsing error
        error_msg = str(e)
        line_info = ""
        
        # Try to extract line and column information
        if hasattr(e, 'line') and hasattr(e, 'col'):
            line_info = f" at line {e.line}, column {e.col}"
        elif "line:" in error_msg and "col:" in error_msg:
            # Extract from error message like "(at char 96), (line:4, col:3)"
            import re
            match = re.search(r'line:(\d+), col:(\d+)', error_msg)
            if match:
                line_info = f" at line {match.group(1)}, column {match.group(2)}"
        
        # Create a user-friendly error message
        friendly_msg = f"DBML syntax error{line_info}: {error_msg}"
        
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Invalid DBML syntax",
                "message": friendly_msg,
                "type": "dbml_parse_error"
            }
        )
    except Exception as e:
        # Handle other unexpected errors
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Code generation failed",
                "message": str(e),
                "type": "generation_error"
            }
        )

@router.post("/generate-dbml-chat", response_model=DBMLChatResponseFormat)
def dbml_chat_route(request: ChatRequest):
    response = dbml_chat(request)
    return response

@router.post("/generate-dbml-chat-stream")
def chat_interactive_route(request: ChatRequest):
    print("Starting interactive chat")
    return StreamingResponse(stream_dbml_chat(request), media_type="text/plain")
