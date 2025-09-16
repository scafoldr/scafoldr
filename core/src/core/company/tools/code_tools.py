from strands import Agent
from core.storage.code_storage import CodeStorage
from strands import tool
from typing import Dict, List, Any, Optional, TypedDict, Union

# Base response model
class BaseResponse(TypedDict):
    status: str  # "success" or "error"
    message: str

# Read file response
class ReadFileResponse(BaseResponse):
    content: Optional[str]

# Write/Create/Delete file responses use BaseResponse

# Search files by name response
class SearchFilesByNameResponse(BaseResponse):
    files: List[str]

# Match in content search
class ContentMatch(TypedDict):
    file_path: str
    line_number: int
    context: str

# Search file by content response
class SearchFileByContentResponse(BaseResponse):
    matches: List[ContentMatch]

@tool
def read_file(file_path: str, agent: Agent) -> ReadFileResponse:
    """
    Read the content of a file from the code storage.
    
    Args:
        file_path: Path to the file to read
        agent: Agent instance with access to code storage
        
    Returns:
        Dict with:
            status: "success" or "error"
            message: Description of the result
            content: File content (only if status is "success")
    """
    code_storage = agent.state.get("code_storage")
    project_id = agent.state.get("project_id")

    if not isinstance(code_storage, CodeStorage):
        return {
            "status": "error",
            "message": "Agent has no access to code base."
        }
    
    # Use asyncio to run the async method in a synchronous context
    import asyncio
    
    # Check if file exists and get its content
    try:
        file_content = asyncio.run(code_storage.get_file(project_id, file_path))
        if file_content is None:
            return {
                "status": "error",
                "message": f"File not found: {file_path}"
            }
        
        return {
            "status": "success",
            "message": f"Successfully read file: {file_path}",
            "content": file_content
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error reading file {file_path}: {str(e)}"
        }
@tool
def write_file(file_path: str, file_content: str, agent: Agent) -> BaseResponse:
    """
    Update an existing file with new content.
    
    Args:
        file_path: Path to the file to update
        file_content: New content for the file
        agent: Agent instance with access to code storage
        
    Returns:
        Dict with:
            status: "success" or "error"
            message: Description of the result
    """
    code_storage = agent.state.get("code_storage")
    project_id = agent.state.get("project_id")
    
    if not isinstance(code_storage, CodeStorage):
        return {
            "status": "error",
            "message": "Agent has no access to code base."
        }
    
    import asyncio
    
    # Check if file exists before updating
    try:
        existing_content = asyncio.run(code_storage.get_file(project_id, file_path))
        if existing_content is None:
            return {
                "status": "error",
                "message": f"File not found: {file_path}. Use create_file to create a new file."
            }
        
        # Update the file
        asyncio.run(code_storage.save_file(project_id, file_path, file_content))
        return {
            "status": "success",
            "message": f"File updated successfully: {file_path}"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error updating file {file_path}: {str(e)}"
        }

@tool
def create_file(file_path: str, file_content: str, agent: Agent) -> BaseResponse:
    """
    Create a new file with content.
    
    Args:
        file_path: Path to the new file
        file_content: Content for the new file
        agent: Agent instance with access to code storage
        
    Returns:
        Dict with:
            status: "success" or "error"
            message: Description of the result
    """
    code_storage = agent.state.get("code_storage")
    project_id = agent.state.get("project_id")
    
    if not isinstance(code_storage, CodeStorage):
        return {
            "status": "error",
            "message": "Agent has no access to code base."
        }
    
    import asyncio
    
    # Check if file already exists
    try:
        existing_content = asyncio.run(code_storage.get_file(project_id, file_path))
        if existing_content is not None:
            return {
                "status": "error",
                "message": f"File already exists: {file_path}. Use write_file to update an existing file."
            }
        
        # Create the file
        asyncio.run(code_storage.save_file(project_id, file_path, file_content))
        return {
            "status": "success",
            "message": f"File created successfully: {file_path}"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error creating file {file_path}: {str(e)}"
        }
@tool
def delete_file(file_path: str, agent: Agent) -> BaseResponse:
    """
    Delete a file from the code storage.
    
    Args:
        file_path: Path to the file to delete
        agent: Agent instance with access to code storage
        
    Returns:
        Dict with:
            status: "success" or "error"
            message: Description of the result
    """
    code_storage = agent.state.get("code_storage")
    project_id = agent.state.get("project_id")
    
    if not isinstance(code_storage, CodeStorage):
        return {
            "status": "error",
            "message": "Agent has no access to code base."
        }
    
    import asyncio
    
    # Check if file exists before deleting
    try:
        existing_content = asyncio.run(code_storage.get_file(project_id, file_path))
        if existing_content is None:
            return {
                "status": "error",
                "message": f"File not found: {file_path}"
            }
        
        # Delete the file
        asyncio.run(code_storage.delete_file(project_id, file_path))
        return {
            "status": "success",
            "message": f"File deleted successfully: {file_path}"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error deleting file {file_path}: {str(e)}"
        }
@tool
def search_files_by_name(file_name: str, agent: Agent) -> SearchFilesByNameResponse:
    """
    Search for files by name pattern.
    
    Args:
        file_name: Name pattern to search for
        agent: Agent instance with access to code storage
        
    Returns:
        Dict with:
            status: "success" or "error"
            message: Description of the result
            files: List of matching file paths (only if status is "success")
    """
    code_storage = agent.state.get("code_storage")
    project_id = agent.state.get("project_id")
    
    if not isinstance(code_storage, CodeStorage):
        return {
            "status": "error",
            "message": "Agent has no access to code base."
        }
    
    import asyncio
    import fnmatch
    
    try:
        # Get all project files
        project_files = asyncio.run(code_storage.get_project_files(project_id))
        
        # Filter files by name pattern
        matching_files = []
        for path in project_files.keys():
            if fnmatch.fnmatch(path.lower(), f"*{file_name.lower()}*"):
                matching_files.append(path)
        
        if not matching_files:
            return {
                "status": "success",
                "message": f"No files found matching: {file_name}",
                "files": []
            }
        
        return {
            "status": "success",
            "message": f"Found {len(matching_files)} files matching '{file_name}'",
            "files": matching_files
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error searching for files: {str(e)}"
        }

@tool
def search_file_by_content(partial_content: str, agent: Agent) -> SearchFileByContentResponse:
    """
    Search for files containing specific content.
    
    Args:
        partial_content: Content to search for
        agent: Agent instance with access to code storage
        
    Returns:
        Dict with:
            status: "success" or "error"
            message: Description of the result
            matches: List of dicts with file path, line number, and context (only if status is "success")
    """
    code_storage = agent.state.get("code_storage")
    project_id = agent.state.get("project_id")
    
    if not isinstance(code_storage, CodeStorage):
        return {
            "status": "error",
            "message": "Agent has no access to code base."
        }
    
    import asyncio
    
    try:
        # Get all project files
        project_files = asyncio.run(code_storage.get_project_files(project_id))
        
        # Search for content in files
        matches = []
        
        for path, content in project_files.items():
            if partial_content.lower() in content.lower():
                # Find the line number and context
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if partial_content.lower() in line.lower():
                        matches.append({
                            "file_path": path,
                            "line_number": i + 1,
                            "context": line.strip()
                        })
        
        if not matches:
            return {
                "status": "success",
                "message": f"No files found containing: {partial_content}",
                "matches": []
            }
        
        return {
            "status": "success",
            "message": f"Found {len(matches)} matches for '{partial_content}'",
            "matches": matches
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error searching file content: {str(e)}"
        }