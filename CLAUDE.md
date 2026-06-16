# Jobify — Agent Memory

## Stack
Next.js 16 · React 19 · Clerk 6 · Prisma 6 · TanStack Query 5 · PostgreSQL · Sentry · Vitest (49 tests)

## Auth
- `proxy.ts` — Clerk gate; `/jobs/*` → `/dashboard`
- Navbar: `dashboard/layout` `currentUser()` → `NavUserProvider` · `useNavUserSession`

## Data flow
1. `force-dynamic` · per-page `await prefetchQuery` before `dehydrate`
2. `PersistQueryClient` localStorage `jobify-query-cache` buster `v1` — jobs/stats/charts/job keys
3. `useQueryBodyLoading` — skeleton only on cold cache (no SSR/persist data)
4. Reads: `lib/jobs/queries.ts` (unstable_cache + tags + Redis)
5. CRUD: `useJobsMutation` onSuccess → `invalidateAllJobQueries` (broadcast) · onSettled → same `broadcast:false` incl. filterOptions
6. Cross-tab: `useJobsCacheSync` + `/api/jobs/events`
7. Optimistic: `stats-optimistic.ts` · `chart-optimistic.ts`

## Query keys
`jobs.list(…)` · `jobs.filterOptions` · `stats` · `charts` · `job(id)`

## Routes
- `/dashboard` — filter bar · results toolbar · `JobCardShell` grid · pagination
- `/dashboard/[id]` — edit dialog · await prefetch job
- `/stats` — StatsContainer + ChartsContainer body loading

## UI notes
- Clear Filters: always reserves width (`invisible` when inactive)
- `keepPreviousData` on jobs list
- Glass dropdowns/dialogs `modal={false}` · `scrollbar-gutter: stable`

## Verify
`npm run lint && npm run typecheck && npm run test && npm run build`

## Do not
`cacheComponents: true` · break SSE/invalidation · skeleton when cache warm
