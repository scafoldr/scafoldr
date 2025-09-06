from pydantic import BaseModel
from models.scafoldr_schema import ScafoldrSchema

class GenerateRequest(BaseModel):
    project_name: str
    database_name: str = None
    backend_option: str
    features: list[str] = []
    user_input: str  # DBML schema string
    description: str = None
    version: str = "1.0"
    backend_port: int = 8080
    backend_container_name: str = "api"
    database_connection_string: str = "postgresql://user:password@localhost:5432/scafoldr_app_db"

class GenerateResponse(BaseModel):
    files: dict[str, str]
    commands: list[str]
