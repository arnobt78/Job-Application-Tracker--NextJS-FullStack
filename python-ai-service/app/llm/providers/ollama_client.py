"""Ollama provider — local LLM via REST API at localhost:11434.

No API key required. Falls through when Ollama is not running.
"""

from __future__ import annotations
import os
import time
import httpx
from app.llm.types import LLMResult


_BASE = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2")


async def complete(prompt: str, system: str, max_tokens: int = 1024) -> LLMResult:
    """Call Ollama /api/chat — raises on failure so router can try next provider."""
    start = time.monotonic()
    async with httpx.AsyncClient(timeout=25.0) as client:
        resp = await client.post(
            f"{_BASE}/api/chat",
            json={
                "model": _MODEL,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
                "stream": False,
                "options": {"num_predict": max_tokens},
            },
        )
        resp.raise_for_status()
        data = resp.json()
        text: str = data["message"]["content"]
        latency_ms = int((time.monotonic() - start) * 1000)
        return LLMResult(text=text, model_used=_MODEL, provider="ollama", latency_ms=latency_ms)
