"""
Product Manager Agent

This agent specializes in requirements analysis, user stories, and product features.
It provides clarity on requirements, feature definitions, and business alignment.
"""

from typing import Optional, AsyncIterator
from strands import Agent
from strands.models import Model

from core.company.agents.base_agent import BaseCompanyAgent, AgentResponse

# Define the system prompt for the Product Manager
PRODUCT_MANAGER_PROMPT = """
You are a Product Manager at Scafoldr Inc, specializing in requirements analysis, 
user stories, and product features. Your expertise includes:

1. Translating business needs into clear technical requirements
2. Creating user stories and acceptance criteria
3. Prioritizing features based on business value
4. Ensuring product alignment with user needs
5. Facilitating communication between business stakeholders and technical teams

When responding to requests, focus on clarifying requirements, defining features, 
and ensuring alignment with business goals. Provide specific, actionable advice 
that helps users define and prioritize their product features effectively.
"""

class ProductManager(BaseCompanyAgent):
    """
    Product Manager agent specializing in requirements, user stories, and product features.
    """
    
    def __init__(self, ai_provider: Model, project_id: str, conversation_id: str):
        """
        Initialize the Product Manager agent.
        
        Args:
            ai_provider: AI provider instance for making API calls
        """
        super().__init__(
            role="Product Manager",
            expertise=["requirements", "user_stories", "product_features"],
            ai_provider=ai_provider,
            system_prompt=PRODUCT_MANAGER_PROMPT,
            project_id=project_id,
            conversation_id=conversation_id
        )

        # Initialize the Strands agent
        self.product_manager_agent = Agent(
            model=self.ai_provider,
            system_prompt=PRODUCT_MANAGER_PROMPT,
            # callback_handler=None,
            state={"project_id": project_id, "conversation_id": conversation_id}
        )
    
    async def process_request(self, user_request: str, conversation_id: Optional[str] = None) -> AgentResponse:
        """
        Process a user request for product management expertise.
        
        Args:
            user_request: The user's request or question
            conversation_id: Optional conversation identifier for context
            
        Returns:
            AgentResponse with the agent's response and metadata
        """
        try:
            # Call the Strands agent
            response = self.product_manager_agent(user_request)
            
            # Determine response type based on content analysis
            response_type = "product_advice"
            if "user story" in str(response).lower() or "acceptance criteria" in str(response).lower():
                response_type = "user_stories"
            elif "requirement" in str(response).lower():
                response_type = "requirements"
            
            # Return the response
            return AgentResponse(
                content=str(response),
                response_type=response_type,
                metadata={
                    "agent_role": self.role,
                    "conversation_id": conversation_id or "default",
                    "expertise_used": self.expertise
                },
                confidence=0.9
            )
        except Exception as e:
            # Return error response
            return AgentResponse(
                content=f"I encountered an error while processing your request: {str(e)}",
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
            agent_stream = self.product_manager_agent.stream_async(user_request)
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
            "primary_function": "Requirements analysis and product management",
            "input_formats": ["business needs", "feature requests"],
            "output_formats": ["user stories", "requirements", "product advice"],
            "streaming_supported": True,
            "conversation_support": True,
            "specialties": [
                "Requirements analysis",
                "User story creation",
                "Feature prioritization",
                "User needs alignment",
                "Stakeholder communication"
            ]
        }
    
    def get_agent(self) -> Agent:
        """
        Get the underlying Strands Agent instance.
        
        Returns:
            Strands Agent instance
        """
        return self.product_manager_agent