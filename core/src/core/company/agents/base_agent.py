"""
Base Agent Architecture for Scafoldr Inc

This module defines the base classes and models for company agents.
All specialized agents inherit from BaseCompanyAgent.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel


class AgentResponse(BaseModel):
    """
    Standardized response format for all company agents.
    
    Attributes:
        content: The main response content from the agent
        response_type: Type of response (e.g., "question", "dbml", "code", "advice")
        metadata: Additional information about the response
        confidence: Agent's confidence in the response (0.0-1.0)
    """
    content: str
    response_type: str
    metadata: Dict[str, Any] = {}
    confidence: float = 1.0


class BaseCompanyAgent(ABC):
    """
    Abstract base class for all Scafoldr Inc agents.
    
    Each agent has a specific role and expertise areas, and uses an AI provider
    to process requests and generate responses.
    """
    
    def __init__(self, role: str, expertise: List[str], ai_provider):
        """
        Initialize the agent with role, expertise, and AI provider.
        
        Args:
            role: The agent's role (e.g., "Software Architect", "QA Engineer")
            expertise: List of expertise areas (e.g., ["database_design", "dbml"])
            ai_provider: AI provider instance for making API calls
        """
        self.role = role
        self.expertise = expertise
        self.ai_provider = ai_provider
    
    @abstractmethod
    async def process_request(self, user_request: str, conversation_id: Optional[str] = None) -> AgentResponse:
        """
        Process a user request and return an agent response.
        
        Args:
            user_request: The user's request or question
            conversation_id: Optional conversation identifier for context
            
        Returns:
            AgentResponse with the agent's response and metadata
        """
        pass
    
    @abstractmethod
    def get_system_prompt(self) -> str:
        """
        Get the system prompt that defines this agent's behavior and expertise.
        
        Returns:
            System prompt string for the AI provider
        """
        pass
    
    def can_handle_request(self, request_type: str) -> bool:
        """
        Check if this agent can handle a specific type of request.
        
        Args:
            request_type: Type of request to check
            
        Returns:
            True if the agent can handle this request type
        """
        return request_type in self.expertise
    
    def get_agent_info(self) -> Dict[str, Any]:
        """
        Get information about this agent.
        
        Returns:
            Dictionary with agent role, expertise, and capabilities
        """
        return {
            "role": self.role,
            "expertise": self.expertise,
            "description": f"I'm a {self.role} specialized in {', '.join(self.expertise)}"
        }