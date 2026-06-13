# Checkpoints — Durable HITL Interrupts

| INT-ID | Cycle | Gate | Type | Status | resume_token | Created | Scope |
|---|---|---|---|---|---|---|---|
| INT-0001 | C1 | Gate 1 | Human-Verify | PENDING | `c1-gate1-baseline-20260611` | 2026-06-11 | Approve REQ-0001…0018 baseline |
| INT-0002 | C1 | — | Agent-Resume | RESOLVED | `ui-resume-20260612` | 2026-06-11 | BL-0006 UI polish — shipped `be950be` |
| INT-0003 | C1 | — | Dev-Active | **ACTIVE** | `c1-dev-20260612` | 2026-06-12 | C1 user-driven work; resume @ `a4763f4` |

## Resume INT-0003 (active — every session)

1. READ `.agile-v/STATE.md` + this file + `CLAUDE.md`
2. Git: `a4763f4` on `main`
3. Verify: `npm run lint && npm run typecheck && npm test && npm run build` (20 tests)
4. MAP tasks → REQ-XXXX · SCOPE-V · log TRACE + DECISION
5. Architecture: instant shell, no `loading.tsx`, preserve SSE/invalidation

## Resume INT-0001 (Gate 1)

Human approves `.agile-v/REQUIREMENTS.md` → `APPROVALS.md` → Stage 2 Validation
