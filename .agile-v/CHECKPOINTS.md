# Checkpoints — Durable HITL Interrupts

| INT-ID | Cycle | Gate | Type | Status | resume_token | Created | Scope |
|---|---|---|---|---|---|---|---|
| INT-0001 | C1 | Gate 1 | Human-Verify | PENDING | `c1-gate1-baseline-20260611` | 2026-06-11 | Approve REQ-0001…0033 baseline |
| INT-0002 | C1 | — | Agent-Resume | RESOLVED | `ui-resume-20260612` | 2026-06-11 | BL-0006 UI polish — shipped |
| INT-0003 | C1 | — | Dev-Active | **ACTIVE** | `c1-dev-20260612` | 2026-06-12 | Continue C1 synthesis; BL-0011 WIP |

## Resume INT-0003 (active — every session)

1. READ `.agile-v/STATE.md` + this file + `CLAUDE.md` + `docs/PROJECT_PLAN.md`
2. Git: clean HEAD `7a648e3` · WIP uncommitted on BL-0011 (lint ✓ typecheck ✓ 51/51 ✓ build ✓)
3. Verify HEAD: `npm run lint && npm run typecheck && npm test && npm run build`
4. MAP tasks → REQ-XXXX · SCOPE-V · log TRACE + DECISION
5. BL-0011 typefix DONE (2026-06-29) — remaining: wire UI to `/profile` + team route + manual QA
6. Next: wire BL-0011 UI into `/profile` OR user instruction

## Resume INT-0001 (Gate 1)

Human approves `.agile-v/REQUIREMENTS.md` → reply **`Approve Gate 1`** → `APPROVALS.md` → Stage 2 Validation
