# Agile V State — Jobify

| Field | Value |
|---|---|
| **Cycle** | C1 |
| **Stage** | 1 Baseline + **UI Extension Track** (active) |
| **Status** | `ACTIVE` — Infinity Loop ready |
| **Pipeline** | Baseline captured → UI synthesis ongoing → Gate 1 pending |
| **Last Updated** | 2026-06-12T21:31:53Z |
| **Git HEAD** | `be950be` (main, clean) |
| **Active Checkpoint** | INT-0003 `c1-dev-20260612` |
| **Skills** | 24 registered — **`agile-v-core` FIRST every prompt** |

## Session Protocol (every prompt)

1. READ `STATE.md` + `CHECKPOINTS.md`
2. MAP task → `REQ-XXXX` (halt if none)
3. SCOPE-V: Specify → Constrain → Orchestrate → Prove → Evolve → Verify
4. LOG `TRACE_LOG.md` + `DECISION_LOG.md` write-through
5. USE `build-agent-js` for code · do NOT self-verify (Red Team protocol)
6. STOP at Human Gates (INT-0001 Gate 1, Gate 2)

## Architecture Constraints (always)

| Rule | Path / pattern |
|---|---|
| SSR pages | `export const dynamic = 'force-dynamic'` in `page.tsx` |
| Server code | `page.tsx`, server actions, `lib/jobs/queries.ts` |
| Client code | components/hooks only when SSR impossible |
| CRUD invalidation | `useJobsMutation` → `invalidateAllJobQueries` + server `invalidateUserJobCaches` |
| Cross-tab/SSE | `useJobsCacheSync` + `/api/jobs/events` — do not break |
| No `cacheComponents: true` | conflicts with `force-dynamic` |

## Shipped (UI track)

| Commit | Scope | REQ |
|---|---|---|
| `f660eb9` | Landing carousel, LandingNav, SignUpForm, scroll stagger | REQ-0013, REQ-0023 |
| `07fcd0e` | NavShell, DashboardNav, AuthNav, dialogs, `/dashboard` route | REQ-0012, REQ-0019 |
| `d819396` | Stats header, hero CTA redirect, server cleanup | REQ-0005, REQ-0013 |
| `be950be` | Navbar/page-container/ui styling polish | REQ-0012, REQ-0013 |

**Verify @ be950be:** typecheck ✓ lint ✓ test 19/19 ✓

## Current Focus — BL-0007 (next instructions)

Await user requirements. Suggested backlog: mobile landing QA, E2E tests (BL-0003), Prisma cleanup (BL-0002).

## Gates

| Gate | Status | Token |
|---|---|---|
| Gate 1 | PENDING | `c1-gate1-baseline-20260611` |
| Gate 2 | NOT_REACHED | — |

## Agent Memory

`CLAUDE.md` (local) · `docs/PROJECT_WALKTHROUGH.md` · `docs/UI_STYLING_GUIDE.md`

## Verify Before Done

`npm run lint && npm run typecheck && npm test && npm run build`
