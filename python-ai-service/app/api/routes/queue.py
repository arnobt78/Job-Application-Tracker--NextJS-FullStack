"""ARQ queue endpoints — enqueue background pipeline tasks and poll task status.

POST /enqueue  — enqueue a pipeline job; returns task_id
GET  /task/{task_id} — poll job status from Redis
"""

from __future__ import annotations
import asyncio
import os
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from arq import ArqRedis, create_pool
from arq.connections import RedisSettings
from arq.jobs import Job, JobStatus

from app.api.security import verify_secret

router = APIRouter(tags=["queue"], dependencies=[Depends(verify_secret)])

# One pool per process, created on first use so the API still boots when Redis is down
_pool: ArqRedis | None = None
_pool_lock = asyncio.Lock()


def _redis_settings() -> RedisSettings:
    url = os.environ.get("REDIS_URL", "redis://localhost:6379")
    return RedisSettings.from_dsn(url)


async def _get_pool() -> ArqRedis:
    global _pool
    async with _pool_lock:
        if _pool is None:
            _pool = await create_pool(_redis_settings())
        return _pool


async def close_pool() -> None:
    """Called from the app lifespan on shutdown."""
    global _pool
    if _pool is not None:
        await _pool.aclose()
        _pool = None


class EnqueueRequest(BaseModel):
    job_data: dict[str, Any]
    user_data: dict[str, Any] = Field(default_factory=dict)
    include: list[str] = Field(
        default_factory=lambda: ["fit_score", "cover_letter", "interview_angles", "summary"]
    )


class EnqueueResponse(BaseModel):
    task_id: str
    status: str = "queued"


class TaskStatusResponse(BaseModel):
    task_id: str
    status: str  # queued | in_progress | complete | not_found | failed
    result: dict[str, Any] | None = None
    error: str | None = None


@router.post("/enqueue", response_model=EnqueueResponse)
async def enqueue_task(payload: EnqueueRequest) -> EnqueueResponse:
    """Enqueue a pipeline analysis task for background processing via ARQ."""
    try:
        pool = await _get_pool()
        job = await pool.enqueue_job(
            "run_pipeline_task",
            payload.job_data,
            payload.user_data,
            payload.include,
        )
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Queue unavailable: {type(exc).__name__}") from exc
    if job is None:
        raise HTTPException(status_code=409, detail="Task already queued")
    return EnqueueResponse(task_id=job.job_id)


@router.get("/task/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str) -> TaskStatusResponse:
    """Poll ARQ task status by job ID."""
    try:
        job = Job(task_id, await _get_pool())
        status = await job.status()

        if status == JobStatus.not_found:
            return TaskStatusResponse(task_id=task_id, status="not_found")
        if status == JobStatus.queued:
            return TaskStatusResponse(task_id=task_id, status="queued")
        if status == JobStatus.in_progress:
            return TaskStatusResponse(task_id=task_id, status="in_progress")
        if status == JobStatus.complete:
            result_info = await job.result_info()
            if result_info and result_info.success:
                return TaskStatusResponse(
                    task_id=task_id, status="complete", result=result_info.result
                )
            err = result_info.result if result_info else "Unknown error"
            return TaskStatusResponse(task_id=task_id, status="failed", error=str(err))

        return TaskStatusResponse(task_id=task_id, status=str(status))
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Queue unavailable: {type(exc).__name__}") from exc
