from pydantic import BaseModel
from typing import List, Dict, Optional

class Column(BaseModel):
    name: str
    type: str
    not_null: bool = False
    default: Optional[str] = None
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

class NameVariations(BaseModel):
    singular: str
    plural: str

class Names(BaseModel):
    camel_case: NameVariations
    pascal_case: NameVariations
    kebab_case: NameVariations
    snake_case: NameVariations

class Attribute(BaseModel):
    names: Names
    type: str
    not_null: bool = False
    default: Optional[str] = None
    unique: bool = False
    pk: bool = False

class Entity(BaseModel):
    names: Names
    attributes: List[Attribute] = []


# TODO: Figure out what we need for BackendSchema
class BackendSchema(BaseModel):
    port: int = 8080
    project_name: str = "scafoldr-project"
    container_name: str = "api"
    database_connection_string: str = "postgresql://user:password@localhost:5432/scafoldr_app_dbsqlite:///./test.db"
    entities: List[Entity] = []

# TODO: Figure out what we need for FrontendSchema
# class FrontendSchema(BaseModel):
#     port: int = 3000
#     project_name: str = "scafoldr-project"
#     container_name: str = "web"
#     api_resources: ApiResource[]

class ScafoldrSchema(BaseModel):
    project_name: str
    description: Optional[str] = None
    version: str = "1.0"
    database_schema: DatabaseSchema
    backend_schema: Optional[BackendSchema] = None

    # TODO: Create frontend schema model, part of frontend code generation: issue #51
    # frontend_schema: FrontendSchema

