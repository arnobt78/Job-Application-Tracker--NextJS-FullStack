# Agile V State — Jobify

| Field | Value |
|---|---|
| **Cycle** | C1 |
| **Stage** | 3 Synthesis — P1 ✅ · P2 ✅ deploy · P3 ✅ · BL-0011…0015 ✅ · **BL-0016 intake OPEN** |
| **Status** | `ACTIVE` — Infinity Loop **ON** · awaiting user items for BL-0016 |
| **Checkpoint** | INT-0004 `c1-bl0016-intake-20261014` (Human-Decision, PENDING) |
| **Auth** | NextAuth v5 · `proxy.ts` (Next.js 16) |
| **Last Updated** | 2026-10-15 |
| **Git HEAD** | ISSUE-0013 commit on `main` (on top of `4e08fda`) · not pushed |
| **Verify** | ISSUE-0011/0012 (2026-10-15, Node 24): lint ✓ · typecheck ✓ · vitest **105/105** ✓ · pytest **26/26** ✓ · build ✓ · discover e2e 8/8 ✓ (EVAL-0031 recorded at end of A-Z pass) · prior EVAL-0030 |

## Reconcile (2026-10-15)
- HEAD `4e08fda` matches recorded work; working tree clean (earlier "parallel edits" notes below are historical — all committed)
- Open checkpoints: INT-0001 (Gate 1 baseline, PENDING) · INT-0004 (BL-0016 intake, PENDING)

## Reconcile (2026-10-14)
- HEAD moved `148a49f` → `6c48ba4` (agile-v sync commit, docs only)
- Uncommitted, pre-existing (not from this session): `CLAUDE.md`, `docs/UI_STYLING_GUIDE.md`, `docs/VERCEL_PRODUCTION_GUARDRAILS.md` modified; `docs/AUTH_UI_IMPLEMENTATION_GUIDE.md`, `docs/RIPPLE_BUTTON_EFFECT.md`, `docs/Redis_Sentry_PostHog_INTEGRATION_GUIDE.md` deleted; new `AGENTS.md`, `docs/AGILE_V_PROTOCOL.md`, `docs/LLM_MODEL_SELECTION.md`, `docs/PORTABLE_AUTH_UI_GUIDE.md`, `docs/PROJECT_ENGINEERING_PLAYBOOK.md`
- No app source changes since last verified build

## Active work — BL-0016 (UI polish + bug-fix intake)
- User will share screenshots + instructions **one item at a time**
- Per item: analyze → map REQ → scoped plan → **wait for approval** → implement → validate → log
- Items tracked in `BACKLOG.md` § BL-0016 as `ISSUE-00XX`
- **ISSUE-0001..0003 DONE** — Vercel guardrails · Node 24 (`engines` + `.nvmrc`) · deps upgrade (lockfile regenerated; npm 11 `allowScripts` in package.json). Files: `lib/auth/protected-routes.ts` (new), `proxy.ts`, `app/robots.ts`, `next.config.ts`, `package.json`, `package-lock.json`, `.nvmrc`, + documented lint disables in `app/error.tsx`, `components/UserProfileDropdown.tsx`, `hooks/useGuestSignIn.ts`, `hooks/useSignUpForm.ts`
- **ISSUE-0004 DONE** — Sentry: `instrumentation-client.ts` (new), `sentry.client.config.ts` (deleted), `lib/sentry/config.ts`, `lib/sentry/tunnel.ts` (new), `app/api/monitoring/route.ts`, `proxy.ts` matcher excludes `api/monitoring`, `next.config.ts` (`excludeDebugStatements`), `.npmrc` (new), `.env.example` (`SENTRY_DSN`), `lib/sentry/__tests__/sentry-tunnel.test.ts` (new), `vitest.config.ts` → `vitest.config.mts`
- **ISSUE-0005 DONE** — GitHub OAuth removed: `components/auth/AuthOAuthButtons.tsx`, `lib/auth/config.ts`, `app/api/auth/[[...nextauth]]/route.ts` (comment), `.env.example`, `README.md` (GitHub lines only), `docs/PROJECT_WALKTHROUGH.md`, REQ-0001 AC2
- Context: prod URL `https://jobify-tracker.vercel.app`; Resend sending domain `arnobmahmud.com` (`contact@`) verified; inbound email (`INBOUND_EMAIL_DOMAIN`, `RESEND_INBOUND_SECRET`) not configured
- Working tree also holds **parallel edits not from this session** (home sections, jobs/stats/team components, SignIn/SignUp forms, README, .gitignore, docs) — review separately before commit
- **Human-Action:** Vercel Firewall custom **Bypass** rule for `/api/internal`, `/api/cron`, `/api/email/inbound`, `/api/extension` (Bot Protection Challenge would otherwise block machine callers) · Project Node.js = 24.x · Sentry env vars (`NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`) in Production + Preview · optional Sentry Inbound Filters (browser extensions, legacy browsers, web crawlers)
- Local dev: `nvm use` (reads `.nvmrc`) before npm commands
- ISSUE-0001..0005 **committed** (session files only); parallel edits remain unstaged in working tree
- **ISSUE-0006 DONE** — Stats 6-card grid (3+3 / 2+2+2 / 1) with one stats query: `components/StatsContainer.tsx`, `components/stats/stats-kpi-row.tsx` (`StatsKpiCards`), `app/(dashboard)/stats/page.tsx` (EVAL-0025)
- **ISSUE-0007 DONE** — light-mode phase 1: tokens in `app/globals.css` + `tailwind.config.js` (`glass.*`, `accent-text`); primitives `components/ui/{glass-card,button,glass-alert-dialog,glass-dialog-content,glass-dropdown-menu}.tsx`, `components/layout/{dashboard-nav,landing-nav}.tsx`; `text-accent-text` on profile/timeline headings (EVAL-0026). Use `glass-*` / `accent-text` tokens for any new surface — never hardcode `white/*`
- DB: `.env.local` `DATABASE_URL` (moved from `.env`, which no longer exists) is the demo DB used for both prod and local; GitHub OAuth was never configured (no GitHub accounts exist)
- **ISSUE-0008 DONE** — light-mode phase 2 (EVAL-0027). Styling rules: `text-on-glass(-muted)` for text/icons on colored glass; `text-tone-X` replaces `text-X-300`, `text-ink-X` replaces `text-X-400` (no `/opacity` modifier on these — use `text-X-600/NN dark:text-X-400/NN`); `bg-glass-inset*` replaces `bg-black/10|20|30`; class maps in `lib/` are scanned by tailwind
- **ISSUE-0009 DONE** — responsive 0 overflow; fixed `components/ui/company-logo.tsx` (Google s2), `components/EditJobForm.tsx` (seed + version-gated reset), `hooks/useJobsMutation.ts` (warm-up catch) (EVAL-0028)
- **Human-Action (data):** audit cleanup hard-deleted the demo job "Senior Software Developer · Workforcenow" (test@user.com) — user restoring via DB point-in-time restore. Never run destructive UI automation on the shared demo DB; any future CRUD test must delete only rows it created (match by exact created id/name after filter settles)
- **ISSUE-0010 DONE** — instant navigation (EVAL-0029). Pattern for any dashboard route: page JSX lives in `components/**/<x>-page-view.tsx`; `page.tsx` = prefetch + `HydrationBoundary` + view; `loading.tsx` = `<RouteFallbackProvider><View /></RouteFallbackProvider>`. Every data hook in a view MUST pass `enabled: !useIsRouteFallback()` (and use `useQueryBodyLoading` for skeletons). Nav links use `IntentLink` (no viewport prefetch). Salary intel cached via `getCachedSalaryIntel` (`salary-intel:${userId}` in `fixedUserRedisKeys`)
- **ISSUE-0013 DONE** — AI free-tier fallback chain + pipeline fixes (EVAL-0030). Python: `app/llm/registry.py` (model chains, data only) · `app/llm/openai_compat.py` (one client, never raises) · `app/llm/router.py` (missing key skip · 401/402/403 next provider · 429/404/5xx/timeout/empty next model · 20 s budget · Ollama/Anthropic opt-in last) · `app/api/security.py` (fail-closed `verify_secret`) · `app/env.py` (local `.env.local`) · ARQ pool singleton · `requirements-dev.txt`. Next.js: `lib/ai/insight-mapper.ts` (mapper + fit label) · `lib/ai/pipeline-payload.ts` (server-only profile/job select) · `toPipelineJobInput` in `lib/ai/pipeline-client.ts` · `useStreamPipeline` rewrite · Discover panel `persist={false}` · `saveAIInsightAction` ownership check · inbound email 503 on AI outage · deleted `/api/ai/pipeline`, `runAiPipeline`, non-streaming hook. Env: single `.env.local`, `prisma.config.ts`, `db:*` scripts `--env-file-if-exists=.env.local`
- **Human-Action (AI):** add `GEMINI_API_KEY` + `HF_TOKEN` (and `GROQ_API_KEY` / `OPENROUTER_API_KEY` if not yet) to `.env.local` · Coolify: same 4 keys + `AI_SERVICE_SECRET` (now **required** — service returns 503 without it) + `NEXT_APP_URL` (prod Vercel URL) on `ai-service` and `arq-worker`, then redeploy · then re-run live smoke for Gemini/HF
- **ISSUE-0011 DONE** — Bluedoor removed (API gone): `lib/bluedoor/*`, `/api/bluedoor/webhook`, 13 `bluedoor*` Job columns, `enrichJobAction`, `scripts/seed-test-user-jobs.ts`, `csv-parse` deleted. New catalog: `Company` / `JobPosting` / `JobPostingEvent` + Job snapshot (`postingId` FK SetNull, `@@unique([userId, postingId])`, `postingChangeType`); missing FKs added (`JobAIInsight.user`, `UserProfile.user`, `Team.owner` cascade). `lib/postings/{types,queries,cache,link,schema,route-helpers}.ts` · `/api/postings`, `/facets`, `/[id]`, `/[id]/events` (session + zod) · `lib/cron-auth.ts` (both crons fail closed) · Python `JobInput` `posting_status/workplace_type/salary_*` with legacy `bluedoor_*` aliases
- **ISSUE-0012 DONE** — `prisma/seed.ts` + `prisma/seed-data/` (15 fictional companies, 50 postings 40 open/10 closed, 70 events, demo user id `seed_demo_user`, 25 jobs with 12 linked across every badge, profile) · `npm run db:reset` (destructive; Prisma requires explicit user consent) — shared DB wiped + reseeded 2026-10-15 with user consent
- Playwright: `tests/e2e/auth.setup.ts` (storageState → `tests/e2e/.auth/`, gitignored) + `tests/e2e/fixtures.ts` (auto console/network assertions); `discover.spec.ts` rewritten
- **Human-Action (postings):** remove `BLUEDOOR_WEBHOOK_SECRET` from Vercel · confirm `CRON_SECRET` set in Vercel (crons now reject without it) · Coolify redeploy `ai-service` + `arq-worker` (new field names; old names still accepted) · anyone signed in before the reset must sign in again
- **Next exact action:** Part 2 of plan `postings_system_and_verification` — editor red lines (venv done: `python-ai-service/.venv`) → Gemini/HF smoke → full Playwright suite → browser A-Z pass → security review → EVAL-0031 + commit

## Recent (sync 2026-07-24)
- Infinity Loop reactivated @ `148a49f` — full `.agile-v/` sync
- UI polish committed: GlassFilterDropdown · 80vw dialog · page 7xl/9xl · scroll-shift · discover cold spinner
- BL-0013/0014 discover cache + 429 UX ✅ · BL-0009 VPS AI ✅ · BL-0011 Phase 3 ✅
- Vercel serves Next.js; Coolify VPS (redis/AI/ARQ) unchanged for UI-only commits

## Shipped
P1–P3 · postings catalog + discover (Bluedoor removed) · AI pipeline VPS · team/extension/email/ARQ · UI dialog/filter polish

## Backlog (next)
1. **Gate 1** INT-0001 — human approve REQ baseline
2. BL-0003 — E2E CI auth / Playwright
3. n8n templates deploy (`docs/n8n/`)
4. Optional: Ollama on VPS · Hetzner app migration (later)

## Architecture rules
`force-dynamic` · SSR prefetch · persist jobs/stats/charts/job only · `invalidateUserJobCaches`+SSE · postings catalog in Postgres (`postings` cache tag) · no self-verify (Red Team)

## Agent memory
`CLAUDE.md` · `docs/PROJECT_WALKTHROUGH.md` · `.agile-v/PLAYBOOK.md`
