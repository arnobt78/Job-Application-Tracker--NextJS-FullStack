# Product Backlog — Jobify

<!-- BL-XXXX → REQ-XXXX | Maintained by agile-v-product-owner -->

## BL-0011: Phase 3 Advanced (REQ-0033) — WIP

**REQ:** REQ-0033 · **Status:** COMPLETE · **EVAL-0015 PASS (2026-06-29)**  
**Scope:** Browser extension, team mode, email auto-apply, ARQ batch AI, LLM skill gap

| Item | Status |
|---|---|
| Prisma: Team/TeamMember/extensionToken/inboundEmailAddress | ✅ db push done |
| `LLMSkillGapResult` types + `getLLMSkillGapAction` | ✅ coded |
| `skill-gap-tab.tsx` AI mode (keyword/LLM toggle) + typefix | ✅ PASS |
| `browser-extension/` manifest + background/content/popup | ✅ scaffolded |
| `app/api/extension/` token · jobs · verify routes | ✅ coded |
| `components/team/` create · invite · member-list | ✅ coded |
| `components/user-profile/` batch · email · extension-connect | ✅ coded + wired in /profile |
| `hooks/useAIBatch.ts` · `app/api/ai/batch/route.ts` | ✅ coded (+ user_id in user_data) |
| FastAPI routes email/interview/queue/skills + ARQ tasks/ | ✅ scaffolded (+ ai-complete callback) |
| `app/(dashboard)/team/page.tsx` + `components/team/team-dashboard.tsx` | ✅ DONE |
| `app/api/email/inbound/route.ts` | ✅ DONE |
| `app/api/internal/ai-complete/route.ts` | ✅ DONE |
| `triggerInterviewPrepAction` + `publishNotification` on interview status | ✅ DONE |
| `interview_prep_ready` notification type end-to-end | ✅ DONE |
| `/team` in proxy.ts + nav | ✅ DONE |
| lint ✓ typecheck ✓ test 51/51 ✓ build ✓ | ✅ PASS (2026-06-29) |
| Audit: dead code + CSS bug fixes (invite-member-form, triggerInterviewPrepAction) | ✅ DONE 2026-06-29 |
| EVAL-0015 full pass → commit BL-0011 | ✅ COMMITTED 2026-06-29 |

**Status:** COMMITTED — next is BL-0009 (Coolify VPS deploy)

---

## BL-0010: Phase 1 Gaps ✅

**REQ:** REQ-0025, REQ-0026, REQ-0029 · **Status:** **DONE** @ `59060a0`+

---

## BL-0009: Phase 2 Deploy — **DONE**

**REQ:** REQ-0027 · **Status:** `jobify-redis` ✅ · `jobify-ai-backend` ✅ · `jobify-arq-worker` ✅ @ `ai.arnobmahmud.com`

---

## BL-0012: Discover Track Fix — **DONE** (2026-06-30)

| Item | Status |
|---|---|
| `trackJobFromDiscoverAction` — pre-seed bluedoorJobId, idempotent | ✅ |
| `lib/discover/track-helpers.ts` — company/location fallbacks | ✅ |
| `JobActionResult` on `createJobAction` — no silent null | ✅ |
| `useTrackDiscoverJobMutation` — optimistic + invalidateAll | ✅ |
| Vitest track-helpers + optimistic guard | ✅ |

---

## BL-0008: Phase 1 Core ✅

**REQ:** REQ-0025…0029 · **Status:** COMMITTED

---

## BL-0003: Test Suite

**REQ:** REQ-0021 · Vitest **54** ✓ · Playwright scaffold · E2E CI pending

---

## BL-0004: Observability

**REQ:** REQ-0022 · Sentry ✓ · PostHog optional ✓

---

## BL-0013: Discover → Dashboard Cache Sync Fix — **DONE** (2026-06-30)

**REQ:** REQ-0026 · **Status:** COMPLETE · **EVAL-0019 PASS**

| Item | Status |
|---|---|
| RC-1: `jobs:${userId}::all:all:all:1:10` added to `fixedUserRedisKeys` | ✅ |
| RC-2: `revalidateUserJobsDataCache` (no SCAN) for `after()` callbacks | ✅ |
| RC-4: `alreadyTracked` flag + `notifyAlreadyTracked` toast + optimistic rollback | ✅ |
| RC-5: debug log code removed from 4 files + `.cursor/` deleted | ✅ |
| lint ✓ typecheck ✓ test 58/58 ✓ build ✓ | ✅ |

---

## BL-0014: Discover 429 Rate Limit Fix — **DONE** (2026-06-30)

**REQ:** REQ-0026 · **Status:** COMPLETE

| Item | Status |
|---|---|
| `lib/bluedoor/discover-cache.ts` — `getCachedDiscoverSearch` (60s TTL) + `getCachedDiscoverFacets` (300s TTL) using `unstable_cache` | ✅ |
| `searchBluedoorJobsAction` → `getCachedDiscoverSearch` | ✅ |
| `getBluedoorFacetsAction` → `getCachedDiscoverFacets` | ✅ |
| Remove unused `searchJobs` + `getDiscoverFacets` imports from actions.ts | ✅ |
| `discover-results-toolbar.tsx` — "—" badge + rate-limit subtitle when `total_matching_unavailable` | ✅ |
| `discover-results.tsx` — rate-limit message instead of "No jobs found" | ✅ |
| lint ✓ typecheck ✓ test 59/59 ✓ | ✅ |

---

## BL-0015: UI Dialog / Filter Parity — **DONE** (2026-06-30 → `148a49f`)

**REQ:** REQ-0012, REQ-0014, REQ-0026 · **Status:** COMPLETE · CR UI-2026-06-30c

| Item | Status |
|---|---|
| GlassFilterDropdown shared + form status/mode icons + labels | ✅ |
| JOB_DIALOG_PANEL_CLASS 80vw×80vh | ✅ |
| PageContainer public 7xl / app 9xl | ✅ |
| Scroll-shift + discover cold spinner | ✅ |
| lint/typecheck/test 60/60/build | ✅ |

---

## BL-0016: UI Polish + Bug-Fix Intake — **OPEN** (2026-10-14)

**REQ:** mapped per item (UI: REQ-0012/0014 · CRUD/cache: REQ-0026 · others as identified) · **Checkpoint:** INT-0004  
**Process:** one user item at a time → plan → approval → implement → validate (lint/typecheck/test/build) → log

| ISSUE | Source | Summary | REQ | Status |
|---|---|---|---|---|
| ISSUE-0001 | user · VERCEL_PRODUCTION_GUARDRAILS.md | Guardrails: shared `PROTECTED_PREFIXES` → proxy + robots; AI crawler list; image TTL 31d; Sentry silent/telemetry/sourcemap delete + `/config` import; `NEXT_TELEMETRY_DISABLED` | REQ-0024, REQ-0022 | DONE (EVAL-0024) · committed |
| ISSUE-0002 | user · npm audit | In-major upgrades (next 16.4, next-auth beta.32, …), csv-parse 7, overrides, npm 11 `allowScripts`; 34 → 7 (RISK-0005 accepted) | REQ-0024, REQ-0021 | DONE (EVAL-0024) · committed |
| ISSUE-0003 | Vercel Node 20 EOL notice | `engines.node` 24.x · `.nvmrc` 24 · `@types/node` 24 | REQ-0024 | DONE (EVAL-0024) · committed |
| ISSUE-0004 | user · Redis_Sentry_PostHog guide §2A | Sentry: `instrumentation-client.ts` (Turbopack never loaded `sentry.client.config.ts`); `/api/monitoring` tunnel pinned to DSN host+project (SSRF fix), 1 MB cap, 10s timeout, rate-limit headers; prod-only + `VERCEL_ENV`; shared vs client-only `ignoreErrors` + `beforeSend` + `denyUrls`; `excludeDebugStatements`; `.npmrc fund=false`; `vitest.config.mts` | REQ-0024, REQ-0022 | DONE (EVAL-0024) · committed |
| ISSUE-0005 | user · demo scope | Remove GitHub OAuth: button (`AuthOAuthButtons`), provider (`lib/auth/config.ts`), `.env.example`/README/walkthrough; keep `avatars.githubusercontent.com` for stored avatars | REQ-0001 | DONE (EVAL-0024) · committed |
| ISSUE-0006 | user · Stats screenshot | Stats cards: two 3-card grids merged into one 6-card grid in `StatsContainer` (3+3 desktop · 2+2+2 tablet · 1 phone) · single stats query · `StatsKpiRow` → presentational `StatsKpiCards` | REQ-0012, REQ-0014 | DONE (EVAL-0025) |
| ISSUE-0007 | user · light-mode audit | Light-mode phase 1: theme-aware glass tokens (`--glass-*`, `--accent-text`, `--app-glow-*`) in `globals.css` + tailwind `glass.*` colors; `.glass-nav/.glass-sidebar/.glass-input/.app-shell` + GlassCard, Button outline/secondary, glass dialog/dropdown/alert, dashboard/landing nav migrated; dark values identical | REQ-0014 | DONE (EVAL-0026) |
| ISSUE-0008 | ISSUE-0007 follow-up · Agent Review | Light-mode phase 2: tokens `on-glass(-muted)`, `glass-inset(-soft/-strong)`, `.text-tone-*` (700/300) + `.text-ink-*` (600/400) utilities; ~40 feature files migrated; button text/icons slate-800 in light (default/destructive/TryDemo); secondary button visible shape in light (Agent Review fix); dialog overlay `slate-900/40` + opaque glass panels in light; `lib/` added to tailwind `content`; dark identical | REQ-0014 | DONE (EVAL-0027) |
| ISSUE-0009 | user | Responsive audit 10 routes × 390/768/1280 × light/dark + dialogs: 0 overflow. Fixes from A-Z run: CompanyLogo Clearbit (retired, DNS fail → console errors) → Google s2 favicons; EditJobForm empty-until-fetch + refetch reset dropping saves → list-job `placeholderData` + version-gated `reset(keepDirtyValues)`; warm-up `fetchQuery` unhandled `CancelledError` (Sentry events) → caught | REQ-0012, REQ-0014 | DONE (EVAL-0028) |
| ISSUE-0010 | EVAL-0028 finding + user | Instant navigation on all dashboard routes: mirrored `loading.tsx` (same page view, cache-only `RouteFallbackProvider`), intent prefetch + pending spinner in nav/profile dropdown, `staleTimes.dynamic=30`, cached salary intel (Redis + stats tag), deduped stats/facets queries | REQ-0012, REQ-0014 | DONE (EVAL-0029) |
| ISSUE-0011 | user (2026-10-14) | Replace third-party Bluedoor API (upstream down, 530) with ~50 seeded job postings behind the same Discover / enrich workflow, so features, API and network timing can be tested end-to-end | REQ-0026 (TBD) | TODO (needs plan + approval) |
| ISSUE-0012 | user (2026-10-14) | Seed 10–20 varied jobs for the demo account (test@user.com) | REQ-0012 (TBD) | TODO (needs plan + approval) |
| ISSUE-0013 | user (2026-10-14/15) | Free-tier LLM fallback chain per `docs/LLM_MODEL_SELECTION.md` + AI pipeline wiring fixes + single `.env.local` | REQ-0027 | DONE (EVAL-0030) — Human-Action: add GEMINI/HF keys; Coolify env + redeploy |
| ISSUE-0014 | user (2026-10-14) | Feature-by-feature test pass; user will list non-working features, UI polish and API fixes; prod navigation feedback pending | — | TODO (details from user) |

---

## Sprint Plan (2026-10-14)

| Priority | BL | Status |
|---|---|---|
| 0 | **BL-0016** UI polish + bug fixes | OPEN — intake from user |
| 1 | Gate 1 (INT-0001) | PENDING human approval |
| 2 | BL-0003 | E2E CI wiring |
| 3 | n8n templates | Not deployed (`docs/n8n/`) |
| 4 | Optional | Hetzner app migrate / Ollama on VPS |
