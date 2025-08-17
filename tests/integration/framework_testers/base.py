"""
Base classes for framework testing.
"""

import json
import requests
from abc import ABC, abstractmethod
from typing import List


class FrameworkTester(ABC):
    """Abstract base class for framework-specific testing logic."""
    
    @abstractmethod
    def get_health_endpoint(self) -> str:
        """Return the health check endpoint URL for this framework."""
        pass
    
    @abstractmethod
    def check_application_ready(self, response: requests.Response) -> bool:
        """Check if the application is ready based on the health endpoint response."""
        pass
    
    @abstractmethod
    def get_docker_wait_time(self) -> int:
        """Return the maximum wait time for Docker containers to be ready."""
        pass
    
    @abstractmethod
    def get_framework_name(self) -> str:
        """Return the human-readable name of this framework."""
        pass
    
    def get_project_name_prefix(self) -> str:
        """Return a prefix for project names (can be overridden)."""
        return self.get_framework_name().lower().replace(' ', '_')


class FrameworkTesterFactory:
    """Factory for creating framework testers."""
    
    _testers = {}
    
    @classmethod
    def register_tester(cls, framework_id: str, tester_class: type):
        """Register a framework tester class."""
        cls._testers[framework_id] = tester_class
    
    @classmethod
    def create_tester(cls, framework: str) -> FrameworkTester:
        """Create a framework tester for the given framework."""
        if framework not in cls._testers:
            raise ValueError(f"Unknown framework: {framework}. Available: {list(cls._testers.keys())}")
        return cls._testers[framework]()
    
    @classmethod
    def get_supported_frameworks(cls) -> List[str]:
        """Return list of supported framework identifiers."""
        return list(cls._testers.keys())