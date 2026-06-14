# Jobify — Agent Memory

## Stack
Next.js 16 · React 19 · Clerk 6 · Prisma 6 · TanStack Query 5 · PostgreSQL · Sentry · Vitest

## Auth
- `proxy.ts` — Clerk gate; `/jobs/*` → `/dashboard`
- Test creds: `lib/auth/test-credentials.ts`
- Sign-in: `GlassDropdownTrigger` + `TestAccountSelectRow` · Send icon · Loader2 loading
- Sign-up: Sparkles + Loader2 on wait · demo CTA: Loader2 on landing

## Data flow
1. `force-dynamic` · `void prefetchQuery` (never `await` before shell)
2. No `loading.tsx` — data-slot skeletons only
3. Reads: `lib/jobs/queries.ts` (`unstable_cache` + tags + Redis)
4. CRUD: `utils/actions.ts` → `invalidateUserJobCaches`
5. Client: `useJobsMutation` + `invalidateAllJobQueries`
6. Cross-tab: `useJobsCacheSync` + `/api/jobs/events`

## Query keys
`jobs.list(search, jobStatus, jobMode, monthYear, page)` · `jobs.filterOptions` · `stats` · `charts` · `job(id)`

## Filters (`lib/jobs/`)
`filter-types` · `filter-config` · `filter-params` (single parser) · `month-utc`

## Routes
- `/dashboard` — `JobsFilterBar` + count/grid/pagination
- `/dashboard/[id]` — edit dialog URL
- `/stats` — instant shell

## Glass UI
- `glass-dropdown-menu` — `GlassDropdownTrigger` (left label + chevron) · custom-children radio rows
- `glass-search-input` · `glass-alert-dialog` (uses `Dialog` modal=false, not AlertDialog)
- `glass-dialog-content` — 90vw×90vh job dialogs
- Edit/delete: confirm → dialog/mutate on `JobCard`

## Scroll / overlays (no layout shift)
- `OverlayScrollbar` in `providers.tsx` · overlay thumb CSS in `globals.css` (transparent track)
- `DropdownMenu` + `Dialog` default `modal={false}` · overlay blocks wheel/touch
- Job dialog inner scroll: `.overlay-scroll`

## Job forms (dialog)
Stack: position, company, location · row: status+mode (`sm:grid-cols-2`) · full-width submit

## Hydration
`formatJobDate` UTC · `SafeImage` no `loading` when `priority`

## Verify
`npm run lint && npm run typecheck && npm run test && npm run build` (29 tests)

## Do not
`cacheComponents: true` · `await prefetchQuery` before shell · break SSE/invalidation for UI-only work
