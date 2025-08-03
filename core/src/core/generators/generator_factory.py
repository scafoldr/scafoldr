import os
from pathlib import Path
from typing import List
from core.generators.base_generator import BaseGenerator
from core.generators.configurable_generator import ConfigurableGenerator
from core.generators.node_express_js_generator.main import NodeExpressJSGenerator
from core.generators.java_spring_generator.main import JavaSpringGenerator

# Legacy generator mappings (for backward compatibility)
LEGACY_GENERATOR_MAP = {
    ("nodejs-express-js"): NodeExpressJSGenerator,
    ("java-spring"): JavaSpringGenerator,
}

# Mapping from backend option to template directory name
BACKEND_TO_TEMPLATE_DIR = {
    "nodejs-express-js": "node_express_js",
    "java-spring": "java_spring",
}

def get_generator(backend_option: str) -> BaseGenerator:
    """Get generator for the specified backend option"""
    
    # First, try to find a configuration-driven generator
    template_dir = BACKEND_TO_TEMPLATE_DIR.get(backend_option, backend_option)
    config_path = f"./templates/{template_dir}/scafoldr_template_config.json"
    if os.path.exists(config_path):
        return ConfigurableGenerator(config_path)
    
    # Fall back to legacy hardcoded generators
    # generator_class = LEGACY_GENERATOR_MAP.get(backend_option)
    # if generator_class:
    #     return generator_class()
    
    raise ValueError(f"No generator found for backend_option '{backend_option}'")

def list_available_generators() -> List[str]:
    """List all available generators (both configurable and legacy)"""
    generators = []
    
    # Find configurable generators
    templates_dir = Path("./templates")
    if templates_dir.exists():
        for template_dir in templates_dir.iterdir():
            if template_dir.is_dir():
                config_file = template_dir / "scafoldr_template_config.json"
                if config_file.exists():
                    # Map template directory back to backend option
                    backend_option = None
                    for bo, td in BACKEND_TO_TEMPLATE_DIR.items():
                        if td == template_dir.name:
                            backend_option = bo
                            break
                    generators.append(backend_option or template_dir.name)
    
    # Add legacy generators that don't have config files yet
    for backend_option in LEGACY_GENERATOR_MAP.keys():
        template_dir = BACKEND_TO_TEMPLATE_DIR.get(backend_option, backend_option)
        config_path = f"./templates/{template_dir}/scafoldr_template_config.json"
        if not os.path.exists(config_path):
            generators.append(backend_option)
    
    return sorted(set(generators))
