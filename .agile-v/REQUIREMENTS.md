# Requirements — Jobify C1

<!-- Revision: C1 | Baseline: Retroactive capture from existing codebase -->

## Document Control

| Field    | Value                                            |
| -------- | ------------------------------------------------ |
| Cycle    | C1                                               |
| Revision | 1.0                                              |
| Author   | Requirement Architect (Bootstrap)                |
| Status   | Draft — Phase 1 ✅ · Phase 2 deploy ⏳ · Phase 3 ✅ · BL-0011 ✅ · Gate 1 pending |

---

## REQ-0001: User Authentication

**Status:** `approved [C1]` (baseline — implemented)  
**Priority:** CRITICAL  
**Category:** Security / Auth

**Description:** Users SHALL authenticate via NextAuth v5 before accessing protected features.

**Acceptance Criteria:**

1. Sign-in at `/sign-in`, sign-up at `/sign-up` (custom UI — no hosted provider chrome)
2. OAuth callback at `/api/auth/callback/google` and `/api/auth/callback/github`
3. User profile accessible at `/profile` (custom — skills, target roles, resume for AI)
4. Unauthenticated users redirected from protected routes

**Verification:** TC-0001, TC-0002  
**Artifacts:** ART-0001 (`proxy.ts`), ART-0002 (`app/sign-in/`), ART-0003 (`app/sign-up/`), ART-0200 (`auth.ts`), ART-0201 (`lib/auth/config.ts`)

---

## REQ-0002: Job CRUD Operations

**Status:** `approved [C1]` (baseline)  
**Priority:** CRITICAL  
**Category:** Core Feature

**Description:** Authenticated users SHALL create, read, update, and delete their own job applications.

**Acceptance Criteria:**

1. Create job at `/add-job` with position, company, location, status, mode
2. List all jobs at `/dashboard` with filters and pagination
3. Edit job at `/dashboard/[id]` (dialog + detail panels)
4. Delete job from edit dialog
5. All operations scoped to authenticated user's `userId` (NextAuth cuid)

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
2. Data user-scoped via `userId` (NextAuth cuid)
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

1. `/add-job`, `/dashboard(.*)`, `/discover`, `/stats`, `/timeline`, `/profile`, `/team` protected
2. Landing page `/` remains public
3. Static assets excluded from proxy matcher
4. Auth gate file SHALL be `proxy.ts` (Next.js 16 convention)

**Verification:** TC-0002  
**Artifacts:** ART-0001 (`proxy.ts`)

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

**Description:** Users SHALL only access jobs where `Job.userId` matches their NextAuth session user ID.

**Acceptance Criteria:**

1. All server actions filter by `userId` (from `auth()` session)
2. Update/delete use compound where `{ id, userId }`
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

**Status:** `approved [C1]` — **enhanced 2026-06-11** (`f660eb9`)  
**Priority:** MEDIUM  
**Category:** Marketing

**Description:** Public landing page SHALL introduce the app and link to auth flow.

**Acceptance Criteria:**

1. Hero at `/` — carousel (main.svg + job-1..4), Get Started + Try Demo CTAs
2. Fixed `LandingNav` (section scroll) + `SiteFooter` (`h-14` chrome)
3. Sections: highlights, features, about — scroll stagger + parallax
4. SSR shell `app/page.tsx` (`force-dynamic`) + client `HomePage`

**Verification:** TC-0019  
**Artifacts:** ART-0022 (`app/page.tsx`), ART-0031 (`components/pages/HomePage.tsx`), ART-0032 (`components/layout/landing-nav.tsx`), ART-0033 (`components/layout/hero-visual-carousel.tsx`)

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

**Description:** Application SHALL deploy to Vercel with env vars for NextAuth and database.

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

1. Scripts: db-inspect, fix-status, fix-future-dates, seed-test-user
2. Runnable via npm scripts

**Verification:** TC-0024  
**Artifacts:** ART-0030 (`scripts/`)

---

## Backlog — Future Cycle (C2+)

| REQ-ID   | Title                                                 | Priority | Status     |
| -------- | ----------------------------------------------------- | -------- | ---------- |
| REQ-0019 | Auth UI flicker-free enhancements (dashboard Navbar)  | MEDIUM   | `done [C1]` `37f8525` |
| REQ-0023 | Custom auth cards (SignIn/SignUp match, no Clerk UI)  | MEDIUM   | `done [C1]` `f660eb9` |
| REQ-0020 | Prisma schema cleanup (remove unused Task/Tour/Token) | LOW      | `done [C1]` `998d3a5` |
| REQ-0021 | Automated test suite (unit + e2e)                     | HIGH     | `new [C2]` |
| REQ-0022 | Observability (logging, error tracking)               | MEDIUM   | `new [C2]` |
| REQ-0027 | AI agent pipeline (Ollama + FastAPI + n8n)            | HIGH     | `scaffolded [C1]` |

---

## REQ-0025: Bluedoor Live Posting Enrichment

**Status:** `approved [C1]` — **implemented 2026-06-19** (`58e8297`+)  
**Priority:** HIGH  
**Category:** Integration / Core Feature

**Description:** Tracked applications SHALL be enriched with live posting data from the Bluedoor Job Postings API when the user provides an apply URL or when a match is found.

**Acceptance Criteria:**

1. Job model stores `applyUrl` and Bluedoor enrichment fields (`bluedoorJobId`, status, salary, workplace, desc hash, sync timestamps)
2. On create/update with `applyUrl`, enrichment runs post-response via `after()` without blocking the user
3. Match priority: ATS key from URL → exact URL → fuzzy company+title
4. Job cards show enrichment badge (LIVE / CLOSED / CHANGED / SALARY / Syncing)
5. Webhook and nightly cron re-sync linked postings; cache invalidation updates UI without refresh

**Verification:** TC-0026 (manual + automated gates)  
**Artifacts:** ART-0067…ART-0076 (see BUILD_MANIFEST.md)

---

## REQ-0026: Job Discovery (Bluedoor Search)

**Status:** `approved [C1]` — **implemented 2026-06-19** (`58e8297`+)  
**Priority:** MEDIUM  
**Category:** Discovery

**Description:** Authenticated users SHALL search live job postings via Bluedoor and add results to their tracker in one action.

**Acceptance Criteria:**

1. `/discover` route with SSR prefetch, URL-driven filters (q, country, workplace, employment, salary)
2. Results from `searchBluedoorJobsAction`; discover queries NOT persisted to localStorage
3. "Track Application" uses `useCreateJobMutation` for instant dashboard invalidation
4. Posting Activity tab on `/dashboard/[id]` via `getBluedoorJobEventsAction` when `bluedoorJobId` set
5. Discover nav link in dashboard; route protected by NextAuth middleware

**Verification:** TC-0027  
**Artifacts:** ART-0077…ART-0081

---

## REQ-0027: AI Agent Pipeline (Phase 2 — Scaffolded)

**Status:** `implemented [C1]` — code in repo @ `59060a0`; VPS deploy pending  
**Priority:** HIGH  
**Category:** AI / Automation

**Description:** Phase 2 SHALL provide human-in-the-loop AI workflows (fit analysis, cover letter draft, interview prep, digests) via a 9-agent FastAPI pipeline on Coolify with Ollama primary and cloud LLM fallback.

**Acceptance Criteria (shipped):**

1. `python-ai-service/` FastAPI 9-agent pipeline + LLM router
2. `POST /api/ai/pipeline` + `/stream` NextAuth proxy
3. `JobAIInsight` + `UserProfile` DB persist · `/profile` UI
4. `useStreamPipeline` + `PipelineProgress` · internal API for n8n
5. n8n JSON templates in `docs/n8n/`

**Acceptance Criteria (remaining):**

1. Coolify deploy + Ollama models on VPS
2. n8n instance + import flows
3. ARQ async queue (BL-0011 WIP)

**Verification:** TC-0028 (Phase 2)  
**Artifacts:** ART-0090…ART-0096 (see BUILD_MANIFEST.md)

---

## REQ-0028: Stats Analytics Overhaul

**Status:** `approved [C1]` — **implemented 2026-06-27**  
**Priority:** HIGH  
**Category:** Analytics

**Description:** Users SHALL view expanded analytics on `/stats` including KPIs, multiple chart types, and weekly velocity.

**Acceptance Criteria:**

1. KPI row: response rate, interview rate, top job type (`stats-kpi-row.tsx`)
2. Monthly application trend with projection (`application-trend-chart.tsx`)
3. Weekly velocity chart — 12 weeks (`weekly-velocity-chart.tsx` + `getCachedWeeklyCharts`)
4. Status distribution donut + mode distribution bars
5. SSR prefetch for stats + charts + chartsWeekly on `/stats/page.tsx`
6. `chartsWeekly` included in `invalidateAllJobQueries` and persist allowlist

**Verification:** TC-0029  
**Artifacts:** ART-0088 (`components/stats/*`), ART-0089 (`getCachedWeeklyCharts` in `lib/jobs/queries.ts`)

---

## REQ-0029: Real-Time Notification Center

**Status:** `approved [C1]` — **implemented 2026-06-27**  
**Priority:** HIGH  
**Category:** Integration / UX

**Description:** Users SHALL receive in-app and email notifications when enriched job postings change status, description, or salary.

**Acceptance Criteria:**

1. SSE event bus (`lib/jobs-events.ts`) multiplexes `invalidate` + `notify` on `/api/jobs/events`
2. `NotificationsProvider` + `NotificationBell` in dashboard nav (max 50, read/unread)
3. Cross-tab relay via BroadcastChannel `jobify-notifications` (`useJobsCacheSync`)
4. `publishNotification` + `sendPostingChangeEmail` wired in `resyncJob` (`enrich.ts`)
5. Resend email graceful no-op when `RESEND_API_KEY` absent

**Verification:** TC-0030  
**Artifacts:** ART-0082…ART-0087 (see BUILD_MANIFEST.md)

---

## REQ-0024: Agile V Session Governance and Traceability

**Status:** `approved [C1]` (process governance)  
**Priority:** HIGH  
**Category:** Process / Quality

**Description:** The project workflow SHALL keep `.agile-v/` active for every development prompt with traceable REQ mapping, lifecycle continuity, and write-through evidence logs.

**Acceptance Criteria:**

1. Every session starts by reading `STATE.md` + `CHECKPOINTS.md` before implementation
2. User requests are mapped to one or more `REQ-XXXX` IDs (or a new REQ is added before work)
3. `TRACE_LOG.md` and `DECISION_LOG.md` are append-only and updated in-session for significant work
4. `STATE.md`, `VALIDATION_SUMMARY.md`, and `SKILLS_REGISTRY.md` stay in sync with current cycle and active checkpoint

**Verification:** TC-0025 (process audit)  
**Artifacts:** ART-0062 (`.agile-v/STATE.md`), ART-0063 (`.agile-v/SKILLS_REGISTRY.md`), ART-0064 (`.agile-v/TRACE_LOG.md`), ART-0065 (`.agile-v/DECISION_LOG.md`), ART-0066 (`.agile-v/PLAYBOOK.md`)

---

## REQ-0031: Phase 3 Partial Features

**Status:** `implemented [C1]` @ `59060a0`  
**Priority:** MEDIUM  
**Category:** Analytics / UX / AI

**Description:** Users SHALL access fit score on cards, resume PDF upload, keyword skill gap, and salary intelligence.

**Acceptance Criteria:**

1. `AIFitChip` on `JobCard` via `getCachedJobs` aiInsight include
2. PDF resume parser (`lib/pdf/extract-text.ts`) + `ResumeUpload` on `/profile`
3. `SkillGapTab` keyword analysis in `JobDetailPanels`
4. `SalaryIntelligence` on `/stats` with SSR prefetch + CRUD invalidation
5. react-markdown in `AiInsightsPanel` · Framer Motion on enrichment badge

**Verification:** EVAL-0014  
**Artifacts:** ART-0100…ART-0108 (BUILD_MANIFEST)

---

## REQ-0033: Phase 3 Advanced (Extension · Team · Automation)

**Status:** `done [C1]` — BL-0011 committed @ 2026-06-29  
**Priority:** MEDIUM  
**Category:** Integration / Collaboration

**Description:** Users SHALL track jobs via browser extension, collaborate in teams, receive auto-apply email parsing, and run batch/queued AI analysis.

**Acceptance Criteria (target):**

1. Chrome extension (`browser-extension/`) + `POST /api/extension/track`
2. Team model + shared jobs (`Team`, `TeamMember`, `Job.teamId`)
3. Inbound email address per user + parse application confirmations
4. ARQ task queue in FastAPI + batch AI endpoint
5. LLM-enhanced skill gap (optional upgrade from keyword)

**Verification:** EVAL-0015 PASS · EVAL-0017 PASS  
**Artifacts:** ART-0110+ (BUILD_MANIFEST)

---

## Traceability Matrix Reference

See ATM.md for full REQ → ART → TC mapping.
