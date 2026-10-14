# Agile V State — Jobify

| Field | Value |
|---|---|
| **Cycle** | C1 |
| **Stage** | 3 Synthesis — P1 ✅ · P2 ✅ deploy · P3 ✅ · BL-0011…0015 ✅ · **BL-0016 intake OPEN** |
| **Status** | `ACTIVE` — Infinity Loop **ON** · awaiting user items for BL-0016 |
| **Checkpoint** | INT-0004 `c1-bl0016-intake-20261014` (Human-Decision, PENDING) |
| **Auth** | NextAuth v5 · `proxy.ts` (Next.js 16) |
| **Last Updated** | 2026-10-14 |
| **Git HEAD** | BL-0016 ISSUE-0001..0005 commit on `main` (parent `6c48ba4`) · working tree holds unstaged parallel edits |
| **Verify** | EVAL-0024 (2026-10-14, Node 24.21): lint ✓ · typecheck ✓ · test **69/69** ✓ · build ✓ · e2e 11 ✓ · browser CRUD ✓ · security ✓ · audit 7 high (RISK-0005 accepted) |

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
- **Human-Action:** Vercel Firewall custom **Bypass** rule for `/api/internal`, `/api/cron`, `/api/email/inbound`, `/api/bluedoor/webhook`, `/api/extension` (Bot Protection Challenge would otherwise block machine callers) · Project Node.js = 24.x · Sentry env vars (`NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`) in Production + Preview · optional Sentry Inbound Filters (browser extensions, legacy browsers, web crawlers)
- Local dev: `nvm use` (reads `.nvmrc`) before npm commands
- ISSUE-0001..0005 **committed** (session files only); parallel edits remain unstaged in working tree
- **Next exact action:** receive next BL-0016 item from user

## Recent (sync 2026-07-24)
- Infinity Loop reactivated @ `148a49f` — full `.agile-v/` sync
- UI polish committed: GlassFilterDropdown · 80vw dialog · page 7xl/9xl · scroll-shift · discover cold spinner
- BL-0013/0014 discover cache + 429 UX ✅ · BL-0009 VPS AI ✅ · BL-0011 Phase 3 ✅
- Vercel serves Next.js; Coolify VPS (redis/AI/ARQ) unchanged for UI-only commits

## Shipped
P1–P3 · Bluedoor enrich/discover · AI pipeline VPS · team/extension/email/ARQ · UI dialog/filter polish

## Backlog (next)
1. **Gate 1** INT-0001 — human approve REQ baseline
2. BL-0003 — E2E CI auth / Playwright
3. n8n templates deploy (`docs/n8n/`)
4. Optional: Ollama on VPS · Hetzner app migration (later)

## Architecture rules
`force-dynamic` · SSR prefetch · persist jobs/stats/charts/job only · `invalidateUserJobCaches`+SSE · Bluedoor API only · no self-verify (Red Team)

## Agent memory
`CLAUDE.md` · `docs/PROJECT_WALKTHROUGH.md` · `.agile-v/PLAYBOOK.md`
