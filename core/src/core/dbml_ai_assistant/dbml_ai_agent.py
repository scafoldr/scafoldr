from typing import Optional, AsyncIterator

from strands import Agent, tool
from pydbml import PyDBML

from core.scafoldr_schema.dbml_scafoldr_schema_maker import DbmlScafoldrSchemaMaker
from config.config import Config
from core.dbml_ai_assistant.prompt import DBML_AI_AGENT_PROMPT

config = Config()


class DbmlAiAgent:
    def __init__(self):
        self.agent = Agent(
            model=config.ai_provider,
            system_prompt=DBML_AI_AGENT_PROMPT,
            tools=[self.validate_and_save_dbml],
            state={'dbml_schema': ''}  # Initialize with empty DBML schema
        )

    async def process_prompt(self, prompt: str, conversation_id: Optional[str] = None) -> dict:
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
            response = self.agent(prompt)
            return {
                'message': str(response),
                'dbml_schema': self.agent.state.get('dbml_schema')
            }
            
        except Exception as e:
            # Return error response
            return {
                'message': f"I encountered an error while processing your request: {str(e)}",
                'dbml_schema': self.agent.state.get('dbml_schema')
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
            dbml_schema = self.agent.state.get('dbml_schema')
            if dbml_schema:
                print("DEBUG: Sending DBML schema update notification")
                yield f"\n\n[DBML Schema Updated]"
                

        except Exception as e:
            # Yield error message
            print(f"DEBUG: Stream error: {str(e)}")
            yield f"Error: {str(e)}"

   
    @tool
    async def validate_and_save_dbml(agent: Agent, dbml_schema: str) -> str:
        """Validates and saves the provided DBML schema string.
        
        This function checks the syntax and structure of the DBML schema to ensure it adheres
        to the DBML specification. It returns True if the schema is valid, otherwise False.
        
        Args:
            agent: The agent instance calling this tool
            dbml: A string containing the DBML schema to validate
        Returns:
            A string indicating whether the DBML is valid or an error message if invalid
        """
        try:
            PyDBML(dbml_schema)
            # Simple validation could be checking for required keywords
            schema_maker = DbmlScafoldrSchemaMaker()
            scafoldr_schema = schema_maker.from_dbml(dbml=dbml_schema, project_name="validation_temp")

            if not scafoldr_schema.database_schema.tables:
                print(f"DBML validation failed: No tables found.")
                return "Error - DBML validation failed: No tables found."

            
            agent.state.set('dbml_schema', dbml_schema)

            return "Success - DBML is valid."

            # More complex validation can be added here as needed
        except Exception as e:
            print(f"DBML validation failed: {str(e)}. Exception occurred during parsing. {dbml_schema}")
            return f"Error - DBML validation failed: {str(e)}"
