# Jobify — Agent Memory (compact)

## Stack
Next.js 16 · React 19 · Clerk 6 · Prisma 6 · TanStack Query 5 · PostgreSQL · Sentry · exceljs · Vitest

## Auth
- `proxy.ts` — Clerk gate (`/dashboard(.*)`, `/stats`, `/user-profile/*`); `/add-job`→`/dashboard`, `/jobs/*`→`/dashboard`
- Test creds: `lib/auth/test-credentials.ts` (incl. Clerk `imageUrl` for test user)
- Hooks: `useGuestSignIn`, `useSignUpForm` → redirect `/dashboard`
- Sign-in: `SignInPageShell` + `AuthSignInLeadingPanel` (preview only, no left spinner) + `TestAccountSelectRow` (inline avatar/name/email, h-10 trigger)

## Data flow (SSR + cache + instant UI)
1. **Pages** (`force-dynamic`): **non-blocking** `void prefetchQuery` in `page.tsx` → shell instant → `HydrationBoundary` → client `useQuery`
2. **No `loading.tsx`** — inline skeletons on **data slots only** (numbers, chart, job cards, count)
3. **Reads**: `lib/jobs/queries.ts` — `unstable_cache` + tags + optional Redis
4. **CRUD**: `utils/actions.ts` → `invalidateUserJobCaches` (`lib/invalidate-jobs-server.ts`)
5. **Client**: `hooks/useJobsMutation.ts` (optimistic) + `invalidateAllJobQueries` (`lib/invalidate-jobs.ts`)
6. **Cross-tab/SSE**: BroadcastChannel + `GET /api/jobs/events` via `hooks/useJobsCacheSync.ts`

## Notifications (Sonner)
- `components/ui/sonner.tsx` — bottom-right
- `lib/notifications/app-toast.ts` + `auth-toast-storage.ts` (localStorage pending flags)
- `AuthToastListener` — route-gated: welcome on `/dashboard`, goodbye on `/`; no double logout redirect

## Query keys
`lib/query-keys.ts` — `jobs`, `stats`, `charts`, `job(id)`

## Routes
- `/dashboard` — shell in `page.tsx` (headers, "jobs found", filter label); `JobsCount`/`JobsPagination`/`JobsGrid` + `useJobsListQuery`
- `/dashboard/[id]` — edit dialog URL
- `/stats` — headings in `page.tsx`; `StatsContainer`/`ChartsContainer` pulse data only
- Legacy `/jobs/*` removed; middleware redirects old URLs

## Hydration
- `lib/format-date.ts` — UTC `formatJobDate()` in `JobCard`
- `SafeImage` — no `loading` when `priority`

## UI — Nav
- `NavShell` + `LandingNav` / `AuthNav` / `DashboardNav` (replaces Navbar/Sidebar)

## UI — Dialogs
- `add-job-dialog.tsx` (sky) · `edit-job-dialog.tsx` (violet)
- Forms: `standalone` + `onSuccess` props

## Prisma
- Job model only; indexes on `clerkId`, `[clerkId, status]`, `[clerkId, createdAt]`
- Dev: `npx prisma db push`

## Verify
`npm run lint && npm run typecheck && npm run test && npm run build` (20 tests)

## Config
- `next.config.ts` — Cache-Control immutable on `/_next/static` production only

## Do not
- `cacheComponents: true` (conflicts with `force-dynamic`)
- `await prefetchQuery` before shell render (blocks static UI)
- Touch SSR/cache/SSE/invalidation for UI-only work
