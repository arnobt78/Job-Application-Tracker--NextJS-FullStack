"""GET /health — liveness check for Coolify / Docker health probes."""

from fastapi import APIRouter

from app.llm.router import configured_providers

router = APIRouter()


@router.get("/health", tags=["ops"])
async def health() -> dict[str, str | list[str]]:
    # Provider names only — lets ops confirm keys reached the container without exposing them
    return {"status": "ok", "llm_providers": configured_providers()}
