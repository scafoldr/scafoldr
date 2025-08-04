import json
import os
from pathlib import Path
from typing import Dict, Any
from models.template_config import TemplateConfig
from pydantic import ValidationError

class ConfigurationLoader:
    @staticmethod
    def load(config_path: str) -> TemplateConfig:
        """Load and validate template configuration from JSON file"""
        if not os.path.exists(config_path):
            raise FileNotFoundError(f"Configuration file not found: {config_path}")
        
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                config_data = json.load(f)
            
            # Validate configuration against schema
            config = TemplateConfig(**config_data)
            
            # Validate template files exist
            template_dir = Path(config_path).parent
            ConfigurationLoader._validate_templates(config, template_dir)
            
            return config
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in configuration file: {e}")
        except ValidationError as e:
            raise ValueError(f"Configuration validation failed: {e}")
    
    @staticmethod
    def _validate_templates(config: TemplateConfig, template_dir: Path):
        """Validate that all required template files exist"""
        if config.validation and config.validation.required_templates:
            for template_path in config.validation.required_templates:
                full_path = template_dir / template_path
                if not full_path.exists():
                    raise FileNotFoundError(f"Required template not found: {full_path}")
        
        # Validate templates referenced in generation rules
        all_rules = config.generation_rules.entity_based + config.generation_rules.aggregate
        for rule in all_rules:
            if rule.enabled:
                template_path = template_dir / rule.template
                if not template_path.exists():
                    raise FileNotFoundError(f"Template not found for rule '{rule.name}': {template_path}")