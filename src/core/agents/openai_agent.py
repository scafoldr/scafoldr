from core.agents.base_agent import BaseAgent
import openai

class OpenAIAgent(BaseAgent):
    def __init__(self, api_key: str):
        openai.api_key = api_key

    def generate_code(self, prompt: str) -> str:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a code generator AI."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        return response['choices'][0]['message']['content'].strip()
