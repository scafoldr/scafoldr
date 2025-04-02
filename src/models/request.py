from pydantic import BaseModel

class GenerateRequest(BaseModel):
    project_name: str
    database_name: str
    backend_option: str
    features: list[str] = []
    user_input: str # For now this will be dbml schema
