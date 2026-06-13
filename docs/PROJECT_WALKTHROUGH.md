# Jobify Project Walkthrough

Demo: <https://jobify-tracker.vercel.app> — full-stack job application tracker.

## Architecture

```text
page.tsx (force-dynamic, void prefetchQuery)
  → static shell in page.tsx
  → HydrationBoundary → client useQuery + data-slot skeletons
  → lib/jobs/queries.ts (unstable_cache + tags + Redis optional)
  → utils/actions.ts (server actions, Clerk auth)

CRUD: useJobsMutation (optimistic) → invalidateUserJobCaches
  → invalidateAllJobQueries + BroadcastChannel + SSE
```

## Key paths

| Path | Role |
| --- | --- |
| `app/(dashboard)/dashboard/page.tsx` | Shell + `void prefetch` list + filterOptions |
| `lib/jobs/filter-params.ts` | Shared URL filter parse/build (server + client) |
| `lib/jobs/month-utc.ts` | UTC month buckets (matches `formatJobDate`) |
| `hooks/useJobsListQuery.ts` | List query (uses filter-params) |
| `hooks/useJobsListParams.ts` | URL filter write (`router.replace`) |
| `hooks/useJobFilterOptions.ts` | Month dropdown metadata |
| `components/jobs/` | filter-bar, count, grid, pagination |
| `components/ui/glass-*` | dropdown, search, alert-dialog |
| `hooks/useJobsMutation.ts` | Optimistic CRUD + Sonner |
| `hooks/useJobsCacheSync.ts` | BroadcastChannel + SSE |
| `lib/invalidate-jobs*.ts` | Client + server cache bust |

## Dashboard filters

URL params: `search`, `jobStatus`, `jobMode`, `monthYear`, `page` — debounced search, instant dropdowns, month options from DB (UTC).

## Invalidation

`invalidateAllJobQueries(['jobs'])` covers list + `filterOptions`. Every CRUD busts jobs/stats/charts/job(id). Optimistic create/delete/update.

## Instant shell

No `loading.tsx`. `void prefetchQuery` only — headings/labels in `page.tsx`; skeletons on count, cards, pagination, stats, chart.

## Verify

`npm run lint && npm run typecheck && npm run test && npm run build` — 29 tests.

## Deferred

E2E Playwright, PostHog.
