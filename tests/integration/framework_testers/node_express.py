"""
Node.js Express framework tester.
"""

import requests
from .base import FrameworkTester


class NodeExpressTester(FrameworkTester):
    """Framework tester for Node.js Express applications."""
    
    def get_health_endpoint(self) -> str:
        return 'http://localhost:3000/health'
    
    def check_application_ready(self, response: requests.Response) -> bool:
        return response.status_code == 200
    
    def get_docker_wait_time(self) -> int:
        return 120  # Node.js typically starts faster
    
    def get_framework_name(self) -> str:
        return 'Node.js Express'