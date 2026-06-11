# Jobify Project Walkthrough

## What it is
Full-stack job application tracker. Demo: https://jobify-tracker.vercel.app

## Architecture

```
page.tsx (SSR prefetch, force-dynamic)
  → lib/jobs/queries.ts (unstable_cache + tags + Redis optional)
  → utils/actions.ts (server actions, Clerk auth)
  → components/* (client: forms, lists, charts)

CRUD mutation path:
  useJobsMutation (optimistic) → server action → invalidateUserJobCaches
    → revalidateTag + revalidatePath + publishInvalidation
    → React Query invalidate + BroadcastChannel + SSE
```

## Key directories

| Path | Role |
|------|------|
| `app/(dashboard)/` | Jobs, stats, add-job, edit job pages |
| `app/api/jobs/events/` | SSE invalidation stream (Clerk auth) |
| `lib/jobs/queries.ts` | Cached Prisma reads |
| `lib/invalidate-jobs*.ts` | Client + server cache bust |
| `lib/jobs-events.ts` | In-memory + Redis invalidation bus |
| `hooks/useJobsMutation.ts` | Optimistic CRUD hooks |
| `hooks/useJobsCacheSync.ts` | SSE + BroadcastChannel listener |
| `providers/query-provider.tsx` | RQ defaults (staleTime: 0) |
| `proxy.ts` | Clerk auth gate (Next 16) |
| `components/ui/` | shadcn + glass/ripple/safe-image |

## Invalidation coverage
Every CRUD (create/update/delete) invalidates: all `jobs` lists, `stats`, `charts`, and `job(id)` when applicable — current tab, other tabs (BC), other instances (SSE/Redis marker).

## Env vars
- Clerk, DATABASE_URL — required
- UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN — optional (Redis cache + cross-instance SSE)

## Verification
```bash
npm audit && npm run lint && npm run typecheck && npm run test && npm run build
```

## Deferred
NextAuth migration, E2E Playwright, Prisma schema cleanup (Task/Tour/Token models kept).
