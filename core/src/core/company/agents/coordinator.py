"""
Project Coordinator Agent

This agent orchestrates specialized agents using the "Agents as Tools" pattern.
It analyzes user requests and routes them to the appropriate specialized agents.
"""

from typing import Dict, Any, Optional, List, AsyncIterator
from strands import Agent, tool
from strands.models import Model
from core.company.agents.base_agent import BaseCompanyAgent, AgentResponse
from core.company.agents.architect import SoftwareArchitect
from core.company.agents.engineer import SeniorEngineer
from core.company.agents.product_manager import ProductManager

# Define the system prompt for the Project Coordinator
COORDINATOR_PROMPT = """
You are the Project Coordinator at Scafoldr Inc, responsible for managing and routing
requests to the appropriate specialized agents. Your team includes:

1. Software Architect - Specializes in database design, system architecture, and DBML generation
2. Senior Engineer - Specializes in code implementation, technical solutions, and best practices
3. Product Manager - Specializes in requirements, user stories, and product features

Your role is to:
1. Analyze user requests to determine which specialist(s) should handle them
2. Route requests to the appropriate specialist(s)
3. Synthesize responses from specialists into cohesive answers
4. Ensure all user requirements are addressed comprehensively

When a user sends a request, determine which specialist is best suited to handle it
and use the appropriate tool to delegate the task. For complex requests that require
multiple specialists, coordinate their inputs to provide a comprehensive response.

Guidelines for routing:
- Database design, schema questions, and architecture → Software Architect
- Code implementation, technical solutions → Senior Engineer
- Requirements, user stories, product features → Product Manager
- For complex requests, consult multiple specialists as needed
"""

class ProjectCoordinator(BaseCompanyAgent):
    """
    Project Coordinator agent that orchestrates specialized agents.
    
    This agent analyzes user requests and routes them to the appropriate
    specialized agents using the "Agents as Tools" pattern.
    """
    
    def __init__(self, ai_provider: Model):
        """
        Initialize the Project Coordinator agent.
        
        Args:
            ai_provider: AI provider instance for making API calls
        """
        super().__init__(
            role="Project Coordinator",
            expertise=["request_routing", "team_coordination", "project_management"],
            ai_provider=ai_provider,
            system_prompt=COORDINATOR_PROMPT,
        )
        
        # Initialize specialized agents
        self.architect = SoftwareArchitect(ai_provider)
        self.engineer = SeniorEngineer(ai_provider)
        self.product_manager = ProductManager(ai_provider)
        
        # Initialize the Strands agent with specialized agents as tools
        self.coordinator_agent = Agent(
            model=self.ai_provider,
            system_prompt=COORDINATOR_PROMPT,
            tools=[
                self._architect_tool,
                self._engineer_tool,
                self._product_manager_tool
            ]
        )
    
    @tool
    async def _architect_tool(self, query: str) -> str:
        """
        Consult the Software Architect for database design and system architecture.
        
        Args:
            query: The user's question or request related to architecture
            
        Returns:
            The architect's response
        """
        response = await self.architect.process_request(query)
        return response.content
    
    @tool
    async def _engineer_tool(self, query: str) -> str:
        """
        Consult the Senior Engineer for code implementation and technical solutions.
        
        Args:
            query: The user's question or request related to implementation
            
        Returns:
            The engineer's response
        """
        response = await self.engineer.process_request(query)
        return response.content
    
    @tool
    async def _product_manager_tool(self, query: str) -> str:
        """
        Consult the Product Manager for requirements, user stories, and product features.
        
        Args:
            query: The user's question or request related to product management
            
        Returns:
            The product manager's response
        """
        response = await self.product_manager.process_request(query)
        return response.content
    
    async def process_request(self, user_request: str, conversation_id: Optional[str] = None) -> AgentResponse:
        """
        Process a user request by routing it to the appropriate specialized agent(s).
        
        Args:
            user_request: The user's request or question
            conversation_id: Optional conversation identifier for context
            
        Returns:
            AgentResponse with the coordinated response and metadata
        """
        try:
            # Use the coordinator agent to route the request
            response = self.coordinator_agent(user_request)
            
            # Determine response type based on content analysis
            response_type = "text"
            if "```dbml" in str(response):
                response_type = "dbml"
            elif "```" in str(response):
                response_type = "code"
            # elif "test case" in str(response).lower() or "test plan" in str(response).lower():
            #     response_type = "test_plan"
            elif "user story" in str(response).lower() or "acceptance criteria" in str(response).lower():
                response_type = "user_stories"
            
            # Return the coordinated response
            return AgentResponse(
                content=str(response),
                response_type=response_type,
                metadata={
                    "agent_role": self.role,
                    "conversation_id": conversation_id or "default",
                    "coordinator": True
                },
                confidence=0.95
            )
        except Exception as e:
            # Return error response
            return AgentResponse(
                content=f"I encountered an error while coordinating your request: {str(e)}",
                response_type="error",
                metadata={
                    "agent_role": self.role,
                    "error": str(e),
                    "conversation_id": conversation_id or "default"
                },
                confidence=0.0
            )
    
    async def stream_process_request(self, user_request: str, conversation_id: Optional[str] = None) -> AsyncIterator[str]:
        """
        Process a request with streaming response.
        
        Args:
            user_request: The user's request or question
            conversation_id: Optional conversation identifier for context
            
        Yields:
            Response chunks as they become available
        """
        try:
            # Use the Strands agent with streaming
            agent_stream = self.coordinator_agent.stream_async(user_request)
            async for chunk in agent_stream:
                yield str(chunk)
        except Exception as e:
            # Yield error message
            yield f"Error: {str(e)}"

    def get_capabilities(self) -> dict:
        """
        Get information about the agent's capabilities.
        
        Returns:
            Dictionary describing the agent's capabilities
        """
        return {
            "primary_function": "Request routing and team coordination",
            "input_formats": ["any user request"],
            "output_formats": ["coordinated responses from specialists"],
            "streaming_supported": True,
            "conversation_support": True,
            "specialties": [
                "Request analysis and routing",
                "Multi-agent coordination",
                "Comprehensive response synthesis",
                "Project management"
            ]
        }