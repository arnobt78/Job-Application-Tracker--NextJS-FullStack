"""Anthropic provider — Claude Haiku 4.5 as final fallback. Requires ANTHROPIC_API_KEY."""

from __future__ import annotations
import os
import time
import httpx
from app.llm.types import LLMResult


_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
_MODEL = "claude-haiku-4-5-20251001"
_BASE = "https://api.anthropic.com/v1"


async def complete(prompt: str, system: str, max_tokens: int = 1024) -> LLMResult:
    """Call Anthropic Messages API — raises on failure or missing key."""
    if not _API_KEY:
        raise RuntimeError("ANTHROPIC_API_KEY not set")

    start = time.monotonic()
    async with httpx.AsyncClient(timeout=25.0) as client:
        resp = await client.post(
            f"{_BASE}/messages",
            headers={
                "x-api-key": _API_KEY,
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
