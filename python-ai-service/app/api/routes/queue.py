"""ARQ queue endpoints — enqueue background pipeline tasks and poll task status.

POST /enqueue  — enqueue a pipeline job; returns task_id
GET  /task/{task_id} — poll job status from Redis
"""

from __future__ import annotations
import os
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from arq import create_pool
from arq.connections import RedisSettings
from arq.jobs import Job, JobStatus

router = APIRouter(tags=["queue"])


def _redis_settings() -> RedisSettings:
    url = os.environ.get("REDIS_URL", "redis://localhost:6379")
    return RedisSettings.from_dsn(url)


def _verify_secret(request: Request) -> None:
    """Reject requests without a valid X-Internal-Secret header."""
    secret = os.environ.get("AI_SERVICE_SECRET")
    if not secret:
        return
    header = request.headers.get("X-Internal-Secret", "")
    if header != secret:
        raise HTTPException(status_code=401, detail="Invalid internal secret")


class EnqueueRequest(BaseModel):
    job_data: dict[str, Any]
    user_data: dict[str, Any] = {}
    include: list[str] = ["fit_score", "cover_letter", "interview_angles", "summary"]


class EnqueueResponse(BaseModel):
    task_id: str
    status: str = "queued"


class TaskStatusResponse(BaseModel):
    task_id: str
    status: str  # queued | in_progress | complete | not_found | failed
    result: dict[str, Any] | None = None
    error: str | None = None


@router.post("/enqueue", response_model=EnqueueResponse)
async def enqueue_task(
    payload: EnqueueRequest,
    _: None = Depends(_verify_secret),
) -> EnqueueResponse:
    """Enqueue a pipeline analysis task for background processing via ARQ."""
    try:
        pool = await create_pool(_redis_settings())
        job = await pool.enqueue_job(
            "run_pipeline_task",
            payload.job_data,
            payload.user_data,
            payload.include,
        )
        await pool.aclose()
        return EnqueueResponse(task_id=job.job_id)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Queue unavailable: {exc}") from exc


@router.get("/task/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(
    task_id: str,
    _: None = Depends(_verify_secret),
) -> TaskStatusResponse:
    """Poll ARQ task status by job ID."""
    try:
        pool = await create_pool(_redis_settings())
        job = Job(task_id, pool)
        status = await job.status()
        await pool.aclose()

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
        raise HTTPException(status_code=503, detail=f"Queue unavailable: {exc}") from exc
