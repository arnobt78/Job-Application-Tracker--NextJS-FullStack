# Agile V State — Jobify

| Field | Value |
|---|---|
| **Cycle** | C1 |
| **Stage** | 3 Synthesis — P1 ✅ · P2 ✅ deploy · P3 ✅ · BL-0011…0014 ✅ · UI-2026-06-30c ✅ |
| **Status** | `ACTIVE` — Infinity Loop **ON** |
| **Checkpoint** | INT-0003 `c1-dev-20260612` |
| **Auth** | NextAuth v5 · `proxy.ts` (Next.js 16) |
| **Last Updated** | 2026-07-24 |
| **Git HEAD** | `148a49f` · `main` · clean |
| **Verify** | lint ✓ · typecheck ✓ · test **60/60** ✓ · build ✓ |

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
