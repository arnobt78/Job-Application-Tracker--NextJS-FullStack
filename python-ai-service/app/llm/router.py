"""LLM fallback router — tries providers in priority order, never skips local if healthy.

Priority: Ollama (local) → Groq → OpenRouter → Anthropic (Claude Haiku)

Each provider's complete() raises on failure; router catches and tries next.
Raises RuntimeError if all providers fail — caller should surface as 503.
"""

from __future__ import annotations
import logging
from app.llm.types import LLMResult
from app.llm.providers import ollama_client, groq_client, openrouter_client, anthropic_client

logger = logging.getLogger(__name__)

_PROVIDERS = [
    ("ollama", ollama_client),
    ("groq", groq_client),
    ("openrouter", openrouter_client),
    ("anthropic", anthropic_client),
]


async def complete(prompt: str, system: str = "", max_tokens: int = 1024) -> LLMResult:
    """Complete a prompt using the first healthy provider in the fallback chain."""
    last_error: Exception | None = None

    for name, provider in _PROVIDERS:
        try:
            result = await provider.complete(prompt, system, max_tokens)
            logger.info("LLM via %s (%dms)", name, result.latency_ms)
            return result
        except Exception as exc:
            logger.warning("Provider %s failed: %s", name, exc)
            last_error = exc

    raise RuntimeError(f"All LLM providers failed. Last error: {last_error}") from last_error
