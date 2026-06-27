# Jobify v2 — Project Vision & Roadmap

**Author:** Arnob Mahmud  
**Date:** 2026-06-19  
**Status:** Planning  
**Stack:** Next.js 16 · React 19 · Clerk 6 · Prisma 6 · TanStack Query 5 · PostgreSQL · Redis · Python FastAPI · Ollama · n8n · Coolify VPS

---

## Vision

Transform Jobify from a manual job application tracker into a **full-stack intelligent job search OS** — combining live market data (Bluedoor API), AI-powered enrichment (local Ollama multi-agent pipeline), and n8n-style automation — while keeping users in control via human-in-the-loop review.

**Core principle:** Jobify stays an application CRM at heart. AI and automation augment the tracker — they don't replace user judgment.

---

## Architecture Overview

```bash
┌─────────────────────────────────────────────┐
│              Next.js Frontend               │
│  App Router · TanStack Query · Clerk · UI   │
└────────────────────┬────────────────────────┘
                     │ API Routes / Server Actions
        ┌────────────┼────────────────┐
        │            │                │
        ▼            ▼                ▼
  PostgreSQL     Bluedoor API     Python AI API
  (Prisma 6)   (free, no auth)   (FastAPI · Coolify)
                     │                │
               Job search       Ollama pipeline
               Enrichment       Multi-agent (9)
               Webhooks         n8n automation
                                     │
                          ┌──────────┴──────────┐
                          │   LLM Fallback Chain │
                          │  Ollama (local) →   │
                          │  Groq (free) →      │
                          │  OpenRouter (free) → │
                          │  Claude Haiku        │
                          └─────────────────────┘
```

---

## Phase 1 — Bluedoor Enrichment Layer (Next.js only)

**Goal:** Enrich existing tracked applications + add thin job discovery. No new backend service. Ships inside current Next.js codebase.

### 1.1 Auto-Link Tracked Applications to Bluedoor

When user saves an application with `apply_url` or `company + title`:

**Join strategy (priority order):**

1. `apply_url` / `source_url` exact or normalized match → `GET /v1/jobs/search?q=...`
2. ATS key from URL (Greenhouse `gh_jid=`, Lever UUID, Ashby `ashbyHiringPipelineCardId`) → `provider` + `provider_job_key`
3. Fuzzy: `company name + title + location` → score threshold

**New Prisma fields on Job model:**

- `bluedoor_job_id` — linked Bluedoor job_id
- `bluedoor_synced_at` — last enrichment timestamp
- `bluedoor_status` — active / expired / unknown
- `bluedoor_salary_min` / `bluedoor_salary_max` / `bluedoor_salary_currency`
- `bluedoor_workplace_type` — remote / hybrid / on_site
- `bluedoor_description_hash` — detect description changes
- `bluedoor_provider` — greenhouse / lever / ashby / workday / etc

### 1.2 Posting Status Monitoring

**What we watch for:**

- `active` → `expired` — posting closed, alert user
- `description_text` hash change — JD rewritten, may signal re-opening or reqs change
- `salary_min` / `salary_max` added — compensation now disclosed
- `workplace_type` change — remote policy changed
- `job.reopened` event — role reposted

**How:**

- Bluedoor webhooks (`/v1/webhook_endpoints` + `/v1/subscriptions`) on tracked `job_id`s
- Next.js webhook route handler → update DB → invalidate TanStack Query cache → toast alert
- Fallback: nightly poll via cron (Vercel cron or n8n) for users with linked jobs

**UI surface:**

- Job card badge: `POSTING CLOSED` / `SALARY UPDATED` / `DESCRIPTION CHANGED`
- Dashboard notification center: "3 tracked roles had changes"
- Email digest (Resend free tier): weekly summary of watched job events

### 1.3 Job Discovery Mode

**New `/discover` route:**

- Search bar → calls Bluedoor `POST /v1/jobs/search` via Next.js API route
- Filters: remote/hybrid/on_site · employment_type · salary_exists · city/region · department
- Facet counts from `GET /v1/jobs/facets` (live counts per filter)
- Results: job cards with title, company, location, salary, ATS source, posted date
- "Track Application" button → pre-fills existing job form (company, title, apply_url, position, location)
- "View Details" → modal with full description from `GET /v1/jobs/{job_id}`

**Pagination:** Bluedoor cursor-based pagination (`meta.next_cursor`)

### 1.4 Phase 1 New Routes / Components

```bash
app/
  discover/
    page.tsx              — job search UI
    loading.tsx           — skeleton
  api/
    bluedoor/
      search/route.ts     — proxy Bluedoor search
      enrich/route.ts     — link tracked job to Bluedoor
      webhook/route.ts    — receive Bluedoor lifecycle events
    jobs/
      [id]/enrich/route.ts — trigger enrichment for specific job
```

### 1.5 Phase 1 Tech Additions

| Addition                          | Why                                |
| --------------------------------- | ---------------------------------- |
| Bluedoor API client (Next.js)     | Job search + enrichment            |
| Bluedoor webhook handler          | Real-time posting lifecycle events |
| Resend (free 3k/mo) + React Email | Posting change alerts              |
| Prisma schema additions           | Store enrichment fields            |
| Vercel Cron (or n8n fallback)     | Nightly enrichment sync            |

---

## Phase 2 — Python AI Agent Backend (Coolify VPS)

**Goal:** Deploy 9-agent Ollama pipeline as FastAPI service on Coolify. Next.js calls it. n8n orchestrates scheduled automations.

### 2.1 Infrastructure on Coolify VPS

```bash
Coolify VPS (Hetzner)
├── Jobify Next.js app (existing)
├── PostgreSQL (shared)
├── Redis
├── n8n (automation)
├── FastAPI AI service (new)
└── Ollama (local LLM server)
```

All services talk via internal Docker network. Zero egress cost for internal calls.

### 2.2 The 9-Agent Pipeline

Every AI operation (job fit scoring, cover letter draft, interview prep, weekly digest) runs through this pipeline:

```bash
User trigger / n8n cron
        │
        ▼
┌───────────────────┐
│  1. EXTRACTOR     │  Retrieves: JD from Bluedoor, user profile from DB,
│                   │  application history, past AI outputs for this job
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  2. ANALYZER      │  Scores job fit (skills match %, seniority match),
│                   │  detects duplicate/stale requests, flags low-quality JDs
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  3. PREPROCESSOR  │  Cleans JD text (strip HTML/boilerplate), normalizes
│                   │  skills list, extracts: requirements, nice-to-haves,
│                   │  tech stack, team size hints, company signals
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  4. OPTIMIZER     │  Trims to LLM token budget, reorders by relevance,
│                   │  selects which profile sections most relevant to this JD
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  5. SYNTHESIZER   │  LLM call (fallback chain below). Generates:
│                   │  fit analysis, cover letter draft, gap analysis,
│                   │  tailored resume bullets, interview angle suggestions
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  6. VALIDATOR     │  Quality checks LLM output: hallucination detection
│                   │  (company name correct? dates plausible?), length check,
│                   │  tone check, completeness. Retry Synthesizer if fails.
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  7. ASSEMBLER     │  Packages structured JSON output: fit_score, gaps[],
│                   │  cover_letter_draft, resume_bullets[], interview_angles[],
│                   │  confidence_score, model_used, latency_ms
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  8. VIEW          │  Formats for UI: markdown render, truncate previews,
│                   │  highlight matched skills, prepare diff vs previous output
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  9. FINAL BOSS    │  Cross-validates all agent outputs. Checks: does fit_score
│   VERIFIER        │  match extracted skills? Does cover letter reference actual
│                   │  job requirements? Assigns final confidence band.
│                   │  Approves → return. Fails → flag for human review.
└────────┬──────────┘
         │
         ▼
    Structured response to Next.js / stored in DB
```

### 2.3 LLM Fallback Chain

```python
FALLBACK_CHAIN = [
    # Local — free, private, no rate limits
    {"provider": "ollama", "model": "llama3.2:8b",  "priority": 1},
    {"provider": "ollama", "model": "mistral:7b",   "priority": 2},
    {"provider": "ollama", "model": "gemma2:9b",    "priority": 3},
    {"provider": "ollama", "model": "phi3:3.8b",    "priority": 4},  # fast fallback
    {"provider": "ollama", "model": "llama3.2:3b",  "priority": 5},  # fastest local

    # Cloud free tier — if all Ollama fail (OOM, timeout)
    {"provider": "groq",        "model": "llama-3.1-8b-instant",   "priority": 6},
    {"provider": "groq",        "model": "gemma2-9b-it",           "priority": 7},
    {"provider": "openrouter",  "model": "mistralai/mistral-7b-instruct:free", "priority": 8},
    {"provider": "openrouter",  "model": "google/gemma-2-9b-it:free",          "priority": 9},

    # Last resort — paid but cheap
    {"provider": "anthropic",   "model": "claude-haiku-4-5-20251001", "priority": 10},
]
```

**Fallback logic:** try in order, catch timeout/OOM/rate-limit, log which model used → returned in `model_used` field so users know.

### 2.4 n8n Automation Flows

Self-hosted on Coolify, free.

| Flow                        | Trigger                       | What it does                                                                                   |
| --------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------- |
| **Daily Job Digest**        | Cron 8am                      | Fetch Bluedoor jobs matching user profile → run Analyzer → email 5 top matches via Resend      |
| **Stale App Alert**         | Cron weekly                   | Find apps with no status change in 30+ days → suggest follow-up email draft (AI)               |
| **Enrichment Sync**         | Cron nightly                  | Poll Bluedoor for status changes on all linked job_ids → update DB → push notification         |
| **Interview Prep Trigger**  | DB event (status → Interview) | Auto-trigger 9-agent pipeline → generate prep notes → store in DB → notify user                |
| **Posting Closed Alert**    | Bluedoor webhook              | Job expired → real-time alert: "Your Stripe application — role was closed"                     |
| **Weekly Analytics Digest** | Cron Sunday 9am               | AI summary: "You applied to 8 jobs this week. 3 in interview stage. Avg response time 4 days." |
| **Cover Letter Generator**  | User trigger                  | On-demand: user clicks "Generate" on job → pipeline runs → draft ready in ~15s                 |

### 2.5 FastAPI Service Structure

```bash
python-ai-service/
  app/
    main.py                  — FastAPI app, CORS, health
    pipeline/
      orchestrator.py        — runs all 9 agents in sequence
      agents/
        extractor.py         — data retrieval
        analyzer.py          — fit scoring + dedup
        preprocessor.py      — text cleaning + NLP
        optimizer.py         — token budget mgmt
        synthesizer.py       — LLM call + fallback chain
        validator.py         — output quality check
        assembler.py         — JSON packaging
        view_formatter.py    — UI-ready output
        final_verifier.py    — cross-validation
    llm/
      router.py              — fallback chain logic
      providers/
        ollama_client.py     — Ollama HTTP client
        groq_client.py       — Groq SDK
        openrouter_client.py — OpenRouter HTTP
        anthropic_client.py  — Claude SDK
    models/
      job.py                 — Pydantic models
      pipeline.py            — pipeline request/response
    api/
      routes/
        pipeline.py          — POST /pipeline/run
        health.py            — GET /health
  Dockerfile
  docker-compose.yml
```

### 2.6 Phase 2 Tech Stack

| Layer                | Tool                            | Free? |
| -------------------- | ------------------------------- | ----- |
| AI service framework | FastAPI (Python 3.12)           | Yes   |
| Local LLM server     | Ollama                          | Yes   |
| Local models         | llama3.2, mistral, gemma2, phi3 | Yes   |
| Cloud fallback 1     | Groq (14k tok/min free)         | Yes   |
| Cloud fallback 2     | OpenRouter (free models)        | Yes   |
| Cloud fallback 3     | Anthropic Claude Haiku          | Paid  |
| LLM orchestration    | LangChain or raw httpx          | Yes   |
| Automation           | n8n (self-hosted Coolify)       | Yes   |
| Container runtime    | Docker via Coolify              | Yes   |
| Email sending        | Resend (3k/mo free)             | Yes   |
| Job queue (async)    | Celery + Redis or ARQ           | Yes   |

---

## Phase 3 — Advanced (Future)

After Phase 2 stable and used.

| Feature                    | Description                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------- |
| **Resume parser**          | Upload PDF → extract skills, experience, education → build user profile for AI matching |
| **Skill gap analyzer**     | Compare profile vs. Bluedoor market demand across 100k jobs in target role              |
| **Salary intelligence**    | Aggregate Bluedoor salary_min/max for user's target role + location → market range      |
| **Auto-apply detection**   | Parse email confirmations → auto-log application to Jobify                              |
| **Multi-user / team mode** | Share job lists, referral tracking                                                      |
| **Browser extension**      | One-click "Track this job" from any career page                                         |
| **Company intelligence**   | Enrich company info via Bluedoor `/v1/orgs` → funding, ATS, team size signals           |

---

## UI/UX Vision

### Design Language

- Glass morphism cards (existing established pattern)
- Dark-first with system preference respect
- Framer Motion micro-animations on status changes
- Real-time updates via existing SSE (`/api/jobs/events`)

### Key New Screens

**`/discover` — Job Search**

- Two-panel: filter sidebar (facets live) + results grid
- Each card: company logo, title, location badge, remote pill, salary if available, ATS source chip, "posted X days ago"
- Quick actions: Track · Preview JD · AI Score (calls pipeline)
- Infinite scroll (Bluedoor cursor pagination)

**`/dashboard` enhancements**

- Job card: Bluedoor status badge (LIVE / CLOSED / SALARY ADDED / CHANGED)
- AI chip showing fit score if pipeline ran
- Timeline view: application events + Bluedoor lifecycle events merged

**`/jobs/[id]` enhancements**

- New "AI Insights" tab: fit score, skills match, cover letter draft, interview angles
- "Posting Activity" tab: Bluedoor event timeline for this job
- "Generate Prep" button → triggers pipeline → streams output

**Notification Center**

- Bell icon in navbar
- Real-time SSE-fed: posting changes, AI ready, digest available
- Mark read / dismiss

---

## Data Flow Summary

```bash
User adds job with apply_url
  → Phase 1: auto-lookup Bluedoor → store bluedoor_job_id
  → Subscribe Bluedoor webhook for that job_id
  → Status badge appears on card

Bluedoor fires webhook (job closed)
  → Next.js /api/bluedoor/webhook
  → Update DB bluedoor_status = expired
  → Invalidate TanStack Query cache
  → Push SSE event to dashboard
  → Queue email notification (Resend)

User clicks "AI Insights" on job (Phase 2)
  → Next.js calls FastAPI POST /pipeline/run
  → Orchestrator runs 9 agents
  → LLM fallback chain: Ollama → Groq → OpenRouter → Claude
  → Returns structured JSON in ~5-15s
  → Stored in DB, rendered in UI

n8n cron (8am daily)
  → Fetch user profiles from DB
  → Call Bluedoor search per profile
  → Call FastAPI Analyzer agent
  → Email digest via Resend
```

---

## Development Sequence

### Phase 1 Order

1. Prisma schema additions (bluedoor fields)
2. Bluedoor API client utility (Next.js)
3. Job enrichment API route + background job link
4. Bluedoor webhook handler
5. Dashboard job card status badges
6. `/discover` search UI + filter sidebar
7. Resend email alerts for posting changes
8. Vercel cron / nightly enrichment sync

### Phase 2 Order

1. Coolify: set up Ollama container + pull models
2. FastAPI scaffold + Docker on Coolify
3. LLM router with fallback chain (test all providers)
4. Individual agents (start with Preprocessor + Synthesizer)
5. Full 9-agent orchestrator
6. Next.js → FastAPI integration
7. n8n flows (start with enrichment sync, then digest)
8. AI Insights UI in `/jobs/[id]`
9. Cover letter generator + interview prep UI

---

## Constraints

- **All free tier** — Bluedoor (free, high limits), Groq (free 14k tok/min), OpenRouter (free models), Resend (3k/mo), n8n self-hosted, Ollama self-hosted
- **Solo dev** — no over-engineering, no premature microservices
- **Human-in-the-loop** — AI suggests, user approves. No autonomous apply or record-creation without confirmation
- **Privacy** — user data never sent to Bluedoor or cloud LLMs without explicit opt-in. Ollama local = default private path
- **OSS / free product** — no monetization layer needed in architecture

---

_Last updated: 2026-06-19_
