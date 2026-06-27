"""Agent 4 — Optimizer: select which outputs to generate based on available context.

Pure function — prunes the requested outputs list if inputs are too thin for quality results.
"""

from __future__ import annotations
from dataclasses import dataclass
from app.pipeline.agents.preprocessor import PreprocessedContext


@dataclass
class OptimizedPlan:
    context: PreprocessedContext
    outputs: list[str]          # Pruned from original request.include
    skip_reasons: dict[str, str]  # output → reason if skipped


def optimize(context: PreprocessedContext, requested: list[str]) -> OptimizedPlan:
    """Prune outputs that can't produce quality results with the available context."""
    outputs: list[str] = []
    skip_reasons: dict[str, str] = {}

    ext = context.analyzed.extracted
    has_user_context = bool(ext.resume_summary or ext.skills)

    for output in requested:
        if output in ("cover_letter",) and not has_user_context:
            skip_reasons[output] = "No user profile — cover letter would be generic"
            continue
        outputs.append(output)

    return OptimizedPlan(context=context, outputs=outputs, skip_reasons=skip_reasons)
