"""
Java Spring Boot framework tester.
"""

import json
import requests
from .base import FrameworkTester


class JavaSpringTester(FrameworkTester):
    """Framework tester for Java Spring Boot applications."""
    
    def get_health_endpoint(self) -> str:
        return 'http://localhost:8080/actuator/health'
    
    def check_application_ready(self, response: requests.Response) -> bool:
        if response.status_code == 200:
            try:
                health_data = response.json()
                return health_data.get('status') == 'UP'
            except (json.JSONDecodeError, KeyError):
                return False
        return False
    
    def get_docker_wait_time(self) -> int:
        return 300  # Spring Boot can be slow to start
    
    def get_framework_name(self) -> str:
        return 'Java Spring Boot'