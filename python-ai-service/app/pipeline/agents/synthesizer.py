"""Agent 5 — Synthesizer: call the LLM to generate raw outputs.

Only agent in the pipeline that makes an LLM call.
Runs multiple sub-prompts based on the optimized output plan.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from app.pipeline.agents.optimizer import OptimizedPlan
from app.llm import router as llm_router
from app.llm.types import LLMResult


@dataclass
class SynthesizedOutputs:
    plan: OptimizedPlan
    raw_fit_score: str | None = None
    raw_cover_letter: str | None = None
    raw_interview_angles: str | None = None
    raw_summary: str | None = None
    llm_results: list[LLMResult] = field(default_factory=list)


_SYSTEM = (
    "You are a career coach AI helping a job seeker evaluate and apply for roles. "
    "Be concise, practical, and honest. Never fabricate qualifications."
)


async def synthesize(plan: OptimizedPlan) -> SynthesizedOutputs:
    ctx = plan.context
    out = SynthesizedOutputs(plan=plan)

    if "fit_score" in plan.outputs:
        prompt = (
            f"Assess this candidate's fit for this role. "
            f"Reply with only: a score 0-100 on the first line, then 2-3 sentences of reasoning.\n\n"
            f"{ctx.fit_context}"
        )
        result = await llm_router.complete(prompt, _SYSTEM, max_tokens=200)
        out.raw_fit_score = result.text
        out.llm_results.append(result)

    if "cover_letter" in plan.outputs:
        prompt = (
            f"Write a concise, 3-paragraph cover letter for this application. "
            f"No fluff. Focus on fit, enthusiasm, and one specific value-add.\n\n"
            f"{ctx.fit_context}"
        )
        result = await llm_router.complete(prompt, _SYSTEM, max_tokens=512)
        out.raw_cover_letter = result.text
        out.llm_results.append(result)

    if "interview_angles" in plan.outputs:
        prompt = (
            f"List 3 likely interview questions for this role and a sharp angle the candidate "
            f"should use in each answer. Format:\nQ: <question>\nAngle: <angle>\n\n"
            f"{ctx.fit_context}"
        )
        result = await llm_router.complete(prompt, _SYSTEM, max_tokens=400)
        out.raw_interview_angles = result.text
        out.llm_results.append(result)

    if "summary" in plan.outputs:
        prompt = (
            f"Write one sentence (max 25 words) summarising why this role is a good or bad fit "
            f"for this candidate.\n\n{ctx.fit_context}"
        )
        result = await llm_router.complete(prompt, _SYSTEM, max_tokens=60)
        out.raw_summary = result.text.strip()
        out.llm_results.append(result)

    return out
