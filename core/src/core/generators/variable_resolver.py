from typing import Dict, Any, List
from jinja2 import Environment, BaseLoader, meta
from models.scafoldr_schema import ScafoldrSchema, Entity
from core.generators.type_mapper import TypeMapper

class VariableResolver:
    def __init__(self, variables_config: Dict[str, Any], type_mapper: TypeMapper):
        self.variables_config = variables_config
        self.type_mapper = type_mapper
        self.jinja_env = Environment(loader=BaseLoader())
        
        # Add type_mapper methods to Jinja environment
        self.jinja_env.globals['type_mappings'] = type_mapper
    
    def resolve_global_variables(self, schema: ScafoldrSchema) -> Dict[str, Any]:
        """Resolve global template variables"""
        global_vars = self.variables_config.get("global", {})
        context = {"schema": schema}
        
        resolved = {}
        for key, template_str in global_vars.items():
            if isinstance(template_str, str) and "{{" in template_str:
                template = self.jinja_env.from_string(template_str)
                resolved[key] = template.render(context)
            else:
                resolved[key] = template_str
        
        return resolved
    
    def resolve_entity_variables(self, entity: Entity, schema: ScafoldrSchema) -> Dict[str, Any]:
        """Resolve entity-specific template variables"""
        entity_vars = self.variables_config.get("entity_context", {})
        computed_vars = self.variables_config.get("computed", {})
        
        context = {
            "entity": entity,
            "schema": schema,
            "type_mappings": self.type_mapper
        }
        
        resolved = {}
        
        # Resolve entity context variables
        for key, template_str in entity_vars.items():
            if isinstance(template_str, str) and "{{" in template_str:
                template = self.jinja_env.from_string(template_str)
                resolved[key] = template.render(context)
            else:
                resolved[key] = template_str
        
        # Resolve computed variables
        for key, config in computed_vars.items():
            resolved[key] = self._resolve_computed_variable(config, entity, context)
        
        # Add computed variables to context for template access
        context.update(resolved)
        
        return resolved
    
    def resolve_rule_variables(self, variables: Dict[str, Any], entity: Entity = None, schema: ScafoldrSchema = None, entities: List[Entity] = None) -> Dict[str, Any]:
        """Resolve rule-specific variables"""
        resolved = {}
        
        context = {
            "entity": entity,
            "schema": schema,
            "entities": entities,
            "type_mappings": self.type_mapper
        }
        
        for key, config in variables.items():
            if isinstance(config, dict) and "source" in config:
                # Handle computed variables
                resolved[key] = self._resolve_computed_variable(config, entity, context, entities)
            elif isinstance(config, str) and "{{" in config:
                # Resolve template string
                template = self.jinja_env.from_string(config)
                resolved[key] = template.render(context)
            else:
                resolved[key] = config
        
        # Add resolved variables to context for nested template resolution
        context.update(resolved)
        
        return resolved
    
    def _resolve_computed_variable(self, config: Dict[str, Any], entity: Entity = None, context: Dict[str, Any] = None, entities: List[Entity] = None) -> Any:
        """Resolve a computed variable configuration"""
        source = config.get("source")
        transform = config.get("transform", {})
        filter_expr = config.get("filter")
        unique = config.get("unique", False)
        sort_result = config.get("sort", False)
        additional = config.get("additional", [])
        
        # Get source data
        source_data = self._get_source_data(source, entity, context, entities)
        
        # Apply filter if specified
        if filter_expr:
            source_data = self._apply_filter(source_data, filter_expr, context)
        
        # Apply transformation
        if transform:
            result = self._apply_transformation(source_data, transform, context)
        else:
            result = source_data
        
        # Add additional items
        if additional:
            if isinstance(result, list):
                result.extend(additional)
            else:
                result = [result] + additional
        
        # Apply unique filter
        if unique and isinstance(result, list):
            result = self._apply_unique_filter(result)
        
        # Apply sorting
        if sort_result and isinstance(result, list):
            result = sorted(result, key=str)
        
        return result
    
    def _get_source_data(self, source: str, entity: Entity = None, context: Dict[str, Any] = None, entities: List[Entity] = None) -> Any:
        """Get source data based on source specification"""
        if source == "entity.attributes" and entity:
            return entity.attributes
        elif source == "entities" and entities:
            return entities
        elif source == "database_schema.refs" and context and "schema" in context:
            return context["schema"].database_schema.refs if context["schema"].database_schema else []
        else:
            # Try to resolve as a template expression
            try:
                template = self.jinja_env.from_string(f"{{{{ {source} }}}}")
                return template.render(context or {})
            except:
                return []
    
    def _apply_filter(self, source_data: List[Any], filter_expr: str, context: Dict[str, Any]) -> List[Any]:
        """Apply filter expression to source data"""
        filtered_data = []
        for item in source_data:
            item_context = {**context, "attr": item, "item": item}
            if self._evaluate_filter(filter_expr, item_context):
                filtered_data.append(item)
        return filtered_data
    
    def _apply_transformation(self, source_data: List[Any], transform: Dict[str, str], context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Apply transformation to source data"""
        transformed_data = []
        for item in source_data:
            item_context = {**context, "attr": item, "item": item}
            transformed_item = {}
            for key, template_str in transform.items():
                if isinstance(template_str, str) and "{{" in template_str:
                    try:
                        template = self.jinja_env.from_string(template_str)
                        transformed_item[key] = template.render(item_context)
                    except Exception as e:
                        print(f"Warning: Failed to transform {key} with template '{template_str}': {e}")
                        transformed_item[key] = template_str
                else:
                    transformed_item[key] = template_str
            transformed_data.append(transformed_item)
        return transformed_data
    
    def _apply_unique_filter(self, result: List[Any]) -> List[Any]:
        """Apply unique filter to result list"""
        seen = set()
        unique_result = []
        for item in result:
            item_str = str(item)
            if item_str not in seen:
                seen.add(item_str)
                unique_result.append(item)
        return unique_result
    
    def _evaluate_filter(self, filter_expr: str, context: Dict[str, Any]) -> bool:
        """Evaluate a filter expression"""
        try:
            # Simple evaluation - can be extended for more complex expressions
            template = self.jinja_env.from_string(f"{{{{ {filter_expr} }}}}")
            result = template.render(context)
            
            # Handle boolean conversion
            if isinstance(result, str):
                return result.lower() in ['true', '1', 'yes']
            return bool(result)
        except Exception as e:
            print(f"Warning: Failed to evaluate filter '{filter_expr}': {e}")
            return True