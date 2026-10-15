"""POST /pipeline/run — entry point for the 9-agent AI pipeline."""

import time

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.api.security import verify_secret
from app.models.pipeline import PipelineRequest, PipelineResponse
from app.pipeline.orchestrator import run_pipeline, run_streaming

router = APIRouter(dependencies=[Depends(verify_secret)])


@router.post("/pipeline/run", response_model=PipelineResponse, tags=["pipeline"])
async def run(payload: PipelineRequest) -> PipelineResponse:
    start = time.monotonic()
    result = await run_pipeline(payload)
    latency_ms = int((time.monotonic() - start) * 1000)
    result.meta["latency_ms"] = latency_ms
    return result


@router.post("/pipeline/run/stream", tags=["pipeline"])
async def run_stream(payload: PipelineRequest) -> StreamingResponse:
    """SSE streaming endpoint — emits progress events as each agent completes.

    Client reads: data: {"step":"job-extractor","stepIndex":1,"total":9,"done":false}
    Final event:  data: {"done":true,"result":{...PipelineResponse...}}
    Error event:  data: {"done":true,"error":"..."}
    """
    return StreamingResponse(
        run_streaming(payload),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
            "Connection": "keep-alive",
        },
    )
