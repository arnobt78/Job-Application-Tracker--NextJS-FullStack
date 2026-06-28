# Agile V Playbook — Jobify

<!-- One-command operating guide | REQ-0024 | Load with every session -->

## One Command (paste in any new chat)

```
/agile-v-core — Resume Jobify from .agile-v/PLAYBOOK.md. Read STATE.md + CHECKPOINTS.md first. Continue INT-0003. Map my request to REQ-XXXX. Follow SCOPE-V and log TRACE + DECISION.
```

Shorter variant:

```
/agile-v-core resume INT-0003 — [your task here]
```

---

## Startup (agent — every prompt)

| Step | Action | File |
|---|---|---|
| 1 | Read current state | `.agile-v/STATE.md` |
| 2 | Check active checkpoint | `.agile-v/CHECKPOINTS.md` |
| 3 | Load framework skill | `agile-v-core` (always first) |
| 4 | Map user task → REQ | `.agile-v/REQUIREMENTS.md` |
| 5 | Apply SCOPE-V | See below |
| 6 | Log write-through | `TRACE_LOG.md`, `DECISION_LOG.md` |
| 7 | Verify before done | `npm run lint && npm run typecheck && npm test && npm run build` |

**Halt if:** no REQ mapping, ambiguous scope, or Human Gate reached without approval.

---

## SCOPE-V (task execution)

```
Specify → Constrain → Orchestrate → Prove → Evolve → Verify
```

| Phase | What | Agent / Skill |
|---|---|---|
| Specify | Clarify intent, tag REQ | requirement-architect |
| Constrain | Validate feasibility, arch rules | logic-gatekeeper, `CLAUDE.md` |
| Orchestrate | Implement | **build-agent-js** |
| Prove | Evidence, manifest update | build-agent-js, compliance-auditor |
| Evolve | Append decision log | compliance-auditor |
| Verify | Independent check | red-team-verifier (not self-verify) |

---

## Task Routing

| You want… | Paste this | Skills loaded |
|---|---|---|
| Bug fix | `/agile-v-core fix: [describe bug]` | core → quality-gates → build-agent-js → red-team-verifier |
| New feature | `/agile-v-core feature: [describe feature]` | core → pipeline → requirement-architect → build-agent-js → test-designer |
| UI change | `/agile-v-core ui: [describe UI]` | core → ux-spec-author → build-agent-js |
| Error / CI fail | `/agile-v-core error: [paste error]` | core → systematic-debugging → build-agent-js |
| Approve baseline | `Approve Gate 1` | core → compliance → APPROVALS.md |
| New cycle (C2) | `/agile-v-core cycle C2: [scope]` | core → lifecycle → product-owner |
| Process only | `/agile-v-core sync` | core → REQ-0024 governance sync |

---

## Current Session Snapshot

| Field | Value |
|---|---|
| Cycle | C1 |
| Checkpoint | INT-0003 |
| Phase 1 | **✅ COMPLETE** |
| Phase 2 | **~90%** — code in repo; VPS deploy pending |
| Auth | NextAuth v5 (Clerk removed) |
| Gate 1 | PENDING |
| Verify | lint ✓ · typecheck ✓ · test **51/51** ✓ · build ✓ |

---

## Human Gates

### Gate 1 — Baseline REQ approval

1. Human reviews `.agile-v/REQUIREMENTS.md` + `.agile-v/ATM.md`
2. Reply: **`Approve Gate 1`** (or request a change via CR in `CHANGE_LOG.md`)
3. Agent appends `APPROVALS.md` with approver + timestamp + `resume_token`
4. Pipeline advances to Stage 2 Validation

### Gate 2 — Release acceptance

Requires `EVAL_RESULTS.md` with `eval_gate_status: PASS` (or WAIVED) + `VALIDATION_SUMMARY.md`.

---

## File Map (`.agile-v/`)

| File | Purpose | When to touch |
|---|---|---|
| `STATE.md` | Living status, arch constraints, shipped work | Every session start + end |
| `CHECKPOINTS.md` | HITL interrupts, resume tokens | Gate pause / resume |
| `REQUIREMENTS.md` | REQ-XXXX source of truth | New features, CRs |
| `DECISION_LOG.md` | Append-only decisions | Every significant choice |
| `TRACE_LOG.md` | Append-only action spans | Every build/verify step |
| `VALIDATION_SUMMARY.md` | PASS/FAIL/FLAG findings | After verification |
| `BUILD_MANIFEST.md` | ART-XXXX → code paths | After synthesis |
| `TEST_SPEC.md` | TC-XXXX test cases | New features |
| `ATM.md` | REQ → ART → TC matrix | After REQ/ART changes |
| `SKILLS_REGISTRY.md` | 24 active skills | Session activation |
| `PLAYBOOK.md` | This file | Reference only |
| `APPROVALS.md` | Human gate signatures | Gate 1 / Gate 2 only |
| `BACKLOG.md` | BL-XXXX items | Sprint planning |
| `EVAL_RESULTS.md` | Eval flywheel for Gate 2 | Before release |
| `POLICY.yaml` | Policy-as-code | Compliance checks |

Phase dirs: `phases/01-requirements/` … `phases/05-acceptance/`  
Archives: `cycles/C1/` (frozen after Gate 2)

---

## Architecture Constraints (never break)

| Rule | Pattern |
|---|---|
| SSR pages | `export const dynamic = 'force-dynamic'` |
| Prefetch | `await prefetchQuery` before `dehydrate` (dashboard/stats/[id]) |
| Cold skeletons | `useQueryBodyLoading` — skip when SSR/persist warm |
| Persist | `PersistQueryClient` localStorage `jobify-query-cache` — **not** discover/ai/events |
| Auth middleware | `middleware.ts` — NextAuth JWT gate |
| No route `loading.tsx` | Inline skeletons on data slots only |
| CRUD cache | onSuccess `invalidateAll`+broadcast · onSettled same `broadcast:false` |
| Server bust | `invalidateUserJobCaches` + tags + Redis + SSE |
| Cross-tab sync | `useJobsCacheSync` + `/api/jobs/events` |
| Nav avatar | `dashboard/layout` `currentUser()` → `NavUserProvider` |
| No `cacheComponents: true` | Conflicts with `force-dynamic` |

Full rules: `CLAUDE.md` at repo root.

---

## Verify Before Done

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

Current baseline: **49 tests** passing · Phase 1 ~92% @ `0f2ea55`

---

## Re-Entry Points (from agile-v-lifecycle)

| Trigger | Start at | Scope |
|---|---|---|
| New feature | Stage 1 (Specify) | New REQ + full pipeline for affected |
| Bug fix (no REQ change) | Stage 3 (Orchestrate) | Fix + re-verify affected only |
| REQ change from verification | Stage 1 + CR | Full affected; regression others |
| Scheduled iteration (C2+) | Stage 1 | Review all REQs; archive C1 on Gate 2 |

---

## Evidence Summary (template)

Use at end of significant work:

```
Scope: [produced/validated] | Traceability: [REQ-IDs] | Findings: [PASS/FAIL/FLAG counts]
Decision Points: [choices] | Log: [TIMESTAMP | AGENT | DECISION | RATIONALE | LINKED_REQ]
```

---

## Quick REQ Index

| Range | Scope |
|---|---|
| REQ-0001…0018 | C1 baseline (implemented) |
| REQ-0019 | Auth SSR avatar — done |
| REQ-0020…0023 | Prisma cleanup / auth UI — done |
| REQ-0024 | Agile V governance — active |
| REQ-0025 | Bluedoor enrichment — implemented |
| REQ-0026 | `/discover` + Posting Activity — implemented |
| REQ-0027 | AI agent pipeline — scaffolded [C1] |
| REQ-0028 | Stats analytics overhaul — implemented |
| REQ-0029 | Notification center + email — implemented |

Full list: `.agile-v/REQUIREMENTS.md`  
Traceability: `.agile-v/ATM.md`
