# Jobify — Agent Memory

## Product
Personal **job application tracker (CRM)** with live posting enrichment (Bluedoor API), job discovery, and AI insights (Phase 2 FastAPI). Not a full job board.

## Stack
Next.js 16 · React 19 · Clerk 6 · Prisma 6 · TanStack Query 5 · PostgreSQL · Redis (optional) · Bluedoor API · Resend · Sentry · Vitest (49 tests) · FastAPI (python-ai-service/)

## Auth
- `proxy.ts` — Clerk gate; protect `/dashboard(.*)`, `/discover`, `/stats`, `/user-profile(.*)`; `/jobs/*` → `/dashboard`
- Navbar: `dashboard/layout` `currentUser()` → `NavUserProvider` · `useNavUserSession`

## Data flow
1. `force-dynamic` · per-page `await prefetchQuery` before `dehydrate`
2. `PersistQueryClient` localStorage `jobify-query-cache` buster `v1` — jobs/stats/charts/job keys only (not `discover`, not `ai`)
3. `useQueryBodyLoading` — skeleton only on cold cache (no SSR/persist data)
4. Reads: `lib/jobs/queries.ts` (unstable_cache + tags + Redis)
5. CRUD: `useJobsMutation` onSuccess → `invalidateAllJobQueries` (broadcast) · onSettled → same `broadcast:false` incl. filterOptions
6. Cross-tab: `useJobsCacheSync` + `/api/jobs/events` (multiplexes invalidate + notify)
7. Optimistic: `stats-optimistic.ts` · `chart-optimistic.ts`

## Bluedoor enrichment (Phase 1 — complete)
- Client: `lib/bluedoor/client.ts` · `lib/bluedoor/enrich.ts` · `lib/bluedoor/types.ts`
- Join: `applyUrl` → ATS key (Greenhouse/Lever/Ashby/Workday) → URL match → fuzzy company+title
- On create/update with `applyUrl`: `after()` → `enrichJob()` → `invalidateUserJobCaches` (badge via SSE)
- resyncJob: detects statusChanged/descChanged/salaryAdded → `publishNotification` (bell) + `sendPostingChangeEmail` (Resend)
- UI: `JobEnrichmentBadge` on `JobCard` (LIVE / CLOSED / JD CHANGED / SALARY / Syncing)
- Webhook: `POST /api/bluedoor/webhook` (HMAC `BLUEDOOR_WEBHOOK_SECRET`)
- Cron: `GET /api/cron/enrich` daily 03:00 UTC (`CRON_SECRET`, `vercel.json`)
- Discover: NOT persisted — cursor pagination (`useInfiniteQuery`) — Details modal on-demand

## Notification system (Phase 1 — complete)
- SSE event bus `lib/jobs-events.ts`: `JobsEvent` = `invalidate | notify`
- `subscribeJobsEvents` + `publishNotification` + `awaitRemoteJobsEvents`
- SSE route `/api/jobs/events` multiplexes both types
- `useJobsCacheSync` relays `notify` via BroadcastChannel `jobify-notifications`
- `NotificationsProvider` (`context/notifications-context.tsx`) — max 50, read/unread
- `NotificationBell` in `dashboard-nav.tsx` — badge, popover list, mark-all-read
- Email: `lib/notifications/email.ts` — lazy Resend import, no-op when key absent

## AI pipeline (Phase 2 — scaffolded)
- `python-ai-service/` — FastAPI, 9-agent pipeline, LLM fallback router
- LLM chain: Ollama → Groq → OpenRouter → Anthropic claude-haiku-4-5-20251001
- Next.js proxy: `POST /api/ai/pipeline` (Clerk auth → X-Internal-Secret → FastAPI)
- `useAIPipeline` mutation hook · `AiInsightsPanel` component (on-demand, not persisted)
- Types: `lib/ai/pipeline-client.ts`

## Query keys
`jobs.list(…)` · `jobs.filterOptions` · `stats` · `charts` · `job(id)` · `discover.search(…)` · `discover.detail(id)` · `discover.events(bluedoorJobId)` · `ai.pipeline(id)`

## Routes
- `/dashboard` — filter bar · results toolbar · `JobCardShell` grid · pagination · enrichment badges
- `/dashboard/[id]` — edit dialog · `JobDetailPanels` (AI Insights + Posting Activity tabs) · await prefetch job
- `/discover` — Bluedoor search · cursor pagination · Details modal + AiInsightsPanel · Track Application → `createJobAction` + enrich
- `/stats` — StatsContainer + ChartsContainer body loading
- `POST /api/ai/pipeline` — AI proxy (Clerk auth)

## Env (Bluedoor / cron / notifications / AI)
`BLUEDOOR_WEBHOOK_SECRET` (optional) · `CRON_SECRET` (Vercel cron) · `RESEND_API_KEY` (optional) · `EMAIL_FROM` (optional) · `NEXT_PUBLIC_APP_URL` · `AI_SERVICE_URL` · `AI_SERVICE_SECRET`

## UI notes
- Clear Filters: always reserves width (`invisible` when inactive)
- `keepPreviousData` / `placeholderData` on jobs list + discover results
- Glass dropdowns/dialogs `modal={false}` · `scrollbar-gutter: stable`
- `/discover` uses `useInfiniteQuery` + `prefetchInfiniteQuery` via `buildDiscoverQueryOptions`
- `NotificationsProvider` wraps dashboard layout inside `NavUserProvider`

## Docs
`docs/PROJECT_WALKTHROUGH.md` · `docs/PROJECT_PLAN.md` (v2 roadmap) · `docs/JOBIFY_TECH_STACK_ANALYSIS.md` · `.agile-v/PLAYBOOK.md`

## Verify
`npm run lint && npm run typecheck && npm run test && npm run build`

## Do not
`cacheComponents: true` · break SSE/invalidation · skeleton when cache warm · scrape Bluedoor (use official API) · persist discover/ai queries · add second SSE connection for notifications (relay via BroadcastChannel)
