import os
import fnmatch
from pathlib import Path
from typing import Dict, List
from jinja2 import Environment, FileSystemLoader
from models.generate import GenerateResponse
from models.scafoldr_schema import ScafoldrSchema, Entity
from core.generators.base_generator import BaseGenerator
from core.generators.config_loader import ConfigurationLoader
from core.generators.type_mapper import TypeMapper
from core.generators.variable_resolver import VariableResolver
from core.generators.relationship_handler import RelationshipHandler

class ConfigurableGenerator(BaseGenerator):
    def __init__(self, config_path: str):
        self.config_path = config_path
        self.config = ConfigurationLoader.load(config_path)
        self.template_dir = Path(config_path).parent
        
        # Initialize components
        self.type_mapper = TypeMapper(self.config.type_mappings)
        self.variable_resolver = VariableResolver(self.config.variables, self.type_mapper)
        self.relationship_handler = RelationshipHandler(self.config.relationships) if self.config.relationships else None
        
        # Setup Jinja2 environment
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(self.template_dir)),
            trim_blocks=True,
            lstrip_blocks=True,
        )
        
        # Register custom filters and functions
        self._register_plugins()
    
    def generate(self, schema: ScafoldrSchema) -> GenerateResponse:
        """Generate files based on configuration"""
        files = {}
        entities = schema.backend_schema.entities if schema.backend_schema else []
        
        # Generate static files
        if self.config.generation_rules.static_files.enabled:
            files.update(self._generate_static_files())
        
        # Generate entity-based files
        for rule in self.config.generation_rules.entity_based:
            if rule.enabled:
                files.update(self._generate_entity_files(rule, entities, schema))
        
        # Generate aggregate files
        for rule in self.config.generation_rules.aggregate:
            if rule.enabled:
                files.update(self._generate_aggregate_files(rule, entities, schema))
        
        # Get post-generation commands
        commands = []
        if self.config.commands:
            commands = self.config.commands.post_generation
        
        return GenerateResponse(files=files, commands=commands)
    
    def _generate_static_files(self) -> Dict[str, str]:
        """Generate static (non-template) files"""
        static_config = self.config.generation_rules.static_files
        files = {}
        
        for root, _, filenames in os.walk(self.template_dir):
            for filename in filenames:
                file_path = Path(root) / filename
                relative_path = file_path.relative_to(self.template_dir)
                
                # Skip excluded patterns
                if self._matches_patterns(str(relative_path), static_config.exclude_patterns):
                    continue
                
                # Check include patterns
                if not self._matches_patterns(str(relative_path), static_config.include_patterns):
                    continue
                
                # Read file content
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                except UnicodeDecodeError:
                    # Handle binary files
                    with open(file_path, 'rb') as f:
                        content = f.read()
                
                # Apply transformations
                output_path = str(relative_path)
                for old_name, new_name in (static_config.transformations or {}).items():
                    if output_path.endswith(old_name):
                        output_path = output_path.replace(old_name, new_name)
                
                # Apply path transformations
                for old_path, new_path in (static_config.path_transformations or {}).items():
                    output_path = output_path.replace(old_path, new_path)
                
                files[output_path] = content
        
        return files
    
    def _generate_entity_files(self, rule, entities: List[Entity], schema: ScafoldrSchema) -> Dict[str, str]:
        """Generate files for each entity"""
        files = {}
        
        try:
            template = self.jinja_env.get_template(rule.template)
        except Exception as e:
            print(f"Error loading template '{rule.template}': {e}")
            return files
        
        for entity in entities:
            try:
                # Resolve variables for this entity
                variables = self.variable_resolver.resolve_entity_variables(entity, schema)
                global_vars = self.variable_resolver.resolve_global_variables(schema)
                
                # Add rule-specific variables
                if rule.variables:
                    rule_vars = self.variable_resolver.resolve_rule_variables(rule.variables, entity, schema)
                    variables.update(rule_vars)
                
                # Combine all variables
                context = {
                    **global_vars,
                    **variables,
                    "entity": entity,
                    "schema": schema,
                    "computed": variables.get("computed", {})
                }
                
                # Render template
                content = template.render(context)
                
                # Resolve output path
                output_path_template = self.jinja_env.from_string(rule.output_path)
                output_path = output_path_template.render(context)
                
                files[output_path] = content
                
            except Exception as e:
                print(f"Error generating file for entity '{entity.names.pascal_case.singular}' with rule '{rule.name}': {e}")
                continue
        
        return files
    
    def _generate_aggregate_files(self, rule, entities: List[Entity], schema: ScafoldrSchema) -> Dict[str, str]:
        """Generate files that process all entities together"""
        files = {}
        
        try:
            template = self.jinja_env.get_template(rule.template)
        except Exception as e:
            print(f"Error loading template '{rule.template}': {e}")
            return files
        
        try:
            # Resolve global variables
            global_vars = self.variable_resolver.resolve_global_variables(schema)
            
            # Prepare context
            context = {
                **global_vars,
                "entities": entities,
                "schema": schema,
                "database_schema": schema.database_schema
            }
            
            # Add rule-specific variables
            if rule.variables:
                rule_vars = self.variable_resolver.resolve_rule_variables(rule.variables, None, schema, entities)
                context.update(rule_vars)
            
            # Add relationship data if needed
            if self.relationship_handler and "associations" in str(rule.variables):
                associations = self.relationship_handler.generate_associations(schema.database_schema.refs, entities)
                context["associations"] = associations
            
            # Add backward compatibility for relationships
            if self.relationship_handler:
                context["relationships"] = self.relationship_handler
            
            # Render template
            content = template.render(context)
            
            # Resolve output path
            output_path_template = self.jinja_env.from_string(rule.output_path)
            output_path = output_path_template.render(context)
            
            files[output_path] = content
            
        except Exception as e:
            print(f"Error generating aggregate file with rule '{rule.name}': {e}")
        
        return files
    
    def _matches_patterns(self, path: str, patterns: List[str]) -> bool:
        """Check if path matches any of the given patterns"""
        return any(fnmatch.fnmatch(path, pattern) for pattern in patterns)
    
    def _register_plugins(self):
        """Register custom filters and functions from configuration"""
        if not self.config.plugins:
            return
        
        # Register filters
        for filter_config in self.config.plugins.filters:
            try:
                # Create a safe evaluation environment
                safe_globals = {
                    '__builtins__': {},
                    'len': len,
                    'str': str,
                    'int': int,
                    'float': float,
                    'bool': bool,
                    'list': list,
                    'dict': dict,
                    'set': set,
                    'tuple': tuple,
                }
                
                filter_func = eval(filter_config.code, safe_globals)
                self.jinja_env.filters[filter_config.name] = filter_func
            except Exception as e:
                print(f"Warning: Failed to register filter {filter_config.name}: {e}")
        
        # Register tests
        for test_config in self.config.plugins.tests:
            try:
                safe_globals = {
                    '__builtins__': {},
                    'len': len,
                    'str': str,
                    'int': int,
                    'float': float,
                    'bool': bool,
                    'hasattr': hasattr,
                    'getattr': getattr,
                }
                
                test_func = eval(test_config.code, safe_globals)
                self.jinja_env.tests[test_config.name] = test_func
            except Exception as e:
                print(f"Warning: Failed to register test {test_config.name}: {e}")
        
        # Register global functions
        for func_config in self.config.plugins.custom_functions:
            try:
                # For now, we'll add them as globals - more sophisticated plugin system can be added later
                self.jinja_env.globals[func_config.name] = func_config.code
            except Exception as e:
                print(f"Warning: Failed to register function {func_config.name}: {e}")