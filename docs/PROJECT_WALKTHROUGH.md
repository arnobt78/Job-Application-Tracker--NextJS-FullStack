# Jobify Project Walkthrough

Demo: <https://jobify-tracker.vercel.app> — full-stack job application tracker.

## Architecture

```text
page.tsx (force-dynamic, void prefetchQuery)
  → static shell in page.tsx
  → HydrationBoundary → client useQuery + data-slot skeletons
  → lib/jobs/queries.ts (unstable_cache + tags + Redis optional)
  → utils/actions.ts (server actions, Clerk auth)

CRUD: useJobsMutation (optimistic list + stats + charts)
  → lib/jobs/stats-optimistic.ts (status/mode/total)
  → lib/jobs/chart-optimistic.ts (monthly buckets)
  → invalidateUserJobCaches → invalidateAllJobQueries + BroadcastChannel + SSE
```

## Key paths

| Path | Role |
| --- | --- |
| `app/(dashboard)/dashboard/page.tsx` | Shell + prefetch list, filterOptions, stats |
| `components/jobs/dashboard-page-header.tsx` | Page title + New Application CTA |
| `components/jobs/jobs-results-toolbar.tsx` | Filtered badge + global portfolio breakdown + download |
| `components/ui/page-section-header.tsx` | Reusable icon + title + subtitle |
| `lib/ui/dashboard-copy.ts` | Dashboard section copy |
| `lib/jobs/filter-params.ts` | URL filter parse/build + clear helpers |
| `lib/jobs/stats-optimistic.ts` | Optimistic portfolio count patches |
| `lib/jobs/month-utc.ts` | UTC month buckets |
| `hooks/useJobsListQuery.ts` | List query |
| `hooks/useJobsPortfolioStats.ts` | Stats query (shared with /stats) |
| `hooks/useJobsListParams.ts` | URL filter write |
| `components/jobs/` | filter-bar, grid, pagination |
| `hooks/useJobsMutation.ts` | Optimistic CRUD + Sonner |
| `hooks/useJobsCacheSync.ts` | BroadcastChannel + SSE |
| `lib/invalidate-jobs*.ts` | Client + server cache bust |

## Dashboard layout

1. `DashboardPageHeader` — Application Pipeline + New Application
2. Filter `PageSectionHeader` + `JobsFilterBar` (inline Clear Filters when active)
3. `JobsResultsToolbar` — matching count badge + Pending·Interview·…·Internship (global)
4. `JobsGrid` → centered `JobsPagination` below cards

## Dashboard filters

URL: `search`, `jobStatus`, `jobMode`, `monthYear`, `page` — debounced search, instant dropdowns, UTC months from DB.

## Invalidation

`invalidateAllJobQueries` busts jobs/stats/charts/job(id)/filterOptions. Optimistic: list count, stats (status+mode+total), charts; `onSettled` revalidates.

## Instant shell

No `loading.tsx`. `void prefetchQuery` only — section headers in page.tsx; skeletons on toolbar badge, cards, pagination, stats, chart.

## Scroll & overlays

- `scrollbar-gutter: stable` + `OverlayScrollbar`
- `DropdownMenu` / `Dialog` `modal={false}`; `GlassAlertDialog` for confirms
- Job dialogs: `GlassDialogContent` 90vw×90vh

## Verify

`npm run lint && npm run typecheck && npm run test && npm run build` — 41 tests.

## Deferred

E2E Playwright, PostHog.
