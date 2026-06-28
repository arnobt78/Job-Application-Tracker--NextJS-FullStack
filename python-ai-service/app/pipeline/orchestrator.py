"""Pipeline orchestrator — runs agents 1-9 in sequence, threading context forward.

Agent order:
  1. Extractor    — normalise input
  2. Analyzer     — derive metadata (seniority, domain)
  3. Preprocessor — build prompt context blocks
  4. Optimizer    — prune outputs that can't be quality-produced
  5. Synthesizer  — LLM call(s) for raw outputs
  6. Validator    — sanity-check raw LLM text, parse fit score
  7. Assembler    — convert validated text to typed objects
  8. ViewFormatter — shape to PipelineResponse
  9. FinalVerifier — last-pass integrity check
"""

from __future__ import annotations
import json
from typing import AsyncGenerator
from fastapi import HTTPException
from app.models.pipeline import PipelineRequest, PipelineResponse
from app.pipeline.agents import (
    extractor,
    analyzer,
    preprocessor,
    optimizer,
    synthesizer,
    validator,
    assembler,
    view_formatter,
    final_verifier,
)

# Ordered agent names for progress reporting
_AGENT_STEPS = [
    "job-extractor",
    "job-analyzer",
    "job-preprocessor",
    "job-optimizer",
    "job-synthesizer",
    "job-validator",
    "job-assembler",
    "view-formatter",
    "final-verifier",
]


def _sse(data: dict) -> str:
    """Format a dict as a single SSE data line."""
    return f"data: {json.dumps(data)}\n\n"


async def run_streaming(request: PipelineRequest) -> AsyncGenerator[str, None]:
    """Run the 9-agent pipeline while yielding SSE progress events.

    Each agent emits a 'step' event before running.
    Final event has done=true and includes the full PipelineResponse JSON.
    Caller wraps this in FastAPI StreamingResponse(media_type='text/event-stream').
    """
    total = len(_AGENT_STEPS)
    try:
        # Agent 1 — Extractor
        yield _sse({"step": _AGENT_STEPS[0], "stepIndex": 1, "total": total, "done": False})
        extracted = extractor.extract(request)

        # Agent 2 — Analyzer
        yield _sse({"step": _AGENT_STEPS[1], "stepIndex": 2, "total": total, "done": False})
        analyzed = analyzer.analyze(extracted)

        # Agent 3 — Preprocessor
        yield _sse({"step": _AGENT_STEPS[2], "stepIndex": 3, "total": total, "done": False})
        ctx = preprocessor.preprocess(analyzed)

        # Agent 4 — Optimizer
        yield _sse({"step": _AGENT_STEPS[3], "stepIndex": 4, "total": total, "done": False})
        plan = optimizer.optimize(ctx, request.include)

        # Agent 5 — Synthesizer (async LLM call)
        yield _sse({"step": _AGENT_STEPS[4], "stepIndex": 5, "total": total, "done": False})
        synthesized = await synthesizer.synthesize(plan)

        # Agent 6 — Validator
        yield _sse({"step": _AGENT_STEPS[5], "stepIndex": 6, "total": total, "done": False})
        validated = validator.validate(synthesized)

        # Agent 7 — Assembler
        yield _sse({"step": _AGENT_STEPS[6], "stepIndex": 7, "total": total, "done": False})
        assembled = assembler.assemble(validated)

        # Agent 8 — ViewFormatter
        yield _sse({"step": _AGENT_STEPS[7], "stepIndex": 8, "total": total, "done": False})
        response = view_formatter.format_response(assembled, job_id=request.job.job_id)

        # Agent 9 — FinalVerifier
        yield _sse({"step": _AGENT_STEPS[8], "stepIndex": 9, "total": total, "done": False})
        final = final_verifier.verify(response)

        # Done — emit full result
        yield _sse({"done": True, "result": final.model_dump()})

    except (ValueError, RuntimeError) as exc:
        yield _sse({"done": True, "error": str(exc)})


async def run_pipeline(request: PipelineRequest) -> PipelineResponse:
    """Execute the full 9-agent pipeline and return a typed PipelineResponse."""
    try:
        # Agents 1-4 are pure functions — synchronous
        extracted = extractor.extract(request)
        analyzed = analyzer.analyze(extracted)
        ctx = preprocessor.preprocess(analyzed)
        plan = optimizer.optimize(ctx, request.include)

        # Agent 5 — async LLM call
        synthesized = await synthesizer.synthesize(plan)

        # Agents 6-9 — pure functions again
        validated = validator.validate(synthesized)
        assembled = assembler.assemble(validated)
        response = view_formatter.format_response(assembled, job_id=request.job.job_id)
        final = final_verifier.verify(response)

        return final

    except ValueError as exc:
        # FinalVerifier or validation error — 422
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except RuntimeError as exc:
        # All LLM providers failed — 503
        raise HTTPException(status_code=503, detail=str(exc)) from exc
