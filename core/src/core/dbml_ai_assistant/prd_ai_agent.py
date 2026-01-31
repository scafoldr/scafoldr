"""
Product Manager Agent

This agent specializes in requirements analysis, user stories, and product features.
It provides clarity on requirements, feature definitions, and business alignment.
"""

from typing import Optional, AsyncIterator
from strands import Agent
from strands.models import Model

from core.company.agents.base_agent import AgentResponse
from config.config import Config

config = Config()

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

class ProductManager:
    """
    Product Manager agent specializing in requirements, user stories, and product features.
    """
    
    def __init__(self):
        self.agent = Agent(
            model=config.ai_provider,
            system_prompt=PRODUCT_MANAGER_PROMPT,
            tools=[],
            state={'prd': ''}  # Initialize with empty PRD
        )
    
    async def process_prompt(self, prompt: str, conversation_id: Optional[str] = None) -> AgentResponse:
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
            response = self.agent(prompt)
            return {
                'message': str(response),
                'prd': self.agent.state.get('prd')
            }
            
        except Exception as e:
            # Return error response
            return {
                'message': f"I encountered an error while processing your request: {str(e)}",
                'prd': self.agent.state.get('prd')
            }

    async def stream_process_prompt(self, prompt: str, conversation_id: Optional[str] = None) -> AsyncIterator[str]:
        """
        Process a request with streaming response.
        
        Args:
            user_request: The user's request or question
            conversation_id: Optional conversation identifier for context
            
        Yields:
            Response chunks as they become available
        """
        try:
            async for event in self.agent.stream_async(prompt):                
                if "data" in event:
                    # Get the data from the event
                    data = event["data"]                    
                    # Ensure we yield a string, not a dictionary
                    if isinstance(data, str) and data.strip():
                        yield data
                    elif data:  # Handle non-string data
                        yield str(data)

            # Send final metadata as a separate chunk if needed
            prd = self.agent.state.get('prd')
            if prd:
                print("DEBUG: Sending PRD update notification")
                yield f"\n\n[PRD Updated]"

        except Exception as e:
            # Yield error message
            print(f"DEBUG: Stream error: {str(e)}")
            yield f"Error: {str(e)}"
