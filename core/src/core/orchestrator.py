from core.generators.generator_factory import get_generator
from core.scafoldr_schema.dbml_scafoldr_schema_maker import DbmlScafoldrSchemaMaker
from models.generate import GenerateRequest, GenerateResponse

def generate_backend(request: GenerateRequest) -> GenerateResponse:
    # Create ScafoldrSchema from the request
    schema_maker = DbmlScafoldrSchemaMaker()
    scafoldr_schema = schema_maker.make_schema(request)
    
    # Generate code using the schema
    generator = get_generator(request.backend_option)
    project_files = generator.generate(scafoldr_schema)
    
    return project_files
