"""SlagVis Predictor — FastAPI backend entry point."""

import os
from contextlib import asynccontextmanager

import models  # noqa: F401 — registers models
from api.routes import router
from database import init_db
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Comma-separated list, e.g. https://slagvis.vercel.app,http://localhost:3000
_DEFAULT_ORIGINS = "http://localhost:3000,http://127.0.0.1:3000"
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", _DEFAULT_ORIGINS).split(",")
    if origin.strip()
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="SlagVis Predictor API",
    description="Metallurgical slag viscosity prediction using empirical models",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok", "service": "SlagVis Predictor API"}
