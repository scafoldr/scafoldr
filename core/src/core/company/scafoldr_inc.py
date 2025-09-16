"""
Scafoldr Inc - AI Company Simulation System

Main orchestrator for the AI company that manages agents and routes requests.
This implementation uses Strands agents with the "Agents as Tools" pattern.
"""

from typing import Dict, Any, Optional, AsyncIterator

from strands.models import Model

from core.company.agents.coordinator import ProjectCoordinator
from core.company.agents.base_agent import BaseCompanyAgent
from core.storage.code_storage import CodeStorage


class ScafoldrInc:
    """
    Main company orchestrator that manages AI agents and routes user requests.
    
    This implementation uses a Project Coordinator as the main orchestrator,
    which routes requests to specialized agents using the "Agents as Tools" pattern.
    """

    def __init__(self, ai_provider: Model, code_storage: CodeStorage, project_id: str, conversation_id: str):
        """Initialize the company with AI provider and agents."""
        # Initialize the AI provider
        self.ai_provider = ai_provider

        self.coordinator = ProjectCoordinator(
            self.ai_provider,
            project_id=project_id,
            conversation_id=conversation_id,
            code_storage=code_storage
        )

        self.code_storage = code_storage

    
    async def process_request(self, user_request: str, conversation_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Process a user request and return a structured response.
        
        By default, all requests are routed through the Project Coordinator,
        which delegates to specialized agents as needed.
        
        Args:
            user_request: The user's request or question
            conversation_id: Optional conversation identifier for context
            
        Returns:
            Dictionary with response data compatible with existing API expectations
        """
        try:
            # Use the coordinator agent by default
            
            # Process the request
            response = await self.coordinator.process_request(user_request, conversation_id)
            
            # Return structured response compatible with existing API format
            return {
                "response": response.content,
                "response_type": response.response_type,
                "agent_info": {
                    "role": self.coordinator.role,
                    "expertise": self.coordinator.expertise,
                    "confidence": response.confidence
                },
                "metadata": response.metadata,
                "conversation_id": conversation_id or "default"
            }
            
        except Exception as e:
            # Return error response
            return {
                "response": f"I encountered an error while processing your request: {str(e)}",
                "response_type": "error",
                "agent_info": {
                    "role": "System",
                    "expertise": ["error_handling"],
                    "confidence": 0.0
                },
                "metadata": {
                    "error": str(e),
                    "conversation_id": conversation_id or "default"
                },
                "conversation_id": conversation_id or "default"
            }
    
    async def stream_process_request(self, user_request: str, conversation_id: Optional[str] = None) -> AsyncIterator[str]:
        """
        Process a request with streaming response for real-time feedback.
        
        Args:
            user_request: The user's request or question
            conversation_id: Optional conversation identifier for context
            
        Yields:
            Response chunks as they become available
        """
        try:
            
            # Check if agent supports streaming
            if hasattr(self.coordinator, 'stream_process_request'):
                async for chunk in self.coordinator.stream_process_request(user_request, conversation_id):
                    yield chunk
            else:
                # Fallback to non-streaming response
                response = await self.coordinator.process_request(user_request, conversation_id)
                yield response.content
                
        except Exception as e:
            yield f"Error: {str(e)}"
    
    def get_agent_by_expertise(self, expertise_area: str) -> Optional[BaseCompanyAgent]:
        """
        Find an agent that can handle a specific expertise area.
        
        Args:
            expertise_area: The area of expertise needed
            
        Returns:
            Agent that can handle the expertise area, or None if not found
        """
        for agent in self.agents.values():
            if agent.can_handle_request(expertise_area):
                return agent
        return None
    
    def get_company_info(self) -> Dict[str, Any]:
        """
        Get information about the company and its capabilities.
        
        Returns:
            Dictionary with company information
        """
        return {
            "company_name": "Scafoldr Inc",
            "description": "AI-powered software development company with specialized agents",
            "version": "2.0.0",
            "capabilities": [
                "Database schema design",
                "DBML generation",
                "System architecture consulting",
                "Code implementation",
                "Technical solutions",
                "Quality assurance",
                "Product management"
            ],
            "supported_features": {
                "streaming_responses": True,
                "conversation_history": True,
                "multiple_agents": True,
                "expertise_routing": True,
                "agent_collaboration": True
            }
        }