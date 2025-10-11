from strands import Agent, tool
from pydbml import PyDBML

from core.generators.generator_factory import get_generator
from core.scafoldr_schema.dbml_scafoldr_schema_maker import DbmlScafoldrSchemaMaker
from core.orchestrator import generate_backend
from models.generate import GenerateRequest, GenerateResponse
from config.config import Config

config = Config()

@tool
async def validate_dbml(agent: Agent, dbml_schema: str) -> str:
    """Validates the provided DBML schema string.
    
    This function checks the syntax and structure of the DBML schema to ensure it adheres
    to the DBML specification. It returns True if the schema is valid, otherwise False.
    
    Args:
        agent: The agent instance calling this tool
        dbml: A string containing the DBML schema to validate
    Returns:
        A string indicating whether the DBML is valid or an error message if invalid
    """
    try:
        PyDBML(dbml_schema)
        # Simple validation could be checking for required keywords
        schema_maker = DbmlScafoldrSchemaMaker()
        scafoldr_schema = schema_maker.from_dbml(dbml=dbml_schema, project_name="validation_temp")

        if not scafoldr_schema.database_schema.tables:
            print(f"DBML validation failed: No tables found.")
            return "Error - DBML validation failed: No tables found."

        project_id = agent.state.get('project_id')
        await config.code_storage.save_file(project_id, "schema.dbml", dbml_schema)
        print("Saved DBML to code storage for further use.")

        return "Success - DBML is valid."

        # More complex validation can be added here as needed
    except Exception as e:
        print(f"DBML validation failed: {str(e)}. Exception occurred during parsing. {dbml_schema}")
        return f"Error - DBML validation failed: {str(e)}"

@tool
async def scaffold_project(agent: Agent, project_name: str, dbml_schema: str) -> str:
    """Generates a complete application scaffold from the provided DBML schema.
    This function uses the generate_backend orchestrator to create a full project
    based on the DBML schema. It returns a summary of the generated project.

    Args:
        agent: The agent instance calling this tool
        project_name: A descriptive name for the project (use snake_case or kebab-case)
        dbml_schema: A string containing the complete DBML schema
    Returns:
        A summary string of the generated project files and structure
    """
    database_name = project_name.replace('-', '_') + "_db"
    
    request = GenerateRequest(
        project_name=project_name,
        database_name=database_name,
        backend_option='next-js-typescript',
        features=[],
        user_input=dbml_schema,
        description=f"Generated project: {project_name}",
        version="1.0",
        backend_port=8080,
        backend_container_name="api",
        database_connection_string=f"postgresql://user:password@localhost:5432/{database_name}"
    )

    try:
        project_files = generate_backend(request)
        print(f"Scaffolded project '{project_name}' with {len(project_files.files)} files.")

        project_id = agent.state.get('project_id')
        await config.code_storage.save_files_bulk(project_id=project_id, files=project_files.files)
        print(f"Saved scaffolded project '{project_name}' files to code storage.")

        return f"Project '{project_name}' scaffolded successfully with {len(project_files.files)} files."
    except Exception as e:
        print(f"Error during project scaffolding: {str(e)}")
        return f"Error during project scaffolding: {str(e)}"

    