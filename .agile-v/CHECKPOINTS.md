# Checkpoints — Durable HITL Interrupts

| INT-ID | Cycle | Gate | Type | Status | resume_token | Created | Scope |
|---|---|---|---|---|---|---|---|
| INT-0001 | C1 | Gate 1 | Human-Verify | PENDING | `c1-gate1-baseline-20260611` | 2026-06-11 | Approve REQ-0001…0033 baseline |
| INT-0002 | C1 | — | Agent-Resume | RESOLVED | `ui-resume-20260612` | 2026-06-11 | BL-0006 UI polish — shipped |
| INT-0003 | C1 | — | Dev-Active | **ACTIVE** | `c1-dev-20260612` | 2026-06-12 | C1 synthesis; await next instruction |

## Resume INT-0003 (active — every session)

1. READ `.agile-v/STATE.md` + `CLAUDE.md` + `PLAYBOOK.md` + `BACKLOG.md`
2. Git: clean HEAD `148a49f` · branch `main`
3. Verify: `npm run lint && npm run typecheck && npm run test && npm run build` (60 tests)
4. MAP tasks → REQ-XXXX · SCOPE-V · log TRACE + DECISION
5. **Current focus:** await user instruction (Gate 1 / E2E / n8n / Hetzner / feature)
6. **Done:** BL-0009 VPS · BL-0011…0014 · UI dialog/filter polish `148a49f`

## Resume INT-0001 (Gate 1)

Human approves `.agile-v/REQUIREMENTS.md` → reply **`Approve Gate 1`** → `APPROVALS.md` → Stage 2 Validation formal close
