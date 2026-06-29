# Agile V State — Jobify

| Field | Value |
|---|---|
| **Cycle** | C1 |
| **Stage** | 3 Synthesis — Phase 1 ✅ · Phase 2 ~90% · Phase 3 partial ✅ · **BL-0011 WIP** |
| **Status** | `ACTIVE` — Infinity Loop **ON** |
| **Checkpoint** | INT-0003 `c1-dev-20260612` |
| **Git HEAD (clean)** | `7a648e3` |
| **Working tree** | **DIRTY** — BL-0011 uncommitted (typecheck FAIL) |
| **Auth** | NextAuth v5 |
| **Last Updated** | 2026-06-28T20:30:00Z |
| **Verify (HEAD)** | lint ✓ · typecheck ✓ · test **51/51** ✓ · build ✓ |

## Shipped (committed)
- P1: Bluedoor enrich, discover, stats, notifications, email, facets, timeline, org enrich
- P2 code: FastAPI pipeline, SSE streaming, JobAIInsight/UserProfile, /profile, internal API, n8n JSON
- Auth: NextAuth migration (`b0a0f26`)
- P3 partial (`59060a0`): AIFitChip, PDF resume parser, Skill Gap (keyword), Salary Intel, react-markdown, Framer badge

## WIP (do not commit until gates pass)
- BL-0011: browser extension, team mode, auto-apply email, ARQ/batch AI, LLM skill gap
- Blocker: `skill-gap-tab.tsx` type errors · run `npx prisma generate` after schema changes

## Backlog / not deployed
- Coolify VPS · Ollama · n8n instance · E2E CI auth · Gate 1 approval (INT-0001)

## Architecture rules
`force-dynamic` · SSR prefetch · persist jobs/stats/charts/job only · `invalidateUserJobCaches`+SSE · Bluedoor API only · no `cacheComponents`

## Session protocol (every prompt)
1. READ `STATE.md` + `CHECKPOINTS.md` + `CLAUDE.md`
2. MAP task → `REQ-XXXX` (halt if none)
3. SCOPE-V · log `TRACE_LOG` + `DECISION_LOG`
4. Verify: `npm run lint && npm run typecheck && npm run test && npm run build`

## Agent memory
`CLAUDE.md` · `docs/PROJECT_WALKTHROUGH.md` · `docs/PROJECT_PLAN.md` · `docs/JOBIFY_TECH_STACK_ANALYSIS.md` · `.agile-v/PLAYBOOK.md`
