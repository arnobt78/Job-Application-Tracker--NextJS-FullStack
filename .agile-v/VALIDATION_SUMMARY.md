# Validation Summary — Cycle C1

| Field | Value |
|---|---|
| Cycle | C1 |
| Stage | 3 Synthesis — P1+P2+P3 ✅ · BL-0009…0015 ✅ · Gate 1 PENDING |
| Status | `ACTIVE` — EVAL-0031 PASS (own postings catalog + A-Z verification) |
| Last Updated | 2026-10-15 |
| Red Team | EVAL-0016…0019 PASS · EVAL-0020 governance sync |
| EvalGate (Gate 2) | NOT_RUN |

## EVAL-0031 (BL-0016 ISSUE-0011/0012 — own postings catalog + full A-Z verification — 2026-10-15)

| Check | Command | Result | Notes |
|---|---|---|---|
| Gates | `npx tsc --noEmit && npm run lint && npx vitest run && npm run build` (Node 24.21) | PASS | tsc clean · eslint clean · vitest 107/107 (19 files) · build OK |
| Python | `python-ai-service/.venv` · `pytest -q` · `pylint app --rcfile ../.pylintrc` | PASS | 26/26 · pylint 9.82/10 · `pyrightconfig.json` + `.pylintrc` clear editor red lines |
| E2E | `npx playwright test` vs `next start` (shared demo DB) | PASS | 31/31 · auto fixture fails on any console error / same-origin 5xx / unexpected 4xx · every dashboard route · create → optimistic card < 2 s → edit status → `/dashboard/[id]` → delete · discover track `pst_002` → dashboard → delete · only own `E2E-<timestamp>` rows written, 0 leftovers verified after each run |
| Live LLM smoke | 1 tiny prompt per model, status + latency only | PASS (partial) | Gemini OK after chain reorder (`3.5-flash-lite` first; `3.8-flash` timed out) · Hugging Face 402 on every model = credits exhausted (Human-Action) |
| Browser A-Z | Playwright probe vs prod build | PASS | client nav 320–500 ms cold / 70–110 ms warm · 0 console errors/warnings/hydration · `loading.tsx` = real page view (mirrored by construction) · Discover card actions wrap at all widths (Track button was clipped) · Sentry tunnel 27 → 1 request per browsing session |
| Fixes from verification | — | DONE | form select triggers now labelled (`<label htmlFor>` reaches the button) · update/delete mutations throw on `null` → rollback + error toast (was silent optimistic loss) · `updateJobAction` / `createTeamJobAction` persist parsed fields only (snapshot columns server-owned) + log failures · Prisma `connect_timeout=15` when URL has none (remote DB fresh connect 1.7–4 s vs 5 s default) · Sentry `browserSessionIntegration({ lifecycle: 'page' })` · stale Bluedoor-era copy on Discover/job form/Stats |
| Security | security-review (commit `1dde90b` + working tree) | PASS | no medium+ · hardening applied (parsed-only job writes) |
| Not verified | — | OPEN | Coolify `ai-service`/`arq-worker` still on old image · prod Vercel env (`CRON_SECRET`, remove `BLUEDOOR_WEBHOOK_SECRET`) · HF credits |

## EVAL-0030 (BL-0016 ISSUE-0013 — AI free-tier fallback chain + pipeline fixes — 2026-10-15)

| Check | Command | Result | Notes |
|---|---|---|---|
| Gates | `npx tsc --noEmit && npm run lint && npx vitest run && npm run build` (Node 24.21) | PASS | tsc clean · eslint clean · vitest 83/83 (17 files, + `insight-mapper.test.ts`) · build OK (`/api/ai/pipeline` gone, `/api/ai/pipeline/stream` + `/api/ai/batch` present) |
| Python | `pytest -q` in throwaway venv (`requirements-dev.txt`) | PASS | 24/24 — router (next model / next provider / 429 per-model / timeout / empty / missing key / headroom / budget / no upstream body in errors / think-strip), callback payload + non-2xx logging, fail-closed secret (503 unset, 401 wrong), `/health` names only, pipeline |
| E2E | `npx playwright test` vs `next start` | PASS | 11 passed · 10 skipped (`E2E_COOKIE`) — unchanged baseline |
| Service smoke | `uvicorn app.main:app` local | PASS | `/health` → `{"status":"ok","llm_providers":[...]}` (names only) · wrong secret → 401 |
| Live LLM smoke | 1 tiny prompt per model, status + latency only | PASS (partial) | Groq 3/3 OK (gpt-oss-20b 0.9 s, 120b 0.5 s, qwen3.8 0.15 s) · OpenRouter 3/5 OK (both Gemma `:free` 429 while Nemotron + `openrouter/free` answered → 429 reclassified per-model) · Gemini + HF **no key yet** |
| Live pipeline | `run_pipeline` with sample job + profile | PASS | 4 LLM calls via groq/gpt-oss-20b · 4.4 s total · fit 73 · cover letter 150 words · 3 interview angles · summary |
| Prisma env | `npx prisma validate` · `tsx --env-file-if-exists=.env.local` | PASS | `prisma.config.ts` loads `.env.local`; DB URLs present (booleans only) |
| Red Team | implementation-verifier | PASS w/ notes → fixed | `saveAIInsightAction` lacked job-ownership check → added · `onSuccess` inside try → moved out · interview-prep angle format → shared `formatInterviewAngle` · no overall router deadline → 20 s budget · `@next/env` undeclared → devDependency |
| Security | security-review (uncommitted diff) | PASS | no medium+ · hardening applied: client-visible LLM errors carry provider/model/status only (upstream bodies server-log only) |
| Not verified | — | OPEN | Gemini + Hugging Face model IDs on user's keys · VPS (Coolify) still runs old image until redeploy with new env keys · ARQ batch path end-to-end on VPS · DB-writing UI tests (no DB writes this session) |

## EVAL-0029 (BL-0016 ISSUE-0010 — instant navigation — 2026-10-14)

| Check | Command | Result | Notes |
|---|---|---|---|
| Gates | `npm run lint && npm run typecheck && npm run test && npm run build` (Node 24.21) | PASS | eslint clean · tsc clean · vitest 69/69 · build OK |
| E2E | `npx playwright test` | PASS | 11 passed · 10 skipped (`E2E_COOKIE`) |
| Nav timing | Playwright vs `next start`, light 1280, navigation only (no DB writes) | PASS | click→shell 46–118 ms all routes (was `/stats` 2.8–4.2 s) · revisit <30 s 49–58 ms with 0 RSC / 0 actions · hover-prefetched click after expiry 44–47 ms |
| Shell mirror | h1 bounding box shell vs final; screenshots light 1280 + dark 390 | PASS | identical on stats/discover/timeline/team/profile/dashboard · profile + team skeletons match final geometry |
| Stability | CLS observer, console errors, dashboard search-param nav | PASS | CLS 0.0000 · 0 errors · search input keeps focus/value · fallback controls not focusable (`inert`) |
| Requests | RSC/action counter per nav | PASS | 0 client actions from fallbacks (only pre-existing dashboard jobs refetch) |
| Red Team | implementation-verifier ×2 | PASS w/ warnings → fixed | fallback mutations into snapshot cache → `inert`; salary edits on resync not invalidating cached salary intel → `salaryEdited` invalidation; edit dialog portals outside `inert` → fallback always skeleton in `EditJobForm`; `revalidateTag(tag,'max')` is stale-while-revalidate (first read after CRUD returned old cache) → `{ expire: 0 }` in `invalidateUserJobCaches` / `revalidateUserJobsDataCache` |
| Security | security-review (a46dca4..0116b9a) | PASS | no medium+ findings; server actions session-scoped; salary-intel cache keyed by userId |
| Agent Review | IDE review (3 items) | 1 fixed · 2 false positive | `EditJobDialogPageFallback` guards missing `id`; team `currentUserId` "" only affects "(you)" marker (runtime: shell shows "(you)"); `IntentLink` ref forwarded via React 19 ref-as-prop (runtime: Radix item focus + Enter → /profile) |
| Not verified | — | OPEN | CRUD timing re-test pending demo DB restore · first cold-server hit ~0.8–1.3 s before shell · without hover/focus prefetch the shell waits ~1 RTT · Bluedoor upstream 530 outage (external) during run |

## EVAL-0028 (BL-0016 ISSUE-0009 — responsive audit + A-Z runtime — 2026-10-14)

| Check | Command | Result | Notes |
|---|---|---|---|
| Responsive | Playwright vs `next start`, 10 routes × 390/768/1280 × light/dark | PASS | `scrollWidth == clientWidth` everywhere · no element past viewport · create/edit/delete dialogs fit at 390/768 |
| CRUD (light + dark) | Playwright, test@user.com | PASS | create card 267–296 ms · edit card 54–325 ms · delete card 280–321 ms · Stats pending +1 after create · back/forward OK · Discover/Timeline/Team/Profile render |
| Console / network | page `console.error` + `pageerror` + responses ≥400 | PASS | 0 errors · 0 failed first-party (was: Clearbit `ERR_NAME_NOT_RESOLVED` per card, 4× `CancelledError`) · aborted RSC prefetches on hard nav only |
| Sentry envelopes | `/api/monitoring` request types | PASS | `session` + `transaction` only · 0 `event` (was 4 from unhandled `CancelledError`) |
| Edit form | 390 + 1280 | PASS | fields filled on open (list-job placeholder) · fast submit saves (was: empty form, validation focus on `company`, no POST) |
| E2E | `npx playwright test` | PASS | 11 passed · 10 skipped (`E2E_COOKIE`) |
| Perf finding | RSC timing | NOTE | `/stats` nav ~2.8–4.3 s locally (4 awaited prefetches over remote DB) → ISSUE-0010 |
| Data incident | — | HUMAN-ACTION | audit cleanup hard-deleted demo job "Senior Software Developer · Workforcenow" (test@user.com); user restoring via DB point-in-time restore |

## EVAL-0027 (BL-0016 ISSUE-0008 — light-mode phase 2 — 2026-10-14)

| Check | Command | Result | Notes |
|---|---|---|---|
| Lint · Typecheck · Unit · Build | gate commands | PASS | 0 problems · 69/69 · exit 0 · `text-ink-*`, `text-tone-*`, `hover:text-tone-violet` (+ `:is(.dark *)`), `bg-glass-inset*`, `text-on-glass` emitted |
| Sweep | `rg "white/\|text-X-300\|text-X-400\|bg-black/" app components lib` | PASS | remaining: `dark:`-prefixed originals, dialog overlay `dark:bg-black/80`, ripple `bg-white/30`, button secondary `dark:text-white/80` |
| Visual | screenshots light + dark (landing, sign-in, dashboard, stats, dialogs 390) | PASS | light: dark-slate button text, visible secondary, opaque dialog panels, colored form icons · dark unchanged |
| Red Team | implementation-verifier | PASS after fixes | found `text-ink-violet/80` (no opacity on layered utility) → `text-violet-600/80 dark:text-violet-400/80`; `lib/` not in tailwind `content` (icon maps lost color) → added + migrated to `text-ink-*` |

## EVAL-0026 (BL-0016 ISSUE-0007 — light-mode phase 1 tokens — 2026-10-14)

| Check | Command | Result | Notes |
|---|---|---|---|
| Lint · Typecheck · Unit | `npm run lint` · `npm run typecheck` · `npm run test` | PASS | 0 problems · 69/69 |
| Build | `npm run build` | PASS | exit 0 · `bg-glass-*`, `from-glass-from`, `hover:bg-glass-hover`, `text-accent-text`, `var(--glass-nav-shadow)` emitted in CSS |
| Dark parity (`next start`, CDP computed styles) | `getComputedStyle` | PASS | `--glass-border` = `#ffffff1a`; neutral GlassCard border `rgba(255,255,255,0.1)`, gradient `0.1 → 0.05 → 0.05` = original classes |
| Light visual | screenshots | PASS | landing · sign-in · dashboard · stats readable (borders/fills visible, secondary button + stats section headings contrast) |
| Console | `console.error`/`window.error` collector over Stats → Dashboard → Profile → Stats client nav | PASS | 0 errors |
| Red Team | implementation-verifier | PASS w/ warnings | `accent-text` now used (profile/timeline headings) · docs `StatsKpiRow` refs updated · remaining hardcoded `white/*` in feature files → ISSUE-0008 |

## EVAL-0025 (BL-0016 ISSUE-0006 — Stats 6-card grid — 2026-10-14, revised)

| Check | Command | Result | Notes |
|---|---|---|---|
| Lint · Typecheck · Unit · Build | gate commands | PASS | 0 problems · 69/69 · exit 0 |
| Layout (`next start`, test@user.com, `/stats`) | CDP rect measure | PASS | 390: 1+1+1+1+1+1 (374px) · 800: 2+2+2 (376px) · 1280: 3+3 (395px) · no horizontal scroll |
| Data | code review | PASS | single `useQuery(queryKeys.stats.all)` in `StatsContainer`; `StatsKpiCards` presentational (props) · KPI math unchanged |

## EVAL-0024 (BL-0016 ISSUE-0001..0005 final gate — 2026-10-14, pre-commit on `6c48ba4`)

| Check | Command | Result | Notes |
|---|---|---|---|
| Lint · Typecheck | `npm run lint` · `npm run typecheck` | PASS | 0 problems · `**/*.mts` now in tsconfig include (vitest config typechecked) |
| Unit | `npm run test` | PASS | 69/69 · 16 files |
| Build | `npm run build` | PASS | exit 0 · only expected `/_next/static` Cache-Control warning |
| E2E | `npx playwright test` vs `next start` | PASS | 11 passed (adds `/team` redirect) · 10 skipped (need `E2E_COOKIE` session) |
| Browser (`next start`, test@user.com) | manual + CDP | PASS | sign-in → dashboard · create job → card + counts instant · Stats KPIs fresh after client nav · delete → instant revert · Discover/Timeline/Team/Profile render · 0 console errors · 0 failed requests · Sentry envelopes = `session` only via `/api/monitoring` |
| Tunnel | curl | PASS | valid 200 · forged host 403 · malformed/empty 400 · >1 MB 413 (body read as bytes) |
| Overrides | exceljs xlsx write/read roundtrip | PASS | uuid 11.1.1 OK |
| Security | security-review subagent | PASS | no medium+ findings; SSRF fixed |
| Red Team | implementation-verifier | PASS w/ warnings | fixed: tsconfig `.mts`, tunnel binary-safe body, README Node 24, `.env.example` DSN placeholder + count, avatar comment, e2e `/team` |

External: Bluedoor API returned Cloudflare 530/1016 (origin DNS) during run — Discover shows graceful unavailable state; not app code.
Not changed (reported): generic guides `docs/VERCEL_PRODUCTION_GUARDRAILS.md` / `docs/Redis_Sentry_PostHog_INTEGRATION_GUIDE.md` still describe `tunnelRoute` option; this project owns `/api/monitoring` route instead.

## EVAL-0023 (BL-0016 ISSUE-0005 — Remove GitHub OAuth — 2026-10-14, uncommitted on `6c48ba4`)

| Check | Command | Result | Notes |
|---|---|---|---|
| Lint | `npm run lint` | PASS | 0 problems |
| Typecheck | `npm run typecheck` | PASS | |
| Unit | `npm run test` | PASS | 69/69 · 16 files |
| Build | `npm run build` | PASS | exit 0 · only expected `/_next/static` Cache-Control warning |
| Runtime (`next start`) | curl | PASS | `/api/auth/providers` = `google,credentials` · `/sign-in`, `/sign-up` 200 · Google button present · GitHub button absent |
| Red Team | implementation-verifier | PASS w/ warnings | no code references left; REQ-0001 AC2 updated; `mode` prop unused (kept, consumer contract) |

Not verified: existing DB `Account` rows with `provider = 'github'` (those users must use Google/credentials).

## EVAL-0022 (BL-0016 ISSUE-0004 — Sentry tunnel · client init · noise filters — 2026-10-14, uncommitted on `6c48ba4`)

Env: Node `v24.21.0` · npm `11.19.0`

| Check | Command | Result | Notes |
|---|---|---|---|
| Lint | `npm run lint` | PASS | 0 problems |
| Typecheck | `npm run typecheck` | PASS | |
| Unit | `npm run test` | PASS | 69/69 · 16 files · tunnel resolver, `beforeSend`, client-vs-server `ignoreErrors` scope · Vite configLoader warning gone (`.mts`) |
| Build | `npm run build` | PASS | exit 0 · only expected `/_next/static` Cache-Control warning |
| Client bundle | grep `.next/static` | PASS | `/api/monitoring` tunnel present (was absent — browser SDK never initialized before) |
| Browser | `next start` + DevTools | PASS | `window.__SENTRY__` initialized · envelopes POST `/api/monitoring` · 0 direct `sentry.io` requests |
| Tunnel smoke | curl | PASS | forged host 403 · other project 403 · malformed/empty 400 · >1 MB 413 · valid envelope 200 · `/dashboard` 307 |
| Red Team | implementation-verifier | PASS after fixes | network/abort ignores moved client-only (server Bluedoor timeouts still reported) · tunnel validates client DSN first · Turbopack `Failed to load chunk` pattern · upstream timeout + rate-limit headers |

Not verified: production Sentry dashboard ingest (needs deploy with Sentry env vars in Production + Preview).

## EVAL-0021 (BL-0016 ISSUE-0001..0003 — Vercel guardrails · Node 24 · deps — 2026-10-14, uncommitted on `6c48ba4`)

Env: Node `v24.21.0` · npm `11.19.0` (nvm) · clean reinstall (lockfile regenerated)

| Check | Command | Result | Notes |
|---|---|---|---|
| Prisma | `npx prisma validate` · `npm run prisma:generate` | PASS | deepmerge-ts 8 override OK |
| Lint | `npm run lint` | PASS | 0 problems (4 new `no-location-assign-relative-destination` warnings documented as intentional hard navs) |
| Typecheck | `npm run typecheck` | PASS | |
| Unit | `npm run test` | PASS | 60/60 · 15 files · vitest 4.1.11 |
| Build | `npm run build` | PASS | exit 0 · only expected `/_next/static` Cache-Control warning · Sentry root-import deprecation fixed |
| Audit | `npm audit` | ACCEPTED | 34 → 7 high · remainder = `braces` chain only (RISK-0005) · 0 critical / 0 moderate |
| CSS parity | tailwind CLI before/after `postcss-selector-parser` 7 override | PASS | byte-identical output |
| csv-parse 7 | `tsx` runtime `csv-parse/sync` parse | PASS | seed options unchanged |
| Smoke (`next start`) | curl | PASS | security headers · robots.txt new disallow list · `/_next/static` immutable · `/dashboard`,`/team` 307→`/sign-in` · `/_next/image` robohash 200 (sharp 0.35.5) · `/api/cron/enrich` 401 w/o secret |
| Red Team | implementation-verifier (static) | PASS w/ warnings | no defects; commands re-run by orchestrator above |

Not verified: Vercel preview/prod deploy on Node 24 · Vercel Firewall Bypass rule for machine routes (Human-Action).

## EVAL-0020 (Infinity Loop reactivate — 2026-07-24 @ `148a49f`)

| Check | Result | Notes |
|---|---|---|
| git status | PASS | clean · `main` |
| HEAD | PASS | `148a49f` UI polish |
| Agile V bootstrap | PASS | STATE/PLAYBOOK/CHECKPOINTS/config/SKILLS synced |
| Skills | PASS | 24 ACTIVE · core FIRST |
| INT-0003 | ACTIVE | await next instruction |
| Gate 1 INT-0001 | PENDING | reply `Approve Gate 1` |
| VPS | INFO | no redeploy needed for UI-only commits |
| Backlog next | INFO | Gate 1 · E2E CI · n8n |

## EVAL-0018 (Session sync — 2026-06-30 @ `b41373c`)

| Check | Result | Notes |
|---|---|---|
| git status | PASS | clean tree |
| HEAD | PASS | `b41373c` — restore useJobsMutation imports |
| test count | **54/54** | up from 51 (3 new: track-helpers + optimistic guard) |
| VPS deploy | ✅ | `jobify-redis` + `jobify-ai-backend` + `jobify-arq-worker` LIVE |
| Discover track | PASS | idempotent pre-seed, `JobActionResult`, dashboard seed |
| Optimistic guard | PASS | skip `filterOptions` in list patches |
| Backlog | INFO | Gate 1 PENDING · E2E CI pending · n8n pending |

## EVAL-0017 (Pre-VPS audit — 2026-06-30)

| Check | Result | Notes |
|---|---|---|
| lint | PASS | 0 warnings |
| typecheck | PASS | 0 errors |
| test | PASS 51/51 | Vitest |
| build | PASS | all routes ƒ dynamic |
| Discover SSR | PASS | `lib/discover/query-options.ts` server-safe |
| AI port default | PASS | localhost:3000 aligned |
| proxy.ts auth gate | PASS | Next.js 16 convention |
| VPS deploy | **FLAG** | then pending — now ✅ |

## EVAL-0015 (BL-0011 — 2026-06-29) — RESOLVED

| Check | Result | Notes |
|---|---|---|
| BL-0011 commit | **DONE** | Committed 2026-06-29 |
| lint/typecheck/test/build | PASS | 51/51 |

## Findings Summary

```
Scope: Phase 1+2+3-partial | Traceability: REQ-0025–0028, REQ-0031, REQ-0032, REQ-0024, REQ-0001
Findings: PASS: 24 / FAIL: 0 / FLAG: 1 (VPS AI deploy pending)
```

| Severity | Count | REQ-IDs | Notes |
|---|---|---|---|
| PASS | 22 | REQ-0001, REQ-0024…0028, REQ-0031, REQ-0032 | lint/typecheck/test(51)/build · AI fit chip · react-markdown · Framer Motion badge · PDF parser · Skill Gap · Salary Intel |
| FLAG | 1 | REQ-0027 | Coolify AI backend + ARQ worker + Ollama not deployed yet |
| FAIL | 0 | — | — |

## EVAL-0014 Evidence (Phase 3 partial — 2026-06-28)

| Check | Result | Notes |
|---|---|---|
| lint | PASS | 0 warnings |
| typecheck | PASS | 0 errors |
| test | PASS 51/51 | Vitest |
| build | PASS | all routes ƒ dynamic |
| AIFitChip on JobCard | PASS | getCachedJobs include aiInsight · no extra query · auto-busts via saveAIInsightAction |
| react-markdown in AiInsightsPanel | PASS | cover letter + summary rendered with remark-gfm |
| Framer Motion badge | PASS | AnimatePresence mode=wait on JobEnrichmentBadge |
| README Clerk→NextAuth | PASS | title/badge/auth/env/checklist all updated |
| resume PDF parser | PASS | pdfjs-dist legacy/build · Node.js no-worker · 5MB limit · upsert UserProfile |
| ResumeUpload component | PASS | drag-drop + invalidates userProfile() on success |
| skill-gap.ts | PASS | COMMON_SKILLS module-level · computeSkillGap static import in actions |
| getSkillGapAction | PASS | Bluedoor desc fetch + fallback to position+company · auth gate |
| SkillGapTab | PASS | isLoading/isError/null/data states · staleTime 5min |
| skill gap tab wired | PASS | job-detail-panels.tsx 3rd tab · BookOpen icon |
| getSalaryIntelligenceAction | PASS | min/max avg · currency majority vote · byRole top-5 by avgMax |
| SalaryIntelligence component | PASS | isLoading/isError/null/data · KPI row + role bars |
| salary intel SSR prefetch | PASS | /stats page parallel prefetch · queryKeys.salaryIntel() |
| salaryIntel invalidation | PASS | invalidateAllJobQueries adds salaryIntel() bust |
| persist scope unchanged | PASS | salary-intel + skill-gap NOT in shouldPersistQuery |
| dead code | PASS | no unused imports, no console.log in new files |
| COMMON_SKILLS placement | PASS | module-level const (fixed from inside function) |

## EVAL-0012 Evidence (Deep Audit — 2026-06-27)

| Check | Result | Notes |
|---|---|---|
| lint | PASS | 0 warnings |
| typecheck | PASS | 0 errors |
| test | PASS 49/49 | Vitest |
| **middleware.ts fix** | **FIXED** | `proxy.ts` was misnamed → Next.js never loaded Clerk gate; renamed to `middleware.ts` |
| dead JSDoc removed | PASS | Multi-line comment removed from `EditJobDialogPage` per CLAUDE.md policy |
| sentry.edge comment | PASS | Updated comment to reference `middleware.ts` |
| console.log | PASS | Only in scripts/ + error handlers — all legitimate |
| AiInsightsPanel imports | PASS | Used in 2 correct places (job-detail-panels + discover-job-details-modal) |
| enrichJobAction | PASS | Exported but not yet wired to UI button — intentional (manual trigger placeholder) |
| query key coverage | PASS | jobs/stats/charts/chartsWeekly/job/discover.events/ai — all mapped in query-keys.ts |
| persist scope | PASS | Only jobs/stats/charts/charts-weekly/job persisted; discover + ai excluded |
| invalidation coverage | PASS | onSuccess+broadcast + onSettled+no-broadcast on all 3 mutations |
| SSE bus | PASS | In-memory + Redis fallback; multiplexes invalidate+notify correctly |
| BroadcastChannel relay | PASS | useJobsCacheSync → NOTIFICATIONS_CHANNEL → NotificationsProvider |
| Bluedoor client | PASS | getJobEvents() + getJobDetail() + searchJobs() + parseAtsKey() all correct |
| enrich.ts | PASS | publishNotification + sendPostingChangeEmail wired in resyncJob |
| webhook HMAC | PASS | timingSafeEqual; graceful skip when secret absent |
| cron batch | PASS | 10-per-batch, 150ms gap, oldest-first sort |
| AI proxy route | PASS | Clerk auth + AiServiceError mapping + AbortError → 504 |

## EVAL-0011 Evidence (Phase 1+2 + Posting Activity tab)

| Check | Result | Notes |
|---|---|---|
| lint | PASS | 0 warnings |
| typecheck | PASS | 0 errors |
| test | PASS 49/49 | Vitest |
| AiInsightsPanel wired | PASS | `JobDetailPanels` `/dashboard/[id]`; `AiInsightsPanel` in Discover Details modal |
| Posting Activity tab | PASS | `getJobEvents()` client + `getBluedoorJobEventsAction` + `PostingActivityTab` + `JobDetailPanels` tabs |
| `discover.events` query key | PASS | Added to `lib/query-keys.ts` |
| no console.log | PASS | grep returned 0 results |
| dead code | PASS | `AiInsightsPanel` import removed from `EditJobDialogPage` (replaced by `JobDetailPanels`) |

## EVAL-0010 Evidence (Phase 1+2 deep audit)

| Check | Result | Notes |
|---|---|---|
| lint | PASS | 0 warnings |
| typecheck | PASS | 0 errors |
| test | PASS 49/49 | Vitest |
| build | PASS | routes: `/api/ai/pipeline`, `/api/bluedoor/webhook`, `/api/cron/enrich`, `/api/jobs/events`, `/api/monitoring` |
| SSE notification bus | PASS | `lib/jobs-events.ts` invalidate+notify; `/api/jobs/events` multiplexes both |
| publishNotification wired | PASS | `enrich.ts` resyncJob now calls `publishNotification` + `sendPostingChangeEmail` |
| BroadcastChannel relay | PASS | `useJobsCacheSync` → `NOTIFICATIONS_CHANNEL` → `NotificationsProvider` |
| Discover cursor pagination | PASS | `useInfiniteQuery` + `prefetchInfiniteQuery` via shared factory |
| Details modal | PASS | on-demand `useQuery` with staleTime 5min |
| Resend email | PASS | graceful no-op; lazy import; Clerk email lookup |
| Python service | PASS | FastAPI + 9 agents + LLM router; pytest 3/3 with mocked synthesizer |
| AI proxy route | PASS | Clerk auth + AiServiceError mapping + 30s timeout |

## Prior Evidence

EVAL-0009 @ local Phase 1+2 scaffold — PASS 49/49  
EVAL-0006 @ `1a1bec0` baseline — PASS 49/49

## EvalGate (Gate 2)

```
eval_gate_status: NOT_RUN
eval_results_ref: .agile-v/EVAL_RESULTS.md
```

## Gate Recommendation

**Gate 1:** PENDING (commit ready) · **Gate 2:** NOT_READY (needs production deploy)
