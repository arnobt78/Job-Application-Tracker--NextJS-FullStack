# Agile V Playbook — Jobify

<!-- REQ-0024 | Load agile-v-core FIRST every session -->

## One Command

```
/agile-v-core — Resume Jobify INT-0003. Read STATE.md + CHECKPOINTS.md. Map → REQ-XXXX. SCOPE-V. Log TRACE + DECISION.
```

## Startup (every prompt)

| Step | Action | File |
|---|---|---|
| 1 | Read state | `STATE.md` |
| 2 | Check checkpoint | `CHECKPOINTS.md` |
| 3 | Load skill | `agile-v-core` **FIRST** |
| 4 | Map → REQ | `REQUIREMENTS.md` |
| 5 | SCOPE-V | Specify→Constrain→Orchestrate→Prove→Evolve→Verify |
| 6 | Log | `TRACE_LOG.md`, `DECISION_LOG.md` |
| 7 | Verify | lint · typecheck · test · build |

**Halt if:** no REQ mapping · ambiguous scope · Human Gate without approval · typecheck FAIL on commit

## Current Snapshot

| Field | Value |
|---|---|
| Cycle | C1 · INT-0003 ACTIVE |
| Git HEAD | `3551f1e` (clean) |
| WIP | BL-0009 Coolify VPS AI deploy |
| P1 | ✅ · P2 ~90% deploy ⏳ · P3 ✅ |
| Auth | NextAuth v5 |
| Tests | **51/51** @ HEAD |
| Gate 1 | PENDING |

## Task Routing

| Task | Skills |
|---|---|
| Bug fix | core → quality-gates → build-agent-js → red-team-verifier |
| Feature | core → pipeline → requirement-architect → build-agent-js |
| UI | core → ux-spec-author → build-agent-js |
| Deploy | core → deployment-expert → release-manager |
| Sync only | core → documentation-agent |

## Architecture (never break)

| Rule | Pattern |
|---|---|
| SSR | `force-dynamic` + `prefetchQuery` before `dehydrate` |
| Skeletons | `useQueryBodyLoading` — cold cache only |
| Persist | jobs/stats/charts/charts-weekly/job — **not** discover/ai/skill-gap/salary-intel |
| Auth | `proxy.ts` NextAuth JWT (Next.js 16) |
| CRUD cache | `invalidateAllJobQueries` + `invalidateUserJobCaches` + SSE |
| Cross-tab | `useJobsCacheSync` + `/api/jobs/events` |
| Nav | `auth()` → `NavUserProvider` |

Full: `CLAUDE.md`

## REQ Quick Index

| Range | Scope |
|---|---|
| REQ-0001…0018 | C1 baseline CRM |
| REQ-0024 | Agile V governance |
| REQ-0025…0029 | Phase 1 Bluedoor + stats + notifications |
| REQ-0027 | Phase 2 AI pipeline |
| REQ-0031 | Phase 3 partial (shipped) |
| REQ-0033 | Phase 3 advanced (WIP) |

## Verify

```bash
npm run lint && npm run typecheck && npm run test && npm run build
```

## Evidence Summary (template)

```
Scope: [produced] | Traceability: [REQ-IDs] | Findings: PASS/FAIL/FLAG
Decision: [TIMESTAMP | AGENT | DECISION | RATIONALE | REQ]
```
