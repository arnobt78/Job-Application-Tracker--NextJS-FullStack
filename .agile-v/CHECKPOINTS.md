# Checkpoints — Durable HITL Interrupts

| INT-ID | Cycle | Gate | Type | Status | resume_token | Created | Scope |
|---|---|---|---|---|---|---|---|
| INT-0001 | C1 | Gate 1 | Human-Verify | PENDING | `c1-gate1-baseline-20260611` | 2026-06-11 | Approve REQ-0001…0018 baseline |
| INT-0002 | C1 | — | Agent-Resume | RESOLVED | `ui-resume-20260612` | 2026-06-11 | BL-0006 UI polish — shipped `07fcd0e`…`be950be` |
| INT-0003 | C1 | — | Dev-Active | **ACTIVE** | `c1-dev-20260612` | 2026-06-12 | Continue C1 from `be950be`; user-driven features |

## Resume INT-0003 (active — every session)

1. READ `.agile-v/STATE.md` + this file
2. LOAD `agile-v-core` → map task to `REQ-XXXX`
3. Git HEAD `be950be`+ · working tree clean
4. SCOPE-V + `build-agent-js` · log TRACE + DECISION
5. Resolve INT-0003 when user closes UI track or opens C2

## Resume INT-0001 (Gate 1)

Human approves `.agile-v/REQUIREMENTS.md` → `APPROVALS.md` → Stage 2 Validation
