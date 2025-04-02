from core.generators.stacks.node_js_express import NodeJSExpressGenerator
from core.generators.base_generator import BaseGenerator

# Define a mapping of language + framework to generator class
GENERATOR_MAP = {
    # ("python", "django"): DjangoGenerator,
    ("nodejs-express-js"): NodeJSExpressGenerator,
    # ("nodejs-express-ts"): NodeTSExpressGenerator,
    # Add more mappings as needed
}


def get_generator(backend_option: str) -> BaseGenerator:
    key = (backend_option)
    generator_class = GENERATOR_MAP.get(key)

    if not generator_class:
        raise ValueError(f"No generator found for backend_option '{backend_option}'")

    return generator_class()
