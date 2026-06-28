# Product Backlog — Jobify

<!-- BL-XXXX → REQ-XXXX | Maintained by agile-v-product-owner -->

## BL-0010: Phase 1 Remaining Gaps (~8%)

**REQ:** REQ-0025, REQ-0026, REQ-0029 · **Status:** OPEN  
**Scope:** Items documented in `docs/PROJECT_PLAN.md` §1.7

| Priority | Task | Effort |
|---|---|---|
| Medium | Wire `GET /jobs/facets` for live filter counts on `/discover` | 1–2 days |
| Medium | Auto-register Bluedoor webhook subscriptions on successful enrich | 1 day |
| Low | React Email templates for posting alerts + weekly digest | 1–2 days |
| Low | Weekly analytics email cron | 1 day |
| Low | Company logos on discover cards (`logo.dev`) | 0.5 day |

---

## BL-0008: Phase 1 — Bluedoor + Discover + Stats + Notifications ✅

**REQ:** REQ-0025, REQ-0026, REQ-0028, REQ-0029, REQ-0027 (scaffold) · **token:** `c1-dev-20260612`  
**Status:** **COMMITTED** (`58e8297`+) · EVAL-0012 PASS

### Shipped
- Prisma Bluedoor fields · `lib/bluedoor/` · enrichment badges · webhook · cron
- `/discover` — infinite scroll, glass filters, Details modal, Track Application
- SSE notification bus + bell + BroadcastChannel + Resend email
- Stats overhaul — KPI row + 4 charts + weekly velocity + `chartsWeekly` invalidation
- Posting Activity tab — `getJobEvents` + `JobDetailPanels`
- Phase 2 scaffold — `python-ai-service/` + `/api/ai/pipeline` + `AiInsightsPanel`
- `middleware.ts` fix (Clerk gate was not running as `proxy.ts`)
- Docs: `PROJECT_PLAN.md`, `PROJECT_WALKTHROUGH.md`, `JOBIFY_TECH_STACK_ANALYSIS.md`, `README.md`

### Next
- Manual QA: enrich with real ATS URL · discover · bell · AI panel · activity tab
- Gate 1 approval

---

## BL-0009: Phase 2 — Python AI Service (scaffolded)

**REQ:** REQ-0027 · **Status:** SCAFFOLDED — needs deploy + real LLM keys  
**Scope:** Coolify VPS · Ollama models · `JobAIInsight`/`UserProfile` Prisma · n8n · streaming UI  
**Ref:** `docs/PROJECT_PLAN.md` Phase 2

---

## BL-0007: User-Driven Extension ✅

**REQ:** REQ-0014, REQ-0015, REQ-0019 · Cache/SSR track @ `280e284` · **DONE**

---

## BL-0001…0006 ✅

Auth flicker-free · Prisma cleanup · Landing/auth UI · UI polish — all **DONE**

---

## BL-0003: Automated Test Suite

**REQ:** REQ-0021 · 49 Vitest passing; E2E Playwright + Bluedoor unit tests pending

---

## BL-0004: Observability

**REQ:** REQ-0022 · Sentry integrated; PostHog deferred

---

## Sprint Plan

| Priority | BL | Status |
|---|---|---|
| 1 | BL-0010 | OPEN — Phase 1 gaps |
| 2 | BL-0009 | SCAFFOLDED — Phase 2 deploy |
| 3 | Gate 1 approval | PENDING |
| 4 | BL-0003 | Backlog (E2E) |
| 5 | BL-0004 | Backlog |
