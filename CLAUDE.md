# Jobify — Agent Memory

## Stack
Next.js 16 · React 19 · Clerk 6 · Prisma 6 · TanStack Query 5 · PostgreSQL · Sentry · Vitest

## Auth
- `proxy.ts` — Clerk gate; `/jobs/*` → `/dashboard`
- Test creds: `lib/auth/test-credentials.ts`
- Sign-in: glass test-account dropdown + `TestAccountSelectRow`

## Data flow
1. `force-dynamic` pages · `void prefetchQuery` (never `await` before shell)
2. No `loading.tsx` — skeletons on data slots only
3. Reads: `lib/jobs/queries.ts` (`unstable_cache` + tags + Redis)
4. CRUD: `utils/actions.ts` → `invalidateUserJobCaches`
5. Client: `useJobsMutation` + `invalidateAllJobQueries`
6. Cross-tab: `useJobsCacheSync` + `/api/jobs/events`

## Query keys (`lib/query-keys.ts`)
`jobs.list(search, jobStatus, jobMode, monthYear, page)` · `jobs.filterOptions` · `stats` · `charts` · `job(id)`

## Filters (`lib/jobs/`)
- `filter-types.ts` / `filter-config.ts` — types + dropdown options
- `filter-params.ts` — **single parser** for server prefetch + client hooks
- `month-utc.ts` — UTC month filter (aligns `formatJobDate`)

## Routes
- `/dashboard` — `JobsFilterBar` + `JobsCount`/`JobsGrid`/`JobsPagination` · `useJobsListQuery` + `useJobFilterOptions`
- `/dashboard/[id]` — edit dialog URL (no confirm on direct open)
- `/stats` — instant shell + `StatsContainer`/`ChartsContainer`

## Glass UI
- `glass-dropdown-menu` (check right) · `glass-search-input` · `glass-alert-dialog` (action icons)
- Edit/delete: confirm alert → dialog/mutate on `JobCard`

## Hydration
- `formatJobDate` UTC in `JobCard` · `SafeImage` no `loading` when `priority`

## Verify
`npm run lint && npm run typecheck && npm run test && npm run build` (29 tests)

## Do not
- `cacheComponents: true` · `await prefetchQuery` before shell · break SSE/invalidation for UI-only work
