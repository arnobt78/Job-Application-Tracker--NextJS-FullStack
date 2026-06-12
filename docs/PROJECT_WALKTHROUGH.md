# Jobify Project Walkthrough

## What it is

Full-stack job application tracker. Demo: <https://jobify-tracker.vercel.app>

## Architecture

```bash
page.tsx (force-dynamic, void prefetchQuery)
  → static shell (headings, labels) in page.tsx
  → HydrationBoundary → client useQuery (data-slot skeletons)
  → lib/jobs/queries.ts (unstable_cache + tags + Redis optional)
  → utils/actions.ts (server actions, Clerk auth)

CRUD: useJobsMutation (optimistic) → server action → invalidateUserJobCaches
  → invalidateAllJobQueries + BroadcastChannel + SSE
```

## Key directories

| Path | Role |
| --- | --- |
| `app/(dashboard)/dashboard/page.tsx` | Instant shell + `JobsCount`/`JobsGrid`/`JobsPagination` |
| `app/(dashboard)/stats/page.tsx` | Stats shell + `StatsContainer`/`ChartsContainer` |
| `hooks/useJobsListQuery.ts` | Shared dashboard jobs list query |
| `components/jobs/` | `jobs-count`, `jobs-grid`, `jobs-pagination` |
| `hooks/useJobsMutation.ts` | Optimistic CRUD + Sonner |
| `hooks/useJobsCacheSync.ts` | BroadcastChannel + SSE |
| `lib/invalidate-jobs*.ts` | Client + server cache bust |
| `lib/notifications/` | Sonner + localStorage auth toast flags |
| `proxy.ts` | Clerk auth gate |

## Instant shell pattern

- No `loading.tsx` anywhere
- Non-blocking `void prefetchQuery` — shell ships first
- **Dashboard `page.tsx`**: My Jobs header, Search & filter label, "jobs found" text, Download always visible
- **Stats `page.tsx`**: Statistics header, Monthly Applications heading
- Data-slot skeletons: count number, pagination bar, job cards, stat values, chart area
- Removed `components/JobsList.tsx` → split into `components/jobs/*`

## Invalidation

Every CRUD invalidates jobs/stats/charts/job(id). Optimistic create/delete. Cross-tab + SSE unchanged.

## Auth + Sonner

Test account inline select · button-only sign-in loading · route-gated welcome/goodbye toasts · localStorage flags

## Verify

`npm run lint && npm run typecheck && npm run test && npm run build` — 20 tests green (2026-06-13)

## Deferred

E2E Playwright, PostHog.
