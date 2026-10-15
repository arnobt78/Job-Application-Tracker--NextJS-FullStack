"""FastAPI app — Jobify AI pipeline service.

Exposes:
  GET  /health         — liveness probe + configured LLM provider names
  POST /pipeline/run  — 9-agent AI pipeline (requires X-Internal-Secret header)

Auth: X-Internal-Secret header matched against AI_SERVICE_SECRET env var.
CORS: restricted to AI_SERVICE_ALLOWED_ORIGINS (comma-separated list).
"""

from __future__ import annotations
import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from app.env import load_local_env

load_local_env()

from fastapi import FastAPI  # noqa: E402 — env must be loaded before route modules import
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from app.api.routes.health import router as health_router  # noqa: E402
from app.api.routes.pipeline import router as pipeline_router  # noqa: E402
from app.api.routes.queue import close_pool, router as queue_router  # noqa: E402
from app.api.routes.interview import router as interview_router  # noqa: E402
from app.api.routes.skills import router as skills_router  # noqa: E402
from app.api.routes.email import router as email_router  # noqa: E402


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    yield
    await close_pool()


app = FastAPI(
    title="Jobify AI Service",
    version="0.1.0",
    docs_url="/docs",
    redoc_url=None,
    lifespan=lifespan,
)

# CORS — Next.js frontend origin(s) only
_allowed_origins_raw = os.environ.get("AI_SERVICE_ALLOWED_ORIGINS", "http://localhost:3000")
_allowed_origins = [o.strip() for o in _allowed_origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Internal-Secret", "Authorization"],
)

app.include_router(health_router)
app.include_router(pipeline_router)
app.include_router(queue_router)
app.include_router(interview_router)
app.include_router(skills_router)
app.include_router(email_router)
