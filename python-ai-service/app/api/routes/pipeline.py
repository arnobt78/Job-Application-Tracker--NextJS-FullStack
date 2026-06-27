"""POST /pipeline/run — entry point for the 9-agent AI pipeline."""

from fastapi import APIRouter, Depends, HTTPException, Request
from app.models.pipeline import PipelineRequest, PipelineResponse
from app.pipeline.orchestrator import run_pipeline
import os
import time

router = APIRouter()


def _verify_secret(request: Request) -> None:
    """Reject requests without a valid X-Internal-Secret header."""
    secret = os.environ.get("AI_SERVICE_SECRET")
    if not secret:
        # No secret configured — allow (dev mode)
        return
    header = request.headers.get("X-Internal-Secret", "")
    if header != secret:
        raise HTTPException(status_code=401, detail="Invalid internal secret")


@router.post("/pipeline/run", response_model=PipelineResponse, tags=["pipeline"])
async def run(
    payload: PipelineRequest,
    _: None = Depends(_verify_secret),
) -> PipelineResponse:
    start = time.monotonic()
    result = await run_pipeline(payload)
    latency_ms = int((time.monotonic() - start) * 1000)
    result.meta["latency_ms"] = latency_ms
    return result
