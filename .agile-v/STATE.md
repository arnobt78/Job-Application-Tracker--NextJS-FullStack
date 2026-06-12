# Agile V State — Jobify

| Field | Value |
|---|---|
| **Cycle** | C1 |
| **Stage** | 1 Baseline + **UI Extension Track** (active) |
| **Status** | `ACTIVE` — paused for next session |
| **Pipeline** | UI/auth/perf shipped → Gate 1 still pending |
| **Last Updated** | 2026-06-13T01:10:00Z |
| **Git HEAD** | `4efaf37` (main, clean, pushed) |
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

## Shipped (2026-06-12 → 2026-06-13)

| Commit | Scope | REQ |
|---|---|---|
| `998d3a5` | Prisma: remove Task/Tour/Token; Job indexes | REQ-0020 |
| `8ac2e6d` | Sign-in preview, Sonner toasts, auth toast listener | REQ-0001, REQ-0014 |
| `cc72b0b` | Instant page shells, auth toast fixes, test-account select | REQ-0014, REQ-0013 |
| `4efaf37` | Dashboard split: JobsCount/Grid/Pagination + `useJobsListQuery` | REQ-0014, REQ-0003 |

**Verify @ 4efaf37:** lint ✓ typecheck ✓ test 20/20 ✓ build ✓

## Resume Tomorrow — suggested next

| Priority | Item | BL | Notes |
|---|---|---|---|
| 1 | Manual QA sign-in/out toasts, dashboard↔stats nav | BL-0007 | User testing |
| 2 | E2E Playwright | BL-0003 | Deferred |
| 3 | Gate 1 human approval | INT-0001 | REQ baseline sign-off |
| 4 | PostHog / full observability | BL-0004 | Optional |

## Gates

| Gate | Status | Token |
|---|---|---|
| Gate 1 | PENDING | `c1-gate1-baseline-20260611` |
| Gate 2 | NOT_REACHED | — |

## Agent Memory

`CLAUDE.md` · `docs/PROJECT_WALKTHROUGH.md` · `docs/CLERK_AUTH_COMPLETE_IMPLEMENTATION_GUIDE.md`

## Verify Before Done

`npm run lint && npm run typecheck && npm test && npm run build`
