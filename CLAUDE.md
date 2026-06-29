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

## Phase 2 ~90% · Phase 3 partial ✅ · BL-0011 WIP
- FastAPI 9-agent pipeline · LLM: Ollama → Groq → OpenRouter → Haiku
- `POST /api/ai/pipeline` + `/stream` · `useStreamPipeline` · `PipelineProgress`
- `JobAIInsight` + `UserProfile` DB persist · `/profile` UI
- Internal API: `GET /api/internal/jobs?userId=` · `POST /api/internal/notify` (`X-Internal-Secret`)
- n8n JSON templates in `docs/n8n/` (not deployed)
- **AI fit chip** `components/jobs/ai-fit-chip.tsx` — embedded in `getCachedJobs` include, shown on `JobCard`
- **react-markdown** in `AiInsightsPanel` (cover letter + summary) · **Framer Motion** on `JobEnrichmentBadge`

## Phase 3 (partial ✅)
- **Resume PDF parser**: `lib/pdf/extract-text.ts` (pdfjs-dist) · `uploadResumeAction` · `ResumeUpload` drag-drop on `/profile`
- **Skill Gap**: `lib/jobs/skill-gap.ts` `computeSkillGap()` · `getSkillGapAction` · `SkillGapTab` in `JobDetailPanels`
- **Salary Intel**: `getSalaryIntelligenceAction` · `SalaryIntelligence` on `/stats` · SSR-prefetched · invalidated on CRUD

## WIP (BL-0011 — do not commit until gates pass)
- Extension · team mode · email inbound · ARQ batch · LLM skill gap — uncommitted typecheck FAIL

## Query keys
`jobs.*` · `stats` · `charts` · `chartsWeekly` · `job(id)` · `discover.*` · `aiInsight.job(id)` · `timeline()` · `userProfile()` · `skillGap(jobId)` · `salaryIntel()`

## Routes
`/dashboard` · `/dashboard/[id]` (JobDetailPanels) · `/discover` · `/stats` · `/timeline` · `/profile`

## Env
`AUTH_SECRET` · `AUTH_GOOGLE_*` · `AUTH_GITHUB_*` · `DATABASE_URL` · `BLUEDOOR_WEBHOOK_SECRET` · `CRON_SECRET` · `RESEND_API_KEY` · `AI_SERVICE_URL` · `AI_SERVICE_SECRET` · `NEXT_PUBLIC_POSTHOG_KEY` (opt)

## Verify
`npm run lint && npm run typecheck && npm run test && npm run build`

## Do not
`cacheComponents: true` · break SSE/invalidation · skeleton when cache warm · scrape Bluedoor · persist discover/ai · second SSE for notifications

## Docs
`docs/PROJECT_WALKTHROUGH.md` · `docs/PROJECT_PLAN.md` · `docs/JOBIFY_TECH_STACK_ANALYSIS.md` · `.agile-v/STATE.md`
