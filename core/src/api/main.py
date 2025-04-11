from fastapi import FastAPI
from src.api.routes import router

app = FastAPI(title="Scafoldr API")

app.include_router(router)
