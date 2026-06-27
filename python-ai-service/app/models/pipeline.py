"""Pydantic models for the 9-agent pipeline request/response."""

from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field
from app.models.job import JobInput, UserProfile


class PipelineRequest(BaseModel):
    """Inbound payload from Next.js POST /pipeline/run."""

    job: JobInput
    user: UserProfile = Field(default_factory=UserProfile)
    # Which outputs to include — defaults to all
    include: list[str] = Field(
        default=["fit_score", "cover_letter", "interview_angles", "summary"],
        description="Requested output sections",
    )


class FitScoreResult(BaseModel):
    score: int = Field(ge=0, le=100)
    reasoning: str


class CoverLetterResult(BaseModel):
    text: str
    word_count: int


class InterviewAngle(BaseModel):
    question: str
    angle: str


class PipelineResponse(BaseModel):
    """Outbound payload returned to Next.js."""

    job_id: str
    fit_score: FitScoreResult | None = None
    cover_letter: CoverLetterResult | None = None
    interview_angles: list[InterviewAngle] = Field(default_factory=list)
    summary: str | None = None
    # Diagnostic metadata — model used, total latency
    meta: dict[str, Any] = Field(default_factory=dict)
