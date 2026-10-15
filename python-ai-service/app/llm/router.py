"""LLM fallback router — walks the free-tier registry, then optional Ollama / Anthropic.

Order: Groq → Gemini → OpenRouter (:free) → Hugging Face → Ollama (opt-in) → Anthropic (opt-in, paid).

Per docs/LLM_MODEL_SELECTION.md:
  - provider without a key          → skipped, not counted as a failure
  - 401/402/403                     → rest of that provider skipped (bad key / no credits)
  - 429/404/410/5xx/timeout/empty   → next model (free-tier rate limits are per model)
Raises RuntimeError only when every configured model failed — callers surface it as 503.
"""

from __future__ import annotations
import logging
import time

import httpx

from app.llm import openai_compat
from app.llm.openai_compat import ChatFailure
from app.llm.providers import anthropic_client, ollama_client
from app.llm.registry import PROVIDERS
from app.llm.types import LLMResult

logger = logging.getLogger(__name__)

_TIMEOUT = httpx.Timeout(20.0, connect=5.0)

# Wall-clock cap per complete() — the pipeline makes up to 4 sequential calls and the
# Next.js stream proxy aborts at 90s, so the chain must give up before that.
_BUDGET_SECONDS = 20.0

# Non-OpenAI-shaped providers; each exposes is_configured() and complete()
_OPTIONAL_PROVIDERS = (("ollama", ollama_client), ("anthropic", anthropic_client))


def configured_providers() -> list[str]:
    """Provider IDs that currently have credentials — names only, never key values."""
    names = [spec.id for spec in PROVIDERS if spec.api_key()]
    names += [name for name, module in _OPTIONAL_PROVIDERS if module.is_configured()]
    return names


async def complete(prompt: str, system: str = "", max_tokens: int = 1024) -> LLMResult:
    """Complete a prompt with the first model in the fallback chain that answers."""
    deadline = time.monotonic() + _BUDGET_SECONDS
    # Client-facing summary only (provider/model/status) — upstream bodies stay in server logs
    last_failure = "no LLM provider is configured"

    def out_of_time() -> bool:
        return time.monotonic() >= deadline

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        for spec in PROVIDERS:
            api_key = spec.api_key()
            if not api_key:
                continue
            for model in spec.models:
                if out_of_time():
                    break
                result = await openai_compat.chat(client, spec, api_key, model, prompt, system, max_tokens)
                if isinstance(result, LLMResult):
                    logger.info("LLM via %s/%s (%dms)", result.provider, result.model_used, result.latency_ms)
                    return result
                last_failure = _summary(result)
                logger.warning("LLM %s: %s", last_failure, result.message)
                if result.action == "next_provider":
                    break

    for name, module in _OPTIONAL_PROVIDERS:
        if out_of_time() or not module.is_configured():
            continue
        try:
            result = await module.complete(prompt, system, max_tokens)
            logger.info("LLM via %s/%s (%dms)", result.provider, result.model_used, result.latency_ms)
            return result
        except Exception as exc:
            last_failure = f"{name} failed ({type(exc).__name__})"
            logger.warning("LLM %s", last_failure)

    if out_of_time():
        last_failure = f"time budget of {_BUDGET_SECONDS:.0f}s exhausted after {last_failure}"
    raise RuntimeError(f"All LLM providers failed. Last error: {last_failure}")


def _summary(failure: ChatFailure) -> str:
    status = failure.status if failure.status is not None else "network"
    return f"{failure.provider}/{failure.model} failed ({status})"
