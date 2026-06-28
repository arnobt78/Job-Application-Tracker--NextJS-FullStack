# Agile V State — Jobify

| Field | Value |
|---|---|
| **Cycle** | C1 |
| **Stage** | 3 Synthesis — Phase 1 ✅ · Phase 2 ~90% |
| **Status** | `ACTIVE` |
| **Last Updated** | 2026-06-27 |
| **Auth** | NextAuth v5 (Clerk removed) |
| **Verify** | lint ✓ · typecheck ✓ · test **51/51** ✓ · build ✓ |

## Shipped
- Phase 1: Bluedoor enrich, discover, stats, notifications, email, logos, facets, timeline, org enrich
- Phase 2 code: FastAPI pipeline, SSE streaming, `JobAIInsight`/`UserProfile`, `/profile`, internal API, n8n JSON templates
- Auth migration: NextAuth + Prisma `User`/`Account`/`Session`; `Job.userId`

## Not deployed / backlog
- Coolify VPS (FastAPI + Ollama + n8n)
- AI fit chip on `JobCard` · ARQ queue · E2E CI auth · Phase 3

## Architecture rules
`force-dynamic` · SSR prefetch · persist jobs/stats/charts only · `invalidateUserJobCaches` + SSE · official Bluedoor API only · no `cacheComponents`

## Agent memory
`CLAUDE.md` · `docs/PROJECT_WALKTHROUGH.md` · `docs/PROJECT_PLAN.md` · `docs/JOBIFY_TECH_STACK_ANALYSIS.md`

## Verify
`npm run lint && npm run typecheck && npm run test && npm run build`
