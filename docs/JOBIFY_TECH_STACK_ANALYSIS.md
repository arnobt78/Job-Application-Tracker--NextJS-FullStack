# Jobify v2 — Tech Stack Analysis

**Version:** v1.6  
**Date:** 2026-06-19 · **Last updated:** 2026-06-28 (Phase 3 partial)  
**Status:** Phase 1 **✅ complete** · Phase 2 **~90%** · Phase 3 **🔄 partial**

**Verified:** lint ✓ · typecheck ✓ · test **51/51** ✓ · build ✓ · `59060a0`

---

## Table of Contents

0. [Implementation Status (Audit)](#0-implementation-status-audit)
1. [Current Stack (Existing)](#1-current-stack-existing)
2. [Phase 1 Additions — Bluedoor Enrichment](#2-phase-1-additions--bluedoor-enrichment)
3. [Phase 2 — Python AI Backend](#3-phase-2--python-ai-backend)
4. [LLM Provider Comparison](#4-llm-provider-comparison)
5. [Automation Layer (n8n)](#5-automation-layer-n8n)
6. [Infrastructure — Coolify VPS](#6-infrastructure--coolify-vps)
7. [Frontend New Features Stack](#7-frontend-new-features-stack)
8. [Database Schema](#8-database-schema)
9. [What NOT To Use](#9-what-not-to-use)
10. [Full Stack Summary](#10-full-stack-summary)

---

## 0. Implementation Status (Audit)

**Verified 2026-06-27:** lint ✓ · typecheck ✓ · test **51/51** ✓ · build ✓

### Legend

| Symbol | Meaning |
| --- | --- |
| ✅ | Implemented and in production codebase |
| ⚠️ | Partial / scaffolded / optional dependency |
| ⬜ | Planned, not in codebase |

### By layer

| Layer | Planned tool | Status | Notes |
| --- | --- | --- | --- |
| Next.js 16 App Router | ✅ | `force-dynamic` + SSR prefetch on all dashboard pages |
| React 19 | ✅ | Server + Client Components |
| NextAuth v5 (Auth.js) | ✅ | `middleware.ts` + `auth.ts` + Prisma adapter |
| Prisma 6 + PostgreSQL | ✅ | `Job` + `JobAIInsight` + `UserProfile` models |
| TanStack Query 5 | ✅ | Persist + hydration + optimistic mutations |
| Redis (Upstash) | ⚠️ | Optional — in-memory + BroadcastChannel fallback |
| Bluedoor API | ✅ | Client, enrich, discover, webhook, cron |
| Resend | ⚠️ | React Email templates; no-op without key |
| React Email | ✅ | `@react-email/components` + `@react-email/render` |
| Sentry | ⚠️ | Integrated; optional via env |
| PostHog | ⚠️ | `posthog-js` + `PostHogProvider` — no-op without `NEXT_PUBLIC_POSTHOG_KEY` |
| Playwright E2E | ⚠️ | `tests/e2e/*.spec.ts` — `npm run test:e2e` |
| Vitest | ✅ | **51** tests |
| FastAPI AI service | ⚠️ | Code complete; not deployed |
| Ollama | ⬜ | Router ready; no VPS Ollama instance |
| Groq / OpenRouter / Anthropic | ⚠️ | Client code in python-ai-service |
| n8n | ⚠️ | JSON templates in `docs/n8n/` — instance not deployed |
| Coolify VPS | ⬜ | Planned infrastructure |
| ARQ / Celery | ⬜ | Pipeline is synchronous |

### Phase 1 feature matrix

| Feature | Status | Files |
| --- | --- | --- |
| `applyUrl` + Bluedoor enrichment fields | ✅ | `prisma/schema.prisma` |
| Auto-enrich on CRUD | ✅ | `utils/actions.ts`, `lib/bluedoor/enrich.ts` |
| Enrichment badges on cards | ✅ | `components/jobs/job-enrichment-badge.tsx` |
| `/discover` search | ✅ | `app/(dashboard)/discover/` |
| Infinite cursor pagination | ✅ | `useInfiniteQuery`, `buildDiscoverQueryOptions` |
| Glass filter bar | ✅ | `components/discover/discover-filters.tsx` |
| Track Application → dashboard sync | ✅ | `useCreateJobMutation` in `discover-job-card.tsx` |
| Details modal | ✅ | `discover-job-details-modal.tsx` |
| Inbound webhook | ✅ | `app/api/bluedoor/webhook/route.ts` |
| Nightly cron resync | ✅ | `app/api/cron/enrich/route.ts`, `vercel.json` |
| Notification bell (SSE) | ✅ | `notification-bell.tsx`, `notifications-context.tsx` |
| Per-change email | ✅ | `lib/notifications/email.ts` |
| Stats KPI row | ✅ | `components/stats/stats-kpi-row.tsx` |
| 4 chart types + weekly query | ✅ | `components/stats/*`, `getCachedWeeklyCharts` |
| Posting Activity tab | ✅ | `getJobEvents`, `posting-activity-tab.tsx`, `job-detail-panels.tsx` |
| Facet API (`/jobs/facets`) | ✅ | `getDiscoverFacets` — inline counts in `DiscoverFilters` |
| Auto webhook subscription | ✅ | `registerBluedoorWebhook` / `unregisterBluedoorWebhook` |
| Weekly digest email | ✅ | `/api/cron/weekly-digest` + `WeeklyDigestEmail` |
| Company logos | ✅ | `CompanyLogo` — Clearbit + Building2 fallback |
| Global timeline (`/timeline`) | ✅ | `lib/jobs/timeline.ts` — derived from Job + aiInsight |
| Discover two-panel sidebar | ✅ | `DiscoverSidebar` on `lg+` |

### Phase 2 feature matrix

| Feature | Status | Files |
| --- | --- | --- |
| FastAPI app | ✅ | `python-ai-service/app/main.py` |
| 9-agent pipeline | ✅ | `python-ai-service/app/pipeline/` |
| LLM fallback router | ✅ | `python-ai-service/app/llm/router.py` |
| Next.js proxy (blocking) | ✅ | `app/api/ai/pipeline/route.ts` |
| Next.js proxy (SSE stream) | ✅ | `app/api/ai/pipeline/stream/route.ts` |
| `useAIPipeline` / `useStreamPipeline` | ✅ | Blocking + SSE streaming hooks |
| `useAIPipeline` + panel UI | ✅ | DB load + `useStreamPipeline` + `PipelineProgress` |
| `JobAIInsight` DB model | ✅ | `prisma/schema.prisma` — one-to-one with Job |
| `UserProfile` DB model + UI | ✅ | `/profile` + `UserProfileForm` + `useUserProfileMutation` |
| AI output streaming | ✅ | SSE per-agent progress; cover letter after pipeline completes |
| 9-agent progress UI | ✅ | `PipelineProgress` component |
| n8n flows | ⚠️ | `docs/n8n/*.json` templates — instance not deployed |
| `/api/internal/*` routes | ✅ | `internal/jobs`, `internal/notify` (`X-Internal-Secret`) |
| Coolify deploy | ⬜ | — |

### Phase 3 feature matrix (partial)

| Feature | Status | Files |
| --- | --- | --- |
| AI fit chip on JobCard | ✅ | `ai-fit-chip.tsx` · `getCachedJobs` aiInsight include |
| Resume PDF parser | ✅ | `lib/pdf/extract-text.ts` · `uploadResumeAction` · `resume-upload.tsx` |
| Skill gap analyzer | ✅ | `lib/jobs/skill-gap.ts` · `skill-gap-tab.tsx` |
| Salary intelligence | ✅ | `getSalaryIntelligenceAction` · `salary-intelligence.tsx` |
| react-markdown | ✅ | `AiInsightsPanel` + remark-gfm |
| Framer Motion badges | ✅ | `JobEnrichmentBadge` AnimatePresence |
| Browser extension | ⬜ | — |
| Team mode | ⬜ | — |
| Auto-apply email | ⬜ | — |

## 1. Current Stack (Existing)

The foundation. Phase 1 and 2 build on top — don't replace.

| Layer | Tool | Version (package.json) | Notes |
| --- | --- | --- | --- |
| Framework | Next.js | 16.x | App Router, RSC, Server Actions, Turbopack dev |
| Runtime | React | 19.x | Concurrent features |
| Auth | NextAuth v5 | `middleware.ts`, `auth()`, Prisma `User` |
| ORM | Prisma | 6.x | PostgreSQL driver |
| Database | PostgreSQL | 16+ | Primary data store |
| Server cache | Redis (Upstash) | optional | `unstable_cache` + tag invalidation + optional read-through |
| Client state | TanStack Query | 5.x | `PersistQueryClient`, SSR hydration |
| Styling | Tailwind CSS | 3.4.x | JIT, glass morphism design |
| Components | shadcn/ui | latest | Radix primitives, owned code |
| Charts | Recharts | 2.x | Stats page (Bar, Area, Pie, Composed) |
| Monitoring | Sentry | 10.x | Error + performance (optional) |
| Analytics | PostHog | — | **Deferred** — guide in `docs/Redis_Sentry_PostHog_INTEGRATION_GUIDE.md` |
| Testing | Vitest | 4.x | **51** tests |
| Deployment | Vercel | — | SSR + cron |
| CI | GitHub Actions | — | lint → typecheck → test → build |

**Current data flow:**

```text
NextAuth auth → middleware.ts → /dashboard · /discover · /stats · /timeline · /profile
Page: force-dynamic + prefetchQuery / prefetchInfiniteQuery → dehydrate → PersistQueryClient
CRUD: Server Actions → useJobsMutation (optimistic) → invalidateAllJobQueries → broadcast
Cache: unstable_cache + optional Redis + revalidateTag
Realtime: SSE /api/jobs/events + BroadcastChannel (jobify-cache, jobify-notifications)
```

---

## 2. Phase 1 Additions — Bluedoor Enrichment

Built inside Next.js. No separate Bluedoor microservice.

### 2.1 Bluedoor API ✅

| Property | Value |
| --- | --- |
| Base URL | `https://api.bluedoor.sh/job-postings/v1` |
| Auth | None (free, no API key) |
| Rate limits | Very high (confirmed by Sam — OSS projects won't hit ceiling) |
| Coverage | 1.8M jobs · 60k+ companies · US-primary |
| Refresh | Daily |

**Endpoints — usage in Jobify:**

| Endpoint | Purpose | Status |
| --- | --- | --- |
| `GET /jobs` (search) | Discovery + enrich lookup | ✅ `lib/bluedoor/client.ts` `searchJobs` |
| `GET /jobs/{job_id}` | Full job detail | ✅ `getJobDetail` — Details modal |
| `GET /jobs/{job_id}/events` | Lifecycle history | ✅ `getJobEvents` — Posting Activity tab |
| `GET /jobs/facets` | Live filter counts | ✅ `getDiscoverFacets` — parallel prefetch on `/discover` |
| `POST /webhook_endpoints` | Register receiver | ✅ `registerBluedoorWebhook` on enrich |
| `POST /subscriptions` | Subscribe to job_id | ✅ Auto-called; `bluedoorWebhookSubId` on Job |
| `GET /orgs/lookup` | Company enrichment | ✅ `getBluedoorOrg` → companySize/Industry/Hq |

**Join strategy (implemented in `enrich.ts`):**

1. ATS key from `apply_url`
2. URL / source match via search
3. Fuzzy company + title + location

### 2.2 Email — Resend ⚠️

| Property | Value |
| --- | --- |
| Free tier | 3,000 emails/month |
| SDK | `resend` npm package ✅ in dependencies |
| Template system | React Email JSX ✅ (`lib/notifications/templates/`) |
| Use cases | `posting_closed` · `jd_changed` · `salary_added` ✅ · weekly digest ✅ |

**Implementation:** `lib/notifications/email.ts` — graceful no-op when `RESEND_API_KEY` absent.

### 2.3 Scheduled Enrichment Sync ✅

| Option | Status | Notes |
| --- | --- | --- |
| Vercel Cron | ✅ | `vercel.json` → enrich 03:00 UTC · weekly-digest Sunday 09:00 UTC |
| n8n cron | ⬜ | Planned Phase 2 migration |

Batch: 10 jobs per batch, 150ms delay — polite to free API.

### 2.4 Phase 1 Dependencies (actual)

```json
{
  "resend": "^6.16.0",
  "@react-email/components": "^1.0.12",
  "@react-email/render": "^2.0.9"
}
```

### 2.5 Phase 1 Architecture Choice: Server Actions vs API Routes

| Approach | Plan doc (original) | **Actual implementation** |
| --- | --- | --- |
| Bluedoor search | `POST /api/bluedoor/search` | `searchBluedoorJobsAction` Server Action |
| Enrich trigger | `POST /api/jobs/[id]/enrich` | `enrichJobAction` + `after()` on CRUD |
| Webhook | API route | ✅ `POST /api/bluedoor/webhook` |
| Cron | API route | ✅ `GET /api/cron/enrich` + `GET /api/cron/weekly-digest` |

Server Actions chosen for type safety, shared auth pattern, and consistency with existing CRUD.

---

## 3. Phase 2 — Python AI Backend

Separate FastAPI service. **Code in repo; not deployed to production.**

### 3.1 Framework ✅ (in repo)

| Tool | Version | Status |
| --- | --- | --- |
| Python | 3.12+ | ✅ `python-ai-service/` |
| FastAPI | 0.115+ | ✅ `app/main.py` |
| Pydantic | v2 | ✅ `app/models/` |
| uvicorn | latest | ✅ Dockerfile |
| httpx | latest | ✅ LLM provider clients |

### 3.2 LLM Orchestration ⚠️

| Tool | Role | Status |
| --- | --- | --- |
| Ollama | Local LLM server | ⬜ Not running on VPS |
| Ollama Python client | API calls | ✅ `ollama_client.py` |
| Groq SDK | Cloud fallback | ✅ `groq_client.py` |
| OpenRouter httpx | Cloud fallback | ✅ `openrouter_client.py` |
| Anthropic SDK | Last resort | ✅ `anthropic_client.py` |
| LangChain | Optional patterns | ⬜ Not used — raw clients preferred |

**Router:** `app/llm/router.py` — try providers in priority order, log `model_used`.

### 3.3 Local Ollama Models (planned deploy)

| Model | Size | Use case |
| --- | --- | --- |
| `llama3.2:8b` | 5GB | Primary |
| `mistral:7b` | 4.1GB | Fallback 2 |
| `gemma2:9b` | 5.5GB | Quality fallback |
| `phi3:3.8b` | 2.2GB | Fast tasks |
| `llama3.2:3b` | 2GB | Emergency fast path |

**VPS RAM:** 16GB minimum (CX41), 32GB recommended (CX51).

### 3.4 Cloud LLM Fallbacks ✅ (client code ready)

| Provider | Free Tier | Status |
| --- | --- | --- |
| Groq | Yes | ✅ Client implemented |
| OpenRouter | Free models | ✅ Client implemented |
| Anthropic Haiku | Paid (cheap) | ✅ Client implemented |

### 3.5 Async Task Queue ⬜

| Tool | Status |
| --- | --- |
| ARQ + Redis | ⬜ Planned — pipeline is sync today |
| Celery | ⬜ Overkill for current scale |
| FastAPI BackgroundTasks | ⬜ Not used for pipeline |

### 3.6 Next.js ↔ Python Integration ✅

| Piece | Status | Path |
| --- | --- | --- |
| Proxy route | ✅ | `app/api/ai/pipeline/route.ts` |
| TS types + client | ✅ | `lib/ai/pipeline-client.ts` |
| Mutation hook | ✅ | `hooks/useAIPipeline.ts` |
| UI panel | ✅ | `ai-insights-panel.tsx` + `pipeline-progress.tsx` |
| Env vars | ⚠️ | `AI_SERVICE_URL`, `AI_SERVICE_SECRET` |
| FastAPI streaming endpoint | ✅ | `POST /pipeline/run/stream` in `pipeline.py` |

---

## 4. LLM Provider Comparison

| Provider | Hosting | Cost | Privacy | Use in Chain |
| --- | --- | --- | --- | --- |
| Ollama (llama3.2:8b) | Self (VPS) | Free | Perfect | Priority 1-5 ⬜ deploy |
| Groq | Cloud | Free tier | Data to US | Priority 6-7 ✅ code |
| OpenRouter | Cloud | Free models | Data to providers | Priority 8-9 ✅ code |
| Claude Haiku | Cloud | ~$0.001/1k tok | Anthropic policy | Last resort ✅ code |

**Recommendation unchanged:** Ollama primary → Groq → OpenRouter → Claude Haiku.

---

## 5. Automation Layer (n8n)

**Status: ⚠️ Partial — JSON templates in `docs/n8n/`; no running instance.**

### 5.1 What is n8n

Visual workflow automation (self-hosted, free). Planned for Coolify VPS.

### 5.2 n8n vs alternatives

| Tool | Verdict |
| --- | --- |
| **n8n** | **USE** — fits Coolify VPS (when deployed) |
| Zapier / Make | Skip — paid |
| Prefect / Airflow | Overkill |
| Vercel Cron | ✅ **In use today** for nightly enrich |

### 5.3 Key n8n Flows (planned)

| Flow | Today | n8n (planned) |
| --- | --- | --- |
| Nightly enrichment | ✅ Vercel cron | Migrate for flexibility |
| Daily job digest | ⚠️ | `docs/n8n/daily-digest.json` template |
| Stale app alert | ⚠️ | `docs/n8n/stale-app-alert.json` template |
| Interview prep auto-trigger | ⬜ | n8n on status change |
| Posting closed alert | ⚠️ Webhook + Resend in Next.js | Could move to n8n |

### 5.4 n8n + Next.js Integration

**Built:**

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/internal/jobs` | GET | List jobs by `userId` |
| `/api/internal/notify` | POST | Push in-app notification via SSE bus |
| `/api/ai/pipeline/stream` | POST | SSE streaming AI pipeline (NextAuth auth) |

**Workflow templates** (import into n8n when deployed): `docs/n8n/daily-digest.json`, `stale-app-alert.json`, `posting-change-webhook.json`

---

## 6. Infrastructure — Coolify VPS

**Status: ⬜ Planned — Next.js currently on Vercel.**

### 6.1 Target services (all ⬜ except Vercel Next.js today)

```text
Coolify VPS (planned)
├── jobify-web (Next.js)     — currently Vercel ✅
├── jobify-ai (FastAPI)      — code ready ⬜
├── jobify-db (PostgreSQL)   — external (Neon/VPS) ✅
├── jobify-redis (Redis)     — Upstash optional ✅
├── jobify-ollama (Ollama)   — ⬜
└── jobify-n8n (n8n)         — ⬜
```

### 6.2 Hetzner VPS Sizing

| Plan | RAM | Sufficient for |
| --- | --- | --- |
| CX31 (8GB) | 8GB | Phase 1 only |
| CX41 (16GB) | 16GB | Phase 2 + Ollama 7B |
| CX51 (32GB) | 32GB | Concurrent LLM + n8n |

---

## 7. Frontend New Features Stack

| Feature | Tool | Status |
| --- | --- | --- |
| Job discovery search | TanStack Query + Server Actions | ✅ |
| Infinite scroll | `useInfiniteQuery` + cursor | ✅ |
| Glass filter dropdowns | `GlassDropdownTrigger` pattern | ✅ |
| Static card shells | `JobCardShell`, `DiscoverCardShell` | ✅ |
| Stats charts | Recharts (4 chart types) | ✅ |
| KPI derived metrics | `StatsKpiRow` (no extra DB query) | ✅ |
| Notification center | SSE + BroadcastChannel | ✅ |
| Posting Activity timeline | `PostingActivityTab` on `/dashboard/[id]` | ✅ |
| AI output display | `AiInsightsPanel` — DB cache + SSE streaming | ✅ |
| AI streaming | SSE `/api/ai/pipeline/stream` + `PipelineProgress` | ✅ |
| Global timeline | `/timeline` + `TimelineView` | ✅ |
| User profile UI | `/profile` + `UserProfileForm` | ✅ |
| PostHog analytics | `lib/analytics/posthog.ts` — optional env | ⚠️ |
| E2E tests | Playwright `tests/e2e/` | ⚠️ |
| Markdown rendering | `react-markdown` + remark-gfm | ✅ |
| Company logos | Clearbit via `CompanyLogo` | ✅ |
| Framer Motion badges | Animated status change | ✅ |
| AI fit chip | `AIFitChip` on JobCard | ✅ |
| Resume PDF parser | pdfjs-dist server-side | ✅ |
| Skill gap tab | Keyword-based profile vs JD | ✅ |
| Salary intelligence | Aggregated enriched job salaries on `/stats` | ✅ |
| 9-agent progress UI | Step indicator | ✅ `PipelineProgress` |

## 8. Database Schema

### 8.1 Phase 1 — Job model ✅

```prisma
model Job {
  // ... core fields ...
  applyUrl              String?
  bluedoorJobId         String?
  bluedoorOrgId         String?
  bluedoorProvider      String?
  bluedoorStatus        String?
  bluedoorWorkplaceType String?
  bluedoorSalaryMin     Float?
  bluedoorSalaryMax     Float?
  bluedoorSalaryCurrency String?
  bluedoorDescHash      String?
  bluedoorSyncedAt      DateTime?
  bluedoorChangedAt     DateTime?
  bluedoorWebhookSubId  String?   // auto-subscribe on enrich

  aiInsight    JobAIInsight?
}
```

### 8.2 Phase 2 — AI models ✅ (migrated)

```prisma
model JobAIInsight {
  id              String   @id @default(cuid())
  jobId           String   @unique
  userId          String   @map("user_id")
  fitScore        Int?
  fitLabel        String?
  summary         String?
  coverLetter     String?
  interviewAngles String[] @default([])
  redFlags        String[] @default([])
  generatedAt     DateTime @default(now())
  updatedAt       DateTime @updatedAt
  job             Job      @relation(...)
}

model UserProfile {
  id              String   @id @default(cuid())
  userId          String   @map("user_id")   @unique
  skills          String[] @default([])
  targetRoles     String[] @default([])
  experienceLevel String?
  resumeText      String?
  // ...
}
```

**Note:** `UserProfile` has `/profile` UI + `useUserProfileMutation`.

### 8.3 Query / cache keys ✅

| Key | Persisted | Invalidated on CRUD |
| --- | --- | --- |
| `jobs.*` | ✅ | ✅ |
| `stats` | ✅ | ✅ |
| `charts` | ✅ | ✅ |
| `charts-weekly` | ✅ | ✅ |
| `job(id)` | ✅ | ✅ |
| `discover.*` | ❌ | N/A (live external) |
| `discover.facets` | ❌ | N/A (staleTime 5 min) |
| `ai.pipeline(id)` | ❌ | N/A (on-demand mutation) |
| `aiInsight.job(id)` | ❌ | DB is source of truth |
| `timeline` | ❌ | SSR prefetch; invalidated via `jobsTag` |

---

## 9. What NOT To Use

| Tool | Why Skip |
| --- | --- |
| LangChain (full) | Too much abstraction — raw clients used instead ✅ |
| LangGraph | Overkill for linear pipeline ✅ |
| AutoGen / CrewAI | Unpredictable output ✅ |
| GPT-4 / GPT-4o | Paid, not needed |
| Pinecone / Weaviate | No vector search in Phase 2 |
| Kafka / RabbitMQ | Redis + ARQ sufficient |
| Kubernetes | Coolify + Docker Compose sufficient |
| Scrapy | Official Bluedoor API used ✅ |
| WebSockets (new) | SSE infrastructure sufficient ✅ |
| Separate Bluedoor API routes | Server Actions chosen instead ✅ |

---

## 10. Full Stack Summary

### Shipped today (production codebase)

| Layer | Tool | Free? |
| --- | --- | --- |
| Frontend | Next.js 16 + React 19 | Yes |
| Auth | NextAuth v5 | Free (self-hosted OAuth) |
| Database | PostgreSQL + Prisma 6 | Yes |
| Cache | Redis (optional) + unstable_cache | Yes |
| Client state | TanStack Query 5 + Persist | Yes |
| Job enrichment | Bluedoor API | Yes |
| Email alerts | Resend + React Email | Yes (3k/mo) |
| Weekly digest | Vercel Cron + WeeklyDigestEmail | Yes |
| Scheduled sync | Vercel Cron (enrich + digest) | Yes |
| Notifications | SSE + BroadcastChannel | Yes |
| Monitoring | Sentry | Free tier |
| Deployment | Vercel | Free hobby |
| Testing | Vitest **51** tests | Yes |

### Scaffolded / partial (code in repo)

| Layer | Tool | Notes |
| --- | --- | --- |
| AI service | FastAPI + 9-agent pipeline | Not deployed to VPS |
| LLM clients | Ollama, Groq, OpenRouter, Anthropic | Router ready |
| AI UI | AiInsightsPanel + PipelineProgress + useStreamPipeline | ✅ |
| AI DB | JobAIInsight + UserProfile | ✅ |
| User profile page | `/profile` | ✅ |
| Global timeline | `/timeline` | ✅ |
| n8n integration | Internal API + JSON templates | ⚠️ deploy pending |
| Analytics | PostHog (optional) | ⚠️ |
| E2E | Playwright specs | ⚠️ |

### Shipped (Phase 3 partial)

| Layer | Tool |
| --- | --- |
| AI fit chip | `AIFitChip` on JobCard |
| Resume PDF parser | pdfjs-dist + `uploadResumeAction` |
| Skill gap | `computeSkillGap` + `SkillGapTab` |
| Salary intel | `SalaryIntelligence` on `/stats` |

### Planned (not in codebase)

| Layer | Tool |
| --- | --- |
| Automation | n8n instance on Coolify |
| Container PaaS | Coolify on Hetzner |
| Local LLM runtime | Ollama on VPS |
| Task queue | ARQ + Redis |
| Browser extension | One-click track from career pages |
| Team mode | Shared job lists |
| Auto-apply email | Parse confirmations → auto-log |

### Tech Decisions Rationale

| Decision | Rationale |
| --- | --- |
| Server Actions over Bluedoor API routes | Type-safe, shared auth, matches existing CRUD |
| Ollama primary | Privacy, free, no rate limits |
| Vercel Cron before n8n | Simpler for Phase 1 nightly sync |
| SSE over WebSockets | Already built for invalidation + notifications |
| Discover not persisted | Live external data — always fresh |
| AI insights in DB | `JobAIInsight` — instant load; Regenerate on demand |
| AI RQ queries not persisted | `ai.pipeline` mutation ephemeral; DB is cache |
| Single PostgreSQL | No multi-DB complexity |

---

_Document version: v1.6 — Last updated 2026-06-28 (Phase 3 partial) · `59060a0`_
_See also: [PROJECT_PLAN.md](./PROJECT_PLAN.md) · [PROJECT_WALKTHROUGH.md](./PROJECT_WALKTHROUGH.md)_
