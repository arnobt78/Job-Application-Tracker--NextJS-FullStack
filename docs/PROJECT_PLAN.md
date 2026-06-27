# Jobify v2 — Project Vision & Roadmap

**Author:** Arnob Mahmud  
**Date:** 2026-06-19 · **Last updated:** 2026-06-27  
**Status:** Phase 1 **~90% complete** · Phase 2 **scaffolded** (code in repo, not deployed) · Phase 3 **planned**  
**Stack:** Next.js 16 · React 19 · Clerk 6 · Prisma 6 · TanStack Query 5 · PostgreSQL · Redis (optional) · Bluedoor API · Python FastAPI · Ollama · n8n · Coolify VPS (planned)

**Verification (2026-06-27):** lint ✓ · typecheck ✓ · test 49/49 ✓ · build ✓

---

## Vision

Transform Jobify from a manual job application tracker into a **full-stack intelligent job application OS** — combining live market data (Bluedoor API), AI-powered enrichment (local Ollama multi-agent pipeline), and n8n-style automation — while keeping users in control via human-in-the-loop review.

**Core principle:** Jobify stays an **application CRM** at heart. AI and automation augment the tracker — they don't replace user judgment. `/discover` is a discovery add-on, not a replacement for manual tracking.

---

## Implementation Status Summary

| Phase | Overall | Shipped in codebase | Remaining |
| --- | --- | --- | --- |
| **Core tracker** | ✅ Done | CRUD, filters, stats, export, auth, optimistic UI, SSE | — |
| **Phase 1 — Bluedoor** | ✅ ~90% | Enrichment, discover, webhook handler, cron, bell, email, badges | Facets API, auto webhook subscribe, weekly digest, React Email |
| **Stats overhaul** | ✅ Done | KPI row, 4 charts, weekly velocity query | — |
| **Phase 2 — AI** | 🔄 Scaffolded | FastAPI, 9 agents, LLM router, proxy route, AiInsightsPanel | Deploy, DB persist, streaming UI, n8n |
| **Phase 2 — Infra** | ⬜ Planned | `docker-compose.yml` in python-ai-service | Coolify, Ollama on VPS, n8n flows |
| **Phase 3** | ⬜ Future | — | Resume parser, extension, team mode, etc. |

---

## Architecture Overview

```bash
┌─────────────────────────────────────────────┐
│              Next.js Frontend               │
│  App Router · TanStack Query · Clerk · UI   │
└────────────────────┬────────────────────────┘
                     │ Server Actions (+ 5 API routes)
        ┌────────────┼────────────────┐
        │            │                │
        ▼            ▼                ▼
  PostgreSQL     Bluedoor API     Python AI API
  (Prisma 6)   (free, no auth)   (FastAPI · not deployed)
                     │                │
               Enrichment       Ollama pipeline (9 agents)
               Discover         n8n automation (planned)
               Webhooks              │
                          ┌──────────┴──────────┐
                          │   LLM Fallback Chain │
                          │  Ollama → Groq →    │
                          │  OpenRouter → Haiku  │
                          └─────────────────────┘
```

---

## Phase 1 — Bluedoor Enrichment Layer ✅ MOSTLY COMPLETE

**Goal:** Enrich tracked applications + add job discovery. No separate backend service. Ships inside current Next.js codebase.

### 1.1 Auto-Link Tracked Applications to Bluedoor ✅

| Item | Status | Implementation |
| --- | --- | --- |
| Prisma `applyUrl` + 11 `bluedoor*` fields | ✅ | `prisma/schema.prisma` |
| Bluedoor client | ✅ | `lib/bluedoor/client.ts` |
| Match strategies (ATS → URL → fuzzy) | ✅ | `lib/bluedoor/enrich.ts` `findBluedoorMatch` |
| Auto-enrich on create/update | ✅ | `after(() => enrichJob())` in `utils/actions.ts` |
| Manual enrich action | ✅ | `enrichJobAction` |
| `applyUrl` on Create/Edit forms | ✅ | `CreateJobForm`, `EditJobForm` |

**Join strategy (priority order):**

1. ATS key from URL (`gh_jid=`, Lever UUID, Ashby card ID) → `provider` + `provider_job_key`
2. `apply_url` / `source_url` search match
3. Fuzzy: company + title + location

### 1.2 Posting Status Monitoring ✅ (with gaps)

| Item | Status | Implementation |
| --- | --- | --- |
| Detect status / JD / salary changes | ✅ | `resyncJob` in `enrich.ts` |
| Nightly batch poll | ✅ | `GET /api/cron/enrich` + `vercel.json` cron 03:00 UTC |
| Inbound webhook handler | ✅ | `POST /api/bluedoor/webhook` (HMAC `BLUEDOOR_WEBHOOK_SECRET`) |
| Auto-register Bluedoor subscriptions | ⬜ | Handler exists; no `POST /webhook_endpoints` + `subscriptions` on enrich |
| In-app notification bell | ✅ | SSE + `NotificationsProvider` + `NotificationBell` |
| Per-change email (Resend) | ✅ | `lib/notifications/email.ts` — plain HTML |
| Weekly email digest | ⬜ | Not implemented |
| React Email JSX templates | ⬜ | Plain HTML strings only |

**UI badges:** `JobEnrichmentBadge` — LIVE · CLOSED · JD CHANGED · SALARY · Syncing

### 1.3 Job Discovery Mode ✅ (with gaps)

| Item | Status | Implementation |
| --- | --- | --- |
| `/discover` route | ✅ | `app/(dashboard)/discover/page.tsx` |
| Glass filter bar (dashboard parity) | ✅ | `DiscoverFilters` + `DiscoverFilterSection` |
| Search via Server Action | ✅ | `searchBluedoorJobsAction` (not separate API route) |
| Cursor infinite scroll | ✅ | `useInfiniteQuery` + `buildDiscoverQueryOptions` + Load More |
| Track Application | ✅ | `useCreateJobMutation` → instant dashboard invalidation |
| View Details modal | ✅ | `DiscoverJobDetailsModal` + `getBluedoorJobDetailsAction` |
| Static card shell skeletons | ✅ | `DiscoverCardShellGrid` |
| Live facet counts | ⬜ | `GET /jobs/facets` not wired |
| Two-panel facet sidebar | ⬜ | Current: top filter bar + grid (matches `/dashboard` pattern) |
| Company logos | ⬜ | `formatOrgName` only — no logo.dev integration |

### 1.4 Stats & Analytics Overhaul ✅

| Item | Status | Implementation |
| --- | --- | --- |
| Status cards (pending/interview/declined) | ✅ | `StatsContainer` |
| KPI row (response rate, interview rate, top type) | ✅ | `components/stats/stats-kpi-row.tsx` |
| Monthly trend + projection | ✅ | `ApplicationTrendChart` |
| Weekly velocity (12 weeks) | ✅ | `getCachedWeeklyCharts` + `WeeklyVelocityChart` |
| Status distribution donut | ✅ | `StatusDistributionChart` |
| Mode distribution bars | ✅ | `ModeDistributionChart` |
| `chartsWeekly` invalidation | ✅ | `invalidateAllJobQueries` + `chartsTag` |

### 1.5 Actual Routes & Files (as built)

```bash
app/
  (dashboard)/
    discover/page.tsx, loading.tsx
    stats/page.tsx
    dashboard/page.tsx, [id]/page.tsx
  api/
    bluedoor/webhook/route.ts     # inbound lifecycle events
    cron/enrich/route.ts          # nightly batch resync
    jobs/events/route.ts          # SSE invalidate + notify
    ai/pipeline/route.ts          # Phase 2 proxy
    monitoring/route.ts           # Sentry tunnel

lib/bluedoor/                     # client, enrich, types
components/discover/              # filters, cards, results, modals, layout wrappers
components/stats/                 # 4 charts + KPI row
components/jobs/job-enrichment-badge.tsx
context/notifications-context.tsx
lib/notifications/email.ts
```

> **Note:** Original plan listed `app/api/bluedoor/search` and `enrich` routes. **Actual architecture** uses Server Actions in `utils/actions.ts` — simpler, type-safe, consistent with the rest of the app.

### 1.6 Phase 1 Remaining Work

| Priority | Task | Effort |
| --- | --- | --- |
| Medium | Wire `GET /jobs/facets` for live filter counts on `/discover` | 1–2 days |
| Medium | Auto-register Bluedoor webhook subscriptions on successful enrich | 1 day |
| Low | React Email templates for posting alerts + weekly digest | 1–2 days |
| Low | Weekly analytics email cron | 1 day |
| Low | Company logos on discover cards (`logo.dev`) | 0.5 day |
| Low | Dashboard timeline (application + Bluedoor events merged) | 2–3 days |

---

## Phase 2 — Python AI Agent Backend 🔄 SCAFFOLDED

**Goal:** Deploy 9-agent Ollama pipeline as FastAPI on Coolify. Next.js calls it. n8n orchestrates scheduled automations.

### 2.1 What's in the repo today ✅

| Item | Status | Location |
| --- | --- | --- |
| FastAPI app + health route | ✅ | `python-ai-service/app/main.py` |
| 9-agent pipeline orchestrator | ✅ | `python-ai-service/app/pipeline/` |
| LLM fallback router | ✅ | `python-ai-service/app/llm/router.py` |
| Provider clients (Ollama, Groq, OpenRouter, Anthropic) | ✅ | `python-ai-service/app/llm/providers/` |
| Next.js proxy route | ✅ | `app/api/ai/pipeline/route.ts` |
| TypeScript client + types | ✅ | `lib/ai/pipeline-client.ts` |
| `useAIPipeline` hook | ✅ | `hooks/useAIPipeline.ts` |
| `AiInsightsPanel` UI | ✅ | Edit dialog + Discover Details modal |
| Docker + docker-compose | ✅ | `python-ai-service/Dockerfile`, `docker-compose.yml` |
| pytest (mocked LLM) | ✅ | `python-ai-service/tests/` |

### 2.2 What's NOT done yet ⬜

| Item | Notes |
| --- | --- |
| Coolify VPS deploy | Next.js + FastAPI + Ollama + n8n + Redis on Hetzner |
| Pull Ollama models on VPS | `llama3.2`, `mistral`, `gemma2`, `phi3` |
| Set prod env vars | `AI_SERVICE_URL`, `AI_SERVICE_SECRET` on Vercel + Coolify |
| `JobAIInsight` Prisma model | AI output not persisted — regenerated each run |
| `UserProfile` Prisma model | No skills/target roles for personalized matching |
| Cover letter **streaming** UI | Full response after ~5–15s blocking request |
| 9-agent progress indicator | Animated step UI during pipeline run |
| `/dashboard/[id]` Posting Activity tab | Bluedoor `/jobs/{id}/events` timeline |
| n8n automation flows | See §2.4 |
| Internal API routes (`/api/internal/*`) | For n8n → Next.js triggers |
| ARQ async job queue | Pipeline is synchronous in request handler |

### 2.3 Infrastructure on Coolify VPS (planned)

```bash
Coolify VPS (Hetzner)
├── Jobify Next.js app
├── PostgreSQL (shared)
├── Redis
├── n8n (automation)          ← not deployed
├── FastAPI AI service        ← code ready, not deployed
└── Ollama (local LLM)        ← not deployed
```

### 2.4 The 9-Agent Pipeline

Every AI operation runs through:

```bash
Extractor → Analyzer → Preprocessor → Optimizer → Synthesizer (LLM)
  → Validator → Assembler → ViewFormatter → FinalVerifier
```

Implemented as pure functions in `python-ai-service/app/pipeline/agents/`. See orchestrator for sequencing.

### 2.5 LLM Fallback Chain

```python
# Priority order (implemented in app/llm/router.py)
Ollama (llama3.2:8b, mistral:7b, gemma2:9b, phi3:3.8b, llama3.2:3b)
  → Groq (llama-3.1-8b-instant, gemma2-9b-it)
  → OpenRouter (free models)
  → Anthropic (claude-haiku-4-5-20251001)
```

### 2.6 n8n Automation Flows (planned — none deployed)

| Flow | Trigger | What it does |
| --- | --- | --- |
| Daily Job Digest | Cron 8am | Bluedoor search → Analyzer → email top 5 via Resend |
| Stale App Alert | Cron weekly | Apps unchanged 30+ days → follow-up draft |
| Enrichment Sync | Cron nightly | *(Partially covered by Vercel cron today)* |
| Interview Prep Trigger | DB event | status → interview → full pipeline → email |
| Posting Closed Alert | Bluedoor webhook | *(Partially covered by in-app + Resend today)* |
| Weekly Analytics Digest | Cron Sunday | AI summary of week's applications |
| Cover Letter Generator | User trigger | *(Partially covered by AiInsightsPanel today)* |

### 2.7 Phase 2 Development Sequence

1. ✅ FastAPI scaffold + Docker
2. ✅ LLM router with fallback chain
3. ✅ All 9 agents implemented
4. ✅ Full orchestrator
5. ✅ Next.js → FastAPI integration (`/api/ai/pipeline`, `useAIPipeline`, `AiInsightsPanel`)
6. ✅ AI Insights wired into edit dialog + discover Details modal
7. ⬜ Coolify: deploy FastAPI + pull Ollama models
8. ⬜ Prisma: `JobAIInsight` + `UserProfile` models + persist pipeline output
9. ⬜ n8n flows (daily digest, stale alert, interview prep)
10. ⬜ Cover letter streaming UI + pipeline progress indicator
11. ⬜ `/dashboard/[id]` Posting Activity tab
12. ⬜ Internal API routes for n8n integration

---

## Phase 3 — Advanced (Future)

| Feature | Description |
| --- | --- |
| Resume parser | Upload PDF → extract skills → user profile for AI matching |
| Skill gap analyzer | Profile vs Bluedoor market demand |
| Salary intelligence | Aggregate Bluedoor salary data for target role + location |
| Auto-apply detection | Parse email confirmations → auto-log application |
| Multi-user / team mode | Shared job lists, referral tracking |
| Browser extension | One-click "Track this job" from any career page |
| Company intelligence | Bluedoor `/v1/orgs` enrichment on cards |

---

## UI/UX Vision vs Current State

| Screen / Feature | Vision | Current |
| --- | --- | --- |
| `/discover` | Two-panel + facet sidebar + infinite scroll | ✅ Infinite scroll · ⬜ facet sidebar · ✅ filter bar + grid |
| `/dashboard` cards | Bluedoor badge + AI fit chip | ✅ Badge · ⬜ AI chip on card (panel in edit dialog only) |
| `/dashboard/[id]` | AI Insights tab + Posting Activity tab | ✅ AI panel in edit dialog · ⬜ Activity tab |
| Notification center | Bell + SSE | ✅ Complete |
| `/stats` | Rich analytics | ✅ 4 charts + KPI row |
| AI streaming | Pipeline progress + streamed output | ⬜ Blocking request + static panel |

---

## Data Flow Summary

```bash
User adds job with applyUrl
  → after() enrichJob → store bluedoorJobId
  → invalidateUserJobCaches → SSE → badge on card
  → (planned) subscribe Bluedoor webhook for that job_id

Bluedoor webhook OR nightly cron
  → resyncJob → detect changes
  → publishNotification (bell) + sendPostingChangeEmail (Resend)
  → invalidateAllJobQueries

User clicks "Generate Insights" (Phase 2)
  → POST /api/ai/pipeline → FastAPI 9-agent pipeline
  → LLM fallback chain → PipelineResponse
  → (planned) store in JobAIInsight table
  → render in AiInsightsPanel

n8n cron (planned)
  → Fetch profiles → Bluedoor search → FastAPI Analyzer
  → Email digest via Resend
```

---

## Development Sequence (Master Checklist)

### Phase 1

1. ✅ Prisma schema additions (bluedoor fields)
2. ✅ Bluedoor API client (`lib/bluedoor/client.ts`)
3. ✅ Enrichment via Server Actions + `after()` hook
4. ✅ Bluedoor webhook handler (inbound)
5. ✅ Dashboard job card status badges
6. ✅ `/discover` — search, infinite scroll, Details modal, Track Application
7. ✅ Resend email alerts for posting changes (plain HTML)
8. ✅ Vercel cron nightly enrichment sync
9. ✅ SSE notification bell (BroadcastChannel relay, NotificationsProvider)
10. ✅ `publishNotification` wired in `resyncJob`
11. ✅ Discover + Stats UI overhaul (glass filters, card shells, 4 charts, KPIs)
12. ⬜ Bluedoor facet API integration
13. ⬜ Auto webhook subscription registration
14. ⬜ Weekly email digest

### Phase 2

1. ✅ FastAPI scaffold + Docker
2. ✅ LLM router + all 9 agents + orchestrator
3. ✅ Next.js proxy + `AiInsightsPanel` + `useAIPipeline`
4. ⬜ Coolify deploy + Ollama models
5. ⬜ AI output DB persistence
6. ⬜ n8n flows
7. ⬜ Streaming UI + Posting Activity tab

---

## Constraints

- **All free tier** — Bluedoor, Groq, OpenRouter free models, Resend 3k/mo, n8n self-hosted, Ollama self-hosted
- **Solo dev** — no over-engineering, no premature microservices
- **Human-in-the-loop** — AI suggests, user approves. No autonomous apply
- **Privacy** — Ollama local = default private path; cloud LLMs are explicit fallback
- **OSS / free product** — no monetization layer in architecture

---

## Related Docs

- `docs/PROJECT_WALKTHROUGH.md` — technical walkthrough + file map
- `docs/JOBIFY_TECH_STACK_ANALYSIS.md` — stack decisions + implementation matrix
- `README.md` — educational guide for learners
- `CLAUDE.md` — agent memory (concise)

---

_Last updated: 2026-06-27_
