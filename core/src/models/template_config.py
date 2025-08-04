from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union
from enum import Enum

class TemplateInfo(BaseModel):
    name: str
    version: str
    description: str
    author: Optional[str] = None
    framework: str
    language: str
    orm: Optional[str] = None

class CustomMapping(BaseModel):
    condition: str
    result: str

class TypeMapping(BaseModel):
    sql_to_framework: Dict[str, str]
    import_mappings: Optional[Dict[str, str]] = {}
    default_type: str = "String"
    custom_mappings: Optional[List[CustomMapping]] = []

class VariableTransform(BaseModel):
    source: str
    transform: Optional[Dict[str, str]] = None
    filter: Optional[str] = None
    unique: Optional[bool] = False
    sort: Optional[bool] = False
    additional: Optional[List[str]] = []

class GenerationRule(BaseModel):
    name: str
    description: Optional[str] = None
    template: str
    output_path: str
    context: str  # "entity" or "all_entities"
    enabled: bool = True
    variables: Optional[Dict[str, Any]] = {}

class StaticFilesConfig(BaseModel):
    enabled: bool = True
    exclude_patterns: List[str] = ["*.j2", "*.jinja2", "scafoldr_template_config.json"]
    include_patterns: List[str] = ["*"]
    transformations: Optional[Dict[str, str]] = {}
    path_transformations: Optional[Dict[str, str]] = {}

class GenerationRules(BaseModel):
    static_files: StaticFilesConfig
    entity_based: List[GenerationRule] = []
    aggregate: List[GenerationRule] = []

class AssociationPattern(BaseModel):
    condition: str
    many_side: str
    one_side: str
    templates: List[str]

class RelationshipConfig(BaseModel):
    association_patterns: Dict[str, AssociationPattern] = {}
    custom_functions: Optional[Dict[str, Any]] = {}

class PluginFunction(BaseModel):
    name: str
    description: Optional[str] = None
    parameters: Optional[List[str]] = []
    code: str

class PluginConfig(BaseModel):
    custom_functions: List[PluginFunction] = []
    filters: List[PluginFunction] = []
    tests: List[PluginFunction] = []

class ValidationConfig(BaseModel):
    required_templates: List[str] = []
    required_variables: List[str] = []
    template_syntax: str = "jinja2"
    schema_version: str = "1.0"

class CommandsConfig(BaseModel):
    post_generation: List[str] = []
    development: List[str] = []
    production: List[str] = []
    test: List[str] = []

class TemplateConfig(BaseModel):
    template: TemplateInfo
    type_mappings: TypeMapping
    variables: Dict[str, Any]
    generation_rules: GenerationRules
    relationships: Optional[RelationshipConfig] = None
    plugins: Optional[PluginConfig] = None
    validation: Optional[ValidationConfig] = None
    commands: Optional[CommandsConfig] = None