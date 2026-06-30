# Build Manifest — Cycle C1

<!-- ART-XXXX.N suffix on revision | Maps requirements to code artifacts -->

| ART-ID | Cycle | Type | Path | REQ-IDs | Status |
|---|---|---|---|---|---|
| ART-0001 | C1 | Proxy | `proxy.ts` | REQ-0001, REQ-0009 | Next.js 16 (was `middleware.ts` until 2026-06-29) |
| ART-0002 | C1 | Page | `app/sign-in/[[...sign-in]]/page.tsx` | REQ-0001 | Baseline |
| ART-0003 | C1 | Page | `app/sign-up/[[...sign-up]]/page.tsx` | REQ-0001 | Baseline |
| ART-0004 | C1 | Server Actions | `utils/actions.ts` | REQ-0002, REQ-0003, REQ-0004, REQ-0011, REQ-0005, REQ-0006, REQ-0007 | Baseline |
| ART-0005 | C1 | Component | `components/CreateJobForm.tsx` | REQ-0002, REQ-0010 | Baseline |
| ART-0006 | C1 | Component | `components/EditJobForm.tsx` | REQ-0002, REQ-0010 | Baseline |
| ART-0007 | C1 | Schema | `prisma/schema.prisma` | REQ-0002, REQ-0016 | Baseline |
| ART-0008 | C1 | Component | `components/jobs/jobs-filter-bar.tsx` | REQ-0003 | C1 extension |
| ART-0009 | C1 | Component | `components/jobs/*`, `hooks/useJobsListQuery.ts` | REQ-0003, REQ-0015 | `4efaf37` (replaces JobsList) |
| ART-0010 | C1 | Component | `components/ComplexButtonContainer.tsx` | REQ-0004 | Baseline |
| ART-0011 | C1 | Component | `components/StatsContainer.tsx` | REQ-0005 | Baseline |
| ART-0012 | C1 | Component | `components/StatsCard.tsx` | REQ-0005 | Baseline |
| ART-0013 | C1 | Component | `components/ChartsContainer.tsx` | REQ-0006 | Baseline |
| ART-0014 | C1 | Component | `components/DownloadDropdown.tsx` | REQ-0007 | Baseline |
| ART-0015 | C1 | Function | `getAllJobsForDownloadAction` in `utils/actions.ts` | REQ-0007 | Baseline |
| ART-0016 | C1 | Component | `components/ThemeToggle.tsx` | REQ-0008 | Baseline |
| ART-0017 | C1 | Provider | `components/theme-provider.tsx` | REQ-0008 | Baseline |
| ART-0018 | C1 | Types | `utils/types.ts` | REQ-0010 | Baseline |
| ART-0019 | C1 | Component | `components/Sidebar.tsx` | REQ-0012 | Baseline |
| ART-0020 | C1 | Component | `components/Navbar.tsx` | REQ-0012 | Baseline |
| ART-0021 | C1 | Layout | `app/(dashboard)/layout.tsx` | REQ-0012 | Baseline |
| ART-0022 | C1 | Page | `app/page.tsx` | REQ-0013 | Baseline |
| ART-0023 | C1 | Loading | — | REQ-0014 | **REMOVED** — instant shell; no loading.tsx |
| ART-0024 | C1 | UI | `components/ui/skeleton.tsx` | REQ-0014 | Baseline |
| ART-0025 | C1 | UI | `components/ui/sonner.tsx`, `lib/notifications/*` | REQ-0014 | `8ac2e6d` (Sonner; Radix toast deleted) |
| ART-0026 | C1 | Provider | `app/providers.tsx` | REQ-0015 | Baseline |
| ART-0027 | C1 | DB Client | `utils/db.ts` | REQ-0016 | Baseline |
| ART-0028 | C1 | Config | `package.json` | REQ-0017 | Baseline |
| ART-0029 | C1 | Docs | `README.md` | REQ-0017 | Baseline |
| ART-0030 | C1 | Scripts | `scripts/*.ts`, `prisma/seed.ts` | REQ-0018 | Baseline |
| ART-0031 | C1 | Page Shell | `components/pages/HomePage.tsx` | REQ-0013 | `f660eb9` |
| ART-0032 | C1 | Layout | `components/layout/landing-nav.tsx` | REQ-0013 | `f660eb9` |
| ART-0033 | C1 | Layout | `components/layout/hero-visual-carousel.tsx` | REQ-0013 | `f660eb9` |
| ART-0034 | C1 | Component | `components/SignUpForm.tsx` | REQ-0001, REQ-0023 | `f660eb9` |
| ART-0035 | C1 | Component | `components/SignInForm.tsx` | REQ-0001, REQ-0023 | Baseline+ |
| ART-0036 | C1 | Hook | `hooks/useSignUpForm.ts` | REQ-0023 | `f660eb9` |
| ART-0037 | C1 | Auth UI | `components/auth/AuthOAuthButtons.tsx` | REQ-0023 | `f660eb9` |
| ART-0038 | C1 | UI | `components/ui/scroll-stagger.tsx` | REQ-0013 | `f660eb9` |
| ART-0039 | C1 | UI | `lib/ui/landing-chrome.ts` | REQ-0013 | `f660eb9` |
| ART-0040 | C1 | Observability | `lib/sentry/config.ts`, `app/api/monitoring/` | REQ-0022 | Prior commit |
| ART-0041 | C1 | Layout | `components/layout/nav-shell.tsx` | REQ-0012 | `07fcd0e` |
| ART-0042 | C1 | Layout | `components/layout/dashboard-nav.tsx` | REQ-0012, REQ-0019 | `07fcd0e` |
| ART-0043 | C1 | Layout | `components/layout/auth-nav.tsx` | REQ-0001, REQ-0023 | `07fcd0e` |
| ART-0044 | C1 | Page | `app/(dashboard)/dashboard/page.tsx` | REQ-0012 | `4efaf37` |
| ART-0045 | C1 | Auth UI | `SignInPageShell`, `AuthSignInLeadingPanel` | REQ-0001 | `8ac2e6d` |
| ART-0046 | C1 | Auth UI | `TestAccountSelectRow`, `test-credentials imageUrl` | REQ-0001 | `cc72b0b` |
| ART-0047 | C1 | Notifications | `auth-toast-listener.tsx`, `auth-toast-storage.ts` | REQ-0014 | `cc72b0b` |
| ART-0048 | C1 | Notifications | `lib/notifications/app-toast.ts` | REQ-0014 | `8ac2e6d` |
| ART-0049 | C1 | Page | `app/(dashboard)/stats/page.tsx` (instant shell) | REQ-0014, REQ-0005 | `cc72b0b` |
| ART-0050 | C1 | Component | `StatsCard isLoading`, `ChartsContainer` body-only | REQ-0014 | `cc72b0b` |
| ART-0051 | C1 | Hook | `hooks/useJobsListQuery.ts` | REQ-0003 | `4efaf37` |
| ART-0052 | C1 | Component | `components/jobs/jobs-count.tsx` | REQ-0003 | `4efaf37` |
| ART-0053 | C1 | Component | `components/jobs/jobs-grid.tsx` | REQ-0003 | `4efaf37` |
| ART-0054 | C1 | Component | `components/jobs/jobs-pagination.tsx` | REQ-0003 | `4efaf37` |
| ART-0055 | C1 | UI | `glass-dropdown-menu`, `glass-search-input`, `glass-alert-dialog`, `alert-dialog` | REQ-0013, REQ-0014 | `fd6f20c` |
| ART-0056 | C1 | Component | `components/jobs/jobs-filter-bar.tsx`, `hooks/useJobsListParams.ts` | REQ-0003 | `fd6f20c` |
| ART-0057 | C1 | Hook | `hooks/useJobFilterOptions.ts`, `hooks/useDebouncedCallback.ts` | REQ-0003 | `fd6f20c` |
| ART-0058 | C1 | Server | `getCachedJobFilterOptions` in `lib/jobs/queries.ts` | REQ-0003 | `fd6f20c` |
| ART-0059 | C1 | Lib | `lib/jobs/filter-types.ts`, `filter-config.ts`, `filter-params.ts`, `month-utc.ts`, `lib/ui/format-label.ts` | REQ-0003 | `fd6f20c` |
| ART-0060 | C1 | Component | `DeleteJobButton`, `edit-job-dialog` confirm flows | REQ-0014 | `fd6f20c` |
| ART-0061 | C1 | Component | `ThemeToggle`, `SignInForm` glass dropdowns | REQ-0013, REQ-0023 | `fd6f20c` |
| ART-0062 | C1 | Process State | `.agile-v/STATE.md` | REQ-0024 | Governance sync `1615de6` |
| ART-0063 | C1 | Skills Registry | `.agile-v/SKILLS_REGISTRY.md` | REQ-0024 | Governance sync `1615de6` |
| ART-0064 | C1 | Trace Log | `.agile-v/TRACE_LOG.md` | REQ-0024 | Governance sync `1615de6` |
| ART-0065 | C1 | Decision Log | `.agile-v/DECISION_LOG.md` | REQ-0024 | Governance sync `1615de6` |
| ART-0066 | C1 | Playbook | `.agile-v/PLAYBOOK.md` | REQ-0024 | One-command operating guide |
| ART-0067 | C1 | Schema | `prisma/schema.prisma` (Bluedoor fields) | REQ-0025 | Phase 1 `2026-06-19` |
| ART-0068 | C1 | Lib | `lib/bluedoor/client.ts` | REQ-0025, REQ-0026 | Phase 1 |
| ART-0069 | C1 | Lib | `lib/bluedoor/enrich.ts` | REQ-0025 | Phase 1 |
| ART-0070 | C1 | Lib | `lib/bluedoor/types.ts` | REQ-0025, REQ-0026 | Phase 1 |
| ART-0071 | C1 | Server Actions | `utils/actions.ts` (enrich, discover) | REQ-0025, REQ-0026 | Phase 1 |
| ART-0072 | C1 | Component | `components/jobs/job-enrichment-badge.tsx` | REQ-0025 | Phase 1 |
| ART-0073 | C1 | API | `app/api/bluedoor/webhook/route.ts` | REQ-0025 | Phase 1 |
| ART-0074 | C1 | API | `app/api/cron/enrich/route.ts` | REQ-0025 | Phase 1 |
| ART-0075 | C1 | Config | `vercel.json` (cron schedule) | REQ-0025 | Phase 1 |
| ART-0076 | C1 | Component | `components/JobCard.tsx`, forms `applyUrl` | REQ-0025 | Phase 1 |
| ART-0077 | C1 | Page | `app/(dashboard)/discover/page.tsx` | REQ-0026 | Phase 1 |
| ART-0078 | C1 | Loading | `app/(dashboard)/discover/loading.tsx` | REQ-0026 | Phase 1 |
| ART-0079 | C1 | Component | `components/discover/*` | REQ-0026 | Phase 1 |
| ART-0080 | C1 | Nav | `components/layout/dashboard-nav.tsx` (Discover) | REQ-0026 | Phase 1 |
| ART-0081 | C1 | Docs | `docs/PROJECT_PLAN.md`, `JOBIFY_TECH_STACK_ANALYSIS.md` | REQ-0027 | Planning |
| ART-0082 | C1 | Lib | `lib/jobs-events.ts` | REQ-0029 | Phase 1 |
| ART-0083 | C1 | API | `app/api/jobs/events/route.ts` | REQ-0029 | Phase 1 |
| ART-0084 | C1 | Context | `context/notifications-context.tsx` | REQ-0029 | Phase 1 |
| ART-0085 | C1 | Component | `components/layout/notification-bell.tsx` | REQ-0029 | Phase 1 |
| ART-0086 | C1 | Lib | `lib/notifications/email.ts` | REQ-0029 | Phase 1 |
| ART-0087 | C1 | Hook | `hooks/useJobsCacheSync.ts` (notify relay) | REQ-0029 | Phase 1 |
| ART-0088 | C1 | Component | `components/stats/*` | REQ-0028 | Stats overhaul |
| ART-0089 | C1 | Query | `getCachedWeeklyCharts` in `lib/jobs/queries.ts` | REQ-0028 | Stats overhaul |
| ART-0090 | C1 | Service | `python-ai-service/` | REQ-0027 | Phase 2 scaffold |
| ART-0091 | C1 | API | `app/api/ai/pipeline/route.ts` | REQ-0027 | Phase 2 scaffold |
| ART-0092 | C1 | Lib | `lib/ai/pipeline-client.ts` | REQ-0027 | Phase 2 scaffold |
| ART-0093 | C1 | Hook | `hooks/useAIPipeline.ts` | REQ-0027 | Phase 2 scaffold |
| ART-0094 | C1 | Component | `components/jobs/ai-insights-panel.tsx` | REQ-0027 | Phase 2 scaffold |
| ART-0095 | C1 | Component | `components/jobs/posting-activity-tab.tsx` | REQ-0026 | Phase 1 |
| ART-0096 | C1 | Component | `components/jobs/job-detail-panels.tsx` | REQ-0026, REQ-0027 | Phase 1 |
| ART-0097 | C1 | Component | `components/discover/discover-job-details-modal.tsx` | REQ-0026, REQ-0027 | Phase 1 |
| ART-0098 | C1 | Component | `components/discover/discover-results.tsx` (infinite scroll) | REQ-0026 | Phase 1 |
| ART-0099 | C1 | Docs | `docs/PROJECT_WALKTHROUGH.md`, `README.md` | REQ-0024 | Docs audit |
| ART-0100 | C1 | Component | `components/jobs/ai-fit-chip.tsx` | REQ-0027 | Phase 3 — fit chip on JobCard |
| ART-0101 | C1 | Lib | `lib/jobs/queries.ts` (aiInsight include) | REQ-0027 | fit chip embedded in getCachedJobs |
| ART-0102 | C1 | Types | `utils/types.ts` (aiInsight on JobType, SalaryIntelResult) | REQ-0027, REQ-0028 | Phase 3 types |
| ART-0103 | C1 | Lib | `lib/pdf/extract-text.ts` | REQ-0031 | Phase 3 — resume PDF parser |
| ART-0104 | C1 | Component | `components/user-profile/resume-upload.tsx` | REQ-0031 | drag-drop PDF upload on /profile |
| ART-0105 | C1 | Actions | `utils/actions.ts` (uploadResumeAction) | REQ-0031 | pdfjs-dist server-side extraction |
| ART-0106 | C1 | Lib | `lib/jobs/skill-gap.ts` | REQ-0032 | Phase 3 — keyword-based skill gap |
| ART-0107 | C1 | Actions | `utils/actions.ts` (getSkillGapAction) | REQ-0032 | Bluedoor desc + user profile diff |
| ART-0108 | C1 | Component | `components/jobs/skill-gap-tab.tsx` | REQ-0032 | matched/missing/bonus UI |
| ART-0109 | C1 | Component | `components/jobs/job-detail-panels.tsx` (Skill Gap tab) | REQ-0032 | 3rd tab wired |
| ART-0110 | C1 | Actions | `utils/actions.ts` (getSalaryIntelligenceAction) | REQ-0028 | Phase 3 — salary aggregation |
| ART-0111 | C1 | Component | `components/stats/salary-intelligence.tsx` | REQ-0028 | KPI + role bar chart on /stats |
| ART-0112 | C1 | Page | `app/(dashboard)/stats/page.tsx` (salaryIntel prefetch) | REQ-0028 | SSR + invalidation on CRUD |
| ART-0113 | C1 | Lib | `lib/invalidate-jobs.ts` (salaryIntel added) | REQ-0028 | client-side bust on CRUD |
| ART-0114 | C1 | Query | `lib/query-keys.ts` (skillGap, salaryIntel) | REQ-0032, REQ-0028 | new keys |

## Deprecated / removed

- `middleware.ts` — superseded by `proxy.ts` (Next.js 16, 2026-06-29)
- `components/ChartsContainer.tsx` — replaced by `components/stats/application-trend-chart.tsx`

- `components/JobsList.tsx`, `components/Navbar.tsx`, `components/Sidebar.tsx`
- `app/(dashboard)/stats/loading.tsx`, legacy `/jobs` routes
- Radix toast (`toast.tsx`, `use-toast.ts`, `toaster.tsx`)

## Build Commands

```bash
npm run dev          # Development
npm run build        # Production build (includes prisma generate)
npm run lint         # ESLint
npm run db:seed      # Seed database
```

## Synthesis Notes (C1)

Baseline artifacts pre-exist. Future changes enter at Stage 3 (Synthesis) with delta ART revisions (e.g., ART-0004.2).
