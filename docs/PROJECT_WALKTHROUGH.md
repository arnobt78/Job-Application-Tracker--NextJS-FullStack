# Jobify Project Walkthrough

Demo: <https://jobify-tracker.vercel.app>

**Last updated:** 2026-06-30 (BL-0013 cache sync fix @ `10bdb01`)  
**Verification:** lint ✓ · typecheck ✓ · test **58/58** ✓ · build ✓

---

## What Jobify Is

A **job application tracker (CRM)** at its core: users log applications (company, role, status), filter their pipeline, view stats/charts, and export data.

| Layer | Status |
| --- | --- |
| **Core tracker** | ✅ Complete — CRUD, filters, pagination, export, optimistic UI, SSE sync |
| **Phase 1 — Postings catalog** | ✅ Complete — own Postgres catalog (Company / JobPosting / JobPostingEvent), posting link + nightly resync, discover (two-panel sidebar), facets, `/api/postings`, notifications, React Email, weekly digest (Bluedoor removed — API no longer exists) |
| **Stats overhaul** | ✅ Complete — KPI row + 4 chart types + weekly velocity |
| **Global timeline** | ✅ Complete — `/timeline` — job_created, enriched, posting_changed, ai_generated |
| **Phase 2 — AI** | ✅ ~90% — FastAPI + streaming SSE + `PipelineProgress` + DB persist + `/profile` for UserProfile |
| **Phase 2 — n8n / Coolify** | ⚠️ Partial — internal API + `docs/n8n/*.json` templates; no VPS deploy |
| **Testing / analytics** | ✅ Vitest 107 · pytest 26 · Playwright 31 (auth `storageState` + console/network assertions, own-row CRUD) · PostHog (optional) |
| **Phase 3 — complete** | ✅ AI fit chip · react-markdown · Framer Motion · PDF parser · Skill Gap (keyword + LLM) · Salary Intel · Team mode · Browser extension · Email inbound · ARQ batch AI · Interview prep |

**Roadmap detail:** `docs/PROJECT_PLAN.md` · **Stack decisions:** `docs/JOBIFY_TECH_STACK_ANALYSIS.md`

---

## Implementation Status (Audit)

### ✅ Shipped and working

| Area | What exists |
| --- | --- |
| **Auth** | NextAuth v5 (Google/credentials), `proxy.ts` route protection (Next.js 16) |
| **Dashboard** | URL filters, glass filter bar, `JobCardShell` skeletons, pagination, download, CompanyLogo |
| **CRUD** | Server Actions + `useJobsMutation` optimistic updates + cross-tab invalidation |
| **Postings catalog** | `lib/postings/*` — queries, cache (`postings` tag), zod schema, read API `/api/postings*` |
| **Posting link** | `lib/postings/link.ts` — exact apply URL, else same company + title similarity ≥ 0.5; `after()` on create/update/extension |
| **Posting badge** | `JobEnrichmentBadge` — Live / Closed / JD Changed / Salary Added (from `postingChangeType`) |
| **Notifications** | SSE + `NotificationsProvider` + `NotificationBell` + BroadcastChannel |
| **Email (React Email)** | PostingClosed, JdChanged, SalaryAdded, WeeklyDigest templates |
| **Cron** | posting resync 03:00 UTC · weekly-digest Sunday 09:00 UTC — `lib/cron-auth.ts` fails closed without `CRON_SECRET` |
| **Stats** | KPI row + 4 charts + weekly velocity |
| **Discover** | `/discover` — two-panel layout, facet counts, infinite scroll, Details modal, **Track Application** → `trackJobFromDiscoverAction(postingId)` (server loads the posting, idempotent upsert on `userId + postingId`); `alreadyTracked` toast + optimistic rollback; BL-0013 Redis SCAN fix ensures default list key always purged |
| **Timeline** | `/timeline` — global activity feed from Job rows + `JobAIInsight` |
| **User profile** | `/profile` — skills, target roles, experience level, resume text for AI context |
| **AI — streaming** | `useStreamPipeline` → `/api/ai/pipeline/stream` → `PipelineProgress` (9 steps) |
| **AI — panel** | `AiInsightsPanel` — DB instant load, SSE generate/regenerate, `saveAIInsightAction`, react-markdown output |
| **AI fit chip** | `AIFitChip` on `JobCard` — fitScore from `getCachedJobs include aiInsight`; auto-busts via `saveAIInsightAction` |
| **Posting Activity tab** | `JobDetailPanels` — AI Insights · Skill Gap · Posting Activity tabs on `/dashboard/[id]` |
| **Skill Gap** | `lib/jobs/skill-gap.ts` + `SkillGapTab` — user profile skills vs linked posting description; matched/missing/bonus |
| **Resume PDF parser** | `lib/pdf/extract-text.ts` (pdfjs-dist) + `ResumeUpload` drag-drop + `uploadResumeAction` on `/profile` |
| **Salary Intelligence** | `getSalaryIntelligenceAction` + `SalaryIntelligence` on `/stats` — avg range, currency, top roles |
| **Internal API** | `GET /api/internal/jobs` + `POST /api/internal/notify` (`X-Internal-Secret`) |
| **n8n templates** | `docs/n8n/` — daily-digest, stale-app-alert, posting-change-webhook JSON |
| **PostHog** | `PostHogProvider` + `trackEvent` — no-op without `NEXT_PUBLIC_POSTHOG_KEY` |
| **E2E tests** | Playwright — `tests/e2e/auth`, `routes`, `dashboard`, `discover`, `stats`, `user-profile` |

### ⬜ Not yet implemented

| Item | Notes |
| --- | --- |
| Coolify VPS deploy | ✅ DONE — `jobify-redis` · `jobify-ai-backend` · `jobify-arq-worker` @ `ai.arnobmahmud.com` |
| n8n instance | JSON templates in `docs/n8n/`; import + run on VPS |
| E2E in CI | Playwright specs exist; CI wiring optional |

---

## Architecture

```text
force-dynamic
  dashboard/layout → auth() → NavUserProvider + NotificationsProvider
  page.tsx → await prefetchQuery / prefetchInfiniteQuery → HydrationBoundary
  PersistQueryClient (localStorage jobify-query-cache, buster v1)
    persists: jobs · stats · charts · charts-weekly · job(id)
    NOT persisted: discover · ai · aiInsight (DB is source of truth)
  lib/jobs/queries.ts (unstable_cache + tags + optional Redis)
  utils/actions.ts (NextAuth + postings search/link)

Client: useQueryBodyLoading → skeleton only on cold cache
CRUD: useJobsMutation (optimistic) → onSuccess invalidateAll+broadcast · onSettled invalidateAll (no re-broadcast)
Sync: SSE /api/jobs/events + BroadcastChannel (jobify-cache + jobify-notifications)

Postings: create/update → after() linkJobToPosting → invalidateUserJobCaches → SSE updates cards
Discover: `lib/discover/query-options.ts` + `useInfiniteQuery` — SSR prefetch + cursor pagination, Load More
```

---

## Key paths

| Path | Role |
| --- | --- |
| `app/(dashboard)/layout.tsx` | SSR NextAuth session → NavUserProvider + NotificationsProvider |
| `app/(dashboard)/dashboard/page.tsx` | prefetch list + filterOptions + stats |
| `app/(dashboard)/stats/page.tsx` | prefetch stats + charts + chartsWeekly + **salaryIntel** |
| `app/(dashboard)/dashboard/[id]/page.tsx` | prefetch job detail + `EditJobDialogPage` + `JobDetailPanels` |
| `app/(dashboard)/profile/page.tsx` | SSR prefetch `UserProfile` + `UserProfileForm` + `ResumeUpload` + `BatchAnalysisTrigger` + `ExtensionConnect` + `EmailInboundSetup` |
| `app/(dashboard)/team/page.tsx` | SSR prefetch team data → `TeamDashboard` (create team / member management) |
| `app/(dashboard)/timeline/page.tsx` | SSR prefetch global activity feed |
| `app/(dashboard)/discover/page.tsx` | two-panel: `DiscoverSidebar` (lg+) + results; SSR prefetch via `lib/discover/query-options.ts` |
| `lib/discover/query-options.ts` | SSR-safe `buildDiscoverQueryOptions` — shared by page prefetch + client hooks |
| `lib/discover/track-helpers.ts` | `toTrackValues` (posting → form values) + shared salary / workplace formatters |
| `hooks/useJobsMutation.ts` | `useCreateJobMutation` + `useTrackDiscoverJobMutation` — optimistic skips `filter-options` cache |
| `components/discover/discover-sidebar.tsx` | Sticky left-rail filters with facet counts (desktop) |
| `components/timeline/timeline-view.tsx` | Client timeline list — `getTimelineEventsAction` |
| `lib/jobs/timeline.ts` | Derive events from Job + aiInsight (cached by jobsTag) |
| `components/user-profile/user-profile-form.tsx` | Skills tags, target roles, resume textarea |
| `components/jobs/ai-fit-chip.tsx` | Inline fit score badge on `JobCard` |
| `components/jobs/skill-gap-tab.tsx` | Profile vs job description keyword gap analysis |
| `components/stats/salary-intelligence.tsx` | Aggregated linked-posting salary KPIs on `/stats` |
| `components/user-profile/resume-upload.tsx` | PDF drag-drop → `uploadResumeAction` |
| `lib/pdf/extract-text.ts` | pdfjs-dist server-side text extraction |
| `lib/jobs/skill-gap.ts` | `computeSkillGap()` — COMMON_SKILLS keyword matching |
| `components/jobs/pipeline-progress.tsx` | 9-step animated progress during SSE pipeline |
| `app/api/ai/pipeline/stream/route.ts` | SSE proxy → Python `/pipeline/run/stream` |
| `components/providers/posthog-provider.tsx` | Lazy PostHog init |
| `lib/analytics/posthog.ts` | `trackEvent`, `identifyUser` — no-op without key |
| `docs/n8n/` | Workflow JSON for import (daily digest, stale alert, webhook) |
| `tests/e2e/` | Playwright specs (auth, every dashboard route, dashboard CRUD, discover track, stats, profile) — CRUD creates and deletes only its own `E2E-<timestamp>` rows |
| `lib/postings/queries.ts` · `cache.ts` | Keyset search, facets, detail, events + `unstable_cache` wrappers |
| `lib/postings/link.ts` | Match + snapshot + `diffSnapshot` + `resyncJob`; `publishNotification` + `sendPostingChangeEmail` |
| `prisma/seed.ts` · `prisma/seed-data/` | Deterministic demo data — 15 companies, 50 postings + events, demo user, 25 jobs, profile |
| `lib/jobs-events.ts` | SSE event bus: `invalidate` \| `notify` |
| `lib/notifications/email.ts` | Resend wrapper — React Email templates, graceful no-op without `RESEND_API_KEY` |
| `lib/notifications/templates/` | `PostingClosedEmail`, `JdChangedEmail`, `SalaryAddedEmail`, `WeeklyDigestEmail` |
| `lib/notifications/weekly-digest.ts` | `sendAllWeeklyDigests()` — per-user Sunday summary |
| `lib/ai/pipeline-client.ts` | AI service types + `toPipelineJobInput()` (client-safe) |
| `lib/ai/insight-mapper.ts` | `pipelineResultToInsight` / `insightToPipelineResponse` + `fitLabelFromScore` — shared by panel save and ARQ callback |
| `lib/ai/pipeline-payload.ts` | Server-only `PIPELINE_JOB_SELECT` + `loadPipelineUserProfile` (stream, batch, interview prep) |
| `lib/ui/company-logo.ts` | `extractDomain(url)` — logo domain helper |
| `components/ui/company-logo.tsx` | `<CompanyLogo>` — img + Building2 fallback |
| `components/jobs/ai-insights-panel.tsx` | DB-loaded insight + generate/regenerate; `gcTime:0` |
| `lib/query-body-loading.ts` | Warm cache check (SSR/persist/hydrate) |
| `lib/jobs/queries.ts` | `getCachedJobs`, `getCachedStats`, `getCachedCharts`, `getCachedWeeklyCharts` |
| `hooks/useJobsListBodyLoading.ts` | List query + bodyLoading |
| `hooks/useJobsCacheSync.ts` | SSE + BroadcastChannel cache sync; relays notify events |
| `hooks/useAIPipeline.ts` | `useStreamPipeline` — SSE progress; exactly one of onSuccess/onError per run |
| `hooks/useJobsMutation.ts` | Optimistic CRUD + `invalidateAllJobQueries` |
| `lib/query-client.ts` / `lib/query-persist.ts` | RQ defaults + localStorage persist rules |
| `lib/invalidate-jobs.ts` | jobs · stats · charts · chartsWeekly · filterOptions · timeline · **salaryIntel** · job(id) |
| `lib/query-keys.ts` | discover.* · aiInsight · timeline · skillGap · skillGapAI · salaryIntel · chartsWeekly · **team.current/members** |
| `app/api/extension/token\|jobs\|verify` | Browser extension: generate token, POST job, verify connection |
| `app/api/email/inbound` | Resend inbound webhook — HMAC verify → FastAPI `/parse-email` → job create + SSE |
| `app/api/ai/batch` | ARQ batch enqueue — jobs without insight → FastAPI `/enqueue` |
| `app/api/internal/ai-complete` | ARQ completion callback — upsert `JobAIInsight` + SSE invalidation |
| `python-ai-service/app/api/routes/email.py` | `POST /parse-email` — LLM email classification |
| `python-ai-service/app/api/routes/queue.py` | `POST /enqueue` + `GET /task/{id}` — ARQ queue endpoints |
| `python-ai-service/app/api/routes/skills.py` | `POST /skill-gap` — LLM semantic skill matching |
| `python-ai-service/app/api/routes/interview.py` | `POST /pipeline/interview-prep` — angles-only pipeline |
| `python-ai-service/app/tasks/pipeline_task.py` | ARQ task + `_notify_complete` → `/api/internal/ai-complete` |
| `context/notifications-context.tsx` | BroadcastChannel subscriber; AppNotification[] state |
| `components/layout/notification-bell.tsx` | Bell icon + unread badge + popover list |
| `components/jobs/job-enrichment-badge.tsx` | Live / Closed / JD Changed / Salary Added |
| `components/jobs/job-card-shell.tsx` | Stable chrome; text skeletons cold only |
| `components/jobs/ai-insights-panel.tsx` | On-demand AI fit score + cover letter + interview angles |
| `components/jobs/posting-activity-tab.tsx` | Posting event timeline — on-demand via `getPostingEventsAction` |
| `components/jobs/job-detail-panels.tsx` | Tab wrapper: AI Insights + Posting Activity — `/dashboard/[id]` |
| `components/pages/edit-job-dialog-page.tsx` | Client shell — passes `JobDetailPanels` as `aiPanel` to `EditJobDialog` |
| `components/discover/discover-results.tsx` | `useInfiniteQuery` + `useQueryBodyLoading` spinner (cold) + Load More |
| `components/ui/glass-filter-dropdown.tsx` | Shared status/mode dropdown — icons + `formatEnumLabel` |
| `components/jobs/job-form-dialog-header.tsx` · `job-form-dialog-footer.tsx` | Add/Edit dialog chrome |
| `lib/ui/job-dialog-dimensions.ts` | `JOB_DIALOG_PANEL_CLASS` 80vw×80vh |
| `components/discover/discover-job-details-modal.tsx` | On-demand posting detail + AiInsightsPanel |
| `components/discover/discover-page-header.tsx` | Static h1 (dashboard layout parity) |
| `components/discover/discover-filter-section.tsx` | Subtitle + clear button + DiscoverFilters |
| `components/discover/discover-results-toolbar.tsx` | Live posting count badge |
| `components/stats/*` | application-trend, weekly-velocity, status/mode charts, stats-kpi-row |
| `app/api/jobs/events/route.ts` | SSE — multiplexes invalidate + notify |
| `app/api/ai/pipeline/route.ts` | NextAuth auth proxy → Python AI service |
| `app/api/postings/*` | Session-gated read API — search, facets, detail, events |
| `app/api/cron/enrich/route.ts` | Nightly resync of linked jobs (Vercel cron 03:00 UTC) |
| `app/api/cron/weekly-digest/route.ts` | Sunday 09:00 UTC weekly summary email |
| `app/api/internal/jobs/route.ts` | n8n — list jobs by `userId` (`X-Internal-Secret`) |
| `app/api/internal/notify/route.ts` | n8n — push in-app notification |
| `utils/actions.ts` | CRUD + postings + AI insight persist + UserProfile |
| `python-ai-service/` | FastAPI + 9-agent pipeline + LLM router |

---

## Dashboard layout

1. `DashboardPageHeader` — h1 + Add Job dialog
2. `PageSectionHeader` — Search & Filter (static, outside Suspense)
3. `JobsFilterSection` — subtitle + clear button + `JobsFilterBar` (GlassCard sky)
4. `JobsResultsToolbar` — count badge + `PortfolioBreakdownRow` + download
5. `JobsGrid` — `JobCardShell` grid → enrichment badge + apply link
6. `JobsPagination`

---

## Discover layout

1. `DiscoverPageHeader` — h1 + subtitle (static)
2. **Desktop (`lg+`):** `DiscoverSidebar` (sticky left, facet counts) + results column
3. **Mobile:** `DiscoverFilterSection` (top glass filter bar) + results
4. `DiscoverResultsToolbar` — live posting count badge
5. `DiscoverResults` — `useInfiniteQuery` grid + **Load More**
6. `DiscoverJobCard` — CompanyLogo · Details modal · Track Application

**Data path:** `searchPostingsAction` (Server Action) for the UI; the same zod schema backs `GET /api/postings` for external callers.

---

## Stats layout

1. `PageSectionHeader` — Statistics (h1)
2. `StatsContainer` — pending / interview / declined cards
3. `StatsKpiCards` (inside the `StatsContainer` 6-card grid) — response rate, interview rate, top job type
4. `ApplicationTrendChart` — monthly bar + projected line (GlassCard sky)
5. `WeeklyVelocityChart` — 12-week area chart (GlassCard violet)
6. `StatusDistributionChart` + `ModeDistributionChart` — side-by-side (emerald / amber)

**Prefetch:** `stats.all` + `charts.all` + `chartsWeekly.all` in parallel on SSR.

---

## Posting link flow

1. User saves a job (create / edit / browser extension); `applyUrl` is optional.
2. `createJobAction` / `updateJobAction` call `after(() => linkJobToPosting(…))`.
3. `link.ts` matches a posting: exact normalised apply URL → else same company name + title similarity ≥ 0.5; skipped if another of the user's jobs already owns it.
4. `buildPostingSnapshot` writes `postingId`, `postingStatus`, workplace, salary, `postingDescHash`, company size/industry/HQ.
5. `invalidateUserJobCaches` → tags + Redis + SSE → dashboard cards update without refresh.
6. Nightly cron calls `resyncJob` for every linked job; `diffSnapshot` → `posting_closed` / `salary_added` / `jd_changed`.
7. A change sets `postingChangedAt` + `postingChangeType` → `publishNotification` (bell) + `sendPostingChangeEmail` (React Email via Resend).

**Prisma:** `Job.postingId` → `JobPosting` (`SetNull`, unique per user) · `JobPosting.companyId` → `Company` (cascade) · `JobPostingEvent.postingId` → `JobPosting` (cascade).

---

## Notification flow

1. Posting `resyncJob` detects change → `publishNotification(userId, type, jobId, message)`.
2. `lib/jobs-events.ts` dispatches `notify` event to in-memory SSE listener for that userId.
3. SSE route encodes event → client `EventSource` in `useJobsCacheSync`.
4. `useJobsCacheSync` relays via `BroadcastChannel('jobify-notifications')`.
5. `NotificationsProvider` (dashboard layout) subscribes → appends to `notifications[]`.
6. `NotificationBell` in nav reads `useNotifications()` → badge count + popover.

---

## Weekly digest flow

1. Vercel cron hits `GET /api/cron/weekly-digest` Sunday 09:00 UTC (`CRON_SECRET`).
2. `sendAllWeeklyDigests()` in `lib/notifications/weekly-digest.ts` iterates active users.
3. Per user: aggregate week's job activity → render `WeeklyDigestEmail` → Resend.
4. Graceful no-op when `RESEND_API_KEY` absent.

---

## `/dashboard/[id]` — Edit dialog + detail panels

1. `EditJobDialog` — edit form (position, company, status, apply URL, …)
2. `JobDetailPanels` below form:
   - **AI Insights** — `AiInsightsPanel` → `useStreamPipeline` → `/api/ai/pipeline/stream` (profile added server-side; LLM chain in `python-ai-service/app/llm/registry.py`)
   - **Posting Activity** — `PostingActivityTab` → `getPostingEventsAction` (disabled until `postingId` set)

---

## Posting Activity flow

1. User opens `/dashboard/[id]` for a linked job (`postingId` present).
2. Clicks **Posting Activity** tab in `JobDetailPanels`.
3. `PostingActivityTab` runs `useQuery` with `queryKeys.discover.events(postingId)`.
4. `getPostingEventsAction` → `getCachedPostingEvents` → `JobPostingEvent` rows (newest 20).
5. Timeline renders: published · updated · closed · reopened with icons and UTC timestamps.

**Not persisted** — fetched on tab open.

---

## Global timeline flow (`/timeline`)

1. `getTimelineEventsAction` → `lib/jobs/timeline.ts` queries user's jobs + `aiInsight`.
2. Derives up to 4 event types per job: `job_created`, `enriched`, `posting_changed`, `ai_generated`.
3. Sorted desc, capped at 100 — cached via `unstable_cache` tagged with `jobsTag(userId)`.
4. `TimelineView` renders `TimelineItem` list with icons and relative timestamps.

---

## AI pipeline flow (Phase 2 — streaming)

1. `AiInsightsPanel` mounts → `getAIInsightAction` loads `JobAIInsight` from DB (instant if exists).
2. User clicks **Generate** or **Regenerate** → `useStreamPipeline` → `POST /api/ai/pipeline/stream`.
3. Next.js SSE proxy → Python `POST /pipeline/run/stream` — emits per-agent progress events.
4. `PipelineProgress` shows 9 animated steps as SSE events arrive.
5. Final SSE event includes `PipelineResponse` → `saveAIInsightAction` → panel renders result.
6. User profile from `/profile` passed as `PipelineUserProfile` context when available.

**Wired in:** `JobDetailPanels` on `/dashboard/[id]` + `DiscoverJobDetailsModal`.  
**Not yet:** production FastAPI deploy on Coolify.

---

## Loading UX

- `useQueryBodyLoading` — no skeleton when SSR/hydrate/persist has data
- `placeholderData` / `keepPreviousData` on jobs list + discover — no flash on filter change
- `JobCardShell` — static chrome; text skeletons cold only
- Discover results — centered `Loader2` on cold cache only
- Route `loading.tsx` (every dashboard route) renders the same `*-page-view.tsx` as `page.tsx` inside `RouteFallbackProvider`: snapshot of the app cache, queries `enabled: !isRouteFallback` (no requests), `inert` (no input lost on swap). Click → real layout in ~50–120 ms; nav uses `IntentLink` (prefetch on hover/focus/touch, no viewport prefetch) + `staleTimes.dynamic=30`
- Navbar avatar — single ring + glow; pulse only when no SSR seed

---

## Invalidation

**Client** (`invalidateAllJobQueries`): `jobs.all`, `stats`, `charts`, `chartsWeekly`, `filterOptions`, `timeline()`, `salaryIntel()`, `job.detail(id)`.  
Mutations: `onSuccess` broadcasts once; `onSettled` resyncs all keys without re-broadcast.

**Server** (`invalidateUserJobCaches`): `revalidatePath` dashboard/stats/job/**timeline** + tags (`expire: 0`) + Redis + SSE. Catalog reads use the separate `postings` tag.

Discover, skill-gap, AI mutation, posting-events, and facet queries are **not** in persist scope.

---

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `AUTH_SECRET` | yes | NextAuth JWT signing |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | optional | Google OAuth |
| `DATABASE_URL` / `DIRECT_URL` | yes | PostgreSQL |
| `UPSTASH_REDIS_REST_URL` / `TOKEN` | optional | Redis cache + SSE streams |
| `CRON_SECRET` | prod cron | Authorize Vercel cron → `/api/cron/enrich` + `/api/cron/weekly-digest` (requests rejected when unset) |
| `RESEND_API_KEY` | optional | Email alerts (no-op if absent) |
| `EMAIL_FROM` | optional | From address for Resend |
| `NEXT_PUBLIC_APP_URL` | optional | Job deep-links in emails |
| `AI_SERVICE_URL` | optional | Python AI service (default `http://localhost:3000`; prod `https://ai.arnobmahmud.com`) |
| `AI_SERVICE_SECRET` | optional | Shared secret for Next.js → Python + internal API (`X-Internal-Secret`) |
| `NEXT_PUBLIC_POSTHOG_KEY` | optional | PostHog analytics (no-op if absent) |
| `NEXT_PUBLIC_POSTHOG_HOST` | optional | PostHog API host (default us.i.posthog.com) |

Demo data: `npm run db:seed` (catalog + demo account) · `npm run db:reset` wipes the whole DB first.

---

## Verify

```bash
npm run lint && npm run typecheck && npm run test && npm run build
npm run test:e2e    # Playwright (requires a running server + seeded DB)
```

107 Vitest tests · 26 pytest · 31 Playwright tests (auth setup + console/network assertions) · all dashboard routes `force-dynamic`.

---

## Related docs

- `docs/PROJECT_PLAN.md` — v2 vision, phased roadmap, what's left
- `docs/JOBIFY_TECH_STACK_ANALYSIS.md` — stack decisions + implementation matrix
- `README.md` — full educational guide for learners
- `.agile-v/PLAYBOOK.md` — Agile V session protocol
