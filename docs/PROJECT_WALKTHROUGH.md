# Jobify Project Walkthrough

Demo: <https://jobify-tracker.vercel.app>

## What Jobify Is

A **job application tracker**: users log applications (company, role, status), filter their pipeline, view stats/charts, export data. **Phase 1 (complete)** adds Bluedoor live posting enrichment, `/discover` search, SSE notification bell, and Resend email alerts. **Phase 2 (scaffolded)** adds a Python FastAPI AI service with 9-agent pipeline and LLM fallback chain.

**Roadmap:** `docs/PROJECT_PLAN.md` — Phase 2 = FastAPI + Ollama multi-agent pipeline on Coolify VPS.

---

## Architecture

```text
force-dynamic
  dashboard/layout → currentUser() → NavUserProvider (avatar SSR)
  page.tsx → await prefetchQuery → HydrationBoundary
  PersistQueryClient (localStorage jobify-query-cache, buster v1)
  lib/jobs/queries.ts (unstable_cache + tags + Redis)
  utils/actions.ts (Clerk + Bluedoor search/enrich)

Client: useQueryBodyLoading → skeleton only on cold cache
CRUD: useJobsMutation (optimistic) → onSuccess invalidateAll+broadcast · onSettled invalidateAll (no re-broadcast) · SSE · BroadcastChannel

Bluedoor: create/update with applyUrl → after() enrichJob → invalidateUserJobCaches → SSE updates cards
Discover: queryKeys.discover.* — NOT persisted; SSR prefetch on /discover
```

---

## Key paths

| Path | Role |
| --- | --- |
| `app/(dashboard)/layout.tsx` | SSR Clerk user → NavUserProvider + NotificationsProvider |
| `app/(dashboard)/dashboard/page.tsx` | await prefetch list + filterOptions + stats |
| `app/(dashboard)/stats/page.tsx` | await prefetch stats + charts |
| `app/(dashboard)/dashboard/[id]/page.tsx` | await prefetch job detail |
| `app/(dashboard)/discover/page.tsx` | prefetchInfiniteQuery Bluedoor; URL-driven filters |
| `lib/bluedoor/client.ts` | Bluedoor API client + ATS URL parser |
| `lib/bluedoor/enrich.ts` | Match + enrich + resync; publishNotification + sendPostingChangeEmail |
| `lib/jobs-events.ts` | SSE event bus: invalidate + notify (JobsEvent union) |
| `lib/notifications/email.ts` | Resend email wrapper — graceful no-op without RESEND_API_KEY |
| `lib/ai/pipeline-client.ts` | TypeScript types + runAiPipeline() → Python service |
| `lib/query-body-loading.ts` | Warm cache check (SSR/persist/hydrate) |
| `hooks/useJobsListBodyLoading.ts` | List query + bodyLoading |
| `hooks/useJobsCacheSync.ts` | SSE + BroadcastChannel cache sync; relays notify events |
| `hooks/useNavUserSession.ts` | SSR snapshot + Clerk useUser |
| `hooks/useAIPipeline.ts` | useMutation → POST /api/ai/pipeline |
| `lib/query-client.ts` / `lib/query-persist.ts` | RQ defaults + localStorage persist |
| `lib/invalidate-jobs.ts` | jobs · stats · charts · filterOptions · job(id) |
| `lib/query-keys.ts` | includes discover.search/detail · ai.pipeline |
| `context/notifications-context.tsx` | BroadcastChannel subscriber; AppNotification[] state |
| `components/layout/notification-bell.tsx` | Bell icon + unread badge + popover list |
| `components/jobs/job-enrichment-badge.tsx` | LIVE / CLOSED / CHANGED badges |
| `components/jobs/job-card-shell.tsx` | Stable chrome; text skeletons cold only |
| `components/jobs/ai-insights-panel.tsx` | On-demand AI fit score + cover letter + interview angles |
| `components/discover/discover-results.tsx` | useInfiniteQuery; buildDiscoverQueryOptions factory |
| `components/discover/discover-job-details-modal.tsx` | On-demand Bluedoor detail fetch |
| `app/api/jobs/events/route.ts` | SSE — multiplexes invalidate + notify |
| `app/api/ai/pipeline/route.ts` | Clerk auth proxy → Python AI service |
| `app/api/bluedoor/webhook/route.ts` | Lifecycle events → resync linked jobs |
| `app/api/cron/enrich/route.ts` | Nightly batch resync (Vercel cron) |
| `python-ai-service/` | FastAPI + 9-agent pipeline + LLM router |

---

## Dashboard layout

1. `DashboardPageHeader`
2. Filter subtitle + Clear (reserved width) + `JobsFilterBar`
3. `JobsResultsToolbar` — badge + `PortfolioBreakdownRow` + download
4. `JobCardShell` grid → enrichment badge + apply link → pagination

---

## Discover layout

1. `PageSectionHeader` — Discover Jobs
2. `DiscoverFilters` — debounced `q`, country, workplace, employment, salary (URL params)
3. `DiscoverResults` — `useInfiniteQuery` via `buildDiscoverQueryOptions`; Load More cursor pagination
4. `DiscoverJobCard` — **Details** modal (on-demand fetch) · Apply link · **Track Application** (creates job + triggers enrich)

---

## Bluedoor enrichment flow

1. User saves `applyUrl` on create/edit (optional field on forms).
2. `createJobAction` / `updateJobAction` calls `after(() => enrichJob(…))`.
3. `enrich.ts` matches Bluedoor job (ATS key → URL → fuzzy).
4. Prisma fields updated (`bluedoorJobId`, `bluedoorStatus`, salary, workplace, desc hash, …).
5. `invalidateUserJobCaches` → tags + Redis + SSE → dashboard cards update without refresh.
6. Webhook/cron call `resyncJob` when posting closes or JD changes.
7. `resyncJob` detects statusChanged / descChanged / salaryAdded → `publishNotification` (SSE bell) + `sendPostingChangeEmail` (Resend).

**Prisma:** `applyUrl` + 11 `bluedoor*` columns on `Job` (see `prisma/schema.prisma`).

---

## Notification flow

1. Enrichment `resyncJob` detects change → `publishNotification(userId, type, jobId, message)`.
2. `lib/jobs-events.ts` dispatches `notify` event to in-memory SSE listener for that userId.
3. SSE route encodes event → client `EventSource` in `useJobsCacheSync`.
4. `useJobsCacheSync` relays via `new BroadcastChannel('jobify-notifications').postMessage(event)`.
5. `NotificationsProvider` (dashboard layout) subscribes → appends to `notifications[]`.
6. `NotificationBell` in nav reads `useNotifications()` → badge count + popover.

---

## AI pipeline flow (Phase 2 — scaffolded)

1. `AiInsightsPanel` "Generate Insights" → `useAIPipeline` mutation → `POST /api/ai/pipeline`.
2. Next.js route: Clerk auth + X-Internal-Secret header → `runAiPipeline(payload)`.
3. `lib/ai/pipeline-client.ts` → `python-ai-service /pipeline/run` (30s timeout).
4. FastAPI: 9-agent pipeline (Extractor → Analyzer → Preprocessor → Optimizer → **Synthesizer LLM** → Validator → Assembler → ViewFormatter → FinalVerifier).
5. LLM fallback: Ollama (local) → Groq → OpenRouter → Anthropic claude-haiku-4-5-20251001.
6. `PipelineResponse` returned — fit score, cover letter, interview angles, summary.

---

## Loading UX

- `useQueryBodyLoading` — no skeleton when SSR/hydrate/persist has data
- `keepPreviousData` / `placeholderData` on list + discover — no flash on filter change
- Navbar avatar — pulse only when no SSR seed and Clerk not loaded
- `/discover/loading.tsx` — route-level skeleton for Bluedoor cold fetch

---

## Invalidation

`invalidateAllJobQueries`: jobs.all, stats, charts, filterOptions, job.detail(id). Mutations: onSuccess broadcasts once; onSettled resyncs all keys without re-broadcast. Server: `invalidateUserJobCaches` + tags + Redis + SSE (+ `/discover` path revalidate).

Discover queries are **not** in persist scope — refetch on navigation/filter change.

---

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `BLUEDOOR_WEBHOOK_SECRET` | optional | HMAC verify inbound Bluedoor webhooks |
| `CRON_SECRET` | prod | Authorize Vercel cron → `/api/cron/enrich` |
| `RESEND_API_KEY` | optional | Email alerts on posting changes (no-op if absent) |
| `EMAIL_FROM` | optional | From address for Resend emails (default: `Jobify <noreply@jobify.app>`) |
| `NEXT_PUBLIC_APP_URL` | optional | Base URL for job deep-links in emails |
| `AI_SERVICE_URL` | optional | Python AI service URL (default: `http://localhost:8000`) |
| `AI_SERVICE_SECRET` | optional | Shared secret for Next.js → Python auth header |

Bluedoor API requires no API key (free tier per Sam Crombie).

---

## Verify

`npm run lint && npm run typecheck && npm run test && npm run build` — 49 tests.

---

## Related docs

- `docs/PROJECT_PLAN.md` — v2 vision, 9-agent pipeline, n8n flows
- `docs/JOBIFY_TECH_STACK_ANALYSIS.md` — stack decisions (Jobify-specific)
- `.agile-v/PLAYBOOK.md` — Agile V session protocol
