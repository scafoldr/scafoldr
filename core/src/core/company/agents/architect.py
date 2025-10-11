"""
Software Architect Agent

This agent specializes in database design and DBML generation,
with built-in validation to ensure the quality of the generated schemas.
"""

from typing import Optional, AsyncIterator
from strands import Agent
from strands.models import Model

from core.company.agents.base_agent import BaseCompanyAgent, AgentResponse
from core.company.tools.generator_tools import validate_dbml
from core.storage.code_storage import CodeStorage

ARCHITECT_PROMPT = """
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

class SoftwareArchitect(BaseCompanyAgent):
    """
    Software Architect agent specializing in database design and DBML generation
    with built-in validation.
    """
    
    def __init__(self, ai_provider: Model, project_id: str, conversation_id: str):
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
            project_id=project_id,
            conversation_id=conversation_id
        )

        # Initialize the Strands agent
        self.architect_agent = Agent(
            model=self.ai_provider,
            system_prompt=ARCHITECT_PROMPT,
            tools=[validate_dbml],
            # callback_handler=None,
            state={"project_id": project_id, "conversation_id": conversation_id}
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
            "primary_function": "Database schema design with validation",
            "input_formats": ["natural language business requirements"],
            "output_formats": ["validated DBML schema", "architectural guidance"],
            "streaming_supported": True,
            "conversation_support": True,
            "specialties": [
                "Converting business requirements to validated database schemas",
                "DBML generation following Clean Architecture principles",
                "Database relationship modeling with validation",
                "Schema optimization and best practices"
            ]
        }
    
    def get_agent(self) -> Agent:
        """
        Get the underlying Strands Agent instance.
        
        Returns:
            Strands Agent instance
        """
        return self.architect_agent