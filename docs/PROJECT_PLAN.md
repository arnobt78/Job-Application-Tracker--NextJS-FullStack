# Jobify v2 — Project Vision & Roadmap

**Author:** Arnob Mahmud  
**Date:** 2026-06-19 · **Last updated:** 2026-06-29 (BL-0011 Phase 3 Advanced)  
**Status:** Phase 1 **✅ complete** · Phase 2 **~95%** (code in repo; VPS not deployed) · Phase 3 **✅ ~95%** (code in repo)  
**Verification (2026-06-29):** lint ✓ · typecheck ✓ · test **51/51** ✓ · build ✓ · `2429e63`

---

## Vision

Transform Jobify from a manual job application tracker into a **full-stack intelligent job application OS** — combining a built-in job postings catalog, AI-powered enrichment (local Ollama multi-agent pipeline), and n8n-style automation — while keeping users in control via human-in-the-loop review.

**Core principle:** Jobify stays an **application CRM** at heart. AI and automation augment the tracker — they don't replace user judgment. `/discover` is a discovery add-on, not a replacement for manual tracking.

---

## Implementation Status Summary

| Phase | Overall | Shipped in codebase | Remaining |
| --- | --- | --- | --- |
| **Core tracker** | ✅ Done | CRUD, filters, stats, export, auth, optimistic UI, SSE, **global timeline** | — |
| **Phase 1 — Postings catalog** | ✅ Done | Own Postgres catalog (replaced Bluedoor, whose API no longer exists), posting link + resync, discover, facets, `/api/postings`, cron, bell, React Email, weekly digest, Posting Activity | — |
| **Stats overhaul** | ✅ Done | KPI row, 4 charts, weekly velocity query | — |
| **Phase 2 — AI** | 🔄 ~95% | FastAPI + 9 agents + LLM router, DB persist, SSE streaming, profile UI, internal API, **ARQ queue**, batch AI, interview prep | Coolify deploy, prod LLM keys |
| **Phase 2 — Infra** | ⚠️ Partial | `docker-compose.yml` (+ arq-worker), internal API, n8n JSON templates | Coolify, Ollama VPS, n8n instance |
| **Testing / analytics** | ✅ Done | Vitest **105**, pytest 26, Playwright (auth setup + console/network assertions), PostHog (optional) | E2E CI wiring |
| **Phase 3** | ✅ ~95% | Fit chip, PDF parser, Skill Gap (+ LLM mode), Salary Intel, **team mode**, **browser extension**, **email inbound**, batch AI | Manual QA · extension store publish |

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
  PostgreSQL    Postings catalog  Python AI API
  (Prisma 6)   (Company/JobPosting (FastAPI · Coolify)
  JobAIInsight  /JobPostingEvent)
  UserProfile        │                │
               Posting link     Ollama pipeline (9 agents)
               Discover         n8n automation (planned)
               Nightly resync        │
                          ┌──────────┴──────────┐
                          │   LLM Fallback Chain │
                          │  Ollama → Groq →    │
                          │  OpenRouter → Haiku  │
                          └─────────────────────┘
```

---

## Phase 1 — Job Postings Catalog ✅ COMPLETE

**Goal:** Link tracked applications to postings + add job discovery. No separate backend service. Ships inside current Next.js codebase.

> Originally built on the Bluedoor Job Postings API. That API no longer exists, so Phase 1 now runs on the app's own Postgres catalog (ISSUE-0011 / ISSUE-0012).

### 1.1 Auto-Link Tracked Applications to Postings ✅

| Item | Status | Implementation |
| --- | --- | --- |
| Catalog tables | ✅ | `Company`, `JobPosting`, `JobPostingEvent` in `prisma/schema.prisma` |
| Job snapshot columns | ✅ | `postingId` (FK, SetNull, unique per user) + status / workplace / salary / desc hash / change type |
| Match strategies (URL → company + title) | ✅ | `lib/postings/link.ts` `linkJobToPosting` |
| Auto-link on create/update/extension | ✅ | `after(() => linkJobToPosting())` |
| `applyUrl` on Create/Edit forms | ✅ | `CreateJobForm`, `EditJobForm` |
| Demo data | ✅ | `prisma/seed.ts` + `prisma/seed-data/` — 15 companies, 50 postings, events, demo jobs |

**Join strategy (priority order):**

1. Exact normalised apply URL (host + path, no query/hash)
2. Same company name + title similarity (Jaccard) ≥ 0.5

### 1.2 Posting Status Monitoring ✅

| Item | Status | Implementation |
| --- | --- | --- |
| Detect status / JD / salary changes | ✅ | `resyncJob` + `diffSnapshot` in `lib/postings/link.ts` |
| Nightly batch resync | ✅ | `GET /api/cron/enrich` + `vercel.json` cron 03:00 UTC (fails closed without `CRON_SECRET`) |
| In-app notification bell | ✅ | SSE + `NotificationsProvider` + `NotificationBell` |
| Per-change email (Resend) | ✅ | `lib/notifications/email.ts` — React Email JSX templates |
| Weekly email digest | ✅ | `GET /api/cron/weekly-digest` — Sunday 09:00 UTC + `WeeklyDigestEmail` |
| React Email JSX templates | ✅ | `lib/notifications/templates/*` — PostingClosed, JdChanged, SalaryAdded, WeeklyDigest |

**UI badges:** `JobEnrichmentBadge` — Live · Closed · JD Changed · Salary Added

### 1.3 Job Discovery Mode ✅

| Item | Status | Implementation |
| --- | --- | --- |
| `/discover` route | ✅ | `app/(dashboard)/discover/page.tsx` |
| Glass filter bar (dashboard parity) | ✅ | `DiscoverFilters` + `DiscoverFilterSection` |
| Search via Server Action | ✅ | `searchPostingsAction` (+ `GET /api/postings` read API) |
| Keyset infinite scroll | ✅ | `useInfiniteQuery` + `buildDiscoverQueryOptions` + Load More |
| Track Application | ✅ | `useTrackDiscoverJobMutation` → `trackJobFromDiscoverAction(postingId)` |
| View Details modal | ✅ | `DiscoverJobDetailsModal` + `getPostingDetailsAction` |
| Static card shell skeletons | ✅ | `DiscoverCardShellGrid` |
| Live facet counts | ✅ | `getPostingFacets` (groupBy) + `queryKeys.discover.facets` — sidebar + mobile filters |
| Two-panel facet sidebar | ✅ | `DiscoverSidebar` sticky left rail on `lg+`; mobile uses top filter bar |
| Company logos | ✅ | `CompanyLogo` — Google s2 favicons + Building2 fallback on `JobCard` + discover cards |

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
| Events source | ✅ | `JobPostingEvent` rows via `getPostingEvents()` in `lib/postings/queries.ts` |
| Server Action | ✅ | `getPostingEventsAction` in `utils/actions.ts` |
| Timeline UI | ✅ | `components/jobs/posting-activity-tab.tsx` |
| Tabbed panels on `/dashboard/[id]` | ✅ | `JobDetailPanels` — AI Insights + Posting Activity |
| Query key | ✅ | `queryKeys.discover.events(postingId)` — on-demand, not persisted |
| Enabled when | — | Tab disabled until `postingId` is set (job linked) |

Events shown: `created` · `updated` (salary / description / title / workplace) · `closed` · `reopened` with icons and timestamps.

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
    postings/route.ts, facets/, [id]/, [id]/events/
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

> **Note:** The UI uses Server Actions in `utils/actions.ts`; `/api/postings*` exposes the same reads (same zod schemas) for external callers.

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
| Internal API routes | ✅ | `GET /api/internal/jobs`, `POST /api/internal/notify`, `POST /api/internal/ai-complete` |
| **ARQ async queue** | ✅ | `python-ai-service/app/tasks/` · `arq-worker` in docker-compose |
| **Batch AI analysis** | ✅ | `POST /api/ai/batch` · `useAIBatch` · `BatchAnalysisTrigger` on `/profile` |
| **Interview prep trigger** | ✅ | `triggerInterviewPrepAction` on status→interview · `interview_prep_ready` notification |
| **Python routes** | ✅ | pipeline · queue · interview · skills · email — all in `main.py` |
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

> **Note:** ARQ queue code is **implemented** (`arq-worker` + Redis in docker-compose) — requires VPS Redis + worker process at runtime.

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
| Posting Change Alert | Nightly posting resync | ✅ bell + email from `resyncJob` (no external webhook needed) |
| Enrichment Sync | Cron nightly | ✅ Vercel cron `/api/cron/enrich` |
| Weekly Analytics Digest | Cron Sunday | ✅ Vercel cron `/api/cron/weekly-digest` |
| Cover Letter Generator | User trigger | ✅ AiInsightsPanel + streaming + DB persist |
| Interview Prep | Status → interview | ✅ `triggerInterviewPrepAction` · `docs/n8n/interview-prep.json` |

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
15. ✅ AI fit chip on dashboard cards (`AIFitChip`)

### Phase 3 (BL-0011 ✅)

1. ✅ Resume PDF parser (`uploadResumeAction` + `ResumeUpload`)
2. ✅ Skill Gap tab (`computeSkillGap` + `SkillGapTab` + optional LLM mode)
3. ✅ Salary Intelligence on `/stats`
4. ✅ react-markdown in `AiInsightsPanel` · Framer Motion on enrichment badge
5. ✅ Browser extension (`browser-extension/` + `/api/extension/*`)
6. ✅ Team mode (`/team` · `Team`/`TeamMember` · shared jobs)
7. ✅ Auto-apply email inbound (`inboundEmailAddress` · `EmailInboundSetup`)
8. ✅ Batch AI (`useAIBatch` · ARQ queue · `/api/internal/ai-complete`)

---

## Phase 3 — Advanced ✅ ~95%

| Feature | Status | Implementation |
| --- | --- | --- |
| Resume PDF parser | ✅ | `lib/pdf/extract-text.ts` · `uploadResumeAction` · `ResumeUpload` on `/profile` |
| Skill gap analyzer | ✅ | Keyword + optional LLM (`/api/ai/skills`) · `SkillGapTab` in `JobDetailPanels` |
| Salary intelligence | ✅ | `getSalaryIntelligenceAction` · `SalaryIntelligence` on `/stats` |
| AI fit chip on cards | ✅ | `AIFitChip` on `JobCard` via `getCachedJobs` aiInsight include |
| react-markdown + Framer Motion | ✅ | `AiInsightsPanel` · `JobEnrichmentBadge` |
| Browser extension | ✅ | `browser-extension/` · token auth · `POST /api/extension/jobs` |
| Multi-user / team mode | ✅ | `/team` · `Team`/`TeamMember` Prisma · invite flow · `Job.teamId` |
| Auto-apply email inbound | ✅ | `inboundEmailAddress` on `UserProfile` · `EmailInboundSetup` on `/profile` |
| Batch AI analysis | ✅ | `useAIBatch` · ARQ worker · `POST /api/internal/ai-complete` callback |
| Interview prep on status change | ✅ | `triggerInterviewPrepAction` · `interview_prep_ready` bell notification |
| Company intelligence on cards | ✅ | `companySize` copied from the linked posting's `Company` on `JobCard` |

---

## UI/UX Vision vs Current State

| Screen / Feature | Vision | Current |
| --- | --- | --- |
| `/discover` | Two-panel + facet sidebar + infinite scroll | ✅ Sidebar lg+ · ✅ facet counts · ✅ infinite scroll |
| `/dashboard` cards | Posting badge + AI fit chip | ✅ Badge + CompanyLogo + **AIFitChip** + companySize |
| `/dashboard/[id]` | AI Insights + Posting Activity + Skill Gap | ✅ `JobDetailPanels` — 3 tabs |
| `/profile` | Skills + resume PDF + extension + batch AI + email inbound | ✅ `UserProfileForm` + `ResumeUpload` + `ExtensionConnect` + `BatchAnalysisTrigger` |
| `/team` | Shared job tracking + invite members | ✅ `TeamDashboard` · `InviteMemberForm` |
| `/timeline` | Global activity feed | ✅ job_created · enriched · posting_changed · ai_generated |
| Notification center | Bell + SSE (+ interview_prep_ready) | ✅ Complete |
| `/stats` | Rich analytics + salary intel | ✅ 4 charts + KPI + **SalaryIntelligence** |
| AI streaming | Pipeline progress + streamed output | ✅ `PipelineProgress` + SSE; cover letter shown after complete |

---

## Data Flow Summary

```bash
User adds job (applyUrl optional)
  → after() linkJobToPosting → store postingId + posting snapshot
  → invalidateUserJobCaches → SSE → badge on card

Nightly cron (/api/cron/enrich)
  → resyncJob → diffSnapshot → posting_closed | salary_added | jd_changed
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

1. ✅ Prisma catalog: `Company` / `JobPosting` / `JobPostingEvent` + Job snapshot columns + missing FKs
2. ✅ Catalog reads + read API (`lib/postings/*`, `/api/postings*`) + deterministic seed
3. ✅ Posting link via Server Actions + `after()` hook
4. ✅ Bluedoor removed (API no longer exists) — webhook route, client and columns deleted
5. ✅ Dashboard job card status badges
6. ✅ `/discover` — search, infinite scroll, Details modal, Track Application
7. ✅ Resend email alerts — React Email templates (PostingClosed, JdChanged, SalaryAdded, WeeklyDigest)
8. ✅ Vercel cron nightly posting resync
9. ✅ SSE notification bell (BroadcastChannel relay, NotificationsProvider)
10. ✅ `publishNotification` wired in `resyncJob`
11. ✅ Discover + Stats UI overhaul (glass filters, card shells, 4 charts, KPIs)
12. ✅ Posting Activity tab (`getPostingEvents` + `PostingActivityTab` + `JobDetailPanels`)
13. ✅ Facet counts (`groupBy`) — live counts in `DiscoverFilters`
14. ✅ Weekly email digest cron (`/api/cron/weekly-digest`)
15. ✅ Company logos (`CompanyLogo` — Google s2 favicons)

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
10. ⬜ Coolify deploy + Ollama models + Redis worker
11. ✅ AI fit chip on dashboard cards
12. ✅ ARQ batch queue + `ai-complete` callback

### Phase 3

1. ✅ Resume PDF parser · Skill Gap · Salary Intel · fit chip
2. ✅ Browser extension · team mode · email inbound
3. ✅ Batch AI · interview prep notification · LLM skill gap mode
4. ⬜ Extension Chrome Web Store publish · manual QA at scale

---

## Constraints

- **All free tier** — own postings catalog, Groq, OpenRouter free models, Resend 3k/mo, n8n self-hosted, Ollama self-hosted
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

_Last updated: 2026-06-29 (BL-0011 — team, extension, email inbound, ARQ, interview prep) · `2429e63`_
