import os

from core.agents.base_agent import BaseAgent
import openai
from langchain_openai import ChatOpenAI
from typing import Iterator
from tensorzero import TensorZeroGateway

class OpenAIAgent(BaseAgent):
    model: str

    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        openai.api_key = api_key
        self.model = model

    def ask(self, prompt: str) -> str:    
        llm = ChatOpenAI(model=self.model, streaming=True)
        response = llm.invoke(prompt)

        return response.content

    def ask_with_response_format(self, prompt: dict[str, list[dict]], response_format) -> str:
        # model = ChatOpenAI(model=self.model)
        config_file = os.path.join(os.path.dirname(__file__), 'tensorzero.toml')


        client = TensorZeroGateway.build_embedded(
            clickhouse_url="http://chuser:chpassword@clickhouse:8123/tensorzero",
            config_file=config_file,
        )
        response = client.inference(
            function_name="generate_haiku",
            input={
                "system": prompt[0]["content"],
                "messages": prompt[1:]
            },
            output_schema=response_format,
        )

        # patch_openai_client(
        #     model,
        #     # config_file="./tensorzero/config.toml",
        #     clickhouse_url="https://user:password@host:port/database",
        # )
        # structured_llm = model.with_structured_output(response_format)

        # result = structured_llm.invoke(prompt)
        print(response)
        return 'asd'
    
    def stream_ask(self, prompt: str) -> Iterator[str]:
        llm = ChatOpenAI(model=self.model)

        for chunk in llm.stream(prompt):
            text = chunk.content
            if text:
                yield text
