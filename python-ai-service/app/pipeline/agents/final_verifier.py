"""Agent 9 — FinalVerifier: last-pass integrity check on the formatted response.

Pure function — ensures required fields are present and within bounds.
Raises ValueError when the response is fundamentally broken so caller can 503.
"""

from __future__ import annotations
from app.models.pipeline import PipelineResponse


def verify(response: PipelineResponse) -> PipelineResponse:
    """Verify the final response is sane before sending to client."""
    errors: list[str] = []

    if not response.job_id:
        errors.append("job_id is missing")

    if response.fit_score is not None:
        if not (0 <= response.fit_score.score <= 100):
            errors.append(f"fit_score.score out of range: {response.fit_score.score}")

    if response.cover_letter is not None and response.cover_letter.word_count < 10:
        errors.append("cover_letter too short")

    if errors:
        raise ValueError(f"FinalVerifier failed: {'; '.join(errors)}")

    return response
