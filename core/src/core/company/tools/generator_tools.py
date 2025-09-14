from strands import tool

from core.generators.generator_factory import get_generator
from core.scafoldr_schema.dbml_scafoldr_schema_maker import DbmlScafoldrSchemaMaker
from models.generate import GenerateRequest, GenerateResponse

@tool
def scaffold_project(request: GenerateRequest) -> GenerateResponse:
    """Generates a complete application scaffold from a DBML database schema.
    
    This function takes a GenerateRequest containing a DBML schema and project configuration,
    and then uses the appropriate generator based on the requested backend option to produce
    a complete set of project files.
    
    Args:
        request: A GenerateRequest object containing:
            - project_name: Name of the project
            - backend_option: Backend framework to use (nodejs-express-js, java-spring, next-js-typescript)
            - user_input: DBML schema string defining database structure
            - Additional configuration parameters (database connection, ports, etc.)
            
    Returns:
        GenerateResponse containing:
            - files: Dictionary mapping file paths to generated file contents
            - commands: List of commands to execute for project setup
    """
    # Create ScafoldrSchema from the request
    schema_maker = DbmlScafoldrSchemaMaker()
    scafoldr_schema = schema_maker.make_schema(request)

    # Generate code using the schema
    generator = get_generator(request.backend_option)
    project_files = generator.generate(scafoldr_schema)

    return project_files