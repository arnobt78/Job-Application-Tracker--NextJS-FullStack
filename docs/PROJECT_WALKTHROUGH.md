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
| `app/(dashboard)/` | Jobs, stats, add-job, edit job pages |
| `app/api/jobs/events/` | SSE invalidation stream (Clerk auth) |
| `lib/jobs/queries.ts` | Cached Prisma reads |
| `lib/invalidate-jobs*.ts` | Client + server cache bust |
| `lib/jobs/chart-optimistic.ts` | Optimistic charts cache patches |
| `lib/redis.ts` | Read-through cache + Redis Streams |
| `hooks/useJobsMutation.ts` | Optimistic CRUD hooks |
| `hooks/useJobsCacheSync.ts` | BroadcastChannel + SSE sync |
| `hooks/useGuestSignIn.ts` | Demo/test Clerk sign-in |
| `hooks/useSignUpForm.ts` | Custom sign-up + email verify |
| `lib/auth/clerk-oauth.ts` | Shared OAuth redirect URLs |
| `components/auth/` | `AuthOAuthButtons`, `AuthFormDivider` |
| `components/SignInForm.tsx` | Custom sign-in card |
| `components/SignUpForm.tsx` | Custom sign-up card (no Clerk footer) |
| `components/layout/` | `LandingNav`, `HeroVisualCarousel`, `SiteFooter`, `PageContainer` |
| `lib/ui/landing-chrome.ts` | Navbar/footer h-14 shell |
| `lib/ui/landing-sections.ts` | Landing scroll anchors |
| `lib/ui/marketing-copy.ts` | Landing + auth copy |
| `lib/ui/marketing-assets.ts` | Hero carousel slides + glow colors |
| `lib/ui/scroll-motion.ts` | Shared scroll-reveal tokens |
| `components/ui/scroll-stagger.tsx` | Viewport stagger groups |
| `components/ui/scroll-parallax-section.tsx` | Section parallax (translate only) |
| `components/pages/` | `HomePage`, `SignInPageContent`, `SignUpPageContent` |
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

## Deferred

NextAuth migration, E2E Playwright, Prisma schema cleanup, PostHog.
