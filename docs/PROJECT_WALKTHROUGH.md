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

| Path                           | Role                                                  |
| ------------------------------ | ----------------------------------------------------- |
| `app/(dashboard)/`             | Jobs, stats, add-job, edit job pages                  |
| `app/api/jobs/events/`         | SSE invalidation stream (Clerk auth)                  |
| `lib/jobs/queries.ts`          | Cached Prisma reads                                   |
| `lib/invalidate-jobs*.ts`      | Client + server cache bust                            |
| `lib/jobs/chart-optimistic.ts` | Optimistic charts cache patches                       |
| `lib/redis.ts`                 | Read-through cache + Redis Streams (XADD/XREAD BLOCK) |
| `lib/jobs-events.ts`           | In-memory bus + stream publish/subscribe              |
| `hooks/useJobsMutation.ts`     | Optimistic CRUD hooks (lists + stats + charts)        |
| `hooks/useSentryUser.ts`       | Clerk → Sentry user context                           |
| `providers/query-provider.tsx` | RQ defaults (staleTime: 0)                            |
| `app/api/monitoring/`          | Sentry tunnel (ad-blocker bypass for browser SDK)     |
| `lib/sentry/config.ts`         | Shared Sentry init (tunnel client-only)               |
| `proxy.ts`                     | Clerk auth gate (Next 16)                             |
| `components/ui/`               | shadcn + glass/ripple/safe-image                      |
| `components/layout/`           | PageContainer, SplitContentLayout, HeroIllustrationFrame, SiteFooter |
| `lib/ui/marketing-copy.ts`     | Shared landing + auth marketing text                    |
| `lib/ui/marketing-assets.ts`   | Hero main.svg + job-1..4 SVG carousel                   |
| `hooks/useGuestSignIn.ts`      | Guest/demo Clerk sign-in for landing CTA                |
| `components/pages/`            | HomePage, SignIn/SignUp page content (CSR)              |
| `lib/ui/dimensions.ts`         | Shared skeleton/card dimensions                         |

## Invalidation coverage

Every CRUD invalidates jobs/stats/charts/job(id). Optimistic patches on create/delete update charts instantly. Cross-tab: BroadcastChannel. Cross-instance: Redis Streams via SSE XREAD BLOCK.

## Env vars

- Clerk, DATABASE_URL — required
- UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN — optional (Redis cache + cross-instance SSE)
- NEXT_PUBLIC_SENTRY_DSN (+ SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN for builds) — optional; browser SDK uses `/api/monitoring` tunnel when DSN is set

## Sentry files

`sentry.*.config.ts` · `instrumentation.ts` · `app/global-error.tsx` · `app/error.tsx` · `app/api/monitoring/route.ts` · `lib/sentry/config.ts`

## Verification

```bash
npm audit && npm run lint && npm run typecheck && npm run test && npm run build
```

## Deferred

NextAuth migration, E2E Playwright, Prisma schema cleanup, PostHog/Session Replay.

## UI audit (2026-06)

All 8 plan phases shipped in `6df37b0`. typecheck/lint/test/build green. Orphan `public/job-*.svg` removed.
