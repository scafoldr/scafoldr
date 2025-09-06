from abc import ABC, abstractmethod
from models.generate import GenerateResponse
from models.scafoldr_schema import ScafoldrSchema

class BaseGenerator(ABC):
    @abstractmethod
    def generate(self, schema: ScafoldrSchema) -> GenerateResponse:
        """Generate files from ScafoldrSchema and return a dict of {path: content}"""
        pass
