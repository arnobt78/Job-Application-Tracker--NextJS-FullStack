"""GET /health — liveness check for Coolify / Docker health probes."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health", tags=["ops"])
async def health() -> dict[str, str]:
    return {"status": "ok"}
