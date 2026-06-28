# Jobify Project Walkthrough

Demo: <https://jobify-tracker.vercel.app>

**Last updated:** 2026-06-28 (T1–T8 complete, papaparse removed)  
**Verification:** `npm run lint && npm run typecheck && npm run test && npm run build` — **49/49 tests** — lint 0 · types 0 · build ✓

---

## What Jobify Is

A **job application tracker (CRM)** at its core: users log applications (company, role, status), filter their pipeline, view stats/charts, and export data.

| Layer | Status |
| --- | --- |
| **Core tracker** | ✅ Complete — CRUD, filters, pagination, export, optimistic UI, SSE sync |
| **Phase 1 — Bluedoor** | ✅ Complete — enrichment, discover, webhooks, facets, auto-subscribe, cron, notifications, React Email, weekly digest, company logos |
| **Stats overhaul** | ✅ Complete — KPI row + 4 chart types + weekly velocity |
| **Phase 2 — AI** | ✅ Scaffolded + persisted — FastAPI + 9 agents + `AiInsightsPanel` (DB `JobAIInsight`, Regenerate, n8n internal API) |
| **Phase 2 — n8n / Coolify** | ⬜ Infrastructure only — internal API routes done; n8n flows not authored |
| **Phase 3** | ⬜ Future — resume parser, browser extension, etc. |

**Roadmap detail:** `docs/PROJECT_PLAN.md` · **Stack decisions:** `docs/JOBIFY_TECH_STACK_ANALYSIS.md`

---

## Implementation Status (Audit)

### ✅ Shipped and working

| Area | What exists |
| --- | --- |
| **Auth** | Clerk 6, custom sign-in/up, `middleware.ts` route protection |
| **Dashboard** | URL filters, glass filter bar, `JobCardShell` skeletons, pagination, download, CompanyLogo |
| **CRUD** | Server Actions + `useJobsMutation` optimistic updates + cross-tab invalidation |
| **Bluedoor enrich** | `lib/bluedoor/client.ts`, `enrich.ts`, ATS/URL/fuzzy match, `after()` on create/update |
| **Webhook auto-subscribe** | `registerBluedoorWebhook` on enrich → `bluedoorWebhookSubId`; unsubscribe on delete |
| **Enrichment UI** | `JobEnrichmentBadge` — LIVE / CLOSED / CHANGED / SALARY / Syncing |
| **Discover** | `/discover` — glass filters + live facet counts, infinite scroll, Details modal, Track Application |
| **Notifications** | SSE + `NotificationsProvider` + `NotificationBell` + BroadcastChannel relay |
| **Email (React Email)** | `PostingClosedEmail`, `JdChangedEmail`, `SalaryAddedEmail`, `WeeklyDigestEmail` templates |
| **Weekly digest cron** | `GET /api/cron/weekly-digest` — Sunday 09:00 UTC, per-user activity summary |
| **Cron** | `GET /api/cron/enrich` — nightly batch resync (Vercel cron 03:00 UTC) |
| **Webhook inbound** | `POST /api/bluedoor/webhook` — HMAC verify + `resyncJob` |
| **Stats** | Status cards, KPI row, monthly trend, weekly velocity, status donut, mode bars |
| **AI — DB persistence** | `JobAIInsight` model, `saveAIInsightAction`/`getAIInsightAction`, Regenerate flow |
| **AI — panel** | `AiInsightsPanel` — loads from DB instantly, generate/regenerate, `staleTime:Infinity gcTime:0` |
| **AI — Python service** | `python-ai-service/` FastAPI, 9-agent pipeline, LLM fallback Ollama→Groq→OpenRouter→Anthropic |
| **Posting Activity tab** | `JobDetailPanels` — tabbed AI Insights + Bluedoor event timeline on `/dashboard/[id]` |
| **Internal API** | `GET /api/internal/jobs` + `POST /api/internal/notify` (x-internal-secret, n8n use) |

### ⬜ Not yet implemented (Phase 2+ roadmap)

| Item | Notes |
| --- | --- |
| Coolify VPS deploy | Infrastructure planned, not in repo |
| n8n automation flows | Internal API routes ready; flows not authored |
| Cover letter streaming UI | Panel shows full response after pipeline completes |
| 9-agent progress UI | Animated pipeline steps during run |
| ARQ / Celery job queue | Pipeline runs synchronously in FastAPI request |
| UserProfile UI | `upsertUserProfileAction` exists; no settings page yet |
| PostHog | Deferred |
| Phase 3 | Resume parser, salary intelligence, browser extension |

---

## Architecture

```text
force-dynamic
  dashboard/layout → currentUser() → NavUserProvider + NotificationsProvider
  page.tsx → await prefetchQuery / prefetchInfiniteQuery → HydrationBoundary
  PersistQueryClient (localStorage jobify-query-cache, buster v1)
    persists: jobs · stats · charts · charts-weekly · job(id)
    NOT persisted: discover · ai · aiInsight (DB is source of truth)
  lib/jobs/queries.ts (unstable_cache + tags + optional Redis)
  utils/actions.ts (Clerk + Bluedoor search/enrich)

Client: useQueryBodyLoading → skeleton only on cold cache
CRUD: useJobsMutation (optimistic) → onSuccess invalidateAll+broadcast · onSettled invalidateAll (no re-broadcast)
Sync: SSE /api/jobs/events + BroadcastChannel (jobify-cache + jobify-notifications)

Bluedoor: create/update with applyUrl → after() enrichJob → invalidateUserJobCaches → SSE updates cards
Discover: useInfiniteQuery + buildDiscoverQueryOptions — cursor pagination, Load More
```

---

## Key paths

| Path | Role |
| --- | --- |
| `app/(dashboard)/layout.tsx` | SSR Clerk user → NavUserProvider + NotificationsProvider |
| `app/(dashboard)/dashboard/page.tsx` | prefetch list + filterOptions + stats |
| `app/(dashboard)/stats/page.tsx` | prefetch stats + charts + chartsWeekly |
| `app/(dashboard)/dashboard/[id]/page.tsx` | prefetch job detail + `EditJobDialogPage` + `JobDetailPanels` |
| `app/(dashboard)/discover/page.tsx` | `prefetchInfiniteQuery` + `prefetchQuery(discover.facets)` in parallel |
| `lib/bluedoor/client.ts` | Bluedoor API client + `getJobEvents` + ATS parser + `registerBluedoorWebhook` / `unregisterBluedoorWebhook` + `getDiscoverFacets` |
| `lib/bluedoor/enrich.ts` | Match + enrich + resync + webhook subscribe; `publishNotification` + `sendPostingChangeEmail` |
| `lib/jobs-events.ts` | SSE event bus: `invalidate` \| `notify` |
| `lib/notifications/email.ts` | Resend wrapper — React Email templates, graceful no-op without `RESEND_API_KEY` |
| `lib/notifications/templates/` | `PostingClosedEmail`, `JdChangedEmail`, `SalaryAddedEmail`, `WeeklyDigestEmail` |
| `lib/notifications/weekly-digest.ts` | `sendAllWeeklyDigests()` — per-user Sunday summary |
| `lib/ai/pipeline-client.ts` | TypeScript types + `runAiPipeline()` → Python service |
| `lib/ui/company-logo.ts` | `extractDomain(url)` — Clearbit logo domain helper |
| `components/ui/company-logo.tsx` | `<CompanyLogo>` — img + Building2 fallback |
| `components/jobs/ai-insights-panel.tsx` | DB-loaded insight + generate/regenerate; `gcTime:0` |
| `lib/query-body-loading.ts` | Warm cache check (SSR/persist/hydrate) |
| `lib/jobs/queries.ts` | `getCachedJobs`, `getCachedStats`, `getCachedCharts`, `getCachedWeeklyCharts` |
| `hooks/useJobsListBodyLoading.ts` | List query + bodyLoading |
| `hooks/useJobsCacheSync.ts` | SSE + BroadcastChannel cache sync; relays notify events |
| `hooks/useAIPipeline.ts` | useMutation → POST /api/ai/pipeline |
| `hooks/useJobsMutation.ts` | Optimistic CRUD + `invalidateAllJobQueries` |
| `lib/query-client.ts` / `lib/query-persist.ts` | RQ defaults + localStorage persist rules |
| `lib/invalidate-jobs.ts` | jobs · stats · charts · chartsWeekly · filterOptions · job(id) |
| `lib/query-keys.ts` | discover.search/detail/events/facets · ai.pipeline · aiInsight.job · chartsWeekly |
| `context/notifications-context.tsx` | BroadcastChannel subscriber; AppNotification[] state |
| `components/layout/notification-bell.tsx` | Bell icon + unread badge + popover list |
| `components/jobs/job-enrichment-badge.tsx` | LIVE / CLOSED / CHANGED / SALARY / Syncing |
| `components/jobs/job-card-shell.tsx` | Stable chrome; text skeletons cold only |
| `components/jobs/ai-insights-panel.tsx` | On-demand AI fit score + cover letter + interview angles |
| `components/jobs/posting-activity-tab.tsx` | Bluedoor event timeline — on-demand via `getBluedoorJobEventsAction` |
| `components/jobs/job-detail-panels.tsx` | Tab wrapper: AI Insights + Posting Activity — `/dashboard/[id]` |
| `components/pages/edit-job-dialog-page.tsx` | Client shell — passes `JobDetailPanels` as `aiPanel` to `EditJobDialog` |
| `components/discover/discover-results.tsx` | `useInfiniteQuery` + `DiscoverCardShellGrid` + Load More |
| `components/discover/discover-job-details-modal.tsx` | On-demand Bluedoor detail + AiInsightsPanel |
| `components/discover/discover-page-header.tsx` | Static h1 (dashboard layout parity) |
| `components/discover/discover-filter-section.tsx` | Subtitle + clear button + DiscoverFilters |
| `components/discover/discover-results-toolbar.tsx` | Live posting count badge |
| `components/stats/*` | application-trend, weekly-velocity, status/mode charts, stats-kpi-row |
| `app/api/jobs/events/route.ts` | SSE — multiplexes invalidate + notify |
| `app/api/ai/pipeline/route.ts` | Clerk auth proxy → Python AI service |
| `app/api/bluedoor/webhook/route.ts` | Lifecycle events → resync linked jobs |
| `app/api/cron/enrich/route.ts` | Nightly batch resync (Vercel cron) |
| `utils/actions.ts` | CRUD + Bluedoor search/detail/events + chart actions |
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
2. `PageSectionHeader` — Search & Filter (static)
3. `DiscoverFilterSection` — subtitle + clear + `DiscoverFilters` (glass dropdowns)
4. `DiscoverResultsToolbar` — live posting count badge
5. `DiscoverResults` — `useInfiniteQuery` grid + **Load More** (cursor pagination)
6. `DiscoverJobCard` — Details modal · View (external) · Track Application (`useCreateJobMutation`)

**Data path:** `searchBluedoorJobsAction` (Server Action) — not a separate `/api/bluedoor/search` route.

---

## Stats layout

1. `PageSectionHeader` — Statistics (h1)
2. `StatsContainer` — pending / interview / declined cards
3. `StatsKpiRow` — response rate, interview rate, top job type
4. `ApplicationTrendChart` — monthly bar + projected line (GlassCard sky)
5. `WeeklyVelocityChart` — 12-week area chart (GlassCard violet)
6. `StatusDistributionChart` + `ModeDistributionChart` — side-by-side (emerald / amber)

**Prefetch:** `stats.all` + `charts.all` + `chartsWeekly.all` in parallel on SSR.

---

## Bluedoor enrichment flow

1. User saves `applyUrl` on create/edit (optional field on forms).
2. `createJobAction` / `updateJobAction` calls `after(() => enrichJob(…))`.
3. `enrich.ts` matches Bluedoor job (ATS key → URL → fuzzy company+title).
4. Prisma fields updated (`bluedoorJobId`, `bluedoorStatus`, salary, workplace, `bluedoorDescHash`, …).
5. `invalidateUserJobCaches` → tags + Redis + SSE → dashboard cards update without refresh.
6. Webhook/cron call `resyncJob` when posting closes or JD changes.
7. `resyncJob` detects `statusChanged` / `descChanged` / `salaryAdded` → `publishNotification` (bell) + `sendPostingChangeEmail` (Resend).

**Prisma:** `applyUrl` + 11 `bluedoor*` columns on `Job` (see `prisma/schema.prisma`).

---

## Notification flow

1. Enrichment `resyncJob` detects change → `publishNotification(userId, type, jobId, message)`.
2. `lib/jobs-events.ts` dispatches `notify` event to in-memory SSE listener for that userId.
3. SSE route encodes event → client `EventSource` in `useJobsCacheSync`.
4. `useJobsCacheSync` relays via `BroadcastChannel('jobify-notifications')`.
5. `NotificationsProvider` (dashboard layout) subscribes → appends to `notifications[]`.
6. `NotificationBell` in nav reads `useNotifications()` → badge count + popover.

---

## `/dashboard/[id]` — Edit dialog + detail panels

1. `EditJobDialog` — edit form (position, company, status, apply URL, …)
2. `JobDetailPanels` below form:
   - **AI Insights** — `AiInsightsPanel` → `useAIPipeline` → `/api/ai/pipeline`
   - **Posting Activity** — `PostingActivityTab` → `getBluedoorJobEventsAction` → `getJobEvents()` (disabled until `bluedoorJobId` set)

---

## Posting Activity flow

1. User opens `/dashboard/[id]` for an enriched job (`bluedoorJobId` present).
2. Clicks **Posting Activity** tab in `JobDetailPanels`.
3. `PostingActivityTab` runs `useQuery` with `queryKeys.discover.events(bluedoorJobId)`.
4. `getBluedoorJobEventsAction` → `getJobEvents()` → `GET /jobs/{id}/events?limit=20`.
5. Timeline renders: published · updated · closed · reopened with icons and UTC timestamps.

**Not persisted** — fetched on tab open; not in localStorage persist scope.

---

## AI pipeline flow (Phase 2 — scaffolded)

1. `AiInsightsPanel` "Generate Insights" → `useAIPipeline` mutation → `POST /api/ai/pipeline`.
2. Next.js route: Clerk auth + `X-Internal-Secret` → `runAiPipeline(payload)`.
3. `lib/ai/pipeline-client.ts` → `python-ai-service POST /pipeline/run` (~30s timeout).
4. FastAPI: 9-agent pipeline (Extractor → … → FinalVerifier).
5. LLM fallback: Ollama → Groq → OpenRouter → Anthropic claude-haiku-4-5-20251001.
6. `PipelineResponse` returned — fit score, cover letter, interview angles, summary.

**Wired in:** `JobDetailPanels` on `/dashboard/[id]` + `DiscoverJobDetailsModal`.  
**Not yet:** DB persistence, streaming, pipeline progress UI, production deploy.

---

## Loading UX

- `useQueryBodyLoading` — no skeleton when SSR/hydrate/persist has data
- `placeholderData` / `keepPreviousData` on jobs list + discover — no flash on filter change
- `JobCardShell` / `DiscoverCardShell` — static chrome; skeleton only on text slots
- Navbar avatar — pulse only when no SSR seed and Clerk not loaded
- `/discover/loading.tsx` — route-level skeleton matching dashboard parity layout

---

## Invalidation

**Client** (`invalidateAllJobQueries`): `jobs.all`, `stats`, `charts`, `chartsWeekly`, `filterOptions`, `job.detail(id)`.  
Mutations: `onSuccess` broadcasts once; `onSettled` resyncs all keys without re-broadcast.

**Server** (`invalidateUserJobCaches`): `revalidatePath` dashboard/stats/discover + `revalidateTag` all user tags + Redis delete + SSE publish.

Discover, AI, and posting-events queries are **not** in persist scope — refetch on navigation/filter/tab open.

---

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | yes | Clerk auth |
| `CLERK_SECRET_KEY` | yes | Clerk server |
| `DATABASE_URL` / `DIRECT_URL` | yes | PostgreSQL |
| `UPSTASH_REDIS_REST_URL` / `TOKEN` | optional | Redis cache + SSE streams |
| `BLUEDOOR_WEBHOOK_SECRET` | optional | HMAC verify inbound Bluedoor webhooks |
| `CRON_SECRET` | prod cron | Authorize Vercel cron → `/api/cron/enrich` |
| `RESEND_API_KEY` | optional | Email alerts (no-op if absent) |
| `EMAIL_FROM` | optional | From address for Resend |
| `NEXT_PUBLIC_APP_URL` | optional | Job deep-links in emails |
| `AI_SERVICE_URL` | optional | Python AI service (default `http://localhost:8000`) |
| `AI_SERVICE_SECRET` | optional | Shared secret for Next.js → Python |
| Sentry vars | optional | Error monitoring |

Bluedoor API requires **no API key** (free tier per Sam Crombie).

---

## Verify

```bash
npm run lint && npm run typecheck && npm run test && npm run build
```

49 tests · all routes `force-dynamic` on dashboard pages.

---

## Related docs

- `docs/PROJECT_PLAN.md` — v2 vision, phased roadmap, what's left
- `docs/JOBIFY_TECH_STACK_ANALYSIS.md` — stack decisions + implementation matrix
- `README.md` — full educational guide for learners
- `.agile-v/PLAYBOOK.md` — Agile V session protocol
