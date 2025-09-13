"""
Scafoldr Inc - AI Company Simulation System

Main orchestrator for the AI company that manages agents and routes requests.
This implementation focuses on maintaining backward compatibility while
establishing the foundation for a full agent-based architecture.
"""

from typing import Dict, Any, Optional, List, Iterator

from strands.models import Model

from core.company.agents.architect import SoftwareArchitect
from core.company.agents.base_agent import BaseCompanyAgent


class ScafoldrInc:
    """
    Main company orchestrator that manages AI agents and routes user requests.
    
    In Phase 1, all requests are routed to the Software Architect agent
    to maintain 100% backward compatibility with existing DBML chat functionality.
    """
    
    def __init__(self, ai_provider: Model):
        """Initialize the company with AI provider and agents."""
        # Initialize the AI provider
        self.ai_provider = ai_provider
        
        # Initialize agents
        self.agents: Dict[str, BaseCompanyAgent] = {}
        self._initialize_agents()
        
        # For Phase 1, default to architect agent for all requests
        self.default_agent = "architect"
    
    def _initialize_agents(self):
        """Initialize all company agents."""
        # Create Software Architect agent
        self.agents["architect"] = SoftwareArchitect(self.ai_provider)
    
    async def process_request(self, user_request: str, conversation_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Process a user request and return a structured response.
        
        For Phase 1, all requests are routed to the Software Architect agent
        to maintain backward compatibility with existing DBML chat functionality.
        
        Args:
            user_request: The user's request or question
            conversation_id: Optional conversation identifier for context
            
        Returns:
            Dictionary with response data compatible with existing API expectations
        """
        try:
            # For Phase 1, always use the architect agent
            agent = self.agents[self.default_agent]
            
            # Process the request
            response = await agent.process_request(user_request, conversation_id)
            
            # Return structured response compatible with existing API format
            return {
                "response": response.content,
                "response_type": response.response_type,
                "agent_info": {
                    "role": agent.role,
                    "expertise": agent.expertise,
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
    
    async def stream_process_request(self, user_request: str, conversation_id: Optional[str] = None) -> Iterator[str]:
        """
        Process a request with streaming response for real-time feedback.
        
        Args:
            user_request: The user's request or question
            conversation_id: Optional conversation identifier for context
            
        Yields:
            Response chunks as they become available
        """
        try:
            # For Phase 1, always use the architect agent
            agent = self.agents[self.default_agent]
            
            # Check if agent supports streaming
            if hasattr(agent, 'stream_process_request'):
                async for chunk in agent.stream_process_request(user_request, conversation_id):
                    yield chunk
            else:
                # Fallback to non-streaming response
                response = await agent.process_request(user_request, conversation_id)
                yield response.content
                
        except Exception as e:
            yield f"Error: {str(e)}"
    
    def get_available_agents(self) -> Dict[str, Dict[str, Any]]:
        """
        Get information about all available agents.
        
        Returns:
            Dictionary with agent information
        """
        return {
            agent_id: agent.get_agent_info() 
            for agent_id, agent in self.agents.items()
        }
    
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
            "description": "AI-powered software development company specializing in backend code generation",
            "version": "1.0.0",
            "agents": self.get_available_agents(),
            "capabilities": [
                "Database schema design",
                "DBML generation",
                "System architecture consulting"
            ],
            "supported_features": {
                "streaming_responses": True,
                "conversation_history": True,
                "multiple_agents": True,
                "expertise_routing": True
            }
        }