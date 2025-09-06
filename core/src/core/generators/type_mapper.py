import re
from typing import Dict, List, Optional, Set
from models.template_config import TypeMapping

class TypeMapper:
    def __init__(self, type_mapping: TypeMapping):
        self.sql_to_framework = type_mapping.sql_to_framework
        self.import_mappings = type_mapping.import_mappings or {}
        self.default_type = type_mapping.default_type
        self.custom_mappings = type_mapping.custom_mappings or []
    
    def resolve(self, sql_type: str) -> str:
        """Resolve SQL type to framework-specific type"""
        # First try exact match
        framework_type = self.sql_to_framework.get(sql_type.lower())
        if framework_type:
            return framework_type
        
        # Try custom mappings with conditions
        for mapping in self.custom_mappings:
            condition = mapping.condition
            if self._evaluate_condition(condition, sql_type):
                return mapping.result
        
        # Return default type
        return self.default_type
    
    def get_imports(self, sql_type: str) -> Optional[str]:
        """Get required import for a SQL type"""
        framework_type = self.resolve(sql_type)
        return self.import_mappings.get(framework_type)
    
    def get_all_imports(self, sql_types: List[str]) -> Set[str]:
        """Get all required imports for a list of SQL types"""
        imports = set()
        for sql_type in sql_types:
            import_stmt = self.get_imports(sql_type)
            if import_stmt:
                imports.add(import_stmt)
        return imports
    
    def resolve_java(self, sql_type: str) -> str:
        """Java-specific type resolution (for backward compatibility)"""
        return self.resolve(sql_type)
    
    def _evaluate_condition(self, condition: str, sql_type: str) -> bool:
        """Evaluate a condition string against SQL type"""
        # Simple condition evaluation - can be extended
        type_lower = sql_type.lower()
        
        try:
            # Create a safe evaluation context
            context = {
                'type': sql_type,
                'contains': lambda s: s in type_lower,
                'startswith': lambda s: type_lower.startswith(s),
                'endswith': lambda s: type_lower.endswith(s),
                'equals': lambda s: type_lower == s.lower(),
                'len': len,
                'str': str,
                'int': int,
                'float': float,
                'bool': bool,
                'and': lambda a, b: a and b,
                'or': lambda a, b: a or b,
                'not': lambda a: not a,
            }
            
            # Handle .contains() method calls first (before other replacements)
            condition = re.sub(r"\.contains\('([^']+)'\)", r".find('\1') != -1", condition)
            
            # Replace common patterns for easier condition writing
            condition = condition.replace("type.lower()", f"'{type_lower}'")
            condition = condition.replace("type", f"'{sql_type}'")
            
            # Evaluate the condition
            return eval(condition, {"__builtins__": {}}, context)
        except Exception as e:
            print(f"Warning: Failed to evaluate condition '{condition}' for type '{sql_type}': {e}")
            return False