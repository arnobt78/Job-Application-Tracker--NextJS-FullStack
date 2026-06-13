# Agile V State — Jobify

| Field | Value |
|---|---|
| **Cycle** | C1 |
| **Stage** | 1 Baseline + **UI Extension Track** (active) |
| **Status** | `ACTIVE` — Infinity Loop **ON** |
| **Pipeline** | UI/auth/perf shipped → Gate 1 pending → ready for user reqs |
| **Last Updated** | 2026-06-11T23:55:00Z |
| **Git HEAD** | `16516b2` (uncommitted glass filters + alerts) |
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
| Instant shell | `void prefetchQuery` — never `await` before render |
| No `loading.tsx` | inline skeletons on **data slots only** |
| CRUD invalidation | `useJobsMutation` → `invalidateAllJobQueries` + `invalidateUserJobCaches` |
| Cross-tab/SSE | `useJobsCacheSync` + `/api/jobs/events` — do not break |
| No `cacheComponents: true` | conflicts with `force-dynamic` |

## Shipped (C1 UI track)

| Commit | Scope | REQ |
|---|---|---|
| `be950be` | NavShell, dashboard nav, UI polish | REQ-0012, REQ-0013 |
| `998d3a5` | Prisma cleanup | REQ-0020 |
| `8ac2e6d` | Sign-in preview, Sonner, auth toasts | REQ-0001, REQ-0014 |
| `cc72b0b` | Instant shells, auth toast fixes | REQ-0014, REQ-0013 |
| `4efaf37` | Dashboard jobs split + `useJobsListQuery` | REQ-0003, REQ-0014 |
| `a4763f4` | `.agile-v` session sync | — |
| (pending) | Glass filters, dropdowns, confirm alerts | REQ-0003, REQ-0013, REQ-0014, REQ-0023 |

**Verify @ HEAD:** lint ✓ typecheck ✓ test 20/20 ✓ build ✓ (uncommitted)

## Active Backlog

**BL-0007** (ACTIVE) — user-driven extension · token `c1-dev-20260612`  
Next: BL-0003 E2E · INT-0001 Gate 1 · BL-0004 observability

## Gates

| Gate | Status | Token |
|---|---|---|
| Gate 1 | PENDING | `c1-gate1-baseline-20260611` |
| Gate 2 | NOT_REACHED | — |

## Agent Memory

`CLAUDE.md` · `docs/PROJECT_WALKTHROUGH.md`

## Verify Before Done

`npm run lint && npm run typecheck && npm test && npm run build`
