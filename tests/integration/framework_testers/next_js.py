"""
Next.js TypeScript framework tester.
"""

import requests
from .base import FrameworkTester


class NextJsTester(FrameworkTester):
    """Framework tester for Next.js TypeScript applications."""
    
    def get_health_endpoint(self) -> str:
        return 'http://localhost:3000/'
    
    def check_application_ready(self, response: requests.Response) -> bool:
        return response.status_code == 200
    
    def get_docker_wait_time(self) -> int:
        return 180  # Next.js build and start time
    
    def get_framework_name(self) -> str:
        return 'Next.js TypeScript'