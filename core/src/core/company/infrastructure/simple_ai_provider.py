"""
Simple AI Provider

This module provides a clean interface for company agents to interact with
the underlying AI infrastructure while reusing existing OpenAI integration.
"""

from typing import Iterator, Optional
from core.agents.coordinator import AgentCoordinator


class SimpleAIProvider:
    """
    Wrapper around the existing AgentCoordinator to provide a clean interface
    for company agents to make AI calls.
    
    This maintains compatibility with the existing OpenAI infrastructure
    while providing a cleaner interface for the new agent architecture.
    """
    
    def __init__(self):
        """Initialize the AI provider with the existing coordinator."""
        self.coordinator = AgentCoordinator()
    
    async def call_agent(self, prompt: str, response_format: Optional[dict] = None) -> str:
        """
        Make an AI call with the given prompt.
        
        Args:
            prompt: The prompt to send to the AI
            response_format: Optional response format specification
            
        Returns:
            AI response as a string
        """
        if response_format:
            return self.coordinator.ask_agent_with_response_format(prompt, response_format)
        else:
            return self.coordinator.ask_agent(prompt)
    
    async def stream_call(self, prompt: str) -> Iterator[str]:
        """
        Make a streaming AI call with the given prompt.
        
        Args:
            prompt: The prompt to send to the AI
            
        Returns:
            Iterator of response chunks
        """
        return self.coordinator.stream_ask_agent(prompt)
    
    def get_provider_info(self) -> dict:
        """
        Get information about the AI provider.
        
        Returns:
            Dictionary with provider information
        """
        return {
            "provider": "OpenAI",
            "type": "GPT",
            "streaming_supported": True,
            "structured_output_supported": True
        }