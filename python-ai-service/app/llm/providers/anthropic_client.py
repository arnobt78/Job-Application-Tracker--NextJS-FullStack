"""Anthropic provider — Claude Haiku 4.5, paid last resort.

Opt-in: only used when ANTHROPIC_API_KEY is set. Runs after every free provider.
"""

from __future__ import annotations
import os
import time
import httpx
from app.llm.types import LLMResult


_MODEL = "claude-haiku-4-5-20251001"
_BASE = "https://api.anthropic.com/v1"


def _api_key() -> str:
    return os.environ.get("ANTHROPIC_API_KEY", "").strip()


def is_configured() -> bool:
    return bool(_api_key())


async def complete(prompt: str, system: str, max_tokens: int = 1024) -> LLMResult:
    """Call Anthropic Messages API — raises on failure so router can surface the last error."""
    start = time.monotonic()
    async with httpx.AsyncClient(timeout=25.0) as client:
        resp = await client.post(
            f"{_BASE}/messages",
            headers={
                "x-api-key": _api_key(),
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": _MODEL,
                "system": system,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": max_tokens,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        text: str = data["content"][0]["text"]
        latency_ms = int((time.monotonic() - start) * 1000)
        return LLMResult(text=text, model_used=_MODEL, provider="anthropic", latency_ms=latency_ms)
