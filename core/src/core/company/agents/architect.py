"""
Software Architect Agent

This agent specializes in database design and system architecture,
providing the same functionality as the existing DBML chat system
but wrapped in the new agent architecture.
"""

from typing import Optional
from core.company.agents.base_agent import BaseCompanyAgent, AgentResponse
from core.chat.chats.dbml_chat.main import DBMLChat
from core.chat.chats.dbml_chat.prompt import PROMPT_TEMPLATE


class SoftwareArchitect(BaseCompanyAgent):
    """
    Software Architect agent specializing in database design and DBML generation.
    
    This agent wraps the existing DBMLChat functionality to maintain 100%
    backward compatibility while providing the new agent interface.
    """
    
    def __init__(self, ai_provider):
        """
        Initialize the Software Architect agent.
        
        Args:
            ai_provider: AI provider instance for making API calls
        """
        super().__init__(
            role="Software Architect",
            expertise=["database_design", "dbml", "system_architecture"],
            ai_provider=ai_provider
        )
        # Initialize the existing DBML chat system
        self.dbml_chat = DBMLChat()
    
    async def process_request(self, user_request: str, conversation_id: Optional[str] = None) -> AgentResponse:
        """
        Process a user request for database design and architecture.
        
        This method wraps the existing DBMLChat functionality to maintain
        identical behavior while providing the new AgentResponse format.
        
        Args:
            user_request: The user's request or question
            conversation_id: Optional conversation identifier for context
            
        Returns:
            AgentResponse with the agent's response and metadata
        """
        # Use a default conversation ID if none provided
        if conversation_id is None:
            conversation_id = "default"
        
        try:
            # Use the existing DBML chat system
            chat_response = self.dbml_chat.talk(user_request, conversation_id)
            
            # Convert the existing response to our new format
            return AgentResponse(
                content=chat_response.response,
                response_type=chat_response.response_type,
                metadata={
                    "agent_role": self.role,
                    "conversation_id": conversation_id,
                    "expertise_used": ["database_design", "dbml"],
                    "original_response_format": "DBMLChatResponse"
                },
                confidence=0.95  # High confidence as this is the existing proven system
            )
        except Exception as e:
            # Return error response in case of any issues
            return AgentResponse(
                content=f"I encountered an error while processing your request: {str(e)}",
                response_type="error",
                metadata={
                    "agent_role": self.role,
                    "error": str(e),
                    "conversation_id": conversation_id
                },
                confidence=0.0
            )
    
    def get_system_prompt(self) -> str:
        """
        Get the system prompt for the Software Architect agent.
        
        Returns:
            The existing DBML prompt template
        """
        return PROMPT_TEMPLATE
    
    async def stream_process_request(self, user_request: str, conversation_id: Optional[str] = None):
        """
        Process a request with streaming response for real-time feedback.
        
        This method wraps the existing streaming DBML chat functionality.
        
        Args:
            user_request: The user's request or question
            conversation_id: Optional conversation identifier for context
            
        Yields:
            Response chunks as they become available
        """
        # Use a default conversation ID if none provided
        if conversation_id is None:
            conversation_id = "default"
        
        try:
            # Use the existing streaming DBML chat system
            for chunk in self.dbml_chat.stream_talk(user_request, conversation_id):
                yield chunk
        except Exception as e:
            # Yield error message in case of any issues
            yield f"Error: {str(e)}"
    
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