from pydantic import BaseModel

class ChatRequest(BaseModel):
    chat_key: str
    user_input: str

class ChatResponse(BaseModel):
    response: str
