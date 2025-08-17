#!/usr/bin/env python3
"""
Simple integration test for Scafoldr templates.
Tests: DBML input → API generation → Docker compose up → Health check

This is the main entry point that uses the organized integration testing framework.
"""

import sys
import requests
from integration import IntegrationTestOrchestrator


def main():
    """Main entry point."""
    # Check if API is available
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        print("✅ API server is running")
    except requests.exceptions.RequestException:
        print("❌ API server is not running at http://localhost:8000")
        print("   Please start the server first!")
        return 1
    
    # Run tests using the orchestrator
    orchestrator = IntegrationTestOrchestrator()
    results = orchestrator.run_all_tests()
    
    # Exit with appropriate code
    failed_tests = [r for r in results if not r['success']]
    if failed_tests:
        print(f"\n❌ {len(failed_tests)} tests failed!")
        return 1
    else:
        print(f"\n✅ All {len(results)} tests passed!")
        return 0


if __name__ == "__main__":
    sys.exit(main())