"""Agent 6 — Validator: sanity-check raw LLM outputs before they reach the assembler.

Pure function — flags or cleans bad outputs without re-calling the LLM.
"""

from __future__ import annotations
import re
from dataclasses import dataclass
from app.pipeline.agents.synthesizer import SynthesizedOutputs


@dataclass
class ValidatedOutputs:
    synthesized: SynthesizedOutputs
    fit_score_raw: int | None       # Parsed 0-100 integer
    fit_reasoning: str | None
    cover_letter_text: str | None
    interview_angles_raw: str | None
    summary: str | None
    warnings: list[str]


def validate(synthesized: SynthesizedOutputs) -> ValidatedOutputs:
    warnings: list[str] = []

    # Parse fit score — expect first line to be an integer
    fit_score_raw: int | None = None
    fit_reasoning: str | None = None
    if synthesized.raw_fit_score:
        lines = synthesized.raw_fit_score.strip().splitlines()
        try:
            first = re.search(r"\d+", lines[0] if lines else "")
            if first:
                fit_score_raw = min(100, max(0, int(first.group())))
            fit_reasoning = " ".join(lines[1:]).strip() or None
        except (ValueError, IndexError):
            warnings.append("fit_score: could not parse integer from LLM output")

    # Cover letter — strip leading/trailing whitespace, warn if too short
    cover_letter_text: str | None = None
    if synthesized.raw_cover_letter:
        cover_letter_text = synthesized.raw_cover_letter.strip()
        if len(cover_letter_text) < 100:
            warnings.append("cover_letter: suspiciously short output")

    # Interview angles — pass through raw for assembler to parse
    interview_angles_raw = synthesized.raw_interview_angles

    # Summary — strip newlines
    summary: str | None = None
    if synthesized.raw_summary:
        summary = synthesized.raw_summary.replace("\n", " ").strip()

    return ValidatedOutputs(
        synthesized=synthesized,
        fit_score_raw=fit_score_raw,
        fit_reasoning=fit_reasoning,
        cover_letter_text=cover_letter_text,
        interview_angles_raw=interview_angles_raw,
        summary=summary,
        warnings=warnings,
    )
