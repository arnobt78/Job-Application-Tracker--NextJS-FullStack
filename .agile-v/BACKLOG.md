# Product Backlog — Jobify

<!-- BL-XXXX → REQ-XXXX | Maintained by agile-v-product-owner -->

## BL-0008: Phase 1 — Bluedoor Enrichment + Discover (ready to commit)

**REQ:** REQ-0025, REQ-0026, REQ-0002, REQ-0003, REQ-0015 · **token:** `c1-dev-20260612`  
**Status:** **COMPLETE** (uncommitted · pre-commit audit PASS 2026-06-27) · Bluedoor API free tier

### Shipped (2026-06-19 → 2026-06-27)
- Prisma: `applyUrl` + 11 Bluedoor enrichment fields + index on `bluedoorJobId`
- `lib/bluedoor/` — client, types, enrich (ATS key / URL / fuzzy match); resyncJob detects status/desc/salary changes
- `utils/actions.ts` — `after()` enrich on create/update; `enrichJobAction`; `searchBluedoorJobsAction`; `getBluedoorJobDetailsAction`
- `JobEnrichmentBadge` + `JobCard` apply link; forms: optional `applyUrl`
- `/discover` — SSR `prefetchInfiniteQuery`, cursor pagination (`useInfiniteQuery`), Details modal, Track Application
- `POST /api/bluedoor/webhook` · `GET /api/cron/enrich` · `vercel.json` cron 03:00 UTC
- Nav: Discover link · `proxy.ts` protects `/discover`
- **SSE notification bus** — `lib/jobs-events.ts` (invalidate + notify union); `/api/jobs/events` multiplexes both
- **Notification bell** — `NotificationsProvider` + BroadcastChannel relay + `NotificationBell` in nav
- **Resend email** — `lib/notifications/email.ts`; graceful no-op; lazy import
- **publishNotification fix** — `enrich.ts` now fires SSE bell + email on posting change
- Docs: `PROJECT_PLAN.md`, `CLAUDE.md`, `PROJECT_WALKTHROUGH.md`, `.env.example` updated

### Next
- Git commit Phase 1+2
- Manual QA: add job with Lever/Greenhouse URL → badge; discover search → track; bell fires; AI panel
- Gate 1 approval

---

## BL-0009: Phase 2 — Python AI Service (scaffolded)

**REQ:** REQ-0027 · **Status:** SCAFFOLDED — needs deploy + real LLM keys  
**Scope:** `python-ai-service/` FastAPI · 9-agent pipeline · Ollama/Groq/OpenRouter/Anthropic fallback  
**Next:** Deploy on Coolify VPS · wire `AiInsightsPanel` into `/dashboard/[id]` page  
**Ref:** `docs/PROJECT_PLAN.md`

---

## BL-0007: User-Driven Extension ✅ (superseded)

**REQ:** REQ-0014, REQ-0015, REQ-0019 · Cache/SSR track shipped @ `280e284` · **DONE**

---

## BL-0001: Clerk Auth Flicker-Free (dashboard) ✅

**REQ:** REQ-0019 · **Shipped:** `37f8525` · **DONE**

---

## BL-0002: Prisma Schema Cleanup ✅

**REQ:** REQ-0020 · **Shipped:** `998d3a5` · **DONE**

---

## BL-0005: Landing + Auth Marketing UI ✅

**REQ:** REQ-0013, REQ-0023 · **Shipped:** `f660eb9` · **DONE**

---

## BL-0006: UI Polish ✅

**REQ:** REQ-0012, REQ-0013, REQ-0019, REQ-0023 · **DONE**

---

## BL-0003: Automated Test Suite

**REQ:** REQ-0021 · Backlog (49 vitest; E2E Playwright pending; add Bluedoor unit tests)

---

## BL-0004: Observability

**REQ:** REQ-0022 · Backlog (Sentry integrated; PostHog deferred)

---

## Sprint Plan

| Priority | BL | Status |
|---|---|---|
| 1 | BL-0008 | IMPLEMENTED — commit + QA |
| 2 | BL-0009 | PLANNED (Phase 2) |
| 3 | BL-0003 | Backlog (E2E) |
| 4 | Gate 1 approval | PENDING |
| 5 | BL-0004 | Backlog |
