# Jobify — Agent Memory (compact)

## Stack
Next.js 16 · React 19 · Clerk 6 · Prisma 6 · TanStack Query 5 · PostgreSQL · Sentry · exceljs · Vitest

## Auth
- `proxy.ts` — Clerk route protection (`/dashboard(.*)`, `/stats`, `/user-profile/*`); redirects `/add-job`→`/dashboard`, `/jobs/*`→`/dashboard`
- Server actions: `await auth()` in `utils/actions.ts`
- Test creds: `lib/auth/test-credentials.ts` → `SignInForm` dropdown
- Custom auth UI: `SignInForm` + `SignUpForm` (sky `GlassCard`); OAuth via `AuthOAuthButtons` + `lib/auth/clerk-oauth.ts`
- Hooks: `useGuestSignIn`, `useSignUpForm` — post-auth redirect `/dashboard`

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
- `/dashboard` — main jobs list; `/dashboard/[id]` — edit dialog via URL
- `/add-job` — middleware redirect only (no page); Add Job is a dialog on `/dashboard`
- Legacy `/jobs/*` — removed; `proxy.ts` still redirects old URLs → `/dashboard`

## Hydration
- `lib/format-date.ts` — `formatJobDate()` UTC + en-US; used in `JobCard` (fixes React #418)

## UI — Nav (3-variant NavShell pattern)
- `NavShell` (`components/layout/nav-shell.tsx`) — shared glass h-14 fixed chrome (server component)
- `LandingNav` — NavShell + ThemeToggle + section links + Create Account
- `AuthNav` (`components/layout/auth-nav.tsx`) — NavShell + ThemeToggle + Return Home
- `DashboardNav` (`components/layout/dashboard-nav.tsx`) — NavShell + nav pills (Dashboard/Stats) + ThemeToggle + avatar
- Removed: `Navbar`, `Sidebar`, `LinksDropdown`, `utils/links.tsx` (superseded by DashboardNav)

## UI — Dialogs
- `components/dialogs/add-job-dialog.tsx` — sky GlassCard Dialog, trigger button
- `components/dialogs/edit-job-dialog.tsx` — violet GlassCard Dialog, `showTrigger` or `defaultOpen` mode
- `CreateJobForm`/`EditJobForm` — `standalone` prop (skip outer card inside dialog) + `onSuccess` callback

## UI — Landing
- `LandingNav` + `SiteFooter` — `lib/ui/landing-chrome.ts` (h-14, no py)
- Hero: `HeroVisualCarousel` — slide 0 `priority`; active slides `loading="eager"`; SafeImage omits `loading` when `priority` (hydration-safe)
- Sections: `ScrollParallaxSection`, `ScrollStagger`; copy `lib/ui/marketing-copy.ts`
- CTA shine: `cta-shine-wrap--delay-a/b` on Get Started / Try Demo
- `TryDemoAccountButton` + `useGuestSignIn`

## UI — Auth sign-in
- `SignInPageShell` — shared state: left preview + right form
- `AuthSignInLeadingPanel` — marketing / test account card / signing-in spinner
- `TestAccountAvatar` + `lib/auth/avatar-url.ts` — Clerk URL or robohash; optional `imageUrl` on test account

## Notifications (Sonner)
- `components/ui/sonner.tsx` — bottom-left Toaster
- `lib/notifications/app-toast.ts` — dynamic title + subtitle helpers
- `AuthToastListener` in `query-provider` — welcome/goodbye via sessionStorage
- Radix toast removed

## UI — Shared
- `PageContainer`, `SplitContentLayout`, `GlassCard`, `glass-input`, `app-shell`, `RippleButton`
- Scroll: `ScrollStagger`, `lib/ui/scroll-motion.ts`
- Skeleton: `lib/ui/dimensions.ts`
- Errors: `app/error.tsx`, `app/global-error.tsx`

## SEO
`lib/site-metadata.ts` — SITE_URL `https://jobify-tracker.vercel.app`

## Prisma
- `prisma/schema.prisma` — **Job** model only; indexes on `clerkId`, `[clerkId, status]`, `[clerkId, createdAt]`
- Migration `20260612120000_remove_unused_models` drops legacy Task/Tour/Token tables
- **DB sync:** dev → `npx prisma db push`; existing prod DB → `migrate resolve --applied 20260612120000_remove_unused_models` then `migrate deploy`

## Docs
- `README.md` — full educational guide (setup, env, architecture, reuse)
- `.env.example` — Clerk fallbacks → `/dashboard`

## Verify
`npm audit && npm run lint && npm run typecheck && npm run test && npm run build` (20 tests)

## Config
- `next.config.ts` — Cache-Control immutable on `/_next/static` **production only** (avoids dev warning)

## Do not
- Use `cacheComponents: true` (conflicts with `force-dynamic`)
- Edit `.cursor/plans/*` unless asked
- Touch SSR/cache/SSE/invalidation for UI-only work
