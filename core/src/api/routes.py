from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
import pyparsing
import traceback
import warnings

from config.config import Config
from core.orchestrator import generate_backend
from core.company.scafoldr_inc import ScafoldrInc
from models.generate import GenerateRequest, GenerateResponse
from models.chat import ChatRequest

router = APIRouter()

config = Config()

@router.post(
    "/generate",
    response_model=GenerateResponse,
    status_code=status.HTTP_200_OK,
    deprecated=True
)
def generate_backend_route(request: GenerateRequest):
    """
    DEPRECATED: This direct generation endpoint is deprecated and will be removed in a future version.
    
    Please use the /scafoldr-inc/consult endpoint instead, which provides a more robust
    multi-agent approach with the Software Architect agent that can generate DBML and scaffold projects.
    """
    # Emit deprecation warning
    warnings.warn(
        "The /generate endpoint is deprecated. Use /scafoldr-inc/consult instead.",
        DeprecationWarning,
        stacklevel=2
    )
    
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

@router.post("/scafoldr-inc/consult")
async def scafoldr_inc_consult_route(request: ChatRequest):
    """
    Endpoint for the Scafoldr Inc agent-based architecture.
    
    This endpoint now uses the updated Strands-based implementation
    with multi-agent capabilities while maintaining the same API interface.
    """
    try:
        conversation_id = request.conversation_id
        # TODO: At some point allow users to store projects more permanently when #10 is finished
        project_id = conversation_id
        scafoldr_company = ScafoldrInc(ai_provider=config.ai_provider, code_storage=config.code_storage,
                                       project_id=project_id, conversation_id=conversation_id)
        response = await scafoldr_company.process_request(
            user_request=request.user_input,
            conversation_id=request.conversation_id
        )
        return response
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"DETAILED ERROR in /scafoldr-inc/consult endpoint:")
        print(f"Exception type: {type(e).__name__}")
        print(f"Exception message: {str(e)}")
        print(f"Full traceback:\n{error_details}")
        
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Scafoldr Inc consultation failed",
                "message": str(e),
                "type": "agent_error",
                "traceback": error_details
            }
        )

@router.post("/scafoldr-inc/consult-stream")
async def scafoldr_inc_consult_stream_route(request: ChatRequest):
    """
    Streaming version of the Scafoldr Inc consultation endpoint.
    
    This endpoint now uses the updated Strands-based implementation
    with multi-agent capabilities while maintaining the same streaming API interface.
    """
    conversation_id = request.conversation_id
    # TODO: At some point allow users to store projects more permanently when #10 is finished
    project_id = conversation_id
    scafoldr_company = ScafoldrInc(ai_provider=config.ai_provider, code_storage=config.code_storage,
                                   project_id=project_id, conversation_id=conversation_id)

    async def generate_stream():
        try:
            async for chunk in scafoldr_company.stream_process_request(
                user_request=request.user_input,
                conversation_id=conversation_id
            ):
                yield chunk
        except Exception as e:
            error_details = traceback.format_exc()
            print(f"DETAILED ERROR in /scafoldr-inc/consult-stream endpoint:")
            print(f"Exception type: {type(e).__name__}")
            print(f"Exception message: {str(e)}")
            print(f"Full traceback:\n{error_details}")
            
            yield f"Error: {str(e)}"
    
    return StreamingResponse(generate_stream(), media_type="text/plain")

# Add a new endpoint to get company information
@router.get("/scafoldr-inc/info")
async def scafoldr_inc_info_route():
    """
    Get information about the Scafoldr Inc company and its capabilities.
    
    This endpoint provides details about the company, its agents, and supported features.
    """
    try:
        scafoldr_company = ScafoldrInc(ai_provider=config.ai_provider, code_storage=config.code_storage, project_id='', conversation_id='')
        company_info = scafoldr_company.get_company_info()
        return company_info
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"DETAILED ERROR in /scafoldr-inc/info endpoint:")
        print(f"Exception type: {type(e).__name__}")
        print(f"Exception message: {str(e)}")
        print(f"Full traceback:\n{error_details}")
        
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to get company information",
                "message": str(e),
                "type": "company_info_error",
                "traceback": error_details
            }
        )
