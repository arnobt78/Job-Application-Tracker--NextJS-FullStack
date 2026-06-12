# Jobify Project Walkthrough

## What it is

Full-stack job application tracker. Demo: <https://jobify-tracker.vercel.app>

## Architecture

```bash
page.tsx (force-dynamic, non-blocking void prefetchQuery)
  → static shell (headings, labels) in page.tsx
  → HydrationBoundary → client useQuery (data-slot skeletons while pending)
  → lib/jobs/queries.ts (unstable_cache + tags + Redis optional)
  → utils/actions.ts (server actions, Clerk auth)

CRUD mutation path:
  useJobsMutation (optimistic) → server action → invalidateUserJobCaches
    → revalidateTag + revalidatePath + publishInvalidation
    → invalidateAllJobQueries + BroadcastChannel + SSE (Redis Streams)
```

## Key directories

| Path | Role |
| --- | --- |
| `app/(dashboard)/dashboard/` | Jobs route (`/dashboard`, `/dashboard/[id]`) |
| `app/(dashboard)/stats/` | Stats — headings in `page.tsx`, data in containers |
| `app/api/jobs/events/` | SSE invalidation (Clerk auth) |
| `lib/jobs/queries.ts` | Cached Prisma reads |
| `lib/invalidate-jobs*.ts` | Client + server cache bust |
| `hooks/useJobsMutation.ts` | Optimistic CRUD + Sonner toasts |
| `hooks/useJobsCacheSync.ts` | BroadcastChannel + SSE |
| `hooks/useGuestSignIn.ts` | Demo/test sign-in |
| `lib/notifications/` | Sonner helpers + localStorage auth toast flags |
| `components/auth/auth-toast-listener.tsx` | Route-gated welcome/goodbye |
| `components/auth/test-account-select-row.tsx` | Inline test-account select row |
| `components/layout/dashboard-nav.tsx` | Top nav (Dashboard/Stats + avatar) |
| `components/dialogs/` | Add/Edit job glass dialogs |
| `proxy.ts` | Clerk auth gate |

## Instant shell pattern (2026-06-13)

- **No `loading.tsx`** anywhere — removed stats route loading file
- **Non-blocking prefetch**: `void queryClient.prefetchQuery(...)` — shell ships first
- **Static in `page.tsx`**: Statistics title, Monthly Applications heading, My Jobs header
- **Data-slot skeletons only**: stat numbers, chart area, job count, job cards
- `StatsCard` — titles always visible; `isLoading` pulses value
- `ChartsContainer` — chart body only; heading in `page.tsx`
- `JobsList` — count row + card grid skeletons; not full-page replacement

## Invalidation coverage

Every CRUD invalidates jobs/stats/charts/job(id). Optimistic patches on create/delete. Cross-tab: BroadcastChannel. Cross-instance: Redis Streams SSE.

## Auth + Sonner (2026-06-13)

- Test account: Clerk `imageUrl` in `test-credentials.ts`; `TestAccountSelectRow` h-10 inline layout
- Sign-in loading: button spinner only (left panel stays preview/marketing)
- Sonner bottom-right; CRUD + welcome/goodbye toasts
- `AuthToastListener`: localStorage flags; welcome on `/dashboard` after paint; goodbye on `/`; single logout redirect (no flash)

## Env vars

- Clerk, DATABASE_URL — required
- UPSTASH*REDIS*\* — optional (Redis cache + SSE)
- NEXT_PUBLIC_SENTRY_DSN — optional

## Verification

```bash
npm run lint && npm run typecheck && npm run test && npm run build
```

20 tests · no Python backend · lint/typecheck/build green (2026-06-13)

## Deferred

E2E Playwright, PostHog.
