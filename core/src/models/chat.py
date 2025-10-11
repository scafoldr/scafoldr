from pydantic import BaseModel

class ChatRequest(BaseModel):
    user_input: str
    conversation_id: str
    project_id: str

class ChatResponse(BaseModel):
    response: str
