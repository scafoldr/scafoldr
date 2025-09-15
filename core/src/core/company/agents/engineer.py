"""
Senior Engineer Agent

This agent specializes in code implementation, technical solutions, and best practices.
It provides practical implementation details, code examples, and technical advice.
"""

from typing import Optional, AsyncIterator
from strands import Agent
from strands.models import Model

from core.company.agents.base_agent import BaseCompanyAgent, AgentResponse

# Define the system prompt for the Senior Engineer
ENGINEER_PROMPT = """
You are a Senior Software Engineer at Scafoldr Inc, specializing in code implementation, 
technical solutions, and best practices. Your expertise includes:

1. Writing clean, efficient, and maintainable code
2. Implementing technical solutions based on architectural designs
3. Advising on technology choices and implementation strategies
4. Reviewing code and suggesting improvements
5. Solving complex technical problems

When responding to requests, focus on practical implementation details, code examples,
and technical best practices. Provide specific, actionable advice that helps users
implement their software solutions effectively.
"""

class SeniorEngineer(BaseCompanyAgent):
    """
    Senior Engineer agent specializing in code implementation and technical solutions.
    """
    
    def __init__(self, ai_provider: Model):
        """
        Initialize the Senior Engineer agent.
        
        Args:
            ai_provider: AI provider instance for making API calls
        """
        super().__init__(
            role="Senior Engineer",
            expertise=["code_implementation", "technical_solutions", "best_practices"],
            ai_provider=ai_provider,
            system_prompt=ENGINEER_PROMPT,
        )

        # Initialize the Strands agent
        self.senior_engineer_agent = Agent(
            model=self.ai_provider,
            system_prompt=ENGINEER_PROMPT,
            callback_handler=None
        )
    
    async def process_request(self, user_request: str, conversation_id: Optional[str] = None) -> AgentResponse:
        """
        Process a user request for engineering expertise.
        
        Args:
            user_request: The user's request or question
            conversation_id: Optional conversation identifier for context
            
        Returns:
            AgentResponse with the agent's response and metadata
        """
        try:
            # Call the Strands agent
            response = self.senior_engineer_agent(user_request)
            
            # Determine response type based on content analysis
            response_type = "advice"
            if "```" in str(response):
                response_type = "code"
            
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
            agent_stream = self.senior_engineer_agent.stream_async(user_request)
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
            "primary_function": "Code implementation and technical solutions",
            "input_formats": ["technical questions", "implementation requests"],
            "output_formats": ["code examples", "technical advice"],
            "streaming_supported": True,
            "conversation_support": True,
            "specialties": [
                "Writing clean, efficient code",
                "Implementing technical solutions",
                "Technology selection advice",
                "Code review and improvement",
                "Problem solving"
            ]
        }