"""
Project Coordinator Agent

This agent orchestrates standard operating procedures (SOPs) to address user requests.
It analyzes user requests and selects the appropriate SOP to execute.
"""

from typing import Dict, Any, Optional, List, AsyncIterator
from strands import Agent, tool
from strands.models import Model
from core.company.agents.base_agent import BaseCompanyAgent, AgentResponse
from core.company.agents.architect import SoftwareArchitect
from core.company.agents.engineer import SeniorEngineer
from core.company.agents.product_manager import ProductManager
from core.storage.code_storage import CodeStorage
from core.company.standard_operating_procedures.create_new_project import CreateNewProject

# Define the system prompt for the Project Coordinator
COORDINATOR_PROMPT = """
You are the Project Coordinator at Scafoldr Inc, responsible for managing and executing
standard operating procedures (SOPs) to address user requests. SOPs are predefined workflows
that combine multiple specialized agents to accomplish specific tasks.

Your role is to:
1. Analyze user requests to determine which SOP is most appropriate
2. Execute the selected SOP to address the user's needs
3. Ensure all user requirements are addressed comprehensively
4. Provide clear, cohesive responses based on the SOP results

Currently available SOPs:
1. Create New Project - Coordinates Product Manager, Software Architect, and Senior Engineer
   to create a new project from scratch, including requirements, architecture, and implementation

When a user sends a request, determine which SOP is best suited to handle it and use the
appropriate tool to execute that procedure. Each SOP is a carefully designed workflow that
ensures all aspects of the request are handled properly.

As more SOPs are added in the future, you will have more options to address different types
of requests. For now, focus on identifying when the Create New Project SOP is appropriate.

Guidelines for SOP selection:
- New project creation, application generation → Create New Project SOP
- For requests that don't match any available SOP, explain that the capability is under development
  and suggest how the request might be reformulated to use existing SOPs
"""

class ProjectCoordinator(BaseCompanyAgent):
    """
    Project Coordinator agent that orchestrates standard operating procedures (SOPs).
    
    This agent analyzes user requests and selects the appropriate SOP to execute.
    SOPs are predefined workflows that combine multiple specialized agents to
    accomplish specific tasks.
    """
    
    def __init__(self, ai_provider: Model, project_id: str, conversation_id: str):
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
            project_id=project_id,
            conversation_id=conversation_id
        )

        # Initialize SOPs
        self.create_new_project = CreateNewProject(ai_provider, project_id=project_id, conversation_id=conversation_id)
        
        # Store available SOPs in a dictionary for easy access
        self.available_sops = {
            "create_new_project": self.create_new_project.create_new_project_tool
        }

        # Initialize the Strands agent with SOPs as tools
        self.coordinator_agent = Agent(
            model=self.ai_provider,
            system_prompt=COORDINATOR_PROMPT,
            tools=[
                self.create_new_project.create_new_project_tool
            ],
            state={"project_id": project_id, "conversation_id": conversation_id}
        )
    
    # SOP tool methods are now handled by the SOP classes themselves
    
    async def process_request(self, user_request: str, conversation_id: Optional[str] = None) -> AgentResponse:
        """
        Process a user request by selecting and executing the appropriate SOP.
        
        Args:
            user_request: The user's request or question
            conversation_id: Optional conversation identifier for context
            
        Returns:
            AgentResponse with the result from SOP execution
        """
        try:
            # Use the coordinator agent to select and execute the appropriate SOP
            response = self.coordinator_agent(user_request)
            
            # Determine response type based on content analysis
            response_type = "text"
            if "```dbml" in str(response):
                response_type = "dbml"
            elif "```" in str(response):
                response_type = "code"
            elif "user story" in str(response).lower() or "acceptance criteria" in str(response).lower():
                response_type = "user_stories"
            
            # Identify which SOP was used (if any)
            used_sop = "none"
            for sop_name in self.available_sops.keys():
                if sop_name.lower() in str(response).lower():
                    used_sop = sop_name
                    break
            
            # Return the response from SOP execution
            return AgentResponse(
                content=str(response),
                response_type=response_type,
                metadata={
                    "agent_role": self.role,
                    "conversation_id": conversation_id or "default",
                    "coordinator": True,
                    "used_sop": used_sop
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
        Process a request with streaming response using SOPs.
        
        Args:
            user_request: The user's request or question
            conversation_id: Optional conversation identifier for context
            
        Yields:
            Response chunks as they become available from SOP execution
        """
        try:
            # Use the Strands agent with streaming to execute the appropriate SOP
            agent_stream = self.coordinator_agent.stream_async(user_request)
            
            # Track which SOP is being used (for logging/debugging)
            current_sop = "determining..."
            
            # Stream the response chunks
            async for chunk in agent_stream:
                if "data" in chunk:
                    chunk_text = chunk["data"]
                    
                    # Try to identify which SOP is being used from the early chunks
                    if current_sop == "determining...":
                        for sop_name in self.available_sops.keys():
                            if sop_name.lower() in chunk_text.lower():
                                current_sop = sop_name
                                break
                    
                    # Only stream text chunks to the client
                    yield chunk_text

        except Exception as e:
            # Yield error message
            yield f"Error executing SOP: {str(e)}"

    def get_capabilities(self) -> dict:
        """
        Get information about the agent's capabilities.
        
        Returns:
            Dictionary describing the agent's capabilities
        """
        return {
            "primary_function": "SOP execution and coordination",
            "input_formats": ["any user request"],
            "output_formats": ["coordinated responses from SOP execution"],
            "streaming_supported": True,
            "conversation_support": True,
            "available_sops": list(self.available_sops.keys()),
            "specialties": [
                "SOP selection and execution",
                "Multi-agent workflow coordination",
                "Comprehensive response synthesis",
                "Project management"
            ]
        }
    
    def get_agent(self) -> Agent:
        """
        Get the underlying Strands Agent instance.
        
        Returns:
            Strands Agent instance
        """
        return self.coordinator_agent