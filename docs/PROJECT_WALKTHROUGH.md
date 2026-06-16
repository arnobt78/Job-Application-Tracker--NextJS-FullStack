# Jobify Project Walkthrough

Demo: <https://jobify-tracker.vercel.app>

## Architecture

```text
force-dynamic
  dashboard/layout → currentUser() → NavUserProvider (avatar SSR)
  page.tsx → await prefetchQuery → HydrationBoundary
  PersistQueryClient (localStorage jobify-query-cache, buster v1)
  lib/jobs/queries.ts (unstable_cache + tags + Redis)
  utils/actions.ts (Clerk)

Client: useQueryBodyLoading → skeleton only on cold cache
CRUD: useJobsMutation (optimistic) → onSuccess invalidateAll+broadcast · onSettled invalidateAll (no re-broadcast) · SSE · BroadcastChannel
```

## Key paths

| Path | Role |
| --- | --- |
| `app/(dashboard)/layout.tsx` | SSR Clerk user → navbar avatar |
| `app/(dashboard)/dashboard/page.tsx` | await prefetch list + filterOptions + stats |
| `app/(dashboard)/stats/page.tsx` | await prefetch stats + charts |
| `app/(dashboard)/dashboard/[id]/page.tsx` | await prefetch job detail |
| `lib/query-body-loading.ts` | Warm cache check (SSR/persist/hydrate) |
| `hooks/useJobsListBodyLoading.ts` | List query + bodyLoading |
| `hooks/useNavUserSession.ts` | SSR snapshot + Clerk useUser |
| `lib/query-client.ts` / `lib/query-persist.ts` | RQ defaults + localStorage persist |
| `lib/invalidate-jobs.ts` | jobs · stats · charts · filterOptions · job(id) |
| `components/jobs/job-card-shell.tsx` | Stable chrome; text skeletons cold only |

## Dashboard layout

1. `DashboardPageHeader`
2. Filter subtitle + Clear (reserved width) + `JobsFilterBar`
3. `JobsResultsToolbar` — badge + `PortfolioBreakdownRow` + download
4. `JobCardShell` grid → pagination

## Loading UX

- `useQueryBodyLoading` — no skeleton when SSR/hydrate/persist has data
- `keepPreviousData` on list — no flash on filter/page change
- Navbar avatar — pulse only when no SSR seed and Clerk not loaded

## Invalidation

`invalidateAllJobQueries`: jobs.all, stats, charts, filterOptions, job.detail(id). Mutations: onSuccess broadcasts once; onSettled resyncs all keys without re-broadcast. Server: `invalidateUserJobCaches` + tags + Redis + SSE.

## Verify

`npm run lint && npm run typecheck && npm run test && npm run build` — 49 tests.
