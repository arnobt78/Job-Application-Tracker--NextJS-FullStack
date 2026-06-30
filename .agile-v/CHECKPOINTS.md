# Checkpoints — Durable HITL Interrupts

| INT-ID | Cycle | Gate | Type | Status | resume_token | Created | Scope |
|---|---|---|---|---|---|---|---|
| INT-0001 | C1 | Gate 1 | Human-Verify | PENDING | `c1-gate1-baseline-20260611` | 2026-06-11 | Approve REQ-0001…0033 baseline |
| INT-0002 | C1 | — | Agent-Resume | RESOLVED | `ui-resume-20260612` | 2026-06-11 | BL-0006 UI polish — shipped |
| INT-0003 | C1 | — | Dev-Active | **ACTIVE** | `c1-dev-20260612` | 2026-06-12 | C1 synthesis; **BL-0009 VPS deploy** |

## Resume INT-0003 (active — every session)

1. READ `.agile-v/STATE.md` + `CLAUDE.md` + `docs/PROJECT_PLAN.md` + `BACKLOG.md`
2. Git: clean HEAD `3551f1e` · branch `main`
3. Verify: `npm run lint && npm run typecheck && npm test && npm run build` (51 tests)
4. MAP tasks → REQ-XXXX · SCOPE-V · log TRACE + DECISION
5. **Current focus:** BL-0009 — Coolify `jobify-ai-backend` env + deploy + `/health` → ARQ worker → Ollama
6. **Done:** BL-0011 committed · Discover SSR fix · `jobify-redis` ✅

## Resume INT-0001 (Gate 1)

Human approves `.agile-v/REQUIREMENTS.md` → reply **`Approve Gate 1`** → `APPROVALS.md` → Stage 2 Validation
