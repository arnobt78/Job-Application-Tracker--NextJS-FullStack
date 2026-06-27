"""Groq provider — fast cloud inference. Requires GROQ_API_KEY env var."""

from __future__ import annotations
import os
import time
import httpx
from app.llm.types import LLMResult


_API_KEY = os.environ.get("GROQ_API_KEY", "")
_MODEL = "llama-3.3-70b-versatile"
_BASE = "https://api.groq.com/openai/v1"


async def complete(prompt: str, system: str, max_tokens: int = 1024) -> LLMResult:
    """Call Groq chat completions — raises on failure or missing key."""
    if not _API_KEY:
        raise RuntimeError("GROQ_API_KEY not set")

    start = time.monotonic()
    async with httpx.AsyncClient(timeout=25.0) as client:
        resp = await client.post(
            f"{_BASE}/chat/completions",
            headers={"Authorization": f"Bearer {_API_KEY}"},
            json={
                "model": _MODEL,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
                "max_tokens": max_tokens,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        text: str = data["choices"][0]["message"]["content"]
        latency_ms = int((time.monotonic() - start) * 1000)
        return LLMResult(text=text, model_used=_MODEL, provider="groq", latency_ms=latency_ms)
