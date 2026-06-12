# Product Backlog — Jobify

<!-- BL-XXXX → REQ-XXXX | Maintained by agile-v-product-owner -->

## BL-0005: Landing + Auth Marketing UI ✅ (partial)

**Type:** Feature · **Priority:** HIGH · **REQ:** REQ-0013, REQ-0001  
**Shipped:** `f660eb9` — carousel, nav, stagger, custom SignUpForm  
**Status:** `DONE` (QA + polish deferred)  
**Remaining:** mobile nav links, auth page shell parity, manual QA pass

---

## BL-0006: UI Polish — Next Session

**Type:** Enhancement · **Priority:** HIGH · **REQ:** REQ-0013, REQ-0012  
**Story:** Polish landing/auth UI from manual QA; align dashboard chrome.  
**Acceptance:** 1) Mobile landing QA 2) Sign-in/up layout parity 3) Revert `job track` typos 4) Dashboard navbar consistency  
**Effort:** S · **Status:** **Next up** · **resume_token:** `ui-resume-20260612`

---

## BL-0001: Clerk Auth UI Enhancements (dashboard)

**Type:** Enhancement · **Priority:** MEDIUM · **REQ:** REQ-0019  
**Story:** Flicker-free auth in **dashboard** `Navbar.tsx` (not landing nav).  
**Acceptance:** 1) No hydration mismatch 2) No login button flash 3) Skeleton during OAuth return  
**Effort:** M · **Status:** Backlog (after BL-0006)

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

**Next Sprint (UI):** BL-0006 → BL-0001 → BL-0003 → BL-0002 → BL-0004
