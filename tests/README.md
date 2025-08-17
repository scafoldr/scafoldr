# Scafoldr Integration Tests

This document provides comprehensive instructions for running integration tests that validate code generation and deployment across all supported frameworks.

## Overview

The Scafoldr testing infrastructure provides end-to-end integration testing with a modular architecture and beautiful styled output. Tests validate the complete workflow: DBML input → API generation → Docker deployment → Health checks.

## Prerequisites

Before running the tests, ensure you have:

1. **Scafoldr API Server**: Running at `http://localhost:8000`
   ```bash
   cd core && python -m uvicorn src.api.main:app --reload
   ```

2. **Docker & Docker Compose**: Installed and running
   ```bash
   docker --version
   docker-compose --version
   docker info  # Verify daemon is running
   ```

3. **Python 3**: With requests package
   ```bash
   python3 --version
   pip3 install requests  # If not already installed
   ```

## Quick Start

### Run All Tests
```bash
cd tests
./run_simple_tests.sh
```

### Run Specific Framework
```bash
# Test only Java Spring Boot
./run_simple_tests.sh --framework java_spring

# Test only Node.js Express
./run_simple_tests.sh --framework node_express_js

# Test only Next.js TypeScript
./run_simple_tests.sh --framework next-js-typescript
```

### Test Multiple Frameworks
```bash
./run_simple_tests.sh --framework java_spring --framework node_express_js
```

### Test Specific DBML Files
```bash
# Test only with example.dbml
./run_simple_tests.sh --dbml example.dbml

# Test with specific file and framework
./run_simple_tests.sh --framework java_spring --dbml example.dbml
```

## Command Line Options

| Option | Short | Description | Example |
|--------|-------|-------------|---------|
| `--framework` | `-f` | Test specific framework (repeatable) | `-f java_spring` |
| `--dbml` | `-d` | Test specific DBML file (repeatable) | `-d example.dbml` |
| `--api-url` | | Custom API URL | `--api-url http://localhost:8080` |
| `--no-color` | | Disable colored output | `--no-color` |
| `--list-frameworks` | | List available frameworks | `--list-frameworks` |
| `--verbose` | `-v` | Enable verbose output | `-v` |
| `--help` | `-h` | Show help message | `-h` |

## Available Frameworks

List available frameworks:
```bash
./run_simple_tests.sh --list-frameworks
```

Current frameworks:
- `java_spring` - Java Spring Boot with JPA/Hibernate
- `node_express_js` - Node.js Express with Sequelize ORM  
- `next-js-typescript` - Next.js TypeScript with React

## Test Process

Each test follows this workflow:

1. **📡 API Call**: Send DBML to `/generate` endpoint
2. **📁 Code Generation**: Extract generated files to output directory
3. **🐳 Docker Build**: Run `docker-compose up -d --build`
4. **❤️ Health Check**: Wait for application to start and verify endpoints
5. **🧹 Cleanup**: Stop containers and clean up resources

## Output Examples

### Successful Test
```
════════════════════════════════════════════════════════════
                 SCAFOLDR INTEGRATION TESTS                 
════════════════════════════════════════════════════════════

──────────────────────────────────────────────────
            🔧 Testing Java Spring Boot            
            Test: java_spring_example             
──────────────────────────────────────────────────
📡 [INFO] Calling generate API for java_spring
📁 [INFO] Created 29 files in output directory
🐳 [SUCCESS] Docker compose started successfully
❤️ [SUCCESS] Java Spring Boot application is ready! (took 38 seconds)
🧹 [INFO] Docker compose stopped and cleaned up
✅ java_spring_example: PASS ⏱️ 45.2s
```

### Test Summary
```
════════════════════════════════════════════════════════════
                        TEST SUMMARY                        
════════════════════════════════════════════════════════════
Total Tests: 6
✅ Passed: 6
❌ Failed: 0
Success Rate: 100.0%
```

## Test Files and Reports

### Directory Structure
```
tests/
├── run_simple_tests.sh              # Main script entry point
├── simple_integration_test.py       # Python CLI with arguments
├── input/                           # DBML test files
│   ├── example.dbml                 # Simple example schema
│   └── flowers.dbml                 # More complex schema
├── output/                          # Generated code (temporary)
└── reports/                         # Test reports
    ├── simple_integration_report.json
    ├── simple_integration_report.txt
    └── test_execution.log
```

### Generated Reports

After tests complete, check the reports:

- **JSON Report**: Machine-readable results in `reports/simple_integration_report.json`
- **Text Report**: Human-readable summary in `reports/simple_integration_report.txt`  
- **Execution Log**: Detailed logs in `reports/test_execution.log`

## Advanced Usage

### CI/CD Integration
```bash
# Disable colors for clean CI logs
./run_simple_tests.sh --no-color

# Test specific framework in CI pipeline
./run_simple_tests.sh --framework java_spring --no-color
```

### Development Workflow
```bash
# Quick test during development
./run_simple_tests.sh --framework java_spring --dbml example.dbml

# Test against different API URL
./run_simple_tests.sh --api-url http://localhost:8080
```

### Multiple DBML Files
```bash
# Test both DBML files with Java Spring
./run_simple_tests.sh --framework java_spring --dbml example.dbml --dbml flowers.dbml
```

## Troubleshooting

### Common Issues

1. **API Server Not Running**
   ```
   ❌ API server is not running at http://localhost:8000
      Please start the server first!
   ```
   **Solution**: Start the Scafoldr API server
   ```bash
   cd core && python -m uvicorn src.api.main:app --reload
   ```

2. **Docker Not Running**
   ```bash
   ❌ [ERROR] Docker daemon is not running
   ```
   **Solution**: Start Docker Desktop or Docker daemon

3. **Port Conflicts**
   - Java Spring uses port 8080
   - Node.js/Next.js use port 3000
   - Make sure these ports are available

4. **Test Timeout**
   - Framework applications have different startup times
   - Java Spring: up to 300 seconds
   - Node.js: up to 120 seconds  
   - Next.js: up to 180 seconds

### Debug Mode
```bash
# Enable verbose output for debugging
./run_simple_tests.sh --verbose

# Check detailed logs
cat reports/test_execution.log
```

## Architecture

The testing infrastructure uses a clean, modular architecture:

- **Framework Testers**: Each framework has its own tester class
- **Factory Pattern**: Centralized framework discovery and creation
- **Styled Output**: Colorized console output with emojis
- **Orchestrator**: Manages the complete test workflow
- **CLI Integration**: Comprehensive command-line interface

## Adding Custom DBML Files

1. Add your `.dbml` file to `tests/input/`
2. Run tests with your file:
   ```bash
   ./run_simple_tests.sh --dbml your_schema.dbml
   ```

## Performance

Typical test times per framework:
- **Java Spring Boot**: ~45-60 seconds (includes JVM startup)
- **Node.js Express**: ~8-15 seconds (fast startup)
- **Next.js TypeScript**: ~20-30 seconds (includes build time)

Total runtime for all frameworks with both DBML files: ~3-5 minutes