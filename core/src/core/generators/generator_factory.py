import os
from pathlib import Path
from typing import List
from core.generators.base_generator import BaseGenerator
from core.generators.configurable_generator import ConfigurableGenerator

# Mapping from backend option to template directory name
BACKEND_TO_TEMPLATE_DIR = {
    "nodejs-express-js": "node_express_js",
    "java-spring": "java_spring",
    "next-js-typescript": "next-js",
}

def get_generator(backend_option: str) -> BaseGenerator:
    """Get generator for the specified backend option"""
    
    # Find configuration-driven generator
    template_dir = BACKEND_TO_TEMPLATE_DIR.get(backend_option, backend_option)
    config_path = f"./templates/{template_dir}/scafoldr_template_config.json"
    
    if os.path.exists(config_path):
        return ConfigurableGenerator(config_path)
    
    raise ValueError(f"No generator found for backend_option '{backend_option}'. Please ensure a scafoldr_template_config.json file exists in ./templates/{template_dir}/")

def list_available_generators() -> List[str]:
    """List all available configurable generators"""
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
    
    return sorted(set(generators))
