"""Agent 7 — Assembler: parse structured data from validated raw LLM text.

Pure function — converts raw strings into typed objects for the response models.
"""

from __future__ import annotations
import re
from dataclasses import dataclass, field
from app.pipeline.agents.validator import ValidatedOutputs
from app.models.pipeline import FitScoreResult, CoverLetterResult, InterviewAngle


@dataclass
class AssembledResult:
    validated: ValidatedOutputs
    fit_score: FitScoreResult | None = None
    cover_letter: CoverLetterResult | None = None
    interview_angles: list[InterviewAngle] = field(default_factory=list)
    summary: str | None = None


def assemble(validated: ValidatedOutputs) -> AssembledResult:
    result = AssembledResult(validated=validated)

    if validated.fit_score_raw is not None:
        result.fit_score = FitScoreResult(
            score=validated.fit_score_raw,
            reasoning=validated.fit_reasoning or "",
        )

    if validated.cover_letter_text:
        result.cover_letter = CoverLetterResult(
            text=validated.cover_letter_text,
            word_count=len(validated.cover_letter_text.split()),
        )

    if validated.interview_angles_raw:
        result.interview_angles = _parse_interview_angles(validated.interview_angles_raw)

    result.summary = validated.summary

    return result


def _parse_interview_angles(raw: str) -> list[InterviewAngle]:
    """Parse Q:/Angle: block pairs from LLM output."""
    angles: list[InterviewAngle] = []
    # Split on Q: ... Angle: ... blocks
    blocks = re.split(r"\n(?=Q:)", raw.strip())
    for block in blocks:
        q_match = re.search(r"Q:\s*(.+)", block)
        a_match = re.search(r"Angle:\s*(.+)", block, re.DOTALL)
        if q_match and a_match:
            angles.append(
                InterviewAngle(
                    question=q_match.group(1).strip(),
                    angle=a_match.group(1).strip(),
                )
            )
    return angles[:5]  # cap at 5
