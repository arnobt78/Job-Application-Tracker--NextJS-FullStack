# Requirements — Jobify C1

<!-- Revision: C1 | Baseline: Retroactive capture from existing codebase -->

## Document Control

| Field | Value |
|---|---|
| Cycle | C1 |
| Revision | 1.0 |
| Author | Requirement Architect (Bootstrap) |
| Status | Draft — awaiting Logic Gatekeeper + Human Gate 1 |

---

## REQ-0001: User Authentication

**Status:** `approved [C1]` (baseline — implemented)  
**Priority:** CRITICAL  
**Category:** Security / Auth

**Description:** Users SHALL authenticate via Clerk before accessing protected features.

**Acceptance Criteria:**
1. Sign-in at `/sign-in`, sign-up at `/sign-up`
2. SSO callback handled at `/sign-in/sso-callback`
3. User profile accessible at `/user-profile`
4. Unauthenticated users redirected from protected routes

**Verification:** TC-0001, TC-0002  
**Artifacts:** ART-0001 (`proxy.ts`), ART-0002 (`app/sign-in/`), ART-0003 (`app/sign-up/`)

---

## REQ-0002: Job CRUD Operations

**Status:** `approved [C1]` (baseline)  
**Priority:** CRITICAL  
**Category:** Core Feature

**Description:** Authenticated users SHALL create, read, update, and delete their own job applications.

**Acceptance Criteria:**
1. Create job at `/add-job` with position, company, location, status, mode
2. List all jobs at `/jobs`
3. Edit job at `/jobs/[id]`
4. Delete job from edit page
5. All operations scoped to authenticated user's `clerkId`

**Verification:** TC-0003…TC-0007  
**Artifacts:** ART-0004 (`utils/actions.ts`), ART-0005 (`CreateJobForm.tsx`), ART-0006 (`EditJobForm.tsx`), ART-0007 (`prisma/schema.prisma` Job model)

---

## REQ-0003: Job Search and Filter

**Status:** `approved [C1]` (baseline)  
**Priority:** HIGH  
**Category:** Core Feature

**Description:** Users SHALL search jobs by position or company and filter by status.

**Acceptance Criteria:**
1. Search input filters by position OR company (case-insensitive)
2. Status filter: all, pending, interview, declined
3. Filters persist in URL search params
4. React Query refetches on param change

**Verification:** TC-0008, TC-0009  
**Artifacts:** ART-0008 (`SearchForm.tsx`), ART-0009 (`JobsList.tsx`)

---

## REQ-0004: Pagination

**Status:** `approved [C1]` (baseline)  
**Priority:** MEDIUM  
**Category:** Core Feature

**Description:** Job list SHALL paginate when results exceed page limit.

**Acceptance Criteria:**
1. Default page size enforced server-side
2. Page number in URL params
3. Pagination controls visible when totalPages > 1

**Verification:** TC-0010  
**Artifacts:** ART-0010 (`ComplexButtonContainer.tsx`), ART-0004

---

## REQ-0005: Statistics Dashboard

**Status:** `approved [C1]` (baseline)  
**Priority:** HIGH  
**Category:** Analytics

**Description:** Users SHALL view counts of jobs by status on `/stats`.

**Acceptance Criteria:**
1. Cards show pending, interview, declined counts
2. Data user-scoped via clerkId
3. Loading skeletons during fetch

**Verification:** TC-0011  
**Artifacts:** ART-0011 (`StatsContainer.tsx`), ART-0012 (`StatsCard.tsx`)

---

## REQ-0006: Application Trends Chart

**Status:** `approved [C1]` (baseline)  
**Priority:** MEDIUM  
**Category:** Analytics

**Description:** Users SHALL see job application trends over the last 6 months.

**Acceptance Criteria:**
1. Area chart on stats page
2. Monthly aggregation via `getChartsDataAction`
3. Responsive chart container

**Verification:** TC-0012  
**Artifacts:** ART-0013 (`ChartsContainer.tsx`)

---

## REQ-0007: Data Export (CSV / Excel)

**Status:** `approved [C1]` (baseline)  
**Priority:** MEDIUM  
**Category:** Export

**Description:** Users SHALL download complete job history as CSV or Excel.

**Acceptance Criteria:**
1. Export includes summary header with counts
2. Monthly grouping with serial numbers
3. CSV and XLSX formats supported

**Verification:** TC-0013, TC-0014  
**Artifacts:** ART-0014 (`DownloadDropdown.tsx`), ART-0015 (`getAllJobsForDownloadAction`)

---

## REQ-0008: Theme Support (Light / Dark / System)

**Status:** `approved [C1]` (baseline)  
**Priority:** LOW  
**Category:** UX

**Description:** Application SHALL support light, dark, and system theme modes.

**Acceptance Criteria:**
1. Theme toggle in navbar
2. next-themes provider wraps app
3. No flash on initial load

**Verification:** TC-0015  
**Artifacts:** ART-0016 (`ThemeToggle.tsx`), ART-0017 (`theme-provider.tsx`)

---

## REQ-0009: Route Protection Middleware

**Status:** `approved [C1]` (baseline)  
**Priority:** CRITICAL  
**Category:** Security

**Description:** Protected routes SHALL be enforced server-side before page render.

**Acceptance Criteria:**
1. `/add-job`, `/jobs(.*)`, `/stats`, `/user-profile(.*)` protected
2. Landing page `/` remains public
3. Static assets excluded from middleware matcher

**Verification:** TC-0002  
**Artifacts:** ART-0001

---

## REQ-0010: Form Validation

**Status:** `approved [C1]` (baseline)  
**Priority:** HIGH  
**Category:** Data Integrity

**Description:** Job forms SHALL validate input client-side and server-side.

**Acceptance Criteria:**
1. Zod schema in `utils/types.ts`
2. React Hook Form integration
3. Min length rules on text fields
4. Enum validation for status and mode

**Verification:** TC-0016  
**Artifacts:** ART-0018 (`utils/types.ts`), ART-0005, ART-0006

---

## REQ-0011: User Data Isolation

**Status:** `approved [C1]` (baseline)  
**Priority:** CRITICAL  
**Category:** Security

**Description:** Users SHALL only access jobs where `Job.clerkId` matches their Clerk user ID.

**Acceptance Criteria:**
1. All server actions filter by clerkId
2. Update/delete use compound where (id + clerkId)
3. Unauthorized access redirects or returns null

**Verification:** TC-0017  
**Artifacts:** ART-0004

---

## REQ-0012: Responsive UI

**Status:** `approved [C1]` (baseline)  
**Priority:** MEDIUM  
**Category:** UX

**Description:** Application SHALL be usable on desktop, tablet, and mobile.

**Acceptance Criteria:**
1. Mobile-first Tailwind layout
2. Dashboard sidebar + navbar responsive
3. Job grid: 2 cols desktop, 1 col mobile

**Verification:** TC-0018 (manual / visual)  
**Artifacts:** ART-0019 (`Sidebar.tsx`), ART-0020 (`Navbar.tsx`), ART-0021 (`app/(dashboard)/layout.tsx`)

---

## REQ-0013: Landing Page

**Status:** `approved [C1]` (baseline)  
**Priority:** MEDIUM  
**Category:** Marketing

**Description:** Public landing page SHALL introduce the app and link to auth flow.

**Acceptance Criteria:**
1. Hero section at `/`
2. CTA to get started / sign in
3. SSR for fast initial load

**Verification:** TC-0019  
**Artifacts:** ART-0022 (`app/page.tsx`)

---

## REQ-0014: Loading States and Feedback

**Status:** `approved [C1]` (baseline)  
**Priority:** MEDIUM  
**Category:** UX

**Description:** Application SHALL show loading indicators and toast notifications.

**Acceptance Criteria:**
1. Route-level loading.tsx for jobs and stats
2. Skeleton components during data fetch
3. Toast on form success/error

**Verification:** TC-0020  
**Artifacts:** ART-0023 (`loading.tsx` files), ART-0024 (`ui/skeleton.tsx`), ART-0025 (`ui/toast.tsx`)

---

## REQ-0015: React Query Data Layer

**Status:** `approved [C1]` (baseline)  
**Priority:** HIGH  
**Category:** Architecture

**Description:** Client data fetching SHALL use TanStack Query with server hydration.

**Acceptance Criteria:**
1. QueryClient provider in app/providers.tsx
2. Server prefetch + HydrationBoundary on jobs page
3. Query keys include search, status, page

**Verification:** TC-0021  
**Artifacts:** ART-0026 (`app/providers.tsx`), ART-0009

---

## REQ-0016: PostgreSQL Persistence via Prisma

**Status:** `approved [C1]` (baseline)  
**Priority:** CRITICAL  
**Category:** Data

**Description:** Job data SHALL persist in PostgreSQL via Prisma ORM.

**Acceptance Criteria:**
1. DATABASE_URL + DIRECT_URL configured
2. Job model migrated
3. Prisma client singleton in utils/db.ts
4. Build runs `prisma generate`

**Verification:** TC-0022  
**Artifacts:** ART-0007, ART-0027 (`utils/db.ts`)

---

## REQ-0017: Production Deployment

**Status:** `approved [C1]` (baseline)  
**Priority:** HIGH  
**Category:** DevOps

**Description:** Application SHALL deploy to Vercel with env vars for Clerk and database.

**Acceptance Criteria:**
1. `npm run build` succeeds
2. Live demo documented in README
3. Env vars documented (no secrets in repo)

**Verification:** TC-0023  
**Artifacts:** ART-0028 (`package.json`), ART-0029 (`README.md`)

---

## REQ-0018: Database Maintenance Scripts

**Status:** `approved [C1]` (baseline)  
**Priority:** LOW  
**Category:** Operations

**Description:** Project SHALL include utility scripts for DB inspection and data fixes.

**Acceptance Criteria:**
1. Scripts: db-inspect, migrate-clerkid, fix-status, fix-future-dates, seed-test-user
2. Runnable via npm scripts

**Verification:** TC-0024  
**Artifacts:** ART-0030 (`scripts/`)

---

## Backlog — Future Cycle (C2+)

| REQ-ID | Title | Priority | Status |
|---|---|---|---|
| REQ-0019 | Auth UI flicker-free enhancements (Clerk navbar) | MEDIUM | `new [C2]` |
| REQ-0020 | Prisma schema cleanup (remove unused Task/Tour/Token) | LOW | `new [C2]` |
| REQ-0021 | Automated test suite (unit + e2e) | HIGH | `new [C2]` |
| REQ-0022 | Observability (logging, error tracking) | MEDIUM | `new [C2]` |

---

## Traceability Matrix Reference

See ATM.md for full REQ → ART → TC mapping.
