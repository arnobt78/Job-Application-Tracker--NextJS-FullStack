# Jobify — Agent Memory

## Product
Job application CRM + Bluedoor enrichment + discover + AI insights (FastAPI). Not a job board.

## Stack
Next.js 16 · React 19 · **NextAuth v5** · Prisma 6 · TanStack Query 5 · PostgreSQL · Redis (opt) · Bluedoor · Resend · Sentry · PostHog (opt) · Vitest **51** · Playwright E2E · FastAPI (`python-ai-service/`)

## Auth
- `middleware.ts` — NextAuth JWT gate; protect `/dashboard`, `/discover`, `/stats`, `/timeline`, `/profile`; `/jobs/*` → `/dashboard`
- `auth.ts` + `lib/auth/config.ts` — Google/GitHub OAuth + credentials; Prisma adapter
- Navbar: `dashboard/layout` `auth()` → `NavUserProvider` · `useNavUserSession`

## Data flow
1. `force-dynamic` · per-page `prefetchQuery` / `prefetchInfiniteQuery` → `dehydrate`
2. `PersistQueryClient` buster `v1` — jobs/stats/charts/charts-weekly/job(id) only — **not** discover/ai/aiInsight/timeline
3. `useQueryBodyLoading` — skeleton cold cache only
4. Reads: `lib/jobs/queries.ts` (`unstable_cache` + tags + Redis)
5. CRUD + AI save: `invalidateUserJobCaches` (server) · `invalidateAllJobQueries` (client + broadcast)
6. Cross-tab: `useJobsCacheSync` + `/api/jobs/events` (invalidate + notify)
7. Optimistic: `stats-optimistic.ts` · `chart-optimistic.ts`

## Bluedoor (Phase 1 ✅)
- `lib/bluedoor/client.ts` · `enrich.ts` · ATS → URL → fuzzy match
- `after()` enrich · webhook subscribe · cron enrich + weekly digest
- Org intel: `getBluedoorOrg` → `companySize`/`companyIndustry`/`companyHq` on Job
- Discover: infinite scroll · facets · `DiscoverSidebar` (lg+) · not persisted
- Notifications: SSE bell + React Email (Resend)

## Phase 2 ~90% · Phase 3 ✅ · BL-0011 ✅ COMMITTED
- FastAPI 9-agent pipeline · LLM: Ollama → Groq → OpenRouter → Haiku
- `POST /api/ai/pipeline` + `/stream` · `useStreamPipeline` · `PipelineProgress`
- `JobAIInsight` + `UserProfile` DB persist · `/profile` UI
- Internal API: `GET /api/internal/jobs?userId=` · `POST /api/internal/notify` · `POST /api/internal/ai-complete` (`X-Internal-Secret`)
- n8n JSON templates in `docs/n8n/` (not deployed)
- **AI fit chip** `components/jobs/ai-fit-chip.tsx` — embedded in `getCachedJobs` include, shown on `JobCard`
- **react-markdown** in `AiInsightsPanel` · **Framer Motion** on `JobEnrichmentBadge`

## Phase 3 ✅ COMPLETE
- **Resume PDF parser**: `lib/pdf/extract-text.ts` (pdfjs-dist) · `uploadResumeAction` · `ResumeUpload` drag-drop on `/profile`
- **Skill Gap**: keyword (`getSkillGapAction`) + LLM AI toggle (`getLLMSkillGapAction` → FastAPI `/skill-gap`) · `SkillGapTab`
- **Salary Intel**: `getSalaryIntelligenceAction` · `SalaryIntelligence` on `/stats` · SSR-prefetched · invalidated on CRUD
- **Team mode**: `/team` route · `getTeamAction/createTeamAction/inviteTeamMemberAction/removeTeamMemberAction` · `TeamDashboard`
- **Browser extension**: `app/api/extension/token|jobs|verify` · `ExtensionConnect` on `/profile` · `browser-extension/` manifest+popup
- **Email inbound**: `app/api/email/inbound` Resend webhook → FastAPI `/parse-email` → job create + SSE · `EmailInboundSetup` on `/profile`
- **ARQ batch AI**: `app/api/ai/batch` → FastAPI `/enqueue` → `run_pipeline_task` → `app/api/internal/ai-complete` → upsert `JobAIInsight` + SSE · `BatchAnalysisTrigger` + `useAIBatch`
- **Interview prep**: `triggerInterviewPrepAction` via `after()` on status→interview · FastAPI `/pipeline/interview-prep` · `interview_prep_ready` SSE notification

## Query keys
`jobs.*` · `stats` · `charts` · `chartsWeekly` · `job(id)` · `discover.*` · `aiInsight.job(id)` · `timeline()` · `userProfile()` · `skillGap(jobId)` · `skillGapAI(jobId)` · `salaryIntel()` · `team.current()` · `team.members(teamId)`

## Routes
`/dashboard` · `/dashboard/[id]` (JobDetailPanels) · `/discover` · `/stats` · `/timeline` · `/profile` · `/team`

## Env
`AUTH_SECRET` · `AUTH_GOOGLE_*` · `AUTH_GITHUB_*` · `DATABASE_URL` · `BLUEDOOR_WEBHOOK_SECRET` · `CRON_SECRET` · `RESEND_API_KEY` · `AI_SERVICE_URL` · `AI_SERVICE_SECRET` · `NEXT_PUBLIC_POSTHOG_KEY` (opt)

## Verify
`npm run lint && npm run typecheck && npm run test && npm run build`

## Do not
`cacheComponents: true` · break SSE/invalidation · skeleton when cache warm · scrape Bluedoor · persist discover/ai · second SSE for notifications

## Docs
`docs/PROJECT_WALKTHROUGH.md` · `docs/PROJECT_PLAN.md` · `docs/JOBIFY_TECH_STACK_ANALYSIS.md` · `.agile-v/STATE.md`
