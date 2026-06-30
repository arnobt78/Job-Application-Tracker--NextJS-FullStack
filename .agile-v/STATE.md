# Agile V State — Jobify

| Field | Value |
|---|---|
| **Cycle** | C1 |
| **Stage** | 3 Synthesis — P1 ✅ · P2 ~90% · P3 ✅ · BL-0011 ✅ · **BL-0009 ✅** |
| **Status** | `ACTIVE` — Infinity Loop **ON** |
| **Checkpoint** | INT-0003 `c1-dev-20260612` |
| **Auth** | NextAuth v5 · `proxy.ts` (Next.js 16) |
| **Last Updated** | 2026-06-30 |
| **Verify** | lint ✓ · typecheck ✓ · test **60/60** ✓ · build ✓ |

## Recent (2026-06-30)
- **UI polish:** dialog scroll-shift fix · page width 7xl/9xl · job form header/footer · `GlassFilterDropdown` parity · 80vw dialog · discover cold spinner only
- BL-0014 fix: Bluedoor 429 UX — toolbar shows "—" badge + rate-limit subtitle; results show correct message (not "No jobs found")
- BL-0014 fix: Bluedoor 429 rate limit on /discover — added `lib/bluedoor/discover-cache.ts` (unstable_cache 60s/300s); actions use cached wrappers
- BL-0013 fix: Redis SCAN miss → added default list key to fixedUserRedisKeys (RC-1)
- BL-0013 fix: after() double-invalidation SCAN race → revalidateUserJobsDataCache (RC-2)
- BL-0013 fix: idempotent track alreadyTracked flag + rollback + toast (RC-4)
- BL-0013 fix: debug log cleanup across 4 files + delete .cursor/debug-c5463b.log (RC-5)
- Test count 54→58 (new redis-invalidation assertions)
- Session sync: Agile V resumed @ `b41373c` (clean tree)

## Shipped
- P1–P3 code · BL-0011 · BL-0009 VPS · discover track idempotent w/ Bluedoor pre-seed

## Backlog
- Gate 1 · n8n deploy · E2E CI auth · Ollama on VPS (optional)

## Architecture rules
`force-dynamic` · SSR prefetch · persist jobs/stats/charts/job only · `invalidateUserJobCaches`+SSE · Bluedoor API only

## Agent memory
`CLAUDE.md` · `docs/PROJECT_WALKTHROUGH.md` · `.agile-v/PLAYBOOK.md`
