from pydantic import BaseModel
from typing import List

class Column(BaseModel):
    name: str
    type: str
    not_null: bool = False
    default: str = None
    unique: bool = False
    pk: bool = False

class Table(BaseModel):
    name: str
    columns: List[Column]

class RefColumn(BaseModel):
    table: str
    name: str

class Reference(BaseModel):
    type: str
    col1: RefColumn
    col2: RefColumn

class DatabaseSchema(BaseModel):
    tables: List[Table]
    refs: List[Reference] = []


# TODO: Figure out what we need for BackendSchema
# class BackendSchema(BaseModel):
#     port: int = 8080
#     project_name: str = "scafoldr-project"
#     container_name: str = "api"
#     database_connection_string: str = "postgresql://user:password@localhost:5432/scafoldr_app_dbsqlite:///./test.db"
#     entities: Entities[]

# TODO: Figure out what we need for FrontendSchema
# class FrontendSchema(BaseModel):
#     port: int = 3000
#     project_name: str = "scafoldr-project"
#     container_name: str = "web"
#     api_resources: ApiResource[]

class ScafoldrSchema(BaseModel):
    project_name: str
    description: str = None
    version: str = "1.0"
    database_schema: DatabaseSchema

    # TODO: Create backend logic, maps DatabaseSchema to structure more adaptable for backend templating
    # backend_schema: BackendSchema

    # TODO: Create frontend schema model, part of frontend code generation: issue #51
    # frontend_schema: FrontendSchema

