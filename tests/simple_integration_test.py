#!/usr/bin/env python3
"""
Simple integration test for Scafoldr templates.
Tests: DBML input → API generation → Docker compose up → Health check

This is the main entry point that uses the organized integration testing framework.
"""

import sys
import argparse
import requests
from integration import IntegrationTestOrchestrator, FrameworkTesterFactory, set_color_mode


def create_argument_parser():
    """Create and configure argument parser."""
    parser = argparse.ArgumentParser(
        description="Run integration tests for Scafoldr templates",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                           # Run all tests
  %(prog)s --framework java_spring   # Test only Java Spring Boot
  %(prog)s --framework node_express_js --framework next-js-typescript  # Test specific frameworks
  %(prog)s --dbml example.dbml       # Test only with example.dbml
  %(prog)s --no-color                # Disable colored output
  %(prog)s --list-frameworks         # List available frameworks

Available frameworks:
  """ + "\n  ".join(f"- {fw}" for fw in FrameworkTesterFactory.get_supported_frameworks())
    )
    
    parser.add_argument(
        '--framework', '-f',
        action='append',
        dest='frameworks',
        help='Framework to test (can be specified multiple times). Use --list-frameworks to see available options.'
    )
    
    parser.add_argument(
        '--dbml', '-d',
        action='append',
        dest='dbml_files',
        help='DBML file to test (can be specified multiple times). Files should be in tests/input/ directory.'
    )
    
    parser.add_argument(
        '--api-url',
        default='http://localhost:8000',
        help='Base URL for Scafoldr API (default: http://localhost:8000)'
    )
    
    parser.add_argument(
        '--no-color',
        action='store_true',
        help='Disable colored output'
    )
    
    parser.add_argument(
        '--list-frameworks',
        action='store_true',
        help='List available frameworks and exit'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose output'
    )
    
    return parser


def validate_arguments(args):
    """Validate command line arguments."""
    errors = []
    
    # Validate frameworks
    if args.frameworks:
        available_frameworks = FrameworkTesterFactory.get_supported_frameworks()
        for framework in args.frameworks:
            if framework not in available_frameworks:
                errors.append(f"Unknown framework: {framework}")
                errors.append(f"Available frameworks: {', '.join(available_frameworks)}")
    
    # Validate DBML files (basic check - files exist check will be done later)
    if args.dbml_files:
        for dbml_file in args.dbml_files:
            if not dbml_file.endswith('.dbml'):
                errors.append(f"DBML file must have .dbml extension: {dbml_file}")
    
    return errors


def main():
    """Main entry point."""
    parser = create_argument_parser()
    args = parser.parse_args()
    
    # Handle special cases
    if args.list_frameworks:
        frameworks = FrameworkTesterFactory.get_supported_frameworks()
        print("Available frameworks:")
        for framework in frameworks:
            try:
                tester = FrameworkTesterFactory.create_tester(framework)
                print(f"  {framework:20} - {tester.get_framework_name()}")
            except Exception:
                print(f"  {framework:20} - (error loading)")
        return 0
    
    # Configure output
    if args.no_color:
        set_color_mode(False)
    
    # Validate arguments
    validation_errors = validate_arguments(args)
    if validation_errors:
        print("❌ Validation errors:")
        for error in validation_errors:
            print(f"   {error}")
        return 1
    
    # Check if API is available
    try:
        response = requests.get(f"{args.api_url}/", timeout=5)
        print("✅ API server is running")
    except requests.exceptions.RequestException:
        print(f"❌ API server is not running at {args.api_url}")
        print("   Please start the server first!")
        return 1
    
    # Create orchestrator with custom configuration
    orchestrator = IntegrationTestOrchestrator(api_base_url=args.api_url)
    
    # Override frameworks if specified
    if args.frameworks:
        orchestrator.templates = args.frameworks
        print(f"📋 Testing frameworks: {', '.join(args.frameworks)}")
    
    # Override DBML files if specified
    if args.dbml_files:
        orchestrator.dbml_files = args.dbml_files
        print(f"📋 Testing DBML files: {', '.join(args.dbml_files)}")
    
    # Run tests using the orchestrator
    results = orchestrator.run_all_tests()
    
    # Exit with appropriate code
    failed_tests = [r for r in results if not r['success']]
    if failed_tests:
        return 1
    else:
        return 0


if __name__ == "__main__":
    sys.exit(main())