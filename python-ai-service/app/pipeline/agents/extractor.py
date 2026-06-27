"""Agent 1 — Extractor: pull structured fields from the raw job + user input.

Pure function — no LLM call. Normalises and validates inputs for downstream agents.
"""

from __future__ import annotations
from dataclasses import dataclass
from app.models.pipeline import PipelineRequest


@dataclass
class ExtractedData:
    position: str
    company: str
    location: str
    mode: str
    status: str
    apply_url: str | None
    salary_range: str | None
    workplace_type: str | None
    resume_summary: str
    target_role: str
    skills: list[str]


def extract(request: PipelineRequest) -> ExtractedData:
    """Extract and normalise all input fields."""
    job = request.job
    user = request.user

    salary_range: str | None = None
    if job.bluedoor_salary_min is not None and job.bluedoor_salary_max is not None:
        curr = job.bluedoor_salary_currency or "USD"
        salary_range = f"{curr} {int(job.bluedoor_salary_min):,} – {int(job.bluedoor_salary_max):,}"
    elif job.bluedoor_salary_min is not None:
        salary_range = f"{int(job.bluedoor_salary_min):,}+"

    return ExtractedData(
        position=job.position.strip(),
        company=job.company.strip(),
        location=job.location.strip(),
        mode=job.mode,
        status=job.status,
        apply_url=job.apply_url,
        salary_range=salary_range,
        workplace_type=job.bluedoor_workplace_type,
        resume_summary=user.resume_summary or "",
        target_role=user.target_role or job.position,
        skills=user.skills,
    )
