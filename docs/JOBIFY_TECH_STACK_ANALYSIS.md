# Jobify v2 — Tech Stack Analysis

**Version:** v1.0  
**Author:** Arnob Mahmud  
**Date:** 2026-06-19  
**Project:** Jobify — Intelligent Job Search & Application OS  
**Status:** Active Planning

---

## Table of Contents

1. [Current Stack (Existing)](#1-current-stack-existing)
2. [Phase 1 Additions — Bluedoor Enrichment](#2-phase-1-additions--bluedoor-enrichment)
3. [Phase 2 — Python AI Backend](#3-phase-2--python-ai-backend)
4. [LLM Provider Comparison](#4-llm-provider-comparison)
5. [Automation Layer (n8n)](#5-automation-layer-n8n)
6. [Infrastructure — Coolify VPS](#6-infrastructure--coolify-vps)
7. [Frontend New Features Stack](#7-frontend-new-features-stack)
8. [Database Schema Additions](#8-database-schema-additions)
9. [What NOT To Use](#9-what-not-to-use)
10. [Full Stack Summary](#10-full-stack-summary)

---

## 1. Current Stack (Existing)

The foundation. Phase 1 and 2 build on top — don't replace.

| Layer | Tool | Version | Notes |
|-------|------|---------|-------|
| Framework | Next.js | 16 | App Router, RSC, Server Actions |
| Runtime | React | 19 | Concurrent features |
| Auth | Clerk | 6 | Proxy middleware, `currentUser()` |
| ORM | Prisma | 6 | PostgreSQL driver |
| Database | PostgreSQL | 16 | Primary data store |
| Server cache | Redis | 7 | `unstable_cache` + tag-based invalidation |
| Client state | TanStack Query | 5 | `PersistQueryClient`, SSR hydration |
| Styling | Tailwind CSS | 3 | JIT, glass morphism design |
| Components | Shadcn/ui | latest | Radix primitives, owned code |
| Monitoring | Sentry | 8 | Error + performance |
| Analytics | PostHog | 3 | Session replay + events |
| Testing | Vitest | 2 | 49 tests, unit + integration |
| Deployment | Vercel | — | SSR + Edge |
| CI | GitHub Actions | — | lint → typecheck → test → build |

**Current data flow:**
```
Clerk auth → proxy.ts → /dashboard
Page: force-dynamic + prefetchQuery → dehydrate → PersistQueryClient
CRUD: Server Actions → invalidateAllJobQueries → broadcast cross-tab
Cache: unstable_cache + Redis + tag invalidation
```

---

## 2. Phase 1 Additions — Bluedoor Enrichment

Build inside Next.js. No new services.

### 2.1 Bluedoor API

| Property | Value |
|----------|-------|
| Base URL | `https://api.bluedoor.sh/job-postings/v1` |
| Auth | None (completely free, no API key required) |
| Rate limits | Very high (confirmed by Sam — OSS projects won't hit ceiling) |
| Coverage | 1.8M jobs · 60k+ companies · US-primary |
| Sources | Greenhouse, Lever, Ashby, Workday, 30+ ATS providers |
| Refresh | Daily |
| Webhooks | Yes — `job.created`, `job.updated`, `job.closed`, `job.reopened` |

**Key endpoints used:**

| Endpoint | Purpose |
|----------|---------|
| `POST /v1/jobs/search` | Discovery search + enrich lookup by company/title |
| `GET /v1/jobs/{job_id}` | Full job detail with description |
| `GET /v1/jobs/{job_id}/events` | Lifecycle history for a tracked job |
| `GET /v1/jobs/facets` | Live filter counts (remote count, location counts) |
| `POST /v1/webhook_endpoints` | Register Next.js webhook receiver |
| `POST /v1/subscriptions` | Subscribe to events for a specific job_id |
| `GET /v1/orgs/lookup` | Company info enrichment |

**Join strategy (priority):**
1. Exact `apply_url` / `source_url` match
2. ATS key extracted from URL (`gh_jid=`, Lever UUID, Ashby card ID)
3. Fuzzy: `company + title + location` with threshold

### 2.2 Email — Resend

| Property | Value |
|----------|-------|
| Free tier | 3,000 emails/month |
| SDK | `resend` npm package |
| Template system | React Email (JSX templates) |
| Use cases | Posting closed alerts · Salary added alerts · Weekly digest |

**Why Resend over SendGrid / Mailgun:**
- Cleaner API, React Email native integration
- Free tier sufficient for OSS solo product
- Better deliverability than free Mailchimp

### 2.3 Scheduled Enrichment Sync

| Option | Free? | Notes |
|--------|-------|-------|
| Vercel Cron (in `vercel.json`) | Yes (hobby: 1 cron/day) | Simple, no extra service |
| n8n cron (Phase 2) | Yes (self-hosted) | More flexible, visual |

Phase 1: Vercel Cron. Phase 2: migrate to n8n.

### 2.4 Phase 1 New Dependencies

```json
{
  "resend": "^4.x",
  "@react-email/components": "^0.x",
  "bluedoor": "no SDK — raw fetch client"
}
```

---

## 3. Phase 2 — Python AI Backend

Separate FastAPI service on Coolify VPS. Next.js calls it via internal HTTP.

### 3.1 Framework

| Tool | Version | Why |
|------|---------|-----|
| Python | 3.12+ | Latest stable, async support |
| FastAPI | 0.115+ | Fastest Python API framework, async native, auto OpenAPI docs |
| Pydantic | v2 | Input validation, serialization, strict types |
| uvicorn | latest | ASGI server, production-ready |
| httpx | latest | Async HTTP client for LLM provider calls |

**Why FastAPI over Flask / Django:**
- Async-first (critical for LLM streaming)
- Auto Swagger UI (great for debugging 9-agent pipeline)
- Pydantic v2 integration (typed agent I/O)
- Python 3.12 type hints native

### 3.2 LLM Orchestration

| Tool | Role | Why |
|------|------|-----|
| Ollama | Local LLM server | Free, private, runs on VPS GPU/CPU |
| `ollama` Python client | Ollama API calls | Official library |
| `langchain-community` | Optional agent patterns | Good for chain primitives — use if helpful, skip if overkill |
| `httpx` (async) | Direct API calls for Groq/OpenRouter | More control than SDK wrappers |
| `anthropic` SDK | Claude fallback | Official SDK |
| `groq` SDK | Groq fallback | Official SDK |

**LangChain stance:** Use selectively. Full LangChain abstractions often create debugging pain. Use raw Ollama client + httpx for primary path; pull in LangChain only for specific utilities (text splitter, prompt templates).

### 3.3 Local Ollama Models

All run on VPS. Order = quality vs speed tradeoff.

| Model | Size | Speed | Quality | Use case |
|-------|------|-------|---------|----------|
| `llama3.2:8b` | 5GB | Medium | High | Primary — best quality/speed |
| `mistral:7b` | 4.1GB | Medium | High | Fallback 2 — great reasoning |
| `gemma2:9b` | 5.5GB | Slow | Highest | Fallback 3 — best output quality |
| `phi3:3.8b` | 2.2GB | Fast | Good | Quick tasks — digest, scoring |
| `llama3.2:3b` | 2GB | Fastest | OK | Emergency fast path |

**VPS RAM requirement:** 16GB minimum to run 1-2 models simultaneously. 32GB recommended for parallel pipeline.

### 3.4 Cloud LLM Fallbacks

| Provider | Free Tier | Models | Rate limit |
|----------|-----------|--------|------------|
| **Groq** | Yes — free | llama-3.1-8b-instant, gemma2-9b-it, mixtral-8x7b | 14,400 tok/min |
| **OpenRouter** | Yes — free models | mistral-7b-instruct:free, gemma-2-9b:free, phi-3-mini:free | Varies |
| **Anthropic** | No — paid | claude-haiku-4-5-20251001 | Pay per token |

**Groq vs OpenRouter:** Groq is faster (purpose-built inference chips). OpenRouter has more model variety. Use both as fallbacks.

### 3.5 Async Task Queue

| Tool | Why | Free? |
|------|-----|-------|
| **ARQ** (Redis-backed) | Lightweight async job queue, Python, Redis native | Yes |
| **Celery + Redis** | More powerful, more complex | Yes |
| **FastAPI BackgroundTasks** | For quick non-queued tasks | Built-in |

Recommendation: **ARQ** for Phase 2. Simple, async, Redis-backed (Redis already in stack). Celery only if job volume grows.

---

## 4. LLM Provider Comparison

Full comparison for decision-making:

| Provider | Hosting | Cost | Privacy | Speed | Models | Use in Chain |
|----------|---------|------|---------|-------|--------|-------------|
| Ollama (llama3.2:8b) | Self (VPS) | Free | Perfect | Medium | llama3.2, mistral, gemma2, phi3 | Priority 1-5 |
| Groq | Cloud | Free tier | Data sent to US | Very fast | llama3.1-8b, gemma2-9b | Priority 6-7 |
| OpenRouter | Cloud | Free models | Data sent to providers | Varies | mistral, gemma, phi3 | Priority 8-9 |
| Claude Haiku | Cloud | ~$0.001/1k tok | Anthropic policy | Fast | claude-haiku-4-5 | Last resort |
| GPT-4o-mini | Cloud | Paid | OpenAI policy | Fast | gpt-4o-mini | Skip — not needed |
| Together AI | Cloud | Free tier | Data sent | Fast | Various OSS | Alternative to Groq |
| Fireworks AI | Cloud | Free tier | Data sent | Very fast | llama3, mixtral | Alternative to Groq |

**Recommendation:** Ollama primary → Groq → OpenRouter → Claude Haiku. Covers all scenarios, mostly free.

---

## 5. Automation Layer (n8n)

Self-hosted on Coolify. Free.

### 5.1 What is n8n

Visual workflow automation (like Zapier, but self-hosted and free). Nodes connect triggers to actions. JavaScript custom code in nodes when needed.

### 5.2 n8n vs alternatives

| Tool | Cost | Self-host | Visual | Verdict |
|------|------|-----------|--------|---------|
| **n8n** | Free (self-host) | Yes | Yes | **USE — fits Coolify VPS** |
| Zapier | $20+/mo | No | Yes | Skip — paid |
| Make (Integromat) | $9+/mo | No | Yes | Skip — paid |
| Prefect | Free tier | Yes | Yes | Overkill — Python-first |
| Airflow | Free | Yes | Yes | Heavy — overkill |
| Custom cron scripts | Free | Yes | No | OK fallback, less maintainable |

### 5.3 Key n8n Flows

**Flow 1: Daily Job Discovery Digest**
```
Cron (8am) → Fetch user profiles (PostgreSQL node)
  → For each user: Bluedoor search (HTTP node, user profile params)
  → FastAPI Analyzer (HTTP node: POST /pipeline/analyze)
  → Filter top 5 matches
  → Resend email (HTTP node)
  → Log to DB (PostgreSQL node)
```

**Flow 2: Enrichment Sync**
```
Cron (2am nightly) → Fetch all jobs with bluedoor_job_id (PostgreSQL)
  → Batch GET /v1/jobs/{id} calls (Bluedoor)
  → Compare status, hash, salary
  → If changed: UPDATE DB + emit Next.js SSE event (HTTP node)
```

**Flow 3: Interview Prep Auto-Trigger**
```
PostgreSQL trigger (status changed to 'interview') → webhook
  → n8n receives webhook
  → FastAPI POST /pipeline/run (full 9-agent)
  → Store result in DB
  → Resend email "Your interview prep is ready"
```

**Flow 4: Stale Application Check**
```
Cron (Sunday 9am) → Query apps: status unchanged 30+ days (PostgreSQL)
  → FastAPI: generate follow-up email draft (POST /pipeline/draft-followup)
  → Store draft in DB
  → Notify user in-app + email
```

### 5.4 n8n + Next.js Integration

Next.js exposes internal API endpoints that n8n calls:
- `POST /api/internal/enrich-job` — trigger enrichment for job_id
- `POST /api/internal/notify` — push notification to user SSE stream
- `GET /api/internal/users/digest-eligible` — users who want daily digest

These routes protected by internal secret (`X-Internal-Secret` header, env var).

---

## 6. Infrastructure — Coolify VPS

### 6.1 Coolify Overview

Self-hosted PaaS. Like Railway/Render/Vercel but runs on your own VPS. Free to use (you pay VPS cost only).

| Feature | Value |
|---------|-------|
| VPS provider | Hetzner (existing, per HETZNER_VPS_MIGRATION_GUIDE.md) |
| Management UI | Coolify web dashboard |
| Container runtime | Docker |
| SSL | Auto via Let's Encrypt |
| Domains | Custom domain per service |
| Deployment | Git push → auto build → deploy |

### 6.2 Services on Coolify VPS

```
Coolify VPS
├── jobify-web (Next.js)           — main app
├── jobify-ai (FastAPI)            — AI pipeline service
├── jobify-db (PostgreSQL)         — shared DB
├── jobify-redis (Redis)           — cache + job queue
├── jobify-ollama (Ollama)         — local LLM server
├── jobify-n8n (n8n)               — automation
└── jobify-smtp (optional Mailhog) — dev email testing
```

### 6.3 Hetzner VPS Sizing

| Plan | RAM | CPU | Storage | Cost/mo | Sufficient for |
|------|-----|-----|---------|---------|----------------|
| CX31 | 8GB | 2 | 80GB SSD | €8.9 | Phase 1 only (no Ollama) |
| CX41 | 16GB | 4 | 160GB SSD | €17.9 | Phase 2 with Ollama 7B models |
| CX51 | 32GB | 8 | 240GB SSD | €34.9 | Phase 2 with 13B models + n8n + all services |

**Recommendation for Phase 2:** CX41 minimum. CX51 if running concurrent LLM calls.

### 6.4 Service Communication

```
Next.js (internal)
  → FastAPI: http://jobify-ai:8000 (Docker network — no egress)
  → PostgreSQL: postgresql://jobify-db:5432
  → Redis: redis://jobify-redis:6379

n8n (internal)
  → Next.js: http://jobify-web:3000/api/internal/...
  → FastAPI: http://jobify-ai:8000/...
  → PostgreSQL: direct node

Ollama (internal)
  → FastAPI calls: http://jobify-ollama:11434
```

---

## 7. Frontend New Features Stack

New UI components/libraries for Phase 1 + 2 features.

| Feature | Tool | Notes |
|---------|------|-------|
| Job discovery search | Existing filter pattern (TanStack Query) | Extend current filter bar |
| Infinite scroll | `@tanstack/react-virtual` or native Intersection Observer | Bluedoor cursor pagination |
| AI output streaming | `ReadableStream` via fetch / Vercel AI SDK | FastAPI SSE → Next.js |
| Markdown rendering | `react-markdown` + `remark-gfm` | Cover letter / AI output |
| Syntax highlighting | `shiki` | Code in JD descriptions |
| Notification center | Custom SSE-fed component (existing SSE infra) | Bell icon in navbar |
| Company logos | Clearbit Logo API (free) or `logo.dev` (free) | Company name → logo URL |
| Job card status badges | Tailwind + Framer Motion | Animated status change |
| AI progress indicator | Framer Motion steps component | 9-agent pipeline progress |
| Salary range display | Custom range component | Min/max with currency |

**Company logos:** `https://logo.dev/img/logos/{domain}.png` — free, no API key, domain-based.

### 7.1 AI Output UI Pattern

Stream FastAPI response to UI via Server-Sent Events:
```
User clicks "Generate AI Insights"
  → Next.js API route opens SSE to FastAPI
  → FastAPI streams: agent progress events + final JSON
  → UI shows: animated pipeline progress (agents 1-9 completing)
  → Final output rendered as rich card (fit score, cover letter tabs)
```

---

## 8. Database Schema Additions

New Prisma model fields for Phase 1. Phase 2 adds AI output tables.

### 8.1 Phase 1 — Enrich Job model

```prisma
model Job {
  // ... existing fields ...

  // Bluedoor enrichment
  bluedoorJobId         String?   @map("bluedoor_job_id")
  bluedoorSyncedAt      DateTime? @map("bluedoor_synced_at")
  bluedoorStatus        String?   @map("bluedoor_status")  // active | expired | unknown
  bluedoorProvider      String?   @map("bluedoor_provider") // greenhouse | lever | ashby
  bluedoorSalaryMin     Float?    @map("bluedoor_salary_min")
  bluedoorSalaryMax     Float?    @map("bluedoor_salary_max")
  bluedoorSalaryCurrency String?  @map("bluedoor_salary_currency")
  bluedoorWorkplaceType String?   @map("bluedoor_workplace_type") // remote | hybrid | on_site
  bluedoorDescHash      String?   @map("bluedoor_desc_hash")
  bluedoorSourceUrl     String?   @map("bluedoor_source_url")
  bluedoorApplyUrl      String?   @map("bluedoor_apply_url")
  bluedoorWebhookSubId  String?   @map("bluedoor_webhook_sub_id")

  // Change tracking
  statusChangedAt       DateTime? @map("status_changed_at")
  lastCheckedAt         DateTime? @map("last_checked_at")
}
```

### 8.2 Phase 2 — AI Outputs

```prisma
model JobAIInsight {
  id              String   @id @default(cuid())
  jobId           String   @map("job_id")
  job             Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)
  createdAt       DateTime @default(now())
  
  // Pipeline metadata
  modelUsed       String   @map("model_used")
  pipelineMs      Int      @map("pipeline_ms")
  confidenceScore Float    @map("confidence_score")
  
  // Agent outputs
  fitScore        Float    @map("fit_score")      // 0.0 - 1.0
  skillsMatched   Json     @map("skills_matched") // string[]
  skillsGap       Json     @map("skills_gap")     // string[]
  
  // Generated content
  coverLetterDraft   String? @map("cover_letter_draft")
  resumeBullets      Json?   @map("resume_bullets")   // string[]
  interviewAngles    Json?   @map("interview_angles") // string[]
  interviewPrepNotes String? @map("interview_prep_notes")
  
  // Validation
  validatorPassed Boolean @map("validator_passed")
  finalBossScore  Float   @map("final_boss_score") // 0.0 - 1.0
  humanReviewFlag Boolean @default(false) @map("human_review_flag")

  @@map("job_ai_insights")
}

model UserProfile {
  id              String   @id @default(cuid())
  clerkUserId     String   @unique @map("clerk_user_id")
  
  // For AI matching
  skills          Json     // string[]
  experience      String?  // free text or structured
  targetRoles     Json     // string[]
  targetLocations Json     // string[]
  targetSalaryMin Float?   @map("target_salary_min")
  preferRemote    Boolean  @default(false) @map("prefer_remote")
  
  // Digest preferences
  digestEnabled   Boolean  @default(true) @map("digest_enabled")
  digestTime      String   @default("08:00") @map("digest_time")
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("user_profiles")
}
```

---

## 9. What NOT To Use

| Tool | Why Skip |
|------|----------|
| LangChain (full) | Too much abstraction, hard to debug agent failures. Use raw clients + selective LangChain utilities |
| LangGraph | Overkill for linear 9-agent pipeline. Custom orchestrator is simpler and debuggable |
| AutoGen / CrewAI | Experimental, unpredictable, hard to control output format |
| GPT-4 / GPT-4o | Paid, not needed — Ollama + Groq covers use cases |
| Pinecone / Weaviate | Vector DB not needed in Phase 2. Add only if building semantic job search later |
| Kafka / RabbitMQ | Message queue overkill. Redis + ARQ sufficient |
| Kubernetes | VPS Coolify + Docker Compose is sufficient at this scale |
| Airflow | Heavy data pipeline tool. n8n is simpler and visual |
| Django | Full ORM framework unnecessary — FastAPI + raw SQL or SQLAlchemy for AI service |
| Scrapy | Not scraping — using official Bluedoor API |
| Selenium | Not automating browser — not auto-applying |
| Multiple databases | Keep single PostgreSQL. AI service connects to same DB as Next.js |
| WebSockets (new) | Existing SSE infrastructure handles real-time. No need for WS |

---

## 10. Full Stack Summary

### Phase 1 Stack

| Layer | Tool | Free? |
|-------|------|-------|
| Frontend | Next.js 16 + React 19 | Yes |
| Auth | Clerk 6 | Free tier |
| Database | PostgreSQL + Prisma 6 | Yes |
| Cache | Redis 7 | Yes |
| Client state | TanStack Query 5 + Persist | Yes |
| Job data | Bluedoor API | Yes — confirmed |
| Email alerts | Resend + React Email | Yes (3k/mo) |
| Scheduled sync | Vercel Cron | Yes (hobby: 1/day) |
| Monitoring | Sentry | Free tier |
| Deployment | Vercel | Free hobby |
| CI | GitHub Actions | Free |

### Phase 2 Stack (additions)

| Layer | Tool | Free? |
|-------|------|-------|
| AI service | FastAPI + Python 3.12 | Yes |
| Local LLM | Ollama | Yes |
| LLM models | llama3.2:8b, mistral:7b, gemma2:9b, phi3 | Yes |
| LLM fallback 1 | Groq (14k tok/min free) | Yes |
| LLM fallback 2 | OpenRouter (free models) | Yes |
| LLM fallback 3 | Claude Haiku | Paid (cheap) |
| Task queue | ARQ + Redis | Yes |
| Automation | n8n (self-hosted) | Yes |
| Container PaaS | Coolify (self-hosted) | Yes |
| VPS | Hetzner CX41 | ~€18/mo |
| Email (more volume) | Resend | Yes (3k/mo) |

### Tech Decisions Rationale

| Decision | Rationale |
|----------|-----------|
| FastAPI over Django/Flask | Async-first for LLM streaming, auto-docs, Pydantic v2 |
| Ollama primary | Privacy, free, no rate limits, runs on VPS |
| Groq as first cloud fallback | Fastest inference (custom chips), free tier generous |
| OpenRouter as second fallback | More free model variety |
| n8n over custom cron scripts | Visual debugging, no-code modifications, webhook support |
| ARQ over Celery | Simpler, async-native, Redis-backed, sufficient for Phase 2 |
| Bluedoor over scraping | Official API, free, legal, 1.8M jobs, webhooks |
| Single PostgreSQL | No multi-DB complexity, AI service reads same DB via Prisma or raw SQL |
| Resend over SendGrid | Better DX, React Email native, free tier sufficient |

---

_Document version: v1.0 — Update as Phase 1 implementation begins._  
_See also: [PROJECT_PLAN.md](./PROJECT_PLAN.md) for full roadmap and architecture._
