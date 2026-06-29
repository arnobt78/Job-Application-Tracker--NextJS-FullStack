# Product Backlog — Jobify

<!-- BL-XXXX → REQ-XXXX | Maintained by agile-v-product-owner -->

## BL-0011: Phase 3 Advanced — WIP ⚠️

**REQ:** REQ-0033 · **Status:** IN_PROGRESS (uncommitted · typecheck FAIL)  
**Scope:** Extension · team mode · auto-apply email · ARQ batch · LLM skill gap

| Item | Status |
|---|---|
| `browser-extension/` | WIP files |
| Team Prisma models + `components/team/` | WIP schema |
| `inboundEmailAddress` + email inbound | WIP type errors |
| `python-ai-service/app/tasks/` ARQ | WIP scaffold |
| `app/api/extension/` + `app/api/ai/batch/` | WIP untracked |
| LLM skill gap in `skill-gap-tab.tsx` | WIP type mismatch |

**Next:** fix types → prisma generate → gates → commit as single BL-0011

---

## BL-0010: Phase 1 Gaps ✅

**REQ:** REQ-0025, REQ-0026, REQ-0029 · **Status:** **DONE** @ `59060a0`+

---

## BL-0009: Phase 2 Deploy

**REQ:** REQ-0027 · **Status:** CODE ~90% — Coolify/Ollama/n8n **not deployed**

---

## BL-0008: Phase 1 Core ✅

**REQ:** REQ-0025…0029 · **Status:** COMMITTED

---

## BL-0003: Test Suite

**REQ:** REQ-0021 · Vitest **51** ✓ · Playwright scaffold · E2E CI pending

---

## BL-0004: Observability

**REQ:** REQ-0022 · Sentry ✓ · PostHog optional ✓

---

## Sprint Plan

| Priority | BL | Status |
|---|---|---|
| 1 | **BL-0011** | **WIP** — finish + verify before commit |
| 2 | BL-0009 | Deploy FastAPI + Ollama + n8n |
| 3 | Gate 1 (INT-0001) | PENDING human approval |
| 4 | BL-0003 | E2E CI wiring |
