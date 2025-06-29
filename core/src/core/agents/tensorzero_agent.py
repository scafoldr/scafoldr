from langchain_openai import ChatOpenAI

from core.agents.base_agent import BaseAgent
from typing import Iterator
from tensorzero import TensorZeroGateway

class TensorZeroAgent(BaseAgent):
    model: str

    def __init__(self, model: str = "gpt-4o-mini"):
        self.model = model
        self.tensorzero_client = TensorZeroGateway.build_http(gateway_url="http://localhost:3000")

    def ask(self, prompt: str) -> str:
        inference_response = self.tensorzero_client.inference(
            model_name=self.model,
            input={"content": prompt},
        )
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
