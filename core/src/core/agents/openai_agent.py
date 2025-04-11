from core.agents.base_agent import BaseAgent
import openai
from langchain_openai import ChatOpenAI

class OpenAIAgent(BaseAgent):
    model: str

    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        openai.api_key = api_key
        self.model = model

    def ask(self, prompt: str) -> str:    
        llm = ChatOpenAI(model=self.model)
        response = llm.invoke(prompt)

        return response.content
