"""Tests for the LLM fallback router.

All provider clients are mocked so no real API calls are made.
"""

from __future__ import annotations
import pytest
from unittest.mock import AsyncMock, patch
from app.llm.types import LLMResult
from app.llm import router


FAKE_RESULT = LLMResult(text="hello", model_used="test", provider="mock", latency_ms=10)


@pytest.mark.asyncio
async def test_uses_ollama_when_available() -> None:
    with patch.object(router, "_PROVIDERS", [("ollama", AsyncMock(complete=AsyncMock(return_value=FAKE_RESULT)))]):
        result = await router.complete("test prompt")
    assert result.provider == "mock"
    assert result.text == "hello"


@pytest.mark.asyncio
async def test_falls_back_to_groq_when_ollama_fails() -> None:
    ollama = AsyncMock(complete=AsyncMock(side_effect=RuntimeError("ollama down")))
    groq = AsyncMock(complete=AsyncMock(return_value=FAKE_RESULT))
    with patch.object(router, "_PROVIDERS", [("ollama", ollama), ("groq", groq)]):
        result = await router.complete("test prompt")
    assert result.text == "hello"


@pytest.mark.asyncio
async def test_raises_when_all_providers_fail() -> None:
    failing = AsyncMock(complete=AsyncMock(side_effect=RuntimeError("down")))
    with patch.object(router, "_PROVIDERS", [("p1", failing), ("p2", failing)]):
        with pytest.raises(RuntimeError, match="All LLM providers failed"):
            await router.complete("test prompt")


@pytest.mark.asyncio
async def test_skips_remaining_providers_after_first_success() -> None:
    """Provider 1 succeeds — provider 2 should never be called."""
    p1 = AsyncMock(complete=AsyncMock(return_value=FAKE_RESULT))
    p2 = AsyncMock(complete=AsyncMock(return_value=FAKE_RESULT))
    with patch.object(router, "_PROVIDERS", [("p1", p1), ("p2", p2)]):
        await router.complete("test")
    p1.complete.assert_called_once()
    p2.complete.assert_not_called()
