# Agile V State — Jobify

| Field | Value |
|---|---|
| **Cycle** | C1 |
| **Stage** | 3 Synthesis — P1 ✅ · P2 ~90% code · P3 ✅ · BL-0011 ✅ |
| **Status** | `ACTIVE` — Infinity Loop **ON** |
| **Checkpoint** | INT-0003 `c1-dev-20260612` |
| **Auth** | NextAuth v5 · `proxy.ts` (Next.js 16) |
| **Last Updated** | 2026-06-29 |
| **Verify** | lint ✓ · typecheck ✓ · test **51/51** ✓ · build ✓ |

## Recent fix (2026-06-29)
- Discover SSR crash: `buildDiscoverQueryOptions` → `lib/discover/query-options.ts` (server-safe)
- `middleware.ts` → `proxy.ts` (Next.js 16 convention)
- Discover toolbar aligned to infinite query cache

## Shipped
- P1–P3 code complete · BL-0011 committed
- Vercel env synced (NextAuth, DB, Bluedoor, Resend, Sentry, Upstash)

## Backlog / not deployed
- Coolify VPS + Ollama + AI service · n8n · E2E CI auth · Gate 1

## Architecture rules
`force-dynamic` · SSR prefetch · persist jobs/stats/charts/job only · `invalidateUserJobCaches`+SSE · Bluedoor API only

## Agent memory
`CLAUDE.md` · `docs/PROJECT_WALKTHROUGH.md` · `docs/PROJECT_PLAN.md` · `.agile-v/PLAYBOOK.md`
