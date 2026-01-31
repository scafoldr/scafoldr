from pydantic import BaseModel

class DbmlAIAgentRequest(BaseModel):
    prompt: str
    conversation_id: str
    project_id: str

class DbmlAIAgentResponse(BaseModel):
    message: str
    dbml_schema: str
