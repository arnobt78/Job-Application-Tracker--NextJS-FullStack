# Product Backlog — Jobify

<!-- BL-XXXX → REQ-XXXX | Maintained by agile-v-product-owner -->

## BL-0001: Clerk Auth UI Enhancements

**Type:** Enhancement · **Priority:** MEDIUM · **REQ:** REQ-0019  
**Story:** As a user, I want flicker-free auth UI in the navbar, so that login/logout feels smooth.  
**Acceptance:** 1) No hydration mismatch 2) No login button flash 3) Skeleton during OAuth return  
**Effort:** M · **Dependencies:** None · **Status:** Backlog  
**Notes:** docs/AUTH_UI_IMPLEMENTATION_GUIDE.md is NextAuth reference — adapt patterns for Clerk

---

## BL-0002: Prisma Schema Cleanup

**Type:** Technical · **Priority:** LOW · **REQ:** REQ-0020  
**Story:** As a developer, I want unused models removed, so that schema matches Jobify domain.  
**Acceptance:** 1) Task/Tour/Token removed or documented 2) Migration safe 3) Build passes  
**Effort:** S · **Dependencies:** None · **Status:** Backlog

---

## BL-0003: Automated Test Suite

**Type:** Feature · **Priority:** HIGH · **REQ:** REQ-0021  
**Story:** As a developer, I want automated tests, so that regressions are caught in CI.  
**Acceptance:** 1) TC-0001…TC-0024 automated or subset 2) CI runs on PR 3) Red Team signoff  
**Effort:** L · **Dependencies:** None · **Status:** Backlog

---

## BL-0004: Observability Setup

**Type:** Enhancement · **Priority:** MEDIUM · **REQ:** REQ-0022  
**Story:** As an operator, I want error tracking and logs, so that production issues are visible.  
**Acceptance:** 1) Error boundary 2) Structured logging 3) Alert on critical errors  
**Effort:** M · **Dependencies:** BL-0003 recommended · **Status:** Backlog

---

## Sprint Plan (C1 — Bootstrap)

**Goal:** Establish Agile V baseline and obtain Gate 1 approval.

| BL-ID | Story | REQ | Priority | Est | Status |
|---|---|---|---|---|---|
| — | C1 Bootstrap | REQ-0001…0018 | CRITICAL | — | Done |
| — | Gate 1 Approval | — | CRITICAL | — | Pending |

**Next Sprint (C1 continued or C2):** BL-0003 → BL-0001 → BL-0002 → BL-0004
