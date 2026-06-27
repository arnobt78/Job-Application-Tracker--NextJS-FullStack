# Phase 2 Python AI Service — FastAPI + 9-Agent Pipeline Scaffold

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the full Python AI backend service: FastAPI app, 9-agent pipeline, LLM fallback chain (Ollama → Groq → OpenRouter → Claude Haiku), Docker, and Next.js integration route.

**Architecture:** Self-contained `python-ai-service/` directory at repo root. FastAPI exposes `POST /pipeline/run`. Each of 9 agents is a focused module. LLM router tries providers in priority order. Next.js calls FastAPI via an API route proxy + TanStack Query hook.

**Tech Stack:** Python 3.12, FastAPI, Pydantic v2, httpx (async), Ollama REST, Groq SDK, OpenRouter HTTP, Anthropic SDK, Docker, uvicorn.

## Global Constraints

- Python 3.12+ only.
- All agents are pure functions / classes — no shared mutable state.
- LLM fallback chain: Ollama (local) → Groq → OpenRouter → Claude Haiku. Never skip to cloud if local works.
- FastAPI endpoint must return within 30s (timeout in Next.js proxy).
- `POST /pipeline/run` requires `X-Internal-Secret` header matching `AI_SERVICE_SECRET` env var.
- Next.js env: `AI_SERVICE_URL` (default `http://localhost:8000`), `AI_SERVICE_SECRET`.
- `RESEND_API_KEY` absent = graceful no-op (already in Phase 1).
- Follow existing Next.js architecture: force-dynamic, SSR prefetch, invalidation on CRUD.
- Python: `ruff` for linting, `pytest` for tests.

---

### Task 6: Python Service Directory Scaffold + FastAPI App

**Files (all new under `python-ai-service/`):**
- `python-ai-service/app/main.py` — FastAPI app, CORS, health, auth middleware
- `python-ai-service/app/models/job.py` — Pydantic job + profile models
- `python-ai-service/app/models/pipeline.py` — PipelineRequest / PipelineResponse
- `python-ai-service/app/api/routes/pipeline.py` — POST /pipeline/run
- `python-ai-service/app/api/routes/health.py` — GET /health
- `python-ai-service/requirements.txt`
- `python-ai-service/Dockerfile`
- `python-ai-service/docker-compose.yml`
- `python-ai-service/.env.example`
- `python-ai-service/README.md`

- [ ] Create directory tree
- [ ] Write `requirements.txt`
- [ ] Write `app/models/job.py` (Pydantic)
- [ ] Write `app/models/pipeline.py` (Pydantic request/response)
- [ ] Write `app/main.py` (FastAPI + CORS + auth middleware)
- [ ] Write `app/api/routes/health.py`
- [ ] Write `app/api/routes/pipeline.py`
- [ ] Write `Dockerfile`
- [ ] Write `docker-compose.yml`
- [ ] Write `.env.example`

---

### Task 7: LLM Router (Fallback Chain)

**Files:**
- New: `python-ai-service/app/llm/router.py` — try each provider in order
- New: `python-ai-service/app/llm/providers/ollama_client.py`
- New: `python-ai-service/app/llm/providers/groq_client.py`
- New: `python-ai-service/app/llm/providers/openrouter_client.py`
- New: `python-ai-service/app/llm/providers/anthropic_client.py`
- New: `python-ai-service/tests/test_llm_router.py`

**Interfaces:**
- `async def complete(prompt: str, system: str, max_tokens: int) -> LLMResult`
- `LLMResult(text: str, model_used: str, provider: str, latency_ms: int)`
- Fallback order: ollama → groq → openrouter → anthropic

- [ ] Create `app/llm/providers/__init__.py` + each provider client
- [ ] Create `app/llm/router.py` with priority fallback
- [ ] Write `tests/test_llm_router.py` (mock providers)
- [ ] Run `pytest tests/test_llm_router.py` — PASS

---

### Task 8: 9-Agent Pipeline

**Files (all new):**
- `python-ai-service/app/pipeline/orchestrator.py` — runs agents 1-9 in sequence
- `python-ai-service/app/pipeline/agents/extractor.py` (Agent 1)
- `python-ai-service/app/pipeline/agents/analyzer.py` (Agent 2)
- `python-ai-service/app/pipeline/agents/preprocessor.py` (Agent 3)
- `python-ai-service/app/pipeline/agents/optimizer.py` (Agent 4)
- `python-ai-service/app/pipeline/agents/synthesizer.py` (Agent 5 — LLM call)
- `python-ai-service/app/pipeline/agents/validator.py` (Agent 6)
- `python-ai-service/app/pipeline/agents/assembler.py` (Agent 7)
- `python-ai-service/app/pipeline/agents/view_formatter.py` (Agent 8)
- `python-ai-service/app/pipeline/agents/final_verifier.py` (Agent 9)
- `python-ai-service/tests/test_pipeline.py`

- [ ] Create each agent module with typed input/output
- [ ] Wire orchestrator to call agents 1→9, pass context forward
- [ ] Write `tests/test_pipeline.py` with mocked LLM
- [ ] Run `pytest tests/test_pipeline.py` — PASS

---

### Task 9: Next.js → FastAPI Integration

**Files:**
- New: `app/api/ai/pipeline/route.ts` — proxy to FastAPI, auth header
- New: `lib/ai/pipeline-client.ts` — typed fetch wrapper
- Modify: `lib/query-keys.ts` — add `ai.pipeline(jobId)`
- New: `hooks/useAIPipeline.ts` — TanStack Query mutation hook
- New: `components/jobs/ai-insights-panel.tsx` — shows fit score, cover letter, interview angles

- [ ] Create `app/api/ai/pipeline/route.ts`
- [ ] Create `lib/ai/pipeline-client.ts`
- [ ] Add `ai.pipeline` to `lib/query-keys.ts`
- [ ] Create `hooks/useAIPipeline.ts`
- [ ] Create `components/jobs/ai-insights-panel.tsx` (skeleton UI, wired to hook)
- [ ] Run lint + typecheck + test — PASS

---
