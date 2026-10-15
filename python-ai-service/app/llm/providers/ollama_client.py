"""Ollama provider — optional local/self-hosted LLM via REST API.

Opt-in: only used when OLLAMA_BASE_URL is set. Runs after the free-tier cloud chain.
"""

from __future__ import annotations
import os
import time
import httpx
from app.llm.types import LLMResult


def is_configured() -> bool:
    return bool(os.environ.get("OLLAMA_BASE_URL", "").strip())


async def complete(prompt: str, system: str, max_tokens: int = 1024) -> LLMResult:
    """Call Ollama /api/chat — raises on failure so router can try next provider."""
    base = os.environ["OLLAMA_BASE_URL"].strip().rstrip("/")
    model = os.environ.get("OLLAMA_MODEL", "llama3.2")
    start = time.monotonic()
    async with httpx.AsyncClient(timeout=25.0) as client:
        resp = await client.post(
            f"{base}/api/chat",
            json={
                "model": model,
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
        return LLMResult(text=text, model_used=model, provider="ollama", latency_ms=latency_ms)
