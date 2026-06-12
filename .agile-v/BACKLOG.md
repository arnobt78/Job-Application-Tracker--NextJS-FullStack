# Product Backlog — Jobify

<!-- BL-XXXX → REQ-XXXX | Maintained by agile-v-product-owner -->

## BL-0007: User-Driven Extension (active — resume tomorrow)

**REQ:** REQ-0001, REQ-0013, REQ-0014, REQ-0003 · **token:** `c1-dev-20260612`  
**Status:** **ACTIVE** @ `4efaf37` — major slices shipped; await user QA / next reqs

### Done this track
- Sign-in test-account preview + inline select row (`TestAccountSelectRow`)
- Sonner notifications (CRUD + welcome/goodbye); Radix toast removed
- Auth toast route-gated; localStorage; no double logout redirect
- Instant shell: `void prefetchQuery`, no `loading.tsx`, data-slot skeletons
- Stats: headings in `page.tsx`; dashboard: `JobsCount`/`JobsGrid`/`JobsPagination`
- Prisma cleanup shipped (`998d3a5`)

### Next when resuming
- Manual QA (auth flows, nav perceived speed)
- Map any new user request → REQ-XXXX before build

---

## BL-0002: Prisma Schema Cleanup ✅

**REQ:** REQ-0020 · **Shipped:** `998d3a5` · **Status:** DONE

---

## BL-0005: Landing + Auth Marketing UI ✅

**REQ:** REQ-0013, REQ-0023 · **Shipped:** `f660eb9` · **Status:** DONE

---

## BL-0006: UI Polish (NavShell / Auth / Dashboard) ✅

**REQ:** REQ-0012, REQ-0013, REQ-0019, REQ-0023 · **Shipped:** `07fcd0e`…`be950be` · **Status:** DONE

---

## BL-0001: Clerk Auth Flicker-Free (dashboard)

**REQ:** REQ-0019 · **Status:** Backlog (navbar avatar brief robohash flash = expected Clerk hydration)

---

## BL-0003: Automated Test Suite

**REQ:** REQ-0021 · **Status:** Backlog (20 vitest tests; E2E Playwright pending)

---

## BL-0004: Observability

**REQ:** REQ-0022 · **Status:** Backlog (Sentry integrated; PostHog deferred)

---

## Sprint Plan

| Priority | BL | Status |
|---|---|---|
| 1 | BL-0007 | ACTIVE — resume @ `4efaf37` |
| 2 | BL-0003 | Backlog (E2E) |
| 3 | Gate 1 approval | PENDING |
| 4 | BL-0004 | Backlog |
