# Checkpoints — Durable HITL Interrupts

| INT-ID | Cycle | Gate | Type | Status | resume_token | Created | Scope |
|---|---|---|---|---|---|---|---|
| INT-0001 | C1 | Gate 1 | Human-Verify | PENDING | `c1-gate1-baseline-20260611` | 2026-06-11 | Approve REQ-0001…0018 baseline |
| INT-0002 | C1 | — | Agent-Resume | **ACTIVE** | `ui-resume-20260612` | 2026-06-11 | BL-0006 UI polish — see STATE.md |

## Resume INT-0002 (BL-0006 — active)

Agile V Infinity Loop **ACTIVE**. All 24 skills registered.

1. `git pull` · confirm HEAD `f660eb9`+
2. Read `.agile-v/STATE.md` § Tomorrow
3. Fix unstaged `"job track"` typos if still present
4. Start with manual QA → auth shell parity → BL-0001 dashboard navbar
5. Mark INT-0002 `RESOLVED` when next UI slice committed

## Resume INT-0001 (Gate 1)

Human approves `.agile-v/REQUIREMENTS.md` → APPROVALS.md → Stage 2 Validation
