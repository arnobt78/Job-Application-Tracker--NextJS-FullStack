# Jobify — Agent Memory (compact)

## Stack
Next.js 16 · React 19 · Clerk 6 · Prisma 6 · TanStack Query 5 · PostgreSQL · Sentry · exceljs · Vitest

## Auth
- `proxy.ts` — Clerk route protection (`/dashboard(.*)`, `/stats`, `/user-profile/*`); redirects `/add-job`→`/dashboard`, `/jobs/*`→`/dashboard`
- Server actions: `await auth()` in `utils/actions.ts`
- Test creds: `lib/auth/test-credentials.ts` → `SignInForm` dropdown
- Custom auth UI: `SignInForm` + `SignUpForm` (sky `GlassCard`); OAuth via `AuthOAuthButtons` + `lib/auth/clerk-oauth.ts`
- Hooks: `useGuestSignIn`, `useSignUpForm` (email verify step when Clerk requires)

## Data flow (SSR + cache + instant UI)
1. **Pages** (`force-dynamic`): prefetch in `page.tsx` → `HydrationBoundary` → client `useQuery`
2. **Reads**: `lib/jobs/queries.ts` — `unstable_cache` + tags (`lib/cache-tags.ts`) + optional Redis (`lib/redis.ts`)
3. **CRUD**: `utils/actions.ts` → `invalidateUserJobCaches(userId, jobId?)` in `lib/invalidate-jobs-server.ts`
4. **Client**: `hooks/useJobsMutation.ts` (optimistic) + `invalidateAllJobQueries` in `lib/invalidate-jobs.ts`
5. **Cross-tab/SSE**: BroadcastChannel + `GET /api/jobs/events` (Redis Streams) via `hooks/useJobsCacheSync.ts`

## Sentry (optional)
- `lib/sentry/config.ts`; tunnel `/api/monitoring`; `hooks/useSentryUser.ts`
- Env: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`

## Query keys
`lib/query-keys.ts` — `jobs`, `stats`, `charts`, `job(id)`

## Routes
- `/dashboard` — main jobs list (renamed from `/jobs`); `/dashboard/[id]` — edit dialog via URL
- `/add-job` and `/jobs/*` — middleware-redirected to `/dashboard`
- Legacy `app/(dashboard)/jobs/` kept (per no-delete rule); superseded by `app/(dashboard)/dashboard/`

## UI — Nav (3-variant NavShell pattern)
- `NavShell` (`components/layout/nav-shell.tsx`) — shared glass h-14 fixed chrome (server component)
- `LandingNav` — NavShell + ThemeToggle + section links + Create Account
- `AuthNav` (`components/layout/auth-nav.tsx`) — NavShell + ThemeToggle + Return Home
- `DashboardNav` (`components/layout/dashboard-nav.tsx`) — NavShell + nav pills (Dashboard/Stats) + ThemeToggle + avatar
- Legacy `Navbar.tsx`, `Sidebar.tsx`, `LinksDropdown.tsx` — superseded, kept but not imported

## UI — Dialogs
- `components/dialogs/add-job-dialog.tsx` — sky GlassCard Dialog, trigger button
- `components/dialogs/edit-job-dialog.tsx` — violet GlassCard Dialog, `showTrigger` or `defaultOpen` mode
- `CreateJobForm`/`EditJobForm` — `standalone` prop (skip outer card inside dialog) + `onSuccess` callback

## UI — Landing
- `LandingNav` + `SiteFooter` — `lib/ui/landing-chrome.ts` (h-14, no py)
- Hero: `HeroVisualCarousel` (main.svg + job-1..4), `ScrollParallaxSection`, `ScrollStagger`
- Sections: `lib/ui/landing-sections.ts`; copy `lib/ui/marketing-copy.ts`
- CTA shine: `cta-shine-wrap--delay-a/b` on Get Started / Try Demo
- `TryDemoAccountButton` + `useGuestSignIn`

## UI — Shared
- `PageContainer`, `SplitContentLayout`, `GlassCard`, `glass-input`, `app-shell`, `RippleButton`
- Scroll: `ScrollReveal`, `ScrollStagger`, `lib/ui/scroll-motion.ts`
- Skeleton: `lib/ui/dimensions.ts`
- Errors: `app/error.tsx`, `app/global-error.tsx`

## SEO
`lib/site-metadata.ts` — SITE_URL `https://jobify-tracker.vercel.app`

## Verify
`npm audit && npm run lint && npm run typecheck && npm run test && npm run build`

## Do not
- Use `cacheComponents: true` (conflicts with `force-dynamic`)
- Edit `.cursor/plans/*` unless asked
- Touch SSR/cache/SSE/invalidation for UI-only work
