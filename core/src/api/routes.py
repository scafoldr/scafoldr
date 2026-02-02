from fastapi import APIRouter, HTTPException, status, Request
from fastapi.responses import StreamingResponse, JSONResponse
from sse_starlette.sse import EventSourceResponse
import pyparsing
import traceback
import warnings
import asyncio
import json
import hashlib
from datetime import datetime

from config.config import Config
from core.orchestrator import generate_backend
from core.company.scafoldr_inc import ScafoldrInc
from core.storage.code_storage import CodeChange
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
        project_id = request.project_id
        selected_framework = request.selected_framework
        scafoldr_company = ScafoldrInc(ai_provider=config.ai_provider, code_storage=config.code_storage,
                                       project_id=project_id, conversation_id=conversation_id,
                                       selected_framework=selected_framework)
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
    project_id = request.project_id
    selected_framework = request.selected_framework
    scafoldr_company = ScafoldrInc(ai_provider=config.ai_provider, code_storage=config.code_storage,
                                   project_id=project_id, conversation_id=conversation_id,
                                   selected_framework=selected_framework)

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

# SSE endpoint for code updates
@router.get("/api/sse/code-updates/{project_id}")
async def sse_code_updates(project_id: str, request: Request):
    """
    Server-Sent Events (SSE) endpoint for real-time code updates.
    
    Establishes a persistent connection that sends events when code files
    are created, updated, or deleted for the specified project.
    """
    async def event_generator():
        # Create a queue for this connection
        queue = asyncio.Queue()
        
        # Define callback to handle file changes
        async def on_file_change(change: CodeChange):
            # Only forward events for the requested project
            if change.project_id == project_id:
                # Don't include full content in SSE events, just metadata
                event_data = {
                    "project_id": change.project_id,
                    "file_path": change.file_path,
                    "action": change.action,
                    "timestamp": change.timestamp,
                    # Include a hash of the content for change detection
                    "content_hash": hashlib.md5(change.content.encode()).hexdigest() if change.content else None,
                    "size": len(change.content) if change.content else 0
                }
                await queue.put(event_data)
        
        # Subscribe to file changes
        config.code_storage.on_file_change(on_file_change)
        
        # Send initial connected event
        yield {
            "event": "connected",
            "data": json.dumps({
                "message": f"Connected to code updates for project {project_id}",
                "timestamp": datetime.now().isoformat()
            })
        }
        
        # Keep connection alive with events
        try:
            while True:
                # Check if client disconnected
                if await request.is_disconnected():
                    break
                
                # Try to get message from queue, or send heartbeat after timeout
                try:
                    data = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield {
                        "event": "code_change",
                        "data": json.dumps(data)
                    }
                except asyncio.TimeoutError:
                    # Send heartbeat
                    yield {
                        "event": "heartbeat",
                        "data": json.dumps({
                            "timestamp": datetime.now().isoformat()
                        })
                    }
        finally:
            # Clean up subscription when client disconnects
            # Note: This is a simplified cleanup. In production, you'd want to
            # remove the specific callback to avoid memory leaks.
            pass
    
    return EventSourceResponse(event_generator())

# File management endpoints
@router.get("/api/code/{project_id}/{file_path:path}")
async def get_file(project_id: str, file_path: str):
    """
    Get specific file content with metadata.
    """
    try:
        content = await config.code_storage.get_file(project_id, file_path)
        if content is None:
            raise HTTPException(
                status_code=404,
                detail=f"File not found: {file_path}"
            )
        
        # Calculate metadata
        content_hash = hashlib.md5(content.encode()).hexdigest()
        size = len(content)
        
        return {
            "project_id": project_id,
            "file_path": file_path,
            "content": content,
            "metadata": {
                "hash": content_hash,
                "size": size,
                "timestamp": datetime.now().isoformat()
            }
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        
        error_details = traceback.format_exc()
        print(f"ERROR in get_file: {str(e)}\n{error_details}")
        
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to retrieve file",
                "message": str(e),
                "type": "file_retrieval_error"
            }
        )

@router.get("/api/code/{project_id}")
async def get_project_files(project_id: str):
    """
    Get all files for a project (metadata only, not full content).
    """
    try:
        files = await config.code_storage.get_project_files(project_id)

        # Return metadata for each file, not full content
        result = {}
        for file_path, content in files.items():
            # Calculate metadata
            content_hash = hashlib.md5(content.encode()).hexdigest()
            size = len(content)
            
            # Get a preview (first 100 chars)
            preview = content[:100] + "..." if len(content) > 100 else content
            
            result[file_path] = {
                "hash": content_hash,
                "size": size,
                "preview": preview,
                "timestamp": datetime.now().isoformat()
            }
        
        return {
            "project_id": project_id,
            "file_count": len(result),
            "files": result
        }
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"ERROR in get_project_files: {str(e)}\n{error_details}")
        
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to retrieve project files",
                "message": str(e),
                "type": "project_files_error"
            }
        )

@router.post("/api/code/{project_id}/{file_path:path}")
async def save_file(project_id: str, file_path: str, request: Request):
    """
    Save file content.
    """
    try:
        # Parse request body
        body = await request.json()
        if "content" not in body:
            raise HTTPException(
                status_code=400,
                detail="Request body must contain 'content' field"
            )
        
        content = body["content"]
        
        # Save file
        await config.code_storage.save_file(project_id, file_path, content)

        # Calculate metadata
        content_hash = hashlib.md5(content.encode()).hexdigest()
        size = len(content)
        
        return {
            "success": True,
            "project_id": project_id,
            "file_path": file_path,
            "metadata": {
                "hash": content_hash,
                "size": size,
                "timestamp": datetime.now().isoformat()
            }
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        
        error_details = traceback.format_exc()
        print(f"ERROR in save_file: {str(e)}\n{error_details}")
        
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to save file",
                "message": str(e),
                "type": "file_save_error"
            }
        )

@router.delete("/api/code/{project_id}/{file_path:path}")
async def delete_file(project_id: str, file_path: str):
    """
    Delete file.
    """
    try:
        # Check if file exists first
        content = await config.code_storage.get_file(project_id, file_path)
        if content is None:
            raise HTTPException(
                status_code=404,
                detail=f"File not found: {file_path}"
            )
        
        # Delete file
        await config.code_storage.delete_file(project_id, file_path)

        return {
            "success": True,
            "project_id": project_id,
            "file_path": file_path,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        
        error_details = traceback.format_exc()
        print(f"ERROR in delete_file: {str(e)}\n{error_details}")
        
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to delete file",
                "message": str(e),
                "type": "file_delete_error"
            }
        )

@router.get("/api/code/{project_id}/{file_path:path}/stream")
async def stream_file(project_id: str, file_path: str):
    """
    Stream file content in chunks (for large files).
    """
    try:
        content = await config.code_storage.get_file(project_id, file_path)
        if content is None:
            raise HTTPException(
                status_code=404,
                detail=f"File not found: {file_path}"
            )
        
        # Check if file is large enough to warrant streaming
        if len(content) < 100 * 1024:  # Less than 100KB
            # For small files, just return the content directly
            return JSONResponse({
                "project_id": project_id,
                "file_path": file_path,
                "content": content,
                "size": len(content)
            })
        
        # For large files, stream in chunks
        async def content_generator():
            # Stream in 8KB chunks
            chunk_size = 8 * 1024
            for i in range(0, len(content), chunk_size):
                chunk = content[i:i+chunk_size]
                yield chunk
                # Small delay to prevent overwhelming the client
                await asyncio.sleep(0.01)
        
        # Set appropriate headers
        headers = {
            "Content-Disposition": f"attachment; filename={file_path.split('/')[-1]}",
            "Content-Type": "application/octet-stream"
        }
        
        return StreamingResponse(
            content_generator(),
            headers=headers
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        
        error_details = traceback.format_exc()
        print(f"ERROR in stream_file: {str(e)}\n{error_details}")
        
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to stream file",
                "message": str(e),
                "type": "file_stream_error"
            }
        )

@router.post("/api/code/{project_id}/bulk")
async def bulk_save_files(project_id: str, request: Request):
    """
    Bulk save multiple files at once.
    
    Accepts a JSON body with a dictionary of file_path -> content mappings.
    """
    try:
        # Parse request body
        body = await request.json()
        
        if not isinstance(body, dict):
            raise HTTPException(
                status_code=400,
                detail="Request body must be a dictionary of file_path -> content mappings"
            )
        
        # Prepare files dictionary
        files = {}
        for file_path, content in body.items():
            if not isinstance(content, str):
                raise HTTPException(
                    status_code=400,
                    detail=f"Content for file '{file_path}' must be a string"
                )
            files[file_path] = content
        
        # Save files in bulk
        await config.code_storage.save_files_bulk(project_id, files)
        
        # Prepare response with metadata
        result = {}
        for file_path, content in files.items():
            # Calculate metadata
            content_hash = hashlib.md5(content.encode()).hexdigest()
            size = len(content)
            
            result[file_path] = {
                "hash": content_hash,
                "size": size,
                "timestamp": datetime.now().isoformat()
            }
        
        return {
            "success": True,
            "project_id": project_id,
            "file_count": len(result),
            "files": result
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        
        error_details = traceback.format_exc()
        print(f"ERROR in bulk_save_files: {str(e)}\n{error_details}")
        
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to save files in bulk",
                "message": str(e),
                "type": "bulk_save_error"
            }
        )

@router.get("/api/code/{project_id}/bulk")
async def bulk_get_files(project_id: str):
    """
    Get all files for a project, including their full content.

    Args:
        project_id: The ID of the project.
        include_metadata: Whether to include hash, size, and timestamp metadata for each file (default: True).
    """
    try:
        # Retrieve all files from storage
        files = await config.code_storage.get_project_files(project_id)
        if not files:
            raise HTTPException(
                status_code=404,
                detail=f"No files found for project: {project_id}"
            )

        # Prepare response
        result = {}
        for file_path, content in files.items():
            result[file_path] = content

        return {
            "project_id": project_id,
            "files": result
        }

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e

        error_details = traceback.format_exc()
        print(f"ERROR in get_all_project_files: {str(e)}\n{error_details}")

        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to retrieve all project files",
                "message": str(e),
                "type": "project_all_files_error"
            }
        )
