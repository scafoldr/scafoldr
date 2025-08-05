# Code Generators

This directory contains the code generation system that transforms database schemas into complete application code. The system uses a configuration-driven approach where templates are defined using JSON configuration files and Jinja2 templates.

## How It Works

The code generation process follows these steps:

1. **Input**: A `ScafoldrSchema` object containing your database structure and entities
2. **Template Selection**: The system loads the appropriate template based on your chosen framework
3. **Code Generation**: Templates are processed to generate complete application files
4. **Output**: A collection of files ready to run as a complete application

## ScafoldrSchema

The generation system works with a `ScafoldrSchema` object that represents your application structure. This schema contains:

- **Database Schema**: Tables, columns, relationships, and constraints
- **Backend Schema**: Entities with properly formatted names and attributes
- **Project Metadata**: Name, description, and configuration details

For more details about the schema structure, see the [ScafoldrSchema documentation](../scafoldr_schema/README.md).

## Template Configuration

Each template is defined by a `scafoldr_template_config.json` file that tells the system how to generate code. This configuration file contains:

### Template Information
Basic details about the template like name, version, and target framework.

### Type Mappings
Rules for converting database types (like `varchar`, `int`) to framework-specific types (like `String`, `Integer` in Java or `STRING`, `INTEGER` in Sequelize).

### Variables
Template variables that get replaced during generation:
- **Global variables**: Available to all templates (project name, database settings)
- **Entity variables**: Specific to each database entity (class names, table names)
- **Computed variables**: Automatically calculated values (field lists, import statements)

### Generation Rules
Instructions for what files to create:
- **Static files**: Copied as-is (configuration files, build scripts)
- **Entity-based files**: One file per database entity (models, controllers, services)
- **Aggregate files**: Files that process all entities together (main application file, routing)

## Available Templates

### Node.js Express
Location: `templates/node_express_js/`
- Generates a REST API using Express.js and Sequelize ORM
- Creates models, controllers, services, repositories, and routes
- Includes database configuration and application setup

### Java Spring Boot
Location: `templates/java_spring/`
- Generates a REST API using Spring Boot and JPA/Hibernate
- Creates entities, repositories, services, controllers, and DTOs
- Includes Maven configuration and application setup

## Creating New Templates

To add support for a new framework:

1. **Create template directory**: `templates/your-framework/`
2. **Add Jinja2 templates**: Create `.j2` files for each type of code file you want to generate
3. **Create configuration**: Add `scafoldr_template_config.json` with your generation rules
4. **Test**: The system will automatically detect and use your new template

No Python code is required - everything is configured through the JSON file and Jinja2 templates.

## File Structure

```
generators/
├── base_generator.py          # Base interface for all generators
├── configurable_generator.py  # Main generator that processes configurations
├── config_loader.py          # Loads and validates template configurations
├── generator_factory.py      # Selects the right generator for your framework
├── relationship_handler.py   # Processes database relationships
├── type_mapper.py            # Converts database types to framework types
└── variable_resolver.py      # Resolves template variables and computed values
```

## Example Usage

```python
from core.generators.generator_factory import get_generator

# Get a generator for your chosen framework
generator = get_generator("nodejs-express-js")

# Generate code from your schema
result = generator.generate(your_schema)

# Result contains all generated files
for file_path, content in result.files.items():
    print(f"Generated: {file_path}")
```

The system handles all the complexity of code generation, type mapping, and file organization automatically based on your template configuration.