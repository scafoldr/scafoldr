from abc import ABC, abstractmethod
import re
import inflect
from models.scafoldr_schema import ScafoldrSchema, Names, NameVariations

class ScafoldrSchemaMaker(ABC):
    
    def __init__(self):
        self.inflect_engine = inflect.engine()
    
    def _to_camel_case(self, snake_str: str) -> str:
        """Convert snake_case to camelCase"""
        components = snake_str.split('_')
        return components[0] + ''.join(word.capitalize() for word in components[1:])
    
    def _to_camel_case_capitalized(self, snake_str: str) -> str:
        """Convert snake_case to CamelCase (PascalCase)"""
        return ''.join(word.capitalize() for word in snake_str.split('_'))
    
    def _to_kebab_case(self, snake_str: str) -> str:
        """Convert snake_case to kebab-case"""
        return snake_str.replace('_', '-')
    
    def _to_snake_case(self, name: str) -> str:
        """Convert any case to snake_case"""
        # Handle camelCase and PascalCase
        s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
        # Handle kebab-case
        s2 = s1.replace('-', '_')
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s2).lower()
    
    def _pluralize(self, word: str) -> str:
        """Pluralize using inflect library"""
        return self.inflect_engine.plural(word)
    
    def _create_names(self, original_name: str) -> Names:
        """Create Names object with all case variations"""
        snake_name = self._to_snake_case(original_name)
        
        # Get the singular form first - if input is plural, convert to singular
        singular_noun = self.inflect_engine.singular_noun(snake_name)
        if singular_noun:
            # Input was plural, use the singular form
            snake_singular = singular_noun
        else:
            # Input was already singular
            snake_singular = snake_name
        
        # Generate all case variations from the singular form
        camel_singular = self._to_camel_case(snake_singular)
        pascal_singular = self._to_camel_case_capitalized(snake_singular)
        kebab_singular = self._to_kebab_case(snake_singular)
        
        # Generate plural forms
        snake_plural = self._pluralize(snake_singular)
        camel_plural = self._to_camel_case(snake_plural)
        pascal_plural = self._to_camel_case_capitalized(snake_plural)
        kebab_plural = self._to_kebab_case(snake_plural)
        
        return Names(
            camel_case=NameVariations(
                singular=camel_singular,
                plural=camel_plural
            ),
            pascal_case=NameVariations(
                singular=pascal_singular,
                plural=pascal_plural
            ),
            kebab_case=NameVariations(
                singular=kebab_singular,
                plural=kebab_plural
            ),
            snake_case=NameVariations(
                singular=snake_singular,
                plural=snake_plural
            )
        )

    @abstractmethod
    def make_schema(__self, **kwargs) -> ScafoldrSchema:
        """
        Creates and returns a ScafoldrSchema instance based on provided keyword arguments.

        This method generates a complete schema object containing database schema, backend schema,
        and project metadata. Additional dynamic properties can be passed via keyword arguments.

        Args:
            **kwargs: Arbitrary keyword arguments used to customize schema generation.

        Returns:
            ScafoldrSchema: The generated schema object containing database schema, backend schema, and project metadata.
        """
        pass
