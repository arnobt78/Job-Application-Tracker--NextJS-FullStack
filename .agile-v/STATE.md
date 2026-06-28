# Agile V State — Jobify

| Field | Value |
|---|---|
| **Cycle** | C1 |
| **Stage** | 3 Synthesis — **Phase 1 COMPLETE + Phase 2 DB-persisted** |
| **Status** | `ACTIVE` — Infinity Loop **ON** |
| **Pipeline** | BL-0010 COMPLETE · BL-0009 partial · Gate 1 pending · manual QA pending |
| **Last Updated** | 2026-06-28T12:00:00Z |
| **Git HEAD** | pending commit — T1-T8 complete + papaparse removed |
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

- Phase 1 **COMPLETE** — all BL-0010 gaps closed (T1–T8)
- Phase 2 **DB-persisted** — `JobAIInsight` + `UserProfile` models, `AiInsightsPanel` regenerate flow, internal API routes for n8n
- `papaparse` + `@types/papaparse` removed (dead packages — zero imports)
- Verify @ `2026-06-28`: lint ✓ · typecheck ✓ · test **49/49** ✓ · build ✓
- INT-0003 active · Gate 1 still pending

## Vision (locked)

| Phase | Scope | Status |
|---|---|---|
| **Phase 1** | Bluedoor enrich + `/discover` + stats + notifications + email + logos + facets + webhook-subscribe | **✅ COMPLETE** |
| **Phase 2** | FastAPI + Ollama 9-agent pipeline + n8n on Coolify + DB persist | Scaffolded + persisted (`JobAIInsight`, internal API) |
| **Principle** | Application CRM first — enrich + optional discovery, not full job board | — |

## Architecture Constraints (always)

| Rule | Path / pattern |
|---|---|
| SSR pages | `export const dynamic = 'force-dynamic'` in `page.tsx` |
| Auth middleware | `middleware.ts` (Clerk gate — **not** `proxy.ts`) |
| Server code | `page.tsx`, server actions, `lib/jobs/queries.ts`, `lib/bluedoor/*` |
| Client code | components/hooks only when SSR impossible |
| Prefetch | `await prefetchQuery` / `prefetchInfiniteQuery` before `dehydrate` |
| Nav avatar | `dashboard/layout` `currentUser()` → `NavUserProvider` |
| Cold skeletons | `useQueryBodyLoading` only when cache empty |
| Persist | `PersistQueryClient` — jobs/stats/charts/charts-weekly/job only; **not discover/ai/events** |
| Bluedoor enrich | `after()` post-response; never block CRUD response |
| CRUD | `useJobsMutation` onSuccess `invalidateAll`+broadcast · onSettled `broadcast:false` |
| Server bust | `invalidateUserJobCaches` + tags + Redis + SSE |
| Cross-tab | `useJobsCacheSync` + `/api/jobs/events` — do not break |
| No `cacheComponents: true` | conflicts with `force-dynamic` |
| Bluedoor API | Official API only — no scraping |

## Shipped (C1)

| Scope | REQ |
|---|---|
| Core CRM + SSR/cache/persist | REQ-0001…0018, REQ-0024 |
| Phase 1 Bluedoor enrichment | REQ-0025 |
| `/discover` + infinite scroll + Details modal | REQ-0026 |
| Notification bell + SSE + Resend email | REQ-0029 |
| Stats overhaul (4 charts + KPI row + weekly velocity) | REQ-0028 |
| Posting Activity tab (`getJobEvents`) | REQ-0026 |
| Phase 2 AI scaffold (FastAPI + panel) | REQ-0027 |
| `middleware.ts` fix (was `proxy.ts`) | REQ-0009 |
| Docs audit sync | REQ-0024 |

**Verify @ local (`2026-06-28`):** lint ✓ · typecheck ✓ · test **49/49** ✓ · build ✓

## Active Backlog

| BL | Status | Scope |
|---|---|---|
| **BL-0008** | ✅ COMMITTED | Phase 1+2 core + Posting Activity (`58e8297`+) |
| **BL-0010** | ✅ COMPLETE | T1-T8: logos, React Email, weekly digest, facets, webhook-subscribe, AI DB models, AI panel persist, internal API |
| **BL-0009** | PARTIAL | Phase 2: DB models+persist done; Coolify deploy + n8n flows + UserProfile UI pending |
| **BL-0003** | BACKLOG | E2E Playwright + Bluedoor unit tests |
| Gate 1 | PENDING | Human approve baseline REQs |

## Gates

| Gate | Status | Token |
|---|---|---|
| Gate 1 | PENDING | `c1-gate1-baseline-20260611` |
| Gate 2 | NOT_REACHED | — |

## Agent Memory

`CLAUDE.md` · `docs/PROJECT_WALKTHROUGH.md` · `docs/PROJECT_PLAN.md` · `docs/JOBIFY_TECH_STACK_ANALYSIS.md` · **`.agile-v/PLAYBOOK.md`**

## Verify Before Done

`npm run lint && npm run typecheck && npm test && npm run build`
