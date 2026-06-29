"""ARQ background task — wraps the synchronous 9-agent pipeline for async queue execution.

ARQ worker entry-point: arq app.tasks.pipeline_task.WorkerSettings
Enqueued by POST /enqueue; status polled via GET /task/{task_id}.
On completion, fires a callback to Next.js /api/internal/ai-complete so the
result is persisted to JobAIInsight and SSE invalidation updates all clients.
"""

from __future__ import annotations
import os
from typing import Any

import httpx
from arq import create_pool
from arq.connections import RedisSettings

from app.models.pipeline import PipelineRequest
from app.models.job import JobInput, UserProfile
from app.pipeline.orchestrator import run_pipeline


def _redis_settings() -> RedisSettings:
    url = os.environ.get("REDIS_URL", "redis://localhost:6379")
    return RedisSettings.from_dsn(url)


async def _notify_complete(
    job_id: str,
    user_id: str,
    result: dict[str, Any],
) -> None:
    """Fire-and-forget callback to Next.js — persist result + invalidate SSE."""
    next_app_url = os.environ.get("NEXT_APP_URL", "http://localhost:3000")
    ai_secret = os.environ.get("AI_SERVICE_SECRET", "")
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{next_app_url}/api/internal/ai-complete",
                json={"job_id": job_id, "user_id": user_id, "result": result},
                headers={
                    "X-Internal-Secret": ai_secret,
                    "Content-Type": "application/json",
                },
                timeout=10.0,
            )
    except Exception:
        # Never raise — ARQ task must succeed even if callback fails
        pass


async def run_pipeline_task(
    ctx: dict[str, Any],
    job_data: dict[str, Any],
    user_data: dict[str, Any],
    include: list[str],
) -> dict[str, Any]:
    """ARQ task: run the 9-agent pipeline for a single job.

    ctx is the arq worker context (contains redis connection).
    Returns the PipelineResponse as a plain dict for Redis serialisation.
    """
    request = PipelineRequest(
        job=JobInput(**job_data),
        user=UserProfile(**user_data),
        include=include,
    )
    result = await run_pipeline(request)
    result_dict = result.model_dump()

    job_id: str = job_data.get("job_id", "")
    user_id: str = user_data.get("user_id", "")

    if job_id and user_id:
        await _notify_complete(job_id, user_id, result_dict)

    return result_dict


class WorkerSettings:
    """ARQ worker configuration — imported by `arq app.tasks.pipeline_task.WorkerSettings`."""

    functions = [run_pipeline_task]
    # Max concurrent jobs per worker instance
    max_jobs = 10
    # Single task timeout in seconds (AI pipeline can be slow with Ollama)
    job_timeout = 300
    # Redis connection — reads REDIS_URL env var
    redis_settings = _redis_settings()
