"""Tests for the 9-agent pipeline.

The LLM synthesizer is mocked — no real API calls.
Tests verify the full pipeline end-to-end with controlled LLM output.
"""

from __future__ import annotations
import pytest
from unittest.mock import AsyncMock, patch
from app.models.job import JobInput, UserProfile
from app.models.pipeline import PipelineRequest
from app.pipeline.orchestrator import run_pipeline
from app.pipeline.agents import synthesizer as synth_module
from app.pipeline.agents.synthesizer import SynthesizedOutputs
from app.llm.types import LLMResult


def make_request(**overrides) -> PipelineRequest:
    job = JobInput(
        job_id="job-123",
        position=overrides.pop("position", "Senior Software Engineer"),
        company=overrides.pop("company", "Stripe"),
        location="Remote",
        status="Pending",
        mode="Full-time",
        apply_url="https://stripe.com/jobs/123",
        bluedoor_salary_min=180_000,
        bluedoor_salary_max=250_000,
        bluedoor_salary_currency="USD",
    )
    user = UserProfile(
        resume_summary="5 years Python + TypeScript, built payment infra at fintech startup.",
        target_role="Senior Engineer",
        skills=["Python", "TypeScript", "React", "PostgreSQL"],
    )
    return PipelineRequest(job=job, user=user, include=overrides.pop("include", ["fit_score", "summary"]))


FAKE_LLM = LLMResult(text="85\nStrong match for senior backend role.", model_used="test", provider="mock", latency_ms=10)


@pytest.mark.asyncio
async def test_pipeline_full_run_with_mocked_llm() -> None:
    """Full pipeline run returns a valid PipelineResponse."""
    async def fake_synthesize(plan):
        s = SynthesizedOutputs(plan=plan)
        s.raw_fit_score = "85\nStrong match for senior backend role."
        s.raw_summary = "Excellent fit for senior backend role."
        s.llm_results = [FAKE_LLM]
        return s

    with patch.object(synth_module, "synthesize", new=AsyncMock(side_effect=fake_synthesize)):
        response = await run_pipeline(make_request())

    assert response.job_id == "job-123"
    assert response.fit_score is not None
    assert response.fit_score.score == 85
    assert "strong" in response.fit_score.reasoning.lower()
    assert response.summary is not None


@pytest.mark.asyncio
async def test_pipeline_cover_letter_skipped_without_profile() -> None:
    """Optimizer should skip cover_letter when user has no profile."""
    req = make_request(include=["fit_score", "cover_letter"])
    req.user.resume_summary = None
    req.user.skills = []

    async def fake_synthesize(plan):
        assert "cover_letter" not in plan.outputs
        s = SynthesizedOutputs(plan=plan)
        s.raw_fit_score = "70\nDecent fit."
        s.llm_results = [FAKE_LLM]
        return s

    with patch.object(synth_module, "synthesize", new=AsyncMock(side_effect=fake_synthesize)):
        response = await run_pipeline(req)

    assert response.cover_letter is None


@pytest.mark.asyncio
async def test_pipeline_handles_all_outputs() -> None:
    """Pipeline returns all four output types when requested."""
    req = make_request(include=["fit_score", "cover_letter", "interview_angles", "summary"])

    async def fake_synthesize(plan):
        s = SynthesizedOutputs(plan=plan)
        s.raw_fit_score = "90\nExcellent match."
        s.raw_cover_letter = "Dear Hiring Manager,\n\nI am excited to apply for this role.\n\nThank you."
        s.raw_interview_angles = (
            "Q: Tell me about distributed systems.\n"
            "Angle: Highlight your payment infra work and mention Stripe's scale.\n\n"
            "Q: How do you handle production incidents?\n"
            "Angle: Use a concrete example with metrics.\n"
        )
        s.raw_summary = "Strong match for senior backend."
        s.llm_results = [FAKE_LLM] * 4
        return s

    with patch.object(synth_module, "synthesize", new=AsyncMock(side_effect=fake_synthesize)):
        response = await run_pipeline(req)

    assert response.fit_score is not None
    assert response.cover_letter is not None
    assert len(response.interview_angles) >= 2
    assert response.summary is not None
