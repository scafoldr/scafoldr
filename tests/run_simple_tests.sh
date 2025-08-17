#!/bin/bash

# Simple Integration Test Runner for Scafoldr
# Tests DBML → API → Docker → Health Check

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  [INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ [SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️  [WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}❌ [ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Run simple integration tests for Scafoldr templates

This script will:
1. Read DBML files from input/ directory
2. Send each to the /generate API
3. Extract generated code to temp directory
4. Run 'docker-compose up -d' 
5. Wait for application to start
6. Test health endpoint
7. Clean up and repeat for next combination

OPTIONS:
    -h, --help     Show this help message

EXAMPLES:
    # Run all tests
    $0

PREREQUISITES:
    - Scafoldr API server running at http://localhost:8000
    - Docker and Docker Compose installed
    - Python 3 with requests package

EOF
}

# Function to check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check if Python is available
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is required but not installed"
        exit 1
    fi
    
    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        print_error "Docker is required but not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is required but not installed"
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        exit 1
    fi
    
    # Check if API server is running
    if ! curl -s http://localhost:8000/ &> /dev/null; then
        print_error "Scafoldr API server is not running at http://localhost:8000"
        print_error "Please start the server: cd core && python -m uvicorn src.api.main:app --reload"
        exit 1
    fi
    
    # Check if requests package is available
    if ! python3 -c "import requests" &> /dev/null; then
        print_warning "requests package not found, installing..."
        pip3 install requests
    fi
    
    print_success "All prerequisites are available"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_info "Starting Scafoldr Simple Integration Tests..."
    echo
    
    # Check prerequisites
    check_prerequisites
    echo
    
    # Get script directory
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Run the Python test script
    print_info "Running integration tests..."
    python3 "$SCRIPT_DIR/simple_integration_test.py"
    
    if [ $? -eq 0 ]; then
        echo
        print_success "All tests completed successfully!"
        print_info "Check reports in tests/reports/ directory"
    else
        echo
        print_error "Some tests failed. Check the logs above for details."
        exit 1
    fi
}

# Run main function
main "$@"