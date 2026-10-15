"""Generic OpenAI-compatible chat client — one function for every registry provider.

Never raises on a provider failure: returns LLMResult or ChatFailure, so the router can
silently move to the next model / provider (docs/LLM_MODEL_SELECTION.md, Layer 2).
"""

from __future__ import annotations
import re
import time
from dataclasses import dataclass
from typing import Literal

import httpx

from app.llm.registry import ModelSpec, ProviderSpec
from app.llm.types import LLMResult

REASONING_HEADROOM_TOKENS = 1024

# Bad key / exhausted credits apply to the whole key — try the next provider.
# 429 is deliberately not here: free-tier limits are per model (verified live on
# OpenRouter :free and Groq), so a sibling model usually still answers.
_SKIP_PROVIDER_STATUSES = {401, 402, 403}

_THINK_BLOCK = re.compile(r"<think>.*?</think>", re.DOTALL | re.IGNORECASE)


@dataclass(frozen=True)
class ChatFailure:
    # next_model: this model failed; next_provider: the provider/key is unusable right now
    action: Literal["next_model", "next_provider"]
    provider: str
    model: str
    status: int | None
    message: str


def strip_reasoning(text: str) -> str:
    """Drop inline <think> blocks (and a dangling closing tag) some open models emit."""
    text = _THINK_BLOCK.sub("", text)
    if "</think>" in text:
        text = text.split("</think>", 1)[1]
    return text.strip()


async def chat(
    client: httpx.AsyncClient,
    provider: ProviderSpec,
    api_key: str,
    model: ModelSpec,
    prompt: str,
    system: str,
    max_tokens: int,
) -> LLMResult | ChatFailure:
    messages = [{"role": "user", "content": prompt}]
    if system:
        messages.insert(0, {"role": "system", "content": system})

    body = {
        **provider.params,
        **model.params,
        "model": model.id,
        "messages": messages,
        "max_tokens": max_tokens + (REASONING_HEADROOM_TOKENS if model.reasoning else 0),
    }

    def failure(action: Literal["next_model", "next_provider"], status: int | None, message: str) -> ChatFailure:
        return ChatFailure(action, provider.id, model.id, status, message[:300])

    start = time.monotonic()
    try:
        resp = await client.post(
            f"{provider.base_url}/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", **provider.headers},
            json=body,
        )
    except httpx.HTTPError as exc:
        return failure("next_model", None, f"{type(exc).__name__}: {exc}")

    if resp.status_code in _SKIP_PROVIDER_STATUSES:
        return failure("next_provider", resp.status_code, resp.text)
    if resp.status_code >= 400:
        # 429 per-model limit, 404/410 rotated model, 408/5xx upstream, 400/422 param rejection
        return failure("next_model", resp.status_code, resp.text)

    try:
        content = resp.json()["choices"][0]["message"].get("content") or ""
    except (ValueError, KeyError, IndexError, TypeError) as exc:
        return failure("next_model", resp.status_code, f"Malformed response: {exc}")

    text = strip_reasoning(content)
    if not text:
        return failure("next_model", resp.status_code, "Empty completion")

    latency_ms = int((time.monotonic() - start) * 1000)
    return LLMResult(text=text, model_used=model.id, provider=provider.id, latency_ms=latency_ms)
