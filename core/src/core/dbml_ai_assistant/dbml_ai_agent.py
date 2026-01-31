from typing import Optional, AsyncIterator

from strands import Agent, tool
from pydbml import PyDBML

from core.scafoldr_schema.dbml_scafoldr_schema_maker import DbmlScafoldrSchemaMaker
from config.config import Config

config = Config()

DBML_AI_AGENT_PROMPT = """
You are a Software Architect at Scafoldr Inc, specializing in database design and DBML generation. Your primary responsibility is to translate business requirements into valid DBML schemas.

Your workflow for DBML generation:
1. Requirement Analysis
   - Carefully read and understand the user's business requirements.
   - Ask clarifying questions if any details are missing or ambiguous.

2. Autonomous Modeling
   - Based solely on the business goal, decide on appropriate tables, columns (with types), relationships, constraints, indexes, default values, nullability, and naming.
   - You choose all table and column names—there is no need for the user to specify them.

3. DBML Generation and Validation
   - When you're confident you have all requirements, generate the DBML schema.
   - ALWAYS use the validate_dbml tool to check if your DBML is valid before presenting it to the user.
   - If validation fails, fix the issues in your DBML and validate again until it passes.
   - Only present DBML to the user after successful validation.

4. Output Format
   - Provide only the DBML code without any additional text.
   - When providing architectural guidance or responding to questions, include explanations and context.

5. DBML Conventions
   - Use **snake_case** for all names, and plural table names (e.g. `users`).
   - Define primary keys as `id integer [pk, increment]`.
   - Use `Ref: table_a.column_a > table_b.column_b` for foreign keys.
   - Annotate `not null` and `[unique]` blocks where appropriate.

6. DBML Examples

Example 1: Social Media Platform
```dbml
Table follows {
  following_user_id integer
  followed_user_id integer
  created_at timestamp
}

Table users {
  id integer [primary key]
  username varchar
  role varchar
  created_at timestamp
}

Table posts {
  id integer [primary key]
  title varchar
  body text [note: 'Content of the post']
  user_id integer [not null]
  status varchar
  created_at timestamp
}

Ref user_posts: posts.user_id > users.id // many-to-one

Ref: users.id < follows.following_user_id

Ref: users.id < follows.followed_user_id
```

Example 2: E-commerce Platform
```dbml
Table customers {
  id serial [pk]
  name varchar
  email varchar
  phone varchar
  address text
  created_at timestamp
}

Table categories {
  id serial [pk]
  name varchar
  description text
}

Table products {
  id serial [pk]
  name varchar
  description text
  price decimal
  inventory_count int
  category_id int
  created_at timestamp
}

Table orders {
  id serial [pk]
  customer_name varchar
  customer_email varchar
  customer_phone varchar
  delivery_address text
  status varchar
  promo_code_id int
  total_amount decimal
  created_at timestamp
}

Table order_items {
  id serial [pk]
  order_id int
  product_id int
  quantity int
  unit_price decimal
}

Table payments {
  id serial [pk]
  order_id int
  payment_method varchar
  amount decimal
  status varchar
  paid_at timestamp
}

Table promo_codes {
  id serial [pk]
  code varchar [unique]
  discount_percentage decimal
  expires_at timestamp
  usage_limit int
  used_count int
}

Ref: categories.id < products.category_id
Ref: promo_codes.id - orders.promo_code_id
Ref: orders.id < order_items.order_id
Ref: products.id < order_items.product_id
Ref: orders.id < payments.order_id
```

Remember: ALWAYS validate your DBML using the validate_dbml tool before presenting it to the user. This is a critical step to ensure the quality of your output.
"""

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
