"""Pydantic models for job and user profile data sent from Next.js."""

from __future__ import annotations
from pydantic import BaseModel, Field


class JobInput(BaseModel):
    """A tracked job application from the Jobify database."""

    job_id: str
    position: str
    company: str
    location: str
    status: str
    mode: str
    apply_url: str | None = None
    # Bluedoor enrichment fields — present when enrichment ran
    bluedoor_status: str | None = None
    bluedoor_workplace_type: str | None = None
    bluedoor_salary_min: float | None = None
    bluedoor_salary_max: float | None = None
    bluedoor_salary_currency: str | None = None


class UserProfile(BaseModel):
    """Minimal user context for personalising AI output."""

    # Freeform resume text or LinkedIn summary pasted by user (optional)
    resume_summary: str | None = None
    target_role: str | None = None
    years_experience: int | None = None
    skills: list[str] = Field(default_factory=list)
