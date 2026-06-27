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
