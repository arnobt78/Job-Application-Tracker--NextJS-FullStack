# Jobify Project Walkthrough

Demo: <https://jobify-tracker.vercel.app> — full-stack job application tracker.

## Architecture

```text
page.tsx (force-dynamic, void prefetchQuery)
  → HydrationBoundary → useQuery + targeted skeletons
  → lib/jobs/queries.ts (unstable_cache + tags + Redis)
  → utils/actions.ts (Clerk auth)

CRUD: useJobsMutation → stats-optimistic + chart-optimistic
  → invalidateUserJobCaches → invalidateAllJobQueries + SSE + BroadcastChannel
```

## Key paths

| Path | Role |
| --- | --- |
| `app/(dashboard)/dashboard/page.tsx` | Prefetch list, filterOptions, stats |
| `components/jobs/job-card-shell.tsx` | Stable card chrome; text-only skeletons |
| `components/jobs/portfolio-breakdown-row.tsx` | Icon+label stable; number skeleton cold only |
| `components/jobs/jobs-filter-section.tsx` | Subtitle row + clear above filter card |
| `hooks/useJobsListQuery.ts` | `keepPreviousData` — no flash on filter/page |
| `lib/jobs/stats-optimistic.ts` | Optimistic status/mode/total |
| `lib/ui/portfolio-breakdown-config.ts` | Breakdown icons + field keys |

## Dashboard layout

1. `DashboardPageHeader`
2. Filter title + subtitle row (Clear Filters right) + `JobsFilterBar` card
3. `JobsResultsToolbar` — badge + `PortfolioBreakdownRow` as subtitle + download
4. `JobCardShell` grid → centered pagination

## Loading UX

- Skeleton only when `isPending && data === undefined` (true cold start)
- SSR hydrate + `keepPreviousData` → filters/pages keep prior cards visible
- Portfolio breakdown: icons/labels never skeleton; numbers only if no cached stats

## Invalidation

`invalidateAllJobQueries` busts jobs/stats/charts/filterOptions. Optimistic list + stats + charts.

## Verify

`npm run lint && npm run typecheck && npm run test && npm run build` — 41 tests.

## Deferred

E2E Playwright, PostHog.
