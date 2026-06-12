# Jobify Project Walkthrough

## What it is

Full-stack job application tracker. Demo: <https://jobify-tracker.vercel.app>

## Architecture

```bash
page.tsx (SSR prefetch, force-dynamic)
  → lib/jobs/queries.ts (unstable_cache + tags + Redis optional)
  → utils/actions.ts (server actions, Clerk auth)
  → components/* (client: forms, lists, charts)

CRUD mutation path:
  useJobsMutation (optimistic) → server action → invalidateUserJobCaches
    → revalidateTag + revalidatePath + publishInvalidation
    → React Query invalidate + BroadcastChannel + SSE (Redis Streams)
```

## Key directories

| Path | Role |
| ---- | ---- |
| `app/(dashboard)/dashboard/` | Main jobs route (`/dashboard` + `/dashboard/[id]`) |
| `app/(dashboard)/jobs/` | Legacy route — middleware redirects to `/dashboard` (kept per no-delete rule) |
| `app/(dashboard)/stats/` | Stats page — unchanged |
| `app/api/jobs/events/` | SSE invalidation stream (Clerk auth) |
| `lib/jobs/queries.ts` | Cached Prisma reads |
| `lib/invalidate-jobs*.ts` | Client + server cache bust |
| `lib/jobs/chart-optimistic.ts` | Optimistic charts cache patches |
| `lib/redis.ts` | Read-through cache + Redis Streams |
| `hooks/useJobsMutation.ts` | Optimistic CRUD hooks (no router.push on create) |
| `hooks/useJobsCacheSync.ts` | BroadcastChannel + SSE sync |
| `hooks/useGuestSignIn.ts` | Demo/test Clerk sign-in |
| `hooks/useSignUpForm.ts` | Custom sign-up + email verify |
| `lib/auth/clerk-oauth.ts` | Shared OAuth redirect URLs |
| `components/auth/` | `AuthOAuthButtons`, `AuthFormDivider` |
| `components/SignInForm.tsx` | Custom sign-in card |
| `components/SignUpForm.tsx` | Custom sign-up card (no Clerk footer) |
| `components/layout/nav-shell.tsx` | Shared glass h-14 fixed nav chrome (server component) |
| `components/layout/landing-nav.tsx` | Landing nav (NavShell + ThemeToggle + section links) |
| `components/layout/auth-nav.tsx` | Auth nav (NavShell + ThemeToggle + Return Home) |
| `components/layout/dashboard-nav.tsx` | Dashboard nav (NavShell + pills + avatar; replaces Navbar+Sidebar) |
| `components/dialogs/add-job-dialog.tsx` | Sky glassmorphic Add Job dialog |
| `components/dialogs/edit-job-dialog.tsx` | Violet glassmorphic Edit Job dialog (trigger or defaultOpen) |
| `components/layout/` | `HeroVisualCarousel`, `SiteFooter`, `PageContainer`, etc. |
| `lib/ui/landing-sections.ts` | Landing scroll anchors |
| `lib/ui/marketing-copy.ts` | Landing + auth copy |
| `lib/ui/marketing-assets.ts` | Hero carousel slides + glow colors |
| `lib/ui/scroll-motion.ts` | Shared scroll-reveal tokens |
| `components/ui/scroll-stagger.tsx` | Viewport stagger groups |
| `components/ui/scroll-parallax-section.tsx` | Section parallax (translate only) |
| `components/pages/` | `HomePage`, `SignInPageContent`, `SignUpPageContent`, `EditJobDialogPage` |
| `lib/sentry/config.ts` | Sentry init + tunnel |
| `proxy.ts` | Clerk auth gate |

## Invalidation coverage

Every CRUD invalidates jobs/stats/charts/job(id). Optimistic patches on create/delete. Cross-tab: BroadcastChannel. Cross-instance: Redis Streams SSE.

Auth/landing UI does **not** alter jobs cache paths.

## Env vars

- Clerk, DATABASE_URL — required
- UPSTASH_REDIS_* — optional (Redis cache + SSE)
- NEXT_PUBLIC_SENTRY_DSN (+ org/project/token) — optional

## Verification

```bash
npm audit && npm run lint && npm run typecheck && npm run test && npm run build
```

## UI audit (2026-06-11)

- Landing: carousel, nav, parallax, stagger, footer chrome ✓
- Auth: custom SignUpForm matches SignInForm ✓
- SSR/cache/SSE/invalidation unchanged ✓
- typecheck/lint/test(15)/build green ✓

## UI overhaul (2026-06-12)

- NavShell pattern: server chrome + 3 client navs (Landing/Auth/Dashboard) ✓
- ThemeToggle on all pages (landing, sign-in, sign-up, dashboard) ✓
- Sidebar removed; DashboardNav top-nav with pills + mobile hamburger ✓
- Add Job + Edit Job converted to glassmorphic Shadcn Dialog ✓
- /dashboard route (renamed from /jobs); /dashboard/[id] for direct URL edit ✓
- Middleware redirects /add-job + /jobs/* → /dashboard ✓
- FormComponents: required prop + asterisk; 4 Vitest tests passing ✓
- typecheck/lint/test(4)/build green ✓

## Deferred

NextAuth migration, E2E Playwright, Prisma schema cleanup, PostHog.
