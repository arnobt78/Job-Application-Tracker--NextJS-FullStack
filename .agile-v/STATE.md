# Agile V State — Jobify

| Field | Value |
|---|---|
| **Cycle** | C1 |
| **Stage** | 3 Synthesis — Phase 1 ✅ · Phase 2 ~90% · Phase 3 partial ✅ |
| **Status** | `ACTIVE` |
| **Last Updated** | 2026-06-28 |
| **Auth** | NextAuth v5 (Clerk removed) |
| **Verify** | lint ✓ · typecheck ✓ · test **51/51** ✓ · build ✓ |

## Shipped
- Phase 1: Bluedoor enrich, discover, stats, notifications, email, logos, facets, timeline, org enrich
- Phase 2 code: FastAPI pipeline, SSE streaming, `JobAIInsight`/`UserProfile`, `/profile`, internal API, n8n JSON templates
- Auth migration: NextAuth + Prisma `User`/`Account`/`Session`; `Job.userId`
- Phase 3 partial: AI fit chip (`AIFitChip` on `JobCard`), react-markdown in `AiInsightsPanel`, Framer Motion badge, README Clerk→NextAuth, resume PDF parser (`pdfjs-dist` + `uploadResumeAction`), Skill Gap tab (`lib/jobs/skill-gap.ts` + `SkillGapTab`), Salary Intelligence (`getSalaryIntelligenceAction` + `/stats`)

## Not deployed / backlog
- Coolify VPS (FastAPI + Ollama + n8n)
- ARQ queue · E2E CI auth · Phase 3 advanced (auto-apply, team mode, browser extension)

## Architecture rules
`force-dynamic` · SSR prefetch · persist jobs/stats/charts only · `invalidateUserJobCaches` + SSE · official Bluedoor API only · no `cacheComponents`

## Agent memory
`CLAUDE.md` · `docs/PROJECT_WALKTHROUGH.md` · `docs/PROJECT_PLAN.md` · `docs/JOBIFY_TECH_STACK_ANALYSIS.md`

## Verify
`npm run lint && npm run typecheck && npm run test && npm run build`
