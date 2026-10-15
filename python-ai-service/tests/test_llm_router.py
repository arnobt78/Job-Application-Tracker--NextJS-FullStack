"""Tests for the registry-driven LLM fallback router.

HTTP is served by httpx.MockTransport — no real API calls are made.
"""

from __future__ import annotations
import json
from typing import Callable

import httpx
import pytest

from app.llm import router
from app.llm.openai_compat import strip_reasoning
from app.llm.registry import ModelSpec, ProviderSpec

Handler = Callable[[httpx.Request], httpx.Response]

P1 = ProviderSpec("p1", "P1_KEY", "https://p1.test/v1", (ModelSpec("p1-a"), ModelSpec("p1-b")))
P2 = ProviderSpec("p2", "P2_KEY", "https://p2.test/v1", (ModelSpec("p2-a", {"reasoning_effort": "low"}, reasoning=True),))


def ok(text: str) -> httpx.Response:
    return httpx.Response(200, json={"choices": [{"message": {"content": text}}]})


@pytest.fixture
def calls(monkeypatch: pytest.MonkeyPatch) -> Callable[[Handler], list[dict]]:
    """Install a mock transport + two fake providers; returns the captured request bodies."""
    monkeypatch.setattr(router, "PROVIDERS", (P1, P2))
    monkeypatch.setenv("P1_KEY", "k1")
    monkeypatch.setenv("P2_KEY", "k2")
    for key in ("OLLAMA_BASE_URL", "ANTHROPIC_API_KEY"):
        monkeypatch.delenv(key, raising=False)

    def install(handler: Handler) -> list[dict]:
        seen: list[dict] = []

        def wrapped(request: httpx.Request) -> httpx.Response:
            seen.append({"host": request.url.host, **json.loads(request.content)})
            return handler(request)

        real_client = httpx.AsyncClient
        monkeypatch.setattr(
            router.httpx,
            "AsyncClient",
            lambda **kwargs: real_client(transport=httpx.MockTransport(wrapped), **kwargs),
        )
        return seen

    return install


@pytest.mark.asyncio
async def test_first_model_answers(calls) -> None:
    seen = calls(lambda _: ok("hello"))
    result = await router.complete("prompt", "system")
    assert (result.provider, result.model_used, result.text) == ("p1", "p1-a", "hello")
    assert len(seen) == 1
    assert seen[0]["messages"][0] == {"role": "system", "content": "system"}


@pytest.mark.asyncio
async def test_rotated_model_falls_to_next_model_same_provider(calls) -> None:
    seen = calls(lambda req: httpx.Response(404) if json.loads(req.content)["model"] == "p1-a" else ok("b"))
    result = await router.complete("prompt")
    assert result.model_used == "p1-b"
    assert [c["model"] for c in seen] == ["p1-a", "p1-b"]


@pytest.mark.parametrize("status", [401, 402, 403])
@pytest.mark.asyncio
async def test_key_or_credit_errors_skip_rest_of_provider(calls, status: int) -> None:
    seen = calls(lambda req: httpx.Response(status) if req.url.host == "p1.test" else ok("from p2"))
    result = await router.complete("prompt")
    assert result.provider == "p2"
    assert [c["model"] for c in seen] == ["p1-a", "p2-a"]


@pytest.mark.asyncio
async def test_rate_limit_tries_sibling_model_first(calls) -> None:
    seen = calls(lambda req: httpx.Response(429) if json.loads(req.content)["model"] == "p1-a" else ok("b"))
    result = await router.complete("prompt")
    assert result.model_used == "p1-b"
    assert [c["model"] for c in seen] == ["p1-a", "p1-b"]


@pytest.mark.asyncio
async def test_empty_answer_and_5xx_try_next_model(calls) -> None:
    responses = iter([ok("   "), httpx.Response(503), ok("final")])
    result_seen = calls(lambda _: next(responses))
    result = await router.complete("prompt")
    assert result.text == "final"
    assert [c["model"] for c in result_seen] == ["p1-a", "p1-b", "p2-a"]


@pytest.mark.asyncio
async def test_timeout_tries_next_model(calls) -> None:
    def handler(req: httpx.Request) -> httpx.Response:
        if json.loads(req.content)["model"] == "p1-a":
            raise httpx.ReadTimeout("slow", request=req)
        return ok("fast")

    calls(handler)
    assert (await router.complete("prompt")).model_used == "p1-b"


@pytest.mark.asyncio
async def test_missing_key_skips_provider_without_request(calls, monkeypatch) -> None:
    monkeypatch.delenv("P1_KEY")
    seen = calls(lambda _: ok("p2 answer"))
    result = await router.complete("prompt")
    assert result.provider == "p2"
    assert {c["host"] for c in seen} == {"p2.test"}


@pytest.mark.asyncio
async def test_reasoning_model_gets_headroom_and_params(calls) -> None:
    seen = calls(lambda req: httpx.Response(401) if req.url.host == "p1.test" else ok("x"))
    await router.complete("prompt", max_tokens=100)
    p2_body = seen[-1]
    assert p2_body["reasoning_effort"] == "low"
    assert p2_body["max_tokens"] > 100


@pytest.mark.asyncio
async def test_raises_when_every_model_fails(calls) -> None:
    calls(lambda _: httpx.Response(500))
    with pytest.raises(RuntimeError, match="All LLM providers failed"):
        await router.complete("prompt")


@pytest.mark.asyncio
async def test_error_message_excludes_upstream_body(calls) -> None:
    calls(lambda _: httpx.Response(500, text="upstream-internal-detail"))
    with pytest.raises(RuntimeError) as excinfo:
        await router.complete("prompt")
    assert "p2/p2-a failed (500)" in str(excinfo.value)
    assert "upstream-internal-detail" not in str(excinfo.value)


@pytest.mark.asyncio
async def test_stops_when_time_budget_is_spent(calls, monkeypatch) -> None:
    monkeypatch.setattr(router, "_BUDGET_SECONDS", 0.0)
    seen = calls(lambda _: ok("never"))
    with pytest.raises(RuntimeError, match="time budget"):
        await router.complete("prompt")
    assert seen == []


@pytest.mark.asyncio
async def test_raises_when_nothing_configured(calls, monkeypatch) -> None:
    monkeypatch.delenv("P1_KEY")
    monkeypatch.delenv("P2_KEY")
    seen = calls(lambda _: ok("never"))
    with pytest.raises(RuntimeError, match="no LLM provider is configured"):
        await router.complete("prompt")
    assert seen == []


def test_configured_providers_lists_names_only(calls, monkeypatch) -> None:
    monkeypatch.delenv("P2_KEY")
    assert router.configured_providers() == ["p1"]


def test_strip_reasoning_removes_think_blocks() -> None:
    assert strip_reasoning("<think>plan</think>\nAnswer") == "Answer"
    assert strip_reasoning("leaked plan</think>Answer") == "Answer"
    assert strip_reasoning("Plain") == "Plain"
