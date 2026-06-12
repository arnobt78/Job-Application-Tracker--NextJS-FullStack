# Agile V State — Jobify

| Field | Value |
|---|---|
| **Cycle** | C1 |
| **Stage** | 1 Baseline + **UI Track** (parallel extension) |
| **Status** | `ACTIVE` — Infinity Loop engaged |
| **Pipeline** | Left V done (baseline) → UI synthesis in progress → Gate 1 pending |
| **Last Updated** | 2026-06-12T12:58:22Z |
| **Git HEAD** | `f660eb9` (main, pushed) |
| **Active Checkpoint** | INT-0002 `ui-resume-20260612` |
| **Skills** | 24 registered — load `agile-v-core` FIRST every prompt |

## Session Protocol (every prompt)

1. READ `STATE.md` + `CHECKPOINTS.md`
2. MAP task → `REQ-XXXX` (halt if none)
3. SCOPE-V: Specify → Constrain → Orchestrate → Prove → Evolve → Verify
4. LOG `TRACE_LOG.md` + `DECISION_LOG.md` write-through
5. USE `build-agent-js` for code · do NOT self-verify
6. STOP at Human Gates (INT-0001 Gate 1, Gate 2)

## Current Focus — BL-0006 (UI Polish)

| # | Task | REQ | Status |
|---|---|---|---|
| 1 | Manual QA landing/auth/mobile | REQ-0013, REQ-0023 | Pending |
| 2 | Auth shell parity (SignIn/SignUp) | REQ-0023 | Pending |
| 3 | Revert `"job track"` typos (unstaged) | — | Pending |
| 4 | Dashboard `Navbar.tsx` chrome (BL-0001) | REQ-0019 | Backlog |

### Shipped (`f660eb9`)

Landing carousel/nav/stagger/parallax/footer · custom `SignUpForm` · SSR/cache/SSE untouched

### Do not break

`force-dynamic` · `invalidate-jobs*` · `useJobsMutation` · `useJobsCacheSync` · `/api/jobs/events`

## Gates

| Gate | Status | Token |
|---|---|---|
| Gate 1 | PENDING | `c1-gate1-baseline-20260611` |
| Gate 2 | NOT_REACHED | — |

## Agent Memory

`CLAUDE.md` (local) · `docs/PROJECT_WALKTHROUGH.md`

## Verify Before Done

`npm run lint && npm run typecheck && npm test && npm run build`
