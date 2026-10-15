"""Pydantic models for job and user profile data sent from Next.js."""

from __future__ import annotations
from pydantic import AliasChoices, BaseModel, Field


class JobInput(BaseModel):
    """A tracked job application from the Jobify database."""

    job_id: str
    position: str
    company: str
    location: str
    status: str
    mode: str
    apply_url: str | None = None
    # Linked-posting snapshot — present when the job is linked to a posting.
    # Legacy bluedoor_* names are still accepted until every caller is redeployed.
    posting_status: str | None = Field(
        default=None, validation_alias=AliasChoices("posting_status", "bluedoor_status")
    )
    workplace_type: str | None = Field(
        default=None, validation_alias=AliasChoices("workplace_type", "bluedoor_workplace_type")
    )
    salary_min: float | None = Field(
        default=None, validation_alias=AliasChoices("salary_min", "bluedoor_salary_min")
    )
    salary_max: float | None = Field(
        default=None, validation_alias=AliasChoices("salary_max", "bluedoor_salary_max")
    )
    salary_currency: str | None = Field(
        default=None, validation_alias=AliasChoices("salary_currency", "bluedoor_salary_currency")
    )


class UserProfile(BaseModel):
    """Minimal user context for personalising AI output."""

    # Freeform resume text or LinkedIn summary pasted by user (optional)
    resume_summary: str | None = None
    target_role: str | None = None
    years_experience: int | None = None
    skills: list[str] = Field(default_factory=list)
