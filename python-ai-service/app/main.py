"""FastAPI app — Jobify AI pipeline service.

Exposes:
  GET  /health         — liveness probe
  POST /pipeline/run  — 9-agent AI pipeline (requires X-Internal-Secret header)

Auth: X-Internal-Secret header matched against AI_SERVICE_SECRET env var.
CORS: restricted to AI_SERVICE_ALLOWED_ORIGINS (comma-separated list).
"""

from __future__ import annotations
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.health import router as health_router
from app.api.routes.pipeline import router as pipeline_router
from app.api.routes.queue import router as queue_router
from app.api.routes.interview import router as interview_router
from app.api.routes.skills import router as skills_router
from app.api.routes.email import router as email_router

app = FastAPI(
    title="Jobify AI Service",
    version="0.1.0",
    docs_url="/docs",
    redoc_url=None,
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
