"""
Software Architect Agent

This agent specializes in database design and system architecture,
providing expertise in DBML generation and architectural design.
"""

from typing import Optional, AsyncIterator
from strands import Agent
from strands.models import Model

from core.company.agents.base_agent import BaseCompanyAgent, AgentResponse
from core.company.tools.generator_tools import scaffold_project

ARCHITECT_PROMPT = """
You are a Software Architect at Scafoldr Inc, specializing in database design, system architecture, and DBML generation. You are part of a multi-agent system where you collaborate with other specialized agents like Senior Engineers, Product Managers, and QA Engineers.

Your primary responsibilities include:
1. Translating high-level business goals into complete DBML schemas using Clean Architecture principles
2. Providing architectural guidance and best practices
3. Supporting the scaffold_project tool to generate complete application scaffolds

When handling DBML schema generation:

1. Clarification
   - If the user's business goal is ambiguous or lacks critical details, ask exactly one targeted question at a time (e.g. "Should we track order status history?") and wait for their reply before proceeding.
   - Do not generate any DBML until you have enough clarity.

2. Autonomous Modeling
   - Based solely on the business goal, decide on appropriate tables, columns (with types), relationships, constraints, indexes, default values, nullability, and naming.
   - You choose all table and column names—there is no need for the user to specify them.

3. Output Format
   - When you're fully confident you have all requirements, output the valid DBML schema.
   - When the user specifically requests just the DBML schema, provide only the DBML code without any additional text.
   - When providing architectural guidance or responding to questions, include explanations and context.

4. Conventions
   - Use **snake_case** for all names, and plural table names (e.g. `users`).
   - Define primary keys as `id integer [pk, increment]`.
   - Use `Ref: table_a.column_a > table_b.column_b` for foreign keys.
   - Annotate `not null` and `[unique]` blocks where appropriate.

5. Integration with Scaffold Generation
   - You have access to the scaffold_project tool that can generate a complete application from a DBML schema.
   - When users want to generate a project, guide them through providing the necessary information:
     - Project name
     - Backend option (nodejs-express-js, java-spring, next-js-typescript)
     - DBML schema
     - Any additional configuration parameters

Remember that you are part of a collaborative system. For implementation details, defer to the Senior Engineer. For product requirements and user stories, defer to the Product Manager. Focus on your architectural expertise while acknowledging the broader multi-agent context.
"""

class SoftwareArchitect(BaseCompanyAgent):
    """
    Software Architect agent specializing in database design and DBML generation.
    """
    
    def __init__(self, ai_provider: Model):
        """
        Initialize the Software Architect agent.
        
        Args:
            ai_provider: AI provider instance for making API calls
        """
        super().__init__(
            role="Software Architect",
            expertise=["database_design", "dbml", "system_architecture"],
            ai_provider=ai_provider,
            system_prompt=ARCHITECT_PROMPT,
        )

        # Initialize the Strands agent
        self.architect_agent = Agent(
            model=self.ai_provider,
            system_prompt=ARCHITECT_PROMPT,
            tools=[scaffold_project],
            callback_handler=None
        )
    
    async def process_request(self, user_request: str, conversation_id: Optional[str] = None) -> AgentResponse:
        """
        Process a user request for database design and architecture.
        
        Args:
            user_request: The user's request or question
            conversation_id: Optional conversation identifier for context
            
        Returns:
            AgentResponse with the agent's response and metadata
        """
        try:
            # Call the Strands agent
            response = self.architect_agent(user_request)
            
            # Determine response type based on content analysis
            response_type = "text"
            if "```dbml" in str(response):
                response_type = "dbml"
            elif "```" in str(response):
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
                confidence=0.95
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
            agent_stream = self.architect_agent.stream_async(user_request)
            async for chunk in agent_stream:
                yield str(chunk)
        except Exception as e:
            # Yield error message
            yield f"Error: {str(e)}"
    
    def get_system_prompt(self) -> str:
        """
        Get the system prompt for the Software Architect agent.
        
        Returns:
            The existing DBML prompt template
        """
        return ARCHITECT_PROMPT
    
    def get_capabilities(self) -> dict:
        """
        Get information about the agent's capabilities.
        
        Returns:
            Dictionary describing the agent's capabilities
        """
        return {
            "primary_function": "Database schema design and system architecture",
            "input_formats": ["natural language business requirements"],
            "output_formats": ["DBML schema", "architectural questions"],
            "streaming_supported": True,
            "conversation_support": True,
            "specialties": [
                "Converting business requirements to database schemas",
                "DBML generation following Clean Architecture principles",
                "Database relationship modeling",
                "Schema optimization and best practices"
            ]
        }