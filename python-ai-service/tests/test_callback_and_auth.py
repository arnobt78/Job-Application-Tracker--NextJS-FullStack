"""Tests for the ARQ → Next.js callback payload and the shared internal-secret check."""

from __future__ import annotations
import json
import logging

import httpx
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.tasks import pipeline_task


@pytest.fixture
def captured(monkeypatch: pytest.MonkeyPatch):
    """Route the callback's httpx client through a mock transport; return captured requests."""

    def install(status: int = 200) -> list[httpx.Request]:
        seen: list[httpx.Request] = []

        def handler(request: httpx.Request) -> httpx.Response:
            seen.append(request)
            return httpx.Response(status, json={"ok": status < 400})

        real_client = httpx.AsyncClient
        monkeypatch.setattr(
            pipeline_task.httpx,
            "AsyncClient",
            lambda **kwargs: real_client(transport=httpx.MockTransport(handler), **kwargs),
        )
        return seen

    monkeypatch.setenv("NEXT_APP_URL", "https://app.test")
    monkeypatch.setenv("AI_SERVICE_SECRET", "s3cret")
    return install


@pytest.mark.asyncio
async def test_callback_posts_nested_pipeline_result(captured) -> None:
    seen = captured()
    result = {
        "job_id": "job-1",
        "fit_score": {"score": 82, "reasoning": "Strong backend match."},
        "cover_letter": {"text": "Dear team", "word_count": 2},
        "interview_angles": [{"question": "Q?", "angle": "A."}],
        "summary": "Good fit.",
        "meta": {},
    }
    await pipeline_task._notify_complete("job-1", "user-1", result)

    assert len(seen) == 1
    request = seen[0]
    assert str(request.url) == "https://app.test/api/internal/ai-complete"
    assert request.headers["X-Internal-Secret"] == "s3cret"
    body = json.loads(request.content)
    assert body == {"job_id": "job-1", "user_id": "user-1", "result": result}


@pytest.mark.asyncio
async def test_callback_logs_non_2xx_without_raising(captured, caplog) -> None:
    captured(status=500)
    with caplog.at_level(logging.ERROR, logger=pipeline_task.__name__):
        await pipeline_task._notify_complete("job-1", "user-1", {})
    assert "returned 500" in caplog.text


def test_internal_routes_fail_closed_without_secret(monkeypatch) -> None:
    monkeypatch.delenv("AI_SERVICE_SECRET", raising=False)
    client = TestClient(app)
    res = client.post("/skill-gap", json={"job_description": "x", "user_skills": ["Python"]})
    assert res.status_code == 503


def test_internal_routes_reject_wrong_secret(monkeypatch) -> None:
    monkeypatch.setenv("AI_SERVICE_SECRET", "right")
    client = TestClient(app)
    res = client.post(
        "/skill-gap",
        json={"job_description": "x", "user_skills": ["Python"]},
        headers={"X-Internal-Secret": "wrong"},
    )
    assert res.status_code == 401


def test_health_is_public_and_lists_provider_names_only(monkeypatch) -> None:
    monkeypatch.delenv("AI_SERVICE_SECRET", raising=False)
    monkeypatch.setenv("GROQ_API_KEY", "gsk_test_value")
    res = TestClient(app).get("/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert "groq" in body["llm_providers"]
    assert "gsk_test_value" not in res.text
