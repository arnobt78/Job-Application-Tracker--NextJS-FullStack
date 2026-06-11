# Checkpoints — Durable HITL Interrupts

| INT-ID | Cycle | Gate | Type | Status | resume_token | Created | due_at | Scope |
|---|---|---|---|---|---|---|---|---|
| INT-0001 | C1 | Gate 1 | Human-Verify | PENDING | `c1-gate1-baseline-20260611` | 2026-06-11T10:25:44Z | 2026-06-14T10:25:44Z | Approve REQ-0001…REQ-0018 baseline |

## Resume Instructions

To resume after Gate 1 approval:

1. Human adds row to APPROVALS.md with `resume_token=c1-gate1-baseline-20260611`
2. Agent reads STATE.md + matching APPROVALS entry
3. Update INT-0001 status to `RESOLVED`
4. Advance STATE.md to Stage 2 — Validation

## Human Action Required

Review `.agile-v/REQUIREMENTS.md` and either:
- **Approve:** "Approve Gate 1" (with your name/role)
- **Reject:** Specify CR-0001 in CHANGE_LOG.md with required REQ changes
