from core.agents.base_agent import BaseAgent
import openai
from langchain_openai import ChatOpenAI
from typing import Iterator

class OpenAIAgent(BaseAgent):
    model: str

    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        openai.api_key = api_key
        self.model = model

    def ask(self, prompt: str) -> str:    
        llm = ChatOpenAI(model=self.model, streaming=True)
        response = llm.invoke(prompt)

        return response.content
    
    def ask_interactively(self, prompt: str) -> Iterator[str]:
        llm = ChatOpenAI(model=self.model)

        for chunk in llm.stream(prompt):
            text = chunk.content
            if text:
                yield text
