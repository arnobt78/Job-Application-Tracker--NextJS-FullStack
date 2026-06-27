"""Agent 8 — ViewFormatter: shape the assembled result for the API response model.

Pure function — maps AssembledResult to PipelineResponse fields.
"""

from __future__ import annotations
from app.pipeline.agents.assembler import AssembledResult
from app.models.pipeline import PipelineResponse


def format_response(assembled: AssembledResult, job_id: str) -> PipelineResponse:
    """Map assembled pipeline result to the typed API response."""
    llm_results = assembled.validated.synthesized.llm_results
    providers_used = list({r.provider for r in llm_results})
    avg_latency = (
        sum(r.latency_ms for r in llm_results) // len(llm_results)
        if llm_results
        else 0
    )

    return PipelineResponse(
        job_id=job_id,
        fit_score=assembled.fit_score,
        cover_letter=assembled.cover_letter,
        interview_angles=assembled.interview_angles,
        summary=assembled.summary,
        meta={
            "providers_used": providers_used,
            "avg_llm_latency_ms": avg_latency,
            "warnings": assembled.validated.warnings,
            "skipped_outputs": assembled.validated.synthesized.plan.skip_reasons,
        },
    )
