from typing import Dict, List, Any, Optional
from models.template_config import RelationshipConfig
from models.scafoldr_schema import Reference, Entity
from jinja2 import Environment, BaseLoader

class RelationshipHandler:
    def __init__(self, relationship_config: Optional[RelationshipConfig]):
        self.config = relationship_config
        self.jinja_env = Environment(loader=BaseLoader())
    
    def generate_associations(self, refs: List[Reference], entities: List[Entity]) -> List[str]:
        """Generate association code based on database references"""
        if not self.config or not self.config.association_patterns:
            return []
        
        associations = []
        
        for ref in refs:
            # Find matching pattern
            pattern = self._find_matching_pattern(ref)
            if not pattern:
                continue
            
            # Get entities involved in the relationship
            many_entity, one_entity, many_col, one_col = self._resolve_relationship_entities(
                ref, entities, pattern
            )
            
            if not many_entity or not one_entity:
                continue
            
            # Generate association templates
            context = {
                'ref': ref,
                'many_entity': many_entity,
                'one_entity': one_entity,
                'many_col': many_col,
                'one_col': one_col
            }
            
            for template_str in pattern.templates:
                template = self.jinja_env.from_string(template_str)
                association = template.render(context)
                associations.append(association)
        
        return associations
    
    def generate_sequelize_associations(self, ref: Reference, entities: List[Entity] = None) -> List[str]:
        """Generate Sequelize-specific associations (for backward compatibility)"""
        if not entities:
            return []
        
        associations = []
        
        if ref.type not in ('>', '<'):
            return associations
        
        # Determine which side is many vs. one
        if ref.type == '>':
            many_col, one_col = ref.col1, ref.col2
        else:
            many_col, one_col = ref.col2, ref.col1
        
        # Find entities by table name
        many_entity = next((e for e in entities if e.names.snake_case.singular == many_col.table), None)
        one_entity = next((e for e in entities if e.names.snake_case.singular == one_col.table), None)
        
        if many_entity and one_entity:
            many_model = many_entity.names.pascal_case.singular
            one_model = one_entity.names.pascal_case.singular
            fk = many_col.name
            
            associations.append(
                f"{many_model}.belongsTo({one_model}, {{ foreignKey: '{fk}' }});"
            )
            associations.append(
                f"{one_model}.hasMany({many_model}, {{ foreignKey: '{fk}' }});"
            )
        
        return associations
    
    def _find_matching_pattern(self, ref: Reference) -> Optional[Any]:
        """Find the association pattern that matches the reference"""
        if not self.config or not self.config.association_patterns:
            return None
        
        for pattern_name, pattern in self.config.association_patterns.items():
            if self._evaluate_pattern_condition(pattern.condition, ref):
                return pattern
        
        return None
    
    def _evaluate_pattern_condition(self, condition: str, ref: Reference) -> bool:
        """Evaluate if a pattern condition matches the reference"""
        try:
            context = {'ref': ref}
            template = self.jinja_env.from_string(f"{{{{ {condition} }}}}")
            result = template.render(context)
            return result.lower() in ['true', '1', 'yes']
        except Exception as e:
            print(f"Warning: Failed to evaluate pattern condition '{condition}': {e}")
            return False
    
    def _resolve_relationship_entities(self, ref: Reference, entities: List[Entity], pattern: Any) -> tuple:
        """Resolve the entities and columns involved in a relationship"""
        try:
            # Evaluate many_side and one_side expressions
            many_side_expr = pattern.many_side
            one_side_expr = pattern.one_side
            
            context = {'ref': ref}
            
            # Get many side column
            many_template = self.jinja_env.from_string(f"{{{{ {many_side_expr} }}}}")
            many_col = many_template.render(context)
            
            # Get one side column  
            one_template = self.jinja_env.from_string(f"{{{{ {one_side_expr} }}}}")
            one_col = one_template.render(context)
            
            # Find entities by table name
            many_entity = None
            one_entity = None
            
            if hasattr(many_col, 'table'):
                many_entity = next((e for e in entities if e.names.snake_case.singular == many_col.table), None)
            if hasattr(one_col, 'table'):
                one_entity = next((e for e in entities if e.names.snake_case.singular == one_col.table), None)
            
            return many_entity, one_entity, many_col, one_col
            
        except Exception as e:
            print(f"Warning: Failed to resolve relationship entities: {e}")
            return None, None, None, None
    
    def generate_jpa_associations(self, ref: Reference, entities: List[Entity] = None) -> List[str]:
        """Generate JPA/Hibernate associations"""
        if not entities:
            return []
        
        associations = []
        
        if ref.type not in ('>', '<'):
            return associations
        
        # Determine which side is many vs. one
        if ref.type == '>':
            many_col, one_col = ref.col1, ref.col2
        else:
            many_col, one_col = ref.col2, ref.col1
        
        # Find entities by table name
        many_entity = next((e for e in entities if e.names.snake_case.singular == many_col.table), None)
        one_entity = next((e for e in entities if e.names.snake_case.singular == one_col.table), None)
        
        if many_entity and one_entity:
            many_class = many_entity.names.pascal_case.singular
            one_class = one_entity.names.pascal_case.singular
            many_field = one_entity.names.camel_case.singular
            one_field = many_entity.names.camel_case.plural
            fk = many_col.name
            
            # Many-to-One side
            associations.append(
                f"@ManyToOne\n@JoinColumn(name = \"{fk}\")\nprivate {one_class} {many_field};"
            )
            
            # One-to-Many side
            associations.append(
                f"@OneToMany(mappedBy = \"{many_field}\")\nprivate List<{many_class}> {one_field};"
            )
        
        return associations