from pydbml import PyDBML

from models.scafoldr_schema import DatabaseSchema, Table, Column, Reference, RefColumn, ScafoldrSchema, BackendSchema, Entity, Attribute
from core.scafoldr_schema.base_scafoldr_schema_maker import ScafoldrSchemaMaker
from models.generate import GenerateRequest

class DbmlScafoldrSchemaMaker(ScafoldrSchemaMaker):
    def __init__(self):
        super().__init__()
        
    def make_schema(__self, request: GenerateRequest) -> ScafoldrSchema:
        """Generate ScafoldrSchema from GenerateRequest"""
        dbml = request.user_input
        project_name = request.project_name
        description = request.description
        version = request.version
        backend_port = request.backend_port
        backend_container_name = request.backend_container_name
        database_connection_string = request.database_connection_string

        schema = __self.from_dbml(
            dbml,
            project_name=project_name,
            description=description,
            version=version,
            backend_port=backend_port,
            backend_container_name=backend_container_name,
            database_connection_string=database_connection_string
        )

        return schema

    def from_dbml(
        __self,
        dbml: str,
        project_name: str,
        description: str = None,
        version: str = "1.0",
        backend_port: int = 8080,
        backend_container_name: str = "api",
        database_connection_string: str = "postgresql://user:password@localhost:5432/scafoldr_app_db"
    ) -> ScafoldrSchema:
        """Parse DBML string into a ScafoldrSchema model.
        
        Args:
            dbml: DBML string to parse
            project_name: Name of the project
            description: Optional project description
            version: Project version (defaults to "1.0")
            backend_port: Backend service port (defaults to 8080)
            backend_container_name: Backend container name (defaults to "api")
            database_connection_string: Database connection string
            
        Returns:
            ScafoldrSchema containing the parsed database schema, backend schema, and project metadata
        """
        db = PyDBML(dbml)

        tables = []
        for tbl in db.tables:
            columns = [
                Column(
                    name=col.name,
                    type=col.type,
                    not_null=col.not_null,
                    pk=col.pk,
                    unique=getattr(col, 'unique', False),
                    default=getattr(col, 'default', None)
                )
                for col in tbl.columns
            ]
            tables.append(Table(name=tbl.name, columns=columns))

        refs = []
        for ref in getattr(db, "refs", []):
            if not ref.col1 or not ref.col2:
                continue
            col1 = ref.col1[0]
            col2 = ref.col2[0]
            refs.append(
                Reference(
                    type=ref.type,
                    col1=RefColumn(table=col1.table.name, name=col1.name),
                    col2=RefColumn(table=col2.table.name, name=col2.name),
                )
            )

        database_schema = DatabaseSchema(tables=tables, refs=refs)
        
        # Create entities from tables for backend schema
        entities = []
        for table in tables:
            attributes = [
                Attribute(
                    names=__self._create_names(col.name),
                    type=col.type,
                    not_null=col.not_null,
                    default=col.default,
                    unique=col.unique,
                    pk=col.pk
                )
                for col in table.columns
            ]
            entities.append(Entity(names=__self._create_names(table.name), attributes=attributes))
        
        # Create backend schema
        backend_schema = BackendSchema(
            port=backend_port,
            project_name=project_name,
            container_name=backend_container_name,
            database_connection_string=database_connection_string,
            entities=entities
        )
        
        return ScafoldrSchema(
            project_name=project_name,
            description=description,
            version=version,
            database_schema=database_schema,
            backend_schema=backend_schema
        )
