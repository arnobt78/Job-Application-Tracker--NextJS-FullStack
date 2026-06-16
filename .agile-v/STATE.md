# Agile V State — Jobify

| Field | Value |
|---|---|
| **Cycle** | C1 |
| **Stage** | 1 Baseline + **UI/Cache Extension Track** (active) |
| **Status** | `ACTIVE` — Infinity Loop **ON** |
| **Pipeline** | Dashboard + SSR/cache/persist shipped → Gate 1 pending → ready for user reqs |
| **Last Updated** | 2026-06-16T17:45:00Z |
| **Git HEAD** | `280e284` |
| **Active Checkpoint** | INT-0003 `c1-dev-20260612` |
| **Skills** | 24 registered — **`agile-v-core` FIRST every prompt** |

## Session Protocol (every prompt)

1. READ `STATE.md` + `CHECKPOINTS.md`
2. MAP task → `REQ-XXXX` (halt if none)
3. SCOPE-V: Specify → Constrain → Orchestrate → Prove → Evolve → Verify
4. LOG `TRACE_LOG.md` + `DECISION_LOG.md` write-through
5. USE `build-agent-js` for code · do NOT self-verify (Red Team protocol)
6. STOP at Human Gates (INT-0001 Gate 1, Gate 2)

## Resume tomorrow

- HEAD `280e284` on `main` (clean, pushed)
- Verify: `npm run lint && npm run typecheck && npm test && npm run build` (**49 tests**)
- Read `CLAUDE.md` + `docs/PROJECT_WALKTHROUGH.md` + `.agile-v/PLAYBOOK.md`
- INT-0003 active · Gate 1 still pending

## Architecture Constraints (always)

| Rule | Path / pattern |
|---|---|
| SSR pages | `export const dynamic = 'force-dynamic'` in `page.tsx` |
| Server code | `page.tsx`, server actions, `lib/jobs/queries.ts` |
| Client code | components/hooks only when SSR impossible |
| Prefetch | `await prefetchQuery` before `dehydrate` (dashboard/stats/[id]) |
| Nav avatar | `dashboard/layout` `currentUser()` → `NavUserProvider` |
| Cold skeletons | `useQueryBodyLoading` only when cache empty |
| Persist | `PersistQueryClient` localStorage `jobify-query-cache` buster `v1` |
| No `loading.tsx` | inline skeletons on **data slots only** |
| CRUD | `useJobsMutation` onSuccess `invalidateAll`+broadcast · onSettled same `broadcast:false` |
| Server bust | `invalidateUserJobCaches` + tags + Redis + SSE |
| Cross-tab | `useJobsCacheSync` + `/api/jobs/events` — do not break |
| No `cacheComponents: true` | conflicts with `force-dynamic` |

## Shipped (C1 — recent)

| Commit | Scope | REQ |
|---|---|---|
| `4914d29` | Dashboard redesign + optimistic portfolio stats | REQ-0003, REQ-0012, REQ-0014 |
| `93cddf6` | Shell skeletons, filter layout, keepPreviousData | REQ-0014, REQ-0012 |
| `37f8525` | SSR hydrate, persist, body loading, nav SSR avatar | REQ-0014, REQ-0015, REQ-0019 |
| `66bc670` | onSettled → `invalidateAllJobQueries` incl. filterOptions | REQ-0015 |
| `280e284` | Docs sync mutation choke-point | REQ-0024 |

**Verify @ HEAD:** lint ✓ typecheck ✓ test **49/49** ✓ build ✓

## Active Backlog

**BL-0007** (ACTIVE) — user-driven extension · token `c1-dev-20260612`  
**BL-0001** DONE (nav SSR avatar @ `37f8525`)  
Next: user reqs → REQ mapping · manual QA · BL-0003 E2E · INT-0001 Gate 1 · BL-0004 observability

## Gates

| Gate | Status | Token |
|---|---|---|
| Gate 1 | PENDING | `c1-gate1-baseline-20260611` |
| Gate 2 | NOT_REACHED | — |

## Agent Memory

`CLAUDE.md` · `docs/PROJECT_WALKTHROUGH.md` · **`.agile-v/PLAYBOOK.md`**

## Verify Before Done

`npm run lint && npm run typecheck && npm test && npm run build`
