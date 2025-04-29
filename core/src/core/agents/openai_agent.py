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

    def ask_with_response_format(self, prompt: str, response_format) -> str:
        model = ChatOpenAI(model=self.model)
        structured_llm = model.with_structured_output(response_format)

        result = structured_llm.invoke(prompt)
        return result
    
    def stream_ask(self, prompt: str) -> Iterator[str]:
        llm = ChatOpenAI(model=self.model)

        for chunk in llm.stream(prompt):
            text = chunk.content
            if text:
                yield text
