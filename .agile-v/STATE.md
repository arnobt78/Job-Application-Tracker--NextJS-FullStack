# Agile V State — Jobify

| Field | Value |
|---|---|
| **Cycle** | C1 |
| **Stage** | 3 Synthesis — **Phase 1+2 complete + Posting Activity tab** (uncommitted) |
| **Status** | `ACTIVE` — Infinity Loop **ON** |
| **Pipeline** | Phase 1+2 + Posting Activity tab → audit PASS (EVAL-0011) → ready to commit |
| **Last Updated** | 2026-06-27T19:30:00Z |
| **Git HEAD** | `1a1bec0` (+ Phase 1+2 + Posting Activity **uncommitted**) |
| **Active Checkpoint** | INT-0003 `c1-dev-20260612` |
| **Skills** | 24 registered — **`agile-v-core` FIRST every prompt** |

## Session Protocol (every prompt)

1. READ `STATE.md` + `CHECKPOINTS.md`
2. MAP task → `REQ-XXXX` (halt if none)
3. SCOPE-V: Specify → Constrain → Orchestrate → Prove → Evolve → Verify
4. LOG `TRACE_LOG.md` + `DECISION_LOG.md` write-through
5. USE `build-agent-js` for code · do NOT self-verify (Red Team protocol)
6. STOP at Human Gates (INT-0001 Gate 1, Gate 2)

## Resume (current session)

- Phase 1 Bluedoor implemented (schema, lib, discover UI, webhook, cron)
- Verify: `npm run lint && npm run typecheck && npm test && npm run build` — **PASS** (49 tests) @ local
- Read `CLAUDE.md` + `docs/PROJECT_WALKTHROUGH.md` + `docs/PROJECT_PLAN.md`
- INT-0003 active · commit Phase 1 when ready · Gate 1 still pending

## Vision (locked)

| Phase | Scope | Status |
|---|---|---|
| **Phase 1** | Bluedoor enrich + `/discover` in Next.js | **Implemented** (uncommitted) |
| **Phase 2** | FastAPI + Ollama 9-agent pipeline + n8n on Coolify | Planned (`docs/PROJECT_PLAN.md`) |
| **Principle** | Application OS first — enrich + optional discovery, not full job board | — |

## Architecture Constraints (always)

| Rule | Path / pattern |
|---|---|
| SSR pages | `export const dynamic = 'force-dynamic'` in `page.tsx` |
| Server code | `page.tsx`, server actions, `lib/jobs/queries.ts`, `lib/bluedoor/*` |
| Client code | components/hooks only when SSR impossible |
| Prefetch | `await prefetchQuery` before `dehydrate` (dashboard/stats/[id]/discover) |
| Nav avatar | `dashboard/layout` `currentUser()` → `NavUserProvider` |
| Cold skeletons | `useQueryBodyLoading` only when cache empty |
| Persist | `PersistQueryClient` — jobs/stats/charts/job only; **not discover** |
| Bluedoor enrich | `after()` post-response; never block CRUD response |
| CRUD | `useJobsMutation` onSuccess `invalidateAll`+broadcast · onSettled `broadcast:false` |
| Server bust | `invalidateUserJobCaches` + tags + Redis + SSE |
| Cross-tab | `useJobsCacheSync` + `/api/jobs/events` — do not break |
| No `cacheComponents: true` | conflicts with `force-dynamic` |
| Bluedoor API | Official API only — no scraping |

## Shipped (C1 — recent)

| Scope | REQ |
|---|---|
| Dashboard + SSR/cache/persist track (`280e284`…`1a1bec0`) | REQ-0003, REQ-0014, REQ-0015, REQ-0024 |
| Phase 1 Bluedoor (local, uncommitted) | REQ-0025, REQ-0026 |
| **Phase 1 completion** — SSE notification bus + bell + discover details modal + cursor pagination + Resend emails | REQ-0025, REQ-0026 |
| **Phase 2 scaffold** — FastAPI 9-agent pipeline + LLM router + AiInsightsPanel | REQ-0027 |
| **publishNotification fix** — enrich.ts now fires SSE bell on posting change | REQ-0026 |
| **AiInsightsPanel wired** — `/dashboard/[id]` + `/discover` Details modal | REQ-0027 |
| **Posting Activity tab** — `JobDetailPanels` tabbed AI+timeline; `getJobEvents()` client + server action | REQ-0026 |

**Verify @ local (`2026-06-27`):** lint ✓ typecheck ✓ test **49/49** ✓ build ✓ (all 5 API routes)

## Active Backlog

**BL-0008** (READY TO COMMIT) — Phase 1+2 + Posting Activity tab implemented, audit PASS  
**BL-0009** (SCAFFOLDED) — Phase 2 Python service ready; needs Coolify deploy + real LLM keys  
Next: git commit · manual QA discover/enrich/bell/AI panel/activity tab · Gate 1 · BL-0003 E2E

## Gates

| Gate | Status | Token |
|---|---|---|
| Gate 1 | PENDING | `c1-gate1-baseline-20260611` |
| Gate 2 | NOT_REACHED | — |

## Agent Memory

`CLAUDE.md` · `docs/PROJECT_WALKTHROUGH.md` · `docs/PROJECT_PLAN.md` · **`.agile-v/PLAYBOOK.md`**

## Verify Before Done

`npm run lint && npm run typecheck && npm test && npm run build`
