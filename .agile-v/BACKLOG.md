# Product Backlog — Jobify

<!-- BL-XXXX → REQ-XXXX | Maintained by agile-v-product-owner -->

## BL-0007: User-Driven Extension (active)

**REQ:** REQ-0001, REQ-0013, REQ-0014, REQ-0003, REQ-0015, REQ-0019, REQ-0023 · **token:** `c1-dev-20260612`  
**Status:** **ACTIVE** — cache/SSR track shipped @ `280e284`

### Done this track (2026-06-16 session)
- Dashboard redesign: headers, toolbar, portfolio breakdown, pagination fix (`4914d29`)
- Optimistic portfolio stats + chart bumps (`4914d29`)
- Shell skeletons, keepPreviousData, clear-filter layout (`93cddf6`)
- Filter layout shift fix (reserved clear button width)
- `await prefetchQuery` + `useQueryBodyLoading` + `useJobsListBodyLoading`
- `PersistQueryClient` localStorage persist (`jobify-query-cache`)
- Nav SSR avatar: `currentUser()` + `NavUserProvider` + `useNavUserSession` (`37f8525`)
- Edit job `[id]` await prefetch + dialog shell on cold load
- `invalidateAllJobQueries` incl. `filterOptions`; onSettled choke-point (`66bc670`)
- Docs: `CLAUDE.md`, `PROJECT_WALKTHROUGH.md`

### Next when resuming
- Map new user request → REQ-XXXX before build
- Manual QA: refresh dashboard/stats/[id], CRUD cross-page, filter dropdown, avatar
- Gate 1 baseline approval (INT-0001)
- BL-0003 E2E Playwright (optional)

---

## BL-0001: Clerk Auth Flicker-Free (dashboard) ✅

**REQ:** REQ-0019 · **Shipped:** `37f8525` (nav SSR avatar) · **Status:** DONE

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

## BL-0003: Automated Test Suite

**REQ:** REQ-0021 · **Status:** Backlog (49 vitest tests; E2E Playwright pending)

---

## BL-0004: Observability

**REQ:** REQ-0022 · **Status:** Backlog (Sentry integrated; PostHog deferred)

---

## Sprint Plan

| Priority | BL | Status |
|---|---|---|
| 1 | BL-0007 | ACTIVE — resume @ `280e284` |
| 2 | BL-0003 | Backlog (E2E) |
| 3 | Gate 1 approval | PENDING |
| 4 | BL-0004 | Backlog |
