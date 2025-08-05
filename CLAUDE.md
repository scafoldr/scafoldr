# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Scafoldr is a full-stack application generator that creates backend applications from DBML database schemas. The project uses static code generation with Jinja2 templating rather than unpredictable generation methods.

**Architecture:**
- **Backend Core (Python)**: FastAPI server with OpenAI integration for schema design assistance
- **Frontend (Next.js)**: React-based web interface with TypeScript
- **Code Generation**: Template-based system using Jinja2 with configurable generators
- **Deployment**: Docker Compose with Caddy proxy

## Development Commands

### Backend (Core)
```bash
# Development server
cd core && python -m uvicorn src.api.main:app --reload

# Install dependencies
cd core && pip install -r requirements.txt

# CLI tool
cd core && python -m cli.main
```

### Frontend (Web)
```bash
# Development server
cd web && npm run dev

# Build
cd web && npm run build

# Format and lint
cd web && npm run format
cd web && npm run format:check
```

### Full Stack Development
```bash
# Start all services (core, web, proxy)
docker-compose up -d

# View logs
docker-compose logs -f
```

### Testing
```bash
# Run integration tests (requires Docker and API server running)
cd tests && ./run_simple_tests.sh

# Run Python integration tests directly
cd tests && python simple_integration_test.py
```

## Code Architecture

### Core Components

**Orchestrator Pattern** (`core/src/core/orchestrator.py`):
- `generate_backend()`: DBML → ScafoldrSchema → Generated Code
- `dbml_chat()`: OpenAI-powered database schema design assistant
- `stream_dbml_chat()`: Streaming version for real-time chat

**Generator System** (`core/src/core/generators/`):
- `BaseGenerator`: Abstract base for all code generators
- `ConfigurableGenerator`: Jinja2-based template processor
- `GeneratorFactory`: Factory pattern for framework selection
- Supports Java Spring Boot, Node.js Express, with Python FastAPI in development

**Template Configuration** (`scafoldr_template_config.json`):
- Type mappings (SQL → Framework types)
- Generation rules (static files, entity-based, aggregate)
- Variable contexts (global, entity_context, computed)
- Relationship patterns for ORM associations

**Schema Processing** (`core/src/core/scafoldr_schema/`):
- Converts DBML to internal ScafoldrSchema format
- Handles entity relationships and type mappings
- Provides naming conventions (snake_case, camelCase, PascalCase)

### Frontend Architecture

**Feature-Based Structure** (`web/src/features/`):
- `chat/`: Chat interface with OpenAI integration
- `code-editor/`: Monaco-based code viewer with file tree
- `diagram/`: DBML visualization with Konva/React

**API Integration** (`web/src/app/api/`):
- `/chat`: Proxies to core API for schema design
- `/generate`: Handles code generation requests

## Template System

Templates are located in `core/templates/` with each framework having:
- **Static files**: Copied as-is (Dockerfile, package.json, etc.)
- **Jinja2 templates**: Files ending in `.j2` processed with schema context
- **Configuration**: `scafoldr_template_config.json` defines generation rules

**Supported Frameworks:**
- ✅ Java Spring Boot with JPA/Hibernate
- ✅ Node.js Express with Sequelize ORM
- 🔄 Python FastAPI with SQLAlchemy (in development)

## Key Patterns

1. **Clean Architecture**: Core business logic separated from API and CLI interfaces
2. **Template-Based Generation**: Predictable output using proven Jinja2 templating
3. **Type Safety**: Strong typing throughout with Pydantic models
4. **Plugin Architecture**: Extensible generator system for new frameworks
5. **Docker-First**: All services containerized for consistent development

## Environment Variables

Required for development:
- `OPENAI_API_KEY`: For schema design assistant
- `OPENAI_API_MODEL`: OpenAI model to use (optional)
- `CORE_API_BASE_URL`: Backend API URL for frontend
- `DOMAIN`: Domain for Caddy proxy configuration