from strands import tool
from strands.models import Model
from strands.multiagent import GraphBuilder

from core.company.agents import SoftwareArchitect
from core.company.agents.engineer import SeniorEngineer
from core.company.agents.product_manager import ProductManager


class CreateNewProject:
    def __init__(self, ai_provider: Model, project_id: str = None, conversation_id: str = None):
        """
        Initialize the CreateNewProject SOP. This SOP coordinates the efforts of the Product Manager,
        Software Architect, and Senior Engineer to create a new project from scratch.
        
        Args:
            ai_provider: The AI model provider
            project_id: The project identifier
            conversation_id: The conversation identifier
        """

        product_manager = ProductManager(ai_provider, project_id=project_id, conversation_id=conversation_id)
        software_architect = SoftwareArchitect(ai_provider, project_id=project_id, conversation_id=conversation_id)
        engineer = SeniorEngineer(ai_provider, project_id=project_id, conversation_id=conversation_id)

        # Build the graph
        builder = GraphBuilder()

        # Add nodes
        builder.add_node(product_manager.get_agent(), "product_manager")
        builder.add_node(software_architect.get_agent(), "software_architect")
        builder.add_node(engineer.get_agent(), "engineer")

        # Add edges (dependencies)
        builder.add_edge("product_manager", "software_architect")
        builder.add_edge("software_architect", "engineer")

        builder.set_entry_point("product_manager")

        builder.set_execution_timeout(300)

        # Build the graph
        self.graph = builder.build()

        print("CreateNewProject SOP initialized with agents:")
        print(" - Product Manager")
        print(" - Software Architect")
        print(" - Senior Engineer")

    def execute(self, prompt: str):
        # Execute the graph on a task
        result = self.graph(prompt)
        return result
    
    async def execute_async(self, prompt: str):
        result = await self.graph.invoke_async(prompt)
        return result
    
    @tool
    def create_new_project_tool(self, user_request: str) -> str:
        """
        Tool method to execute the CreateNewProject SOP.
        
        Args:
            user_request: The user's request or question
            
        Returns:
            The result of the SOP execution
        """
        result = self.execute(user_request)
        return str(result)
    
