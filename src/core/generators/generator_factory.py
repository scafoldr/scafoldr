from core.generators.base_generator import BaseGenerator
from core.generators.node_express_js_generator.main import NodeExpressJSGenerator
from core.generators.java_spring_generator.main import JavaSpringGenerator

# Define a mapping of language + framework to generator class
GENERATOR_MAP = {
    # ("python", "django"): DjangoGenerator,
    ("nodejs-express-js"): NodeExpressJSGenerator,
    ("java-spring"): JavaSpringGenerator,
    # ("nodejs-express-ts"): NodeTSExpressGenerator,
    # Add more mappings as needed
}


def get_generator(backend_option: str) -> BaseGenerator:
    key = (backend_option)
    generator_class = GENERATOR_MAP.get(key)

    if not generator_class:
        raise ValueError(f"No generator found for backend_option '{backend_option}'")

    return generator_class()
