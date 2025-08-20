from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import pyparsing

from core.orchestrator import generate_backend
from core.company import ScafoldrInc
from models.generate import GenerateRequest, GenerateResponse
from models.chat import ChatRequest

router = APIRouter()

# Initialize the global Scafoldr Inc company instance
scafoldr_company = ScafoldrInc()

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
        import traceback
        error_details = traceback.format_exc()
        print(f"DETAILED ERROR in /generate endpoint:")
        print(f"Exception type: {type(e).__name__}")
        print(f"Exception message: {str(e)}")
        print(f"Full traceback:\n{error_details}")
        
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Code generation failed",
                "message": str(e),
                "type": "generation_error",
                "traceback": error_details
            }
        )

# Legacy endpoints removed - use /scafoldr-inc/consult instead

@router.post("/scafoldr-inc/consult")
async def scafoldr_inc_consult_route(request: ChatRequest):
    """
    New endpoint for the Scafoldr Inc agent-based architecture.
    
    Provides the same functionality as existing DBML chat endpoints
    but with enhanced structure and agent information.
    """
    try:
        response = await scafoldr_company.process_request(
            user_request=request.user_input,
            conversation_id=request.conversation_id
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Scafoldr Inc consultation failed",
                "message": str(e),
                "type": "agent_error"
            }
        )

@router.post("/scafoldr-inc/consult-stream")
async def scafoldr_inc_consult_stream_route(request: ChatRequest):
    """
    Streaming version of the Scafoldr Inc consultation endpoint.
    
    Provides real-time response streaming while maintaining compatibility
    with existing streaming functionality.
    """
    async def generate_stream():
        try:
            async for chunk in scafoldr_company.stream_process_request(
                user_request=request.user_input,
                conversation_id=request.conversation_id
            ):
                yield chunk
        except Exception as e:
            yield f"Error: {str(e)}"
    
    return StreamingResponse(generate_stream(), media_type="text/plain")
