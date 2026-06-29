# Product Backlog — Jobify

<!-- BL-XXXX → REQ-XXXX | Maintained by agile-v-product-owner -->

## BL-0011: Phase 3 Advanced (REQ-0033) — WIP

**REQ:** REQ-0033 · **Status:** COMPLETE · **EVAL-0015 PASS (2026-06-29)**  
**Scope:** Browser extension, team mode, email auto-apply, ARQ batch AI, LLM skill gap

| Item | Status |
|---|---|
| Prisma: Team/TeamMember/extensionToken/inboundEmailAddress | ✅ db push done |
| `LLMSkillGapResult` types + `getLLMSkillGapAction` | ✅ coded |
| `skill-gap-tab.tsx` AI mode (keyword/LLM toggle) + typefix | ✅ PASS |
| `browser-extension/` manifest + background/content/popup | ✅ scaffolded |
| `app/api/extension/` token · jobs · verify routes | ✅ coded |
| `components/team/` create · invite · member-list | ✅ coded |
| `components/user-profile/` batch · email · extension-connect | ✅ coded + wired in /profile |
| `hooks/useAIBatch.ts` · `app/api/ai/batch/route.ts` | ✅ coded (+ user_id in user_data) |
| FastAPI routes email/interview/queue/skills + ARQ tasks/ | ✅ scaffolded (+ ai-complete callback) |
| `app/(dashboard)/team/page.tsx` + `components/team/team-dashboard.tsx` | ✅ DONE |
| `app/api/email/inbound/route.ts` | ✅ DONE |
| `app/api/internal/ai-complete/route.ts` | ✅ DONE |
| `triggerInterviewPrepAction` + `publishNotification` on interview status | ✅ DONE |
| `interview_prep_ready` notification type end-to-end | ✅ DONE |
| `/team` in middleware + nav | ✅ DONE |
| lint ✓ typecheck ✓ test 51/51 ✓ build ✓ | ✅ PASS (2026-06-29) |
| Audit: dead code + CSS bug fixes (invite-member-form, triggerInterviewPrepAction) | ✅ DONE 2026-06-29 |
| EVAL-0015 full pass → commit BL-0011 | ✅ COMMITTED 2026-06-29 |

**Status:** COMMITTED — next is BL-0009 (Coolify VPS deploy)

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
