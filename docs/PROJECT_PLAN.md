# Jobify v2 — Project Vision & Roadmap

**Author:** Arnob Mahmud  
**Date:** 2026-06-19 · **Last updated:** 2026-06-27 (NextAuth migration + audit)  
**Status:** Phase 1 **✅ complete** · Phase 2 **~90%** (code in repo; VPS not deployed) · Phase 3 **planned**  
**Stack:** Next.js 16 · React 19 · **NextAuth v5** · Prisma 6 · TanStack Query 5 · PostgreSQL · Redis (optional) · Bluedoor API · React Email · PostHog · Python FastAPI · Ollama · n8n · Coolify VPS (planned)

**Verification (2026-06-27):** lint ✓ · typecheck ✓ · test **51/51** ✓ · build ✓

---

## Vision

Transform Jobify from a manual job application tracker into a **full-stack intelligent job application OS** — combining live market data (Bluedoor API), AI-powered enrichment (local Ollama multi-agent pipeline), and n8n-style automation — while keeping users in control via human-in-the-loop review.

**Core principle:** Jobify stays an **application CRM** at heart. AI and automation augment the tracker — they don't replace user judgment. `/discover` is a discovery add-on, not a replacement for manual tracking.

---

## Implementation Status Summary

| Phase | Overall | Shipped in codebase | Remaining |
| --- | --- | --- | --- |
| **Core tracker** | ✅ Done | CRUD, filters, stats, export, auth, optimistic UI, SSE, **global timeline** | — |
| **Phase 1 — Bluedoor** | ✅ Done | Enrichment, discover, facets, webhook, cron, bell, React Email, weekly digest, logos, Posting Activity, **org enrich** | AI fit chip (optional) |
| **Stats overhaul** | ✅ Done | KPI row, 4 charts, weekly velocity query | — |
| **Phase 2 — AI** | 🔄 ~90% | FastAPI + 9 agents + LLM router, DB persist, SSE streaming, profile UI, internal API | Coolify deploy, prod LLM keys |
| **Phase 2 — Infra** | ⚠️ Partial | `docker-compose.yml`, internal API, n8n JSON templates | Coolify, Ollama VPS, n8n instance |
| **Testing / analytics** | ⚠️ Partial | Vitest **51**, Playwright E2E, PostHog (optional) | E2E CI wiring |
| **Phase 3** | ⬜ Future | — | Resume parser, extension, team mode, etc. |

---

## Architecture Overview

```bash
┌─────────────────────────────────────────────┐
│              Next.js Frontend               │
│  App Router · TanStack Query · NextAuth · UI   │
└────────────────────┬────────────────────────┘
                     │ Server Actions (+ 9 API routes)
        ┌────────────┼────────────────┐
        │            │                │
        ▼            ▼                ▼
  PostgreSQL     Bluedoor API     Python AI API
  (Prisma 6)   (free, no auth)   (FastAPI · not deployed)
  JobAIInsight · UserProfile
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

## Phase 1 — Bluedoor Enrichment Layer ✅ COMPLETE

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

### 1.2 Posting Status Monitoring ✅

| Item | Status | Implementation |
| --- | --- | --- |
| Detect status / JD / salary changes | ✅ | `resyncJob` in `enrich.ts` |
| Nightly batch poll | ✅ | `GET /api/cron/enrich` + `vercel.json` cron 03:00 UTC |
| Inbound webhook handler | ✅ | `POST /api/bluedoor/webhook` (HMAC `BLUEDOOR_WEBHOOK_SECRET`) |
| Auto-register Bluedoor subscriptions | ✅ | `registerBluedoorWebhook` on enrich → `bluedoorWebhookSubId`; `unregisterBluedoorWebhook` on delete |
| In-app notification bell | ✅ | SSE + `NotificationsProvider` + `NotificationBell` |
| Per-change email (Resend) | ✅ | `lib/notifications/email.ts` — React Email JSX templates |
| Weekly email digest | ✅ | `GET /api/cron/weekly-digest` — Sunday 09:00 UTC + `WeeklyDigestEmail` |
| React Email JSX templates | ✅ | `lib/notifications/templates/*` — PostingClosed, JdChanged, SalaryAdded, WeeklyDigest |

**UI badges:** `JobEnrichmentBadge` — LIVE · CLOSED · JD CHANGED · SALARY · Syncing

### 1.3 Job Discovery Mode ✅

| Item | Status | Implementation |
| --- | --- | --- |
| `/discover` route | ✅ | `app/(dashboard)/discover/page.tsx` |
| Glass filter bar (dashboard parity) | ✅ | `DiscoverFilters` + `DiscoverFilterSection` |
| Search via Server Action | ✅ | `searchBluedoorJobsAction` (not separate API route) |
| Cursor infinite scroll | ✅ | `useInfiniteQuery` + `buildDiscoverQueryOptions` + Load More |
| Track Application | ✅ | `useCreateJobMutation` → instant dashboard invalidation |
| View Details modal | ✅ | `DiscoverJobDetailsModal` + `getBluedoorJobDetailsAction` |
| Static card shell skeletons | ✅ | `DiscoverCardShellGrid` |
| Live facet counts | ✅ | `getDiscoverFacets` + `queryKeys.discover.facets` — sidebar + mobile filters |
| Two-panel facet sidebar | ✅ | `DiscoverSidebar` sticky left rail on `lg+`; mobile uses top filter bar |
| Company logos | ✅ | `CompanyLogo` — Clearbit `logo.clearbit.com` + Building2 fallback on `JobCard` + discover cards |

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

### 1.5 Posting Activity Tab ✅

| Item | Status | Implementation |
| --- | --- | --- |
| Bluedoor events client | ✅ | `getJobEvents()` in `lib/bluedoor/client.ts` |
| Server Action | ✅ | `getBluedoorJobEventsAction` in `utils/actions.ts` |
| Timeline UI | ✅ | `components/jobs/posting-activity-tab.tsx` |
| Tabbed panels on `/dashboard/[id]` | ✅ | `JobDetailPanels` — AI Insights + Posting Activity |
| Query key | ✅ | `queryKeys.discover.events(bluedoorJobId)` — on-demand, not persisted |
| Enabled when | — | Tab disabled until `bluedoorJobId` is set (job enriched) |

Events shown: `job.created` · `job.updated` · `job.closed` · `job.reopened` with icons and timestamps.

### 1.6 Global Activity Timeline ✅

| Item | Status | Implementation |
| --- | --- | --- |
| `/timeline` route | ✅ | `app/(dashboard)/timeline/page.tsx` |
| Event derivation | ✅ | `lib/jobs/timeline.ts` — job_created, enriched, posting_changed, ai_generated |
| SSR prefetch | ✅ | `getTimelineEventsAction` + `queryKeys.timeline()` |
| Nav link | ✅ | `dashboard-nav.tsx` — Timeline tab |
| UI | ✅ | `TimelineView` + `TimelineItem` — chronological feed, capped 100 events |

### 1.7 Actual Routes & Files (as built)

```bash
app/
  (dashboard)/
    discover/page.tsx, loading.tsx
    stats/page.tsx
    dashboard/page.tsx, [id]/page.tsx
    profile/page.tsx              # UserProfile settings
    timeline/page.tsx             # global activity feed
  api/
    bluedoor/webhook/route.ts
    cron/enrich/route.ts
    cron/weekly-digest/route.ts
    jobs/events/route.ts
    ai/pipeline/route.ts
    ai/pipeline/stream/route.ts   # SSE streaming proxy
    internal/jobs/route.ts
    internal/notify/route.ts
    monitoring/route.ts

components/discover/discover-sidebar.tsx   # lg+ two-panel layout
components/timeline/                       # timeline-view, timeline-item
components/user-profile/user-profile-form.tsx
components/jobs/pipeline-progress.tsx
components/providers/posthog-provider.tsx
lib/jobs/timeline.ts
lib/analytics/posthog.ts
docs/n8n/                                  # workflow JSON templates (not deployed)
tests/e2e/                                 # Playwright specs
```

> **Note:** Original plan listed `app/api/bluedoor/search` and `enrich` routes. **Actual architecture** uses Server Actions in `utils/actions.ts` — simpler, type-safe, consistent with the rest of the app.

### 1.8 Phase 1 Optional / Deferred

| Priority | Task | Effort | Notes |
| --- | --- | --- | --- |
| Low | AI fit chip on dashboard `JobCard` | 0.5 day | Fit score in AI panel only today |

---

## Phase 2 — Python AI Agent Backend 🔄 ~85% COMPLETE

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
| `AiInsightsPanel` UI | ✅ | `JobDetailPanels` + Discover Details modal — DB load + Regenerate |
| `JobAIInsight` Prisma model | ✅ | `prisma/schema.prisma` — fit score, cover letter, angles, red flags |
| `UserProfile` Prisma model | ✅ | Schema + `upsertUserProfileAction` |
| **UserProfile settings UI** | ✅ | `/profile` — skills, target roles, experience, resume text |
| **SSE streaming proxy** | ✅ | `POST /api/ai/pipeline/stream` → Python `/pipeline/run/stream` |
| **`useStreamPipeline` hook** | ✅ | Per-agent SSE progress events |
| **`PipelineProgress` UI** | ✅ | Animated 9-step indicator in `AiInsightsPanel` |
| `saveAIInsightAction` / `getAIInsightAction` | ✅ | `utils/actions.ts` — persist after pipeline run |
| Internal API routes | ✅ | `GET /api/internal/jobs`, `POST /api/internal/notify` |
| **n8n workflow templates** | ⚠️ | `docs/n8n/*.json` — daily digest, stale alert, posting webhook |
| Docker + docker-compose | ✅ | `python-ai-service/Dockerfile`, `docker-compose.yml` |
| pytest (mocked LLM) | ✅ | `python-ai-service/tests/` |

### 2.2 What's NOT done yet ⬜

| Item | Notes |
| --- | --- |
| Coolify VPS deploy | Next.js + FastAPI + Ollama + n8n + Redis on Hetzner |
| Pull Ollama models on VPS | `llama3.2`, `mistral`, `gemma2`, `phi3` |
| Set prod env vars | `AI_SERVICE_URL`, `AI_SERVICE_SECRET` on Vercel + Coolify |
| n8n instance + import flows | JSON templates exist; no running n8n server |
| ARQ async job queue | Pipeline is synchronous in request handler |
| AI fit chip on `JobCard` | Score visible in AI panel only |

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

### 2.6 n8n Automation Flows (templates authored — not deployed)

| Flow | Trigger | Status |
| --- | --- | --- |
| Daily Job Digest | Cron 8am | ⚠️ `docs/n8n/daily-digest.json` |
| Stale App Alert | Cron weekly | ⚠️ `docs/n8n/stale-app-alert.json` |
| Posting Change Webhook | Bluedoor event | ⚠️ `docs/n8n/posting-change-webhook.json` |
| Enrichment Sync | Cron nightly | ✅ Vercel cron `/api/cron/enrich` |
| Weekly Analytics Digest | Cron Sunday | ✅ Vercel cron `/api/cron/weekly-digest` |
| Cover Letter Generator | User trigger | ✅ AiInsightsPanel + streaming + DB persist |

### 2.7 Phase 2 Development Sequence

1. ✅ FastAPI scaffold + Docker
2. ✅ LLM router with fallback chain
3. ✅ All 9 agents implemented
4. ✅ Full orchestrator
5. ✅ Next.js → FastAPI integration (`/api/ai/pipeline`, `useAIPipeline`, `AiInsightsPanel`)
6. ✅ AI Insights + Posting Activity wired into `/dashboard/[id]` (`JobDetailPanels`) + discover Details modal
7. ✅ `JobAIInsight` + `UserProfile` Prisma models + `saveAIInsightAction` + Regenerate flow
8. ✅ Internal API routes (`/api/internal/jobs`, `/api/internal/notify`)
9. ✅ UserProfile settings UI (`/profile` + `UserProfileForm`)
10. ✅ SSE streaming (`/api/ai/pipeline/stream` + `useStreamPipeline` + `PipelineProgress`)
11. ✅ Global timeline (`/timeline` + `lib/jobs/timeline.ts`)
12. ✅ Discover two-panel sidebar (`DiscoverSidebar` on lg+)
13. ⚠️ n8n workflow JSON templates (`docs/n8n/`)
14. ⬜ Coolify: deploy FastAPI + pull Ollama models + import n8n flows
15. ⬜ AI fit chip on dashboard cards

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
| `/discover` | Two-panel + facet sidebar + infinite scroll | ✅ Sidebar lg+ · ✅ facet counts · ✅ infinite scroll |
| `/dashboard` cards | Bluedoor badge + AI fit chip | ✅ Badge + CompanyLogo · ⬜ AI chip on card |
| `/dashboard/[id]` | AI Insights tab + Posting Activity tab | ✅ `JobDetailPanels` — DB load + SSE streaming |
| `/profile` | Skills + resume for AI personalisation | ✅ `UserProfileForm` |
| `/timeline` | Global activity feed | ✅ job_created · enriched · posting_changed · ai_generated |
| Notification center | Bell + SSE | ✅ Complete |
| `/stats` | Rich analytics | ✅ 4 charts + KPI row |
| AI streaming | Pipeline progress + streamed output | ✅ `PipelineProgress` + SSE; cover letter shown after complete |

---

## Data Flow Summary

```bash
User adds job with applyUrl
  → after() enrichJob → store bluedoorJobId + bluedoorWebhookSubId
  → registerBluedoorWebhook (when NEXT_PUBLIC_APP_URL set)
  → invalidateUserJobCaches → SSE → badge on card

Bluedoor webhook OR nightly cron
  → resyncJob → detect changes
  → publishNotification (bell) + sendPostingChangeEmail (React Email via Resend)
  → invalidateAllJobQueries

User opens AI Insights (or clicks Regenerate)
  → getAIInsightAction loads JobAIInsight (instant if exists)
  → POST /api/ai/pipeline/stream → SSE per-agent progress (PipelineProgress)
  → FastAPI run_streaming → saveAIInsightAction → render in AiInsightsPanel

User saves /profile
  → upsertUserProfileAction → UserProfile (skills, roles, resume)
  → passed to AI pipeline as PipelineUserProfile context

/timeline
  → getTimelineEventsAction → derive events from Job + aiInsight rows

Sunday 09:00 UTC cron
  → sendAllWeeklyDigests → WeeklyDigestEmail per active user

n8n (planned)
  → GET /api/internal/jobs?userId=… → POST /api/internal/notify
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
7. ✅ Resend email alerts — React Email templates (PostingClosed, JdChanged, SalaryAdded, WeeklyDigest)
8. ✅ Vercel cron nightly enrichment sync
9. ✅ SSE notification bell (BroadcastChannel relay, NotificationsProvider)
10. ✅ `publishNotification` wired in `resyncJob`
11. ✅ Discover + Stats UI overhaul (glass filters, card shells, 4 charts, KPIs)
12. ✅ Posting Activity tab (`getJobEvents` + `PostingActivityTab` + `JobDetailPanels`)
13. ✅ Bluedoor facet API — live counts in `DiscoverFilters`
14. ✅ Auto webhook subscription registration + unsubscribe on delete
15. ✅ Weekly email digest cron (`/api/cron/weekly-digest`)
16. ✅ Company logos (`CompanyLogo` — Clearbit)

### Phase 2

1. ✅ FastAPI scaffold + Docker
2. ✅ LLM router + all 9 agents + orchestrator
3. ✅ Next.js proxy + `AiInsightsPanel` + `useAIPipeline`
4. ✅ `JobAIInsight` + `UserProfile` Prisma + persist + Regenerate
5. ✅ Internal API routes for n8n
6. ✅ UserProfile settings UI (`/profile`)
7. ✅ Streaming UI + pipeline progress indicator
8. ✅ Global timeline + discover sidebar
9. ⚠️ n8n JSON templates (deploy pending)
10. ⬜ Coolify deploy + Ollama models
11. ⬜ AI fit chip on dashboard cards

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

_Last updated: 2026-06-27 (NextAuth migration, org enrich, timeline invalidation, 51 tests)_
