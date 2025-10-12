"""
Senior Engineer Agent

This agent specializes in code implementation, project scaffolding, and technical solutions.
It generates complete application scaffolds from DBML schemas and provides technical advice.
"""

from typing import Optional, AsyncIterator
from strands import Agent
from strands.models import Model

from core.company.agents.base_agent import BaseCompanyAgent, AgentResponse
from core.storage.code_storage import CodeStorage
from core.company.tools.generator_tools import scaffold_project

# Define the system prompt for the Senior Engineer
ENGINEER_PROMPT = """
You are a Senior Software Engineer at Scafoldr Inc, specializing in code implementation,
technical solutions, and project scaffolding. Your expertise includes:

1. Writing clean, efficient, and maintainable code
2. Implementing technical solutions based on architectural designs
3. Scaffolding new projects from DBML schemas
4. Advising on technology choices and implementation strategies
5. Solving complex technical problems

Your primary responsibility is to use the scaffold_project tool to generate complete
application scaffolds from DBML schemas. When you receive a request containing DBML:

1. Project Creation
   - Identify the DBML schema in the request
   - Extract or ask for a suitable project name
   - Use the scaffold_project tool to generate the project
   - The scaffold_project tool requires two parameters:
     * project_name: A descriptive name for the project (use snake_case or kebab-case); if not provided, figure it out based on the DBML content
     * dbml_schema: The complete DBML schema

2. Technology Selection
   - The scaffold_project tool will automatically select the appropriate technology stack
   - Default is next-js-typescript, but can be customized if needed

3. Response Format
   - After successful scaffolding, provide a summary of what was generated
   - Include next steps for the user to work with their new project

For other technical requests, focus on practical implementation details, code examples,
and technical best practices. Provide specific, actionable advice that helps users
implement their software solutions effectively.
"""

class SeniorEngineer(BaseCompanyAgent):
    """
    Senior Engineer agent specializing in project scaffolding from DBML schemas,
    code implementation, and technical solutions.
    """
    
    def __init__(self, ai_provider: Model, project_id: str, conversation_id: str, selected_framework: str):
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
            project_id=project_id,
            conversation_id=conversation_id
        )

        # Initialize the Strands agent
        self.senior_engineer_agent = Agent(
            model=self.ai_provider,
            system_prompt=ENGINEER_PROMPT,
            # callback_handler=None,
            tools=[scaffold_project],
            state={"project_id": project_id, "conversation_id": conversation_id, "selected_framework": selected_framework}
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
            "primary_function": "Project scaffolding and technical solutions",
            "input_formats": ["DBML schemas", "technical questions", "implementation requests"],
            "output_formats": ["scaffolded projects", "code examples", "technical advice"],
            "streaming_supported": True,
            "conversation_support": True,
            "specialties": [
                "Generating complete application scaffolds from DBML",
                "Writing clean, efficient code",
                "Implementing technical solutions",
                "Technology selection advice",
                "Problem solving"
            ]
        }
    
    def get_agent(self) -> Agent:
        """
        Get the underlying Strands Agent instance.
        
        Returns:
            Strands Agent instance
        """
        return self.senior_engineer_agent