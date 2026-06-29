"""POST /pipeline/interview-prep — focused interview angle generation.

Runs only the synthesizer agent with interview_angles output.
Called when a job status changes to 'interview' (via after() in Next.js updateJobAction).
"""

from __future__ import annotations
import os

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from app.models.job import JobInput, UserProfile
from app.models.pipeline import InterviewAngle
from app.pipeline.agents import (
    extractor,
    analyzer,
    preprocessor,
    optimizer,
    synthesizer,
    validator,
    assembler,
)

router = APIRouter(tags=["interview"])


def _verify_secret(request: Request) -> None:
    """Reject requests without a valid X-Internal-Secret header."""
    secret = os.environ.get("AI_SERVICE_SECRET")
    if not secret:
        return
    header = request.headers.get("X-Internal-Secret", "")
    if header != secret:
        raise HTTPException(status_code=401, detail="Invalid internal secret")


class InterviewPrepRequest(BaseModel):
    job: JobInput
    user: UserProfile = UserProfile()


class InterviewPrepResponse(BaseModel):
    job_id: str
    interview_angles: list[InterviewAngle]
    interview_tips: list[str]


@router.post("/pipeline/interview-prep", response_model=InterviewPrepResponse)
async def run_interview_prep(
    payload: InterviewPrepRequest,
    _: None = Depends(_verify_secret),
) -> InterviewPrepResponse:
    """Generate interview angles only — skips fit score, cover letter, summary.

    Lighter pipeline run used when job status moves to 'interview'.
    """
    try:
        # Run agents 1-4 (pure functions — build context)
        from app.models.pipeline import PipelineRequest
        request = PipelineRequest(
            job=payload.job,
            user=payload.user,
            include=["interview_angles"],
        )

        extracted = extractor.extract(request)
        analyzed = analyzer.analyze(extracted)
        ctx = preprocessor.preprocess(analyzed)
        plan = optimizer.optimize(ctx, ["interview_angles"])

        # Agent 5 — LLM synthesis (interview_angles only)
        synthesized = await synthesizer.synthesize(plan)

        # Agents 6-7 — validate and assemble
        validated = validator.validate(synthesized)
        assembled = assembler.assemble(validated)

        angles = assembled.interview_angles or []

        # Derive practical tips from angle content
        tips = _derive_tips(angles)

        return InterviewPrepResponse(
            job_id=payload.job.job_id,
            interview_angles=angles,
            interview_tips=tips,
        )

    except (ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


def _derive_tips(angles: list[InterviewAngle]) -> list[str]:
    """Convert interview angles into actionable tips (no extra LLM call)."""
    tips = [
        "Research the company's recent news and product launches before the interview.",
        "Prepare 2-3 concrete examples using the STAR method (Situation, Task, Action, Result).",
        "Have questions ready for the interviewer about team culture and growth opportunities.",
    ]
    # Add angle-specific tip if enough angles present
    if len(angles) >= 2:
        tips.append(f"Focus your opening answer on: {angles[0].angle}")
    return tips
