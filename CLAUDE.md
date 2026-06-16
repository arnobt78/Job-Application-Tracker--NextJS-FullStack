# Jobify — Agent Memory

## Stack
Next.js 16 · React 19 · Clerk 6 · Prisma 6 · TanStack Query 5 · PostgreSQL · Sentry · Vitest (41 tests)

## Auth
- `proxy.ts` — Clerk gate; `/jobs/*` → `/dashboard`
- Test creds: `lib/auth/test-credentials.ts`
- Sign-in: `GlassDropdownTrigger` + `TestAccountSelectRow` · Send · Loader2
- Sign-up: Sparkles + Loader2 · demo CTA: Loader2 on landing

## Data flow
1. `force-dynamic` · `void prefetchQuery` (never `await` before shell)
2. No `loading.tsx` — data-slot skeletons only
3. Reads: `lib/jobs/queries.ts` (`unstable_cache` + tags + Redis)
4. CRUD: `utils/actions.ts` → `invalidateUserJobCaches`
5. Client: `useJobsMutation` + `invalidateAllJobQueries`
6. Cross-tab: `useJobsCacheSync` + `/api/jobs/events`
7. Optimistic: `lib/jobs/stats-optimistic.ts` + `chart-optimistic.ts` (status/mode/total + charts)

## Query keys
`jobs.list(search, jobStatus, jobMode, monthYear, page)` · `jobs.filterOptions` · `stats` · `charts` · `job(id)`

## Filters (`lib/jobs/`)
`filter-types` · `filter-config` · `filter-params` (+ `hasActiveJobsFilters` / `clearedJobsListFilters`) · `month-utc`

## Routes
- `/dashboard` — `DashboardPageHeader` · `JobsFilterSection` (clear above card) · `JobsResultsToolbar` · `JobCardShell` grid · pagination below
- `/dashboard/[id]` — edit dialog URL
- `/stats` — instant shell · `StatsResult` includes mode + total counts

## Dashboard UI
- `PageSectionHeader` (subtitle `ReactNode`) + `dashboard-copy.ts`
- `PortfolioBreakdownRow` — icons+labels stable; number skeleton only on cold load
- `useJobsListQuery` — `keepPreviousData`; skeleton when `isPending && !data`
- `JobCardShell` — stable icons/buttons; text slots skeleton on cold load only
- `useJobsPortfolioStats` · prefetch `stats.all`

## Glass UI
- `glass-dropdown-menu` · `glass-search-input` · `glass-alert-dialog` · `glass-dialog-content` (90vw×90vh)
- Edit/delete: confirm → dialog/mutate on `JobCard`

## Scroll / overlays (no layout shift)
- `scrollbar-gutter: stable` on html/body
- `OverlayScrollbar` + overlay thumb CSS
- `DropdownMenu` + `Dialog` default `modal={false}`
- Job dialog inner scroll: `.overlay-scroll`

## Job forms (dialog)
Stack: position, company, location · row: status+mode (`sm:grid-cols-2`) · full-width submit

## Hydration
`formatJobDate` UTC · `SafeImage` no `loading` when `priority`

## Agile V
`.agile-v/PLAYBOOK.md` · INT-0003 active · REQ-0024 governance

## Verify
`npm run lint && npm run typecheck && npm run test && npm run build`

## Do not
`cacheComponents: true` · `await prefetchQuery` before shell · break SSE/invalidation for UI-only work
