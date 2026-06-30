# Decision Log — Append Only

<!-- Cycle-tagged entries — never overwrite -->

| Timestamp | Agent | Cycle | Decision | Rationale | Linked REQ |
|---|---|---|---|---|---|
| 2026-06-11T10:25:44Z | AQMS Bootstrap | C1 | Initialize `.agile-v/` for Jobify | No prior Agile V state existed; user requested C1 bootstrap with Infinity Loop activation | REQ-0001…REQ-0018 |
| 2026-06-11T10:25:44Z | Requirement Architect | C1 | Retroactive baseline capture | App is production-ready; REQs derived from README + codebase audit rather than greenfield Stage 1 | REQ-0001…REQ-0018 |
| 2026-06-11T10:25:44Z | Logic Gatekeeper | C1 | Defer Gate 1 to Human | Baseline REQs need human confirmation before Stage 2 validation proceeds | — |
| 2026-06-11T10:25:44Z | Build Agent (JS) | C1 | Primary domain skill = build-agent-js | Next.js 14 + TypeScript + Clerk + Prisma stack | REQ-0015, REQ-0016 |
| 2026-06-11T10:25:44Z | Compliance Auditor | C1 | Non-regulated signature method | ISO 9001-aligned design phase; APPROVALS.md name + timestamp sufficient | — |
| 2026-06-11T10:25:44Z | Product Owner | C1 | Queue REQ-0019…REQ-0022 for C2 | Auth UI guide in docs/ targets NextAuth; app uses Clerk — extension needs scoped CR | REQ-0019 |
| 2026-06-11T16:30:00Z | Build Agent (JS) | C1 | Custom SignUpForm over Clerk `<SignUp />` | Match SignInForm sky GlassCard; hide Clerk footer/branding | REQ-0001 |
| 2026-06-11T16:30:00Z | Build Agent (JS) | C1 | Landing chrome `h-14` no py | Navbar/footer vertical center via flex not padding | REQ-0013 |
| 2026-06-11T16:30:00Z | Build Agent (JS) | C1 | UI work isolated from data layer | No changes to invalidate-jobs, useJobsMutation, SSE route | REQ-0015 |
| 2026-06-12T12:58:22Z | AQMS Orchestrator | C1 | Reactivate Agile V session; 24 skills ACTIVE; resume INT-0002 BL-0006 | C1 bootstrap complete; Gate 1 still pending | — |
| 2026-06-12T21:00:00Z | Build Agent (JS) | C1 | Unified NavShell for landing/auth/dashboard | Single h-14 chrome; DRY nav pattern | REQ-0012 |
| 2026-06-12T21:31:53Z | AQMS Orchestrator | C1 | INT-0002 resolved; INT-0003 active for user-driven work | BL-0006 complete at be950be | BL-0007 |
| 2026-06-13T00:00:00Z | Build Agent (JS) | C1 | Sonner replaces Radix toast; localStorage auth toast flags | Post-redirect toasts survive Clerk sign-out | REQ-0014 |
| 2026-06-13T00:30:00Z | Build Agent (JS) | C1 | Route-gated welcome/goodbye; single logout redirect | Avoid double navigation flash | REQ-0014 |
| 2026-06-13T00:45:00Z | Build Agent (JS) | C1 | `void prefetchQuery` + remove all `loading.tsx` | Instant static shell in page.tsx | REQ-0014 |
| 2026-06-13T01:00:00Z | Build Agent (JS) | C1 | Split JobsList → jobs-count/grid/pagination + shared hook | Match stats instant-shell pattern | REQ-0003, REQ-0014 |
| 2026-06-13T01:10:00Z | AQMS Orchestrator | C1 | Session pause @ `4efaf37`; sync .agile-v for tomorrow | BL-0007 active; BL-0002 done | — |
| 2026-06-13T23:22:00Z | AQMS Orchestrator | C1 | Infinity Loop reactivated @ `a4763f4`; 24 skills ACTIVE | EVAL-0003 PASS; INT-0003 continues | BL-0007 |
| 2026-06-14T12:56:00Z | AQMS Orchestrator | C1 | Infinity Loop reactivated @ `fd6f20c`; sync all `.agile-v/` | Glass filters committed; EVAL-0004 PASS 29/29 tests | BL-0007 |
| 2026-06-14T13:11:00Z | Build Agent (JS) | C1 | Fix GlassDropdownRadioItem custom-children layout | Empty label span no longer steals flex width on open menu | REQ-0001, REQ-0023 |
| 2026-06-14T13:11:00Z | Build Agent (JS) | C1 | Auth CTA icons: Send, Sparkles, Loader2 on demo | Parity with sign-in loading pattern | REQ-0014, REQ-0013 |
| 2026-06-14T13:34:00Z | Build Agent (JS) | C1 | modal=false dropdowns/dialogs + overlay scrollbar | Prevent scrollbar hide layout shift | REQ-0014, REQ-0003 |
| 2026-06-14T13:34:00Z | Build Agent (JS) | C1 | GlassDialogContent 90vh + stacked job forms | Dialog UX without main-page shift | REQ-0012, REQ-0014 |
| 2026-06-16T12:46:37Z | AQMS Orchestrator | C1 | Resume and re-activate Agile V Infinity Loop from INT-0003 | User requested `/agile-v-core` continuation and full process readiness | REQ-0024 |
| 2026-06-16T12:46:37Z | Requirement Architect | C1 | Add governance requirement for persistent Agile V traceability | Formalize always-on process behavior with auditable acceptance criteria | REQ-0024 |
| 2026-06-16T13:00:00Z | Documentation Agent | C1 | Create `.agile-v/PLAYBOOK.md` one-command operating guide | User requested faster session startup with task routing and file map | REQ-0024 |
| 2026-06-16T14:31:00Z | Build Agent (JS) | C1 | Dashboard UI redesign — section headers, clear filters, results toolbar, pagination fix | User plan: REQ-0003/0012/0014 dashboard polish | REQ-0003, REQ-0012, REQ-0014 |
| 2026-06-16T15:41:00Z | Build Agent (JS) | C1 | Extract stats-optimistic lib; full portfolio bumps on CRUD | Status+mode+total instant updates; README sync | REQ-0014, REQ-0015 |
| 2026-06-16T16:57:00Z | Build Agent (JS) | C1 | Dashboard skeleton UX — shell cards, breakdown icons, clear filter layout | keepPreviousData; no block skeleton flash | REQ-0014, REQ-0012 |
| 2026-06-16T18:00:00Z | Build Agent (JS) | C1 | SSR cache track: await prefetch, useQueryBodyLoading, PersistQueryClient, nav SSR avatar | Calendar-appointment pattern; no refresh skeleton flash | REQ-0014, REQ-0015, REQ-0019 |
| 2026-06-16T18:15:00Z | Build Agent (JS) | C1 | onSettled uses invalidateAllJobQueries (filterOptions + job detail) broadcast:false | Single invalidation choke-point on all CRUD paths | REQ-0015 |
| 2026-06-16T18:30:00Z | AQMS Orchestrator | C1 | Session pause @ `280e284`; sync `.agile-v/` for tomorrow | INT-0003 active; EVAL-0005 PASS 49/49 | BL-0007 |
| 2026-06-18T23:55:00Z | AQMS Orchestrator | C1 | Infinity Loop reactivated @ `1a1bec0`; full `.agile-v/` sync | User requested `/agile-v-core` bootstrap + 24 skills ACTIVE | REQ-0024 |
| 2026-06-18T23:55:00Z | Red Team Verifier | C1 | EVAL-0006 PASS — lint/typecheck/test(49)/build @ `1a1bec0` | Baseline verification before dev continuation | REQ-0024 |
| 2026-06-19T10:00:00Z | Product Owner | C1 | Architecture Phase C: Phase 1 Next.js Bluedoor, Phase 2 Python/Coolify AI | User chose phased approach; avoid premature microservices | REQ-0025, REQ-0027 |
| 2026-06-19T10:00:00Z | Requirement Architect | C1 | Add REQ-0025 enrichment, REQ-0026 discover, REQ-0027 Phase 2 AI | Sam Crombie Bluedoor outreach + v2 vision | REQ-0025…0027 |
| 2026-06-19T10:00:00Z | Build Agent (JS) | C1 | Phase 1 Bluedoor: schema, lib, discover UI, webhook, cron | Enrichment not job-board pivot; human-in-the-loop tracker | REQ-0025, REQ-0026 |
| 2026-06-19T17:00:00Z | Documentation Agent | C1 | Sync CLAUDE.md, PROJECT_WALKTHROUGH, .agile-v for Phase 1 | Agent memory + Agile V traceability | REQ-0024, REQ-0025 |
| 2026-06-27T12:00:00Z | AQMS Orchestrator | C1 | Infinity Loop reactivated; full `.agile-v/` sync from codebase audit | User `/agile-v-core`; continue INT-0003; Phase 1 ~92% + Phase 2 scaffold | REQ-0024 |
| 2026-06-27T12:00:00Z | Requirement Architect | C1 | Add REQ-0028 stats overhaul, REQ-0029 notifications; update REQ-0027 to scaffolded [C1] | Retroactive capture from shipped work + docs audit | REQ-0028, REQ-0029, REQ-0027 |
| 2026-06-27T12:00:00Z | Product Owner | C1 | BL-0008 → COMMITTED; add BL-0010 Phase 1 gaps | Facets, webhook subscribe, digest, logos remain | BL-0010 |
| 2026-06-27T12:00:00Z | Red Team Verifier | C1 | EVAL-0013 PASS — lint/typecheck/test(49) @ `0f2ea55` | Governance reactivation verification | REQ-0024 |
| 2026-06-28T00:00:00Z | Build Agent (JS) | C1 | Phase 3 partial: AI fit chip, react-markdown, Framer Motion, PDF parser, Skill Gap, Salary Intel | User plan approval; production-readiness sprint | REQ-0027, REQ-0028, REQ-0031, REQ-0032 |
| 2026-06-28T00:00:00Z | Build Agent (JS) | C1 | COMMON_SKILLS module-level (not inside function) | Performance: avoid array re-allocation per computeSkillGap call | REQ-0032 |
| 2026-06-28T00:00:00Z | Build Agent (JS) | C1 | computeSkillGap static import (not dynamic) | No heavy deps unlike pdfjs — consistency and tree-shaking | REQ-0032 |
| 2026-06-28T00:00:00Z | Build Agent (JS) | C1 | salaryIntel NOT in persist scope; invalidated client-side via invalidateAllJobQueries | Matches architecture rule: only jobs/stats/charts/job(id) persisted | REQ-0028 |
| 2026-06-28T00:00:00Z | Red Team Verifier | C1 | EVAL-0014 PASS — lint/typecheck/test(51)/build @ HEAD | Phase 3 partial full audit | REQ-0024 |
| 2026-06-28T20:30:00Z | AQMS Orchestrator | C1 | Infinity Loop reactivate; full `.agile-v/` sync; BL-0011 WIP halt until typecheck PASS | Session limit left WIP broken; do not commit BL-0011 | REQ-0024, REQ-0033 |
| 2026-06-28T20:30:00Z | Requirement Architect | C1 | Add REQ-0031 (shipped), REQ-0033 (WIP); update REQ-0027 to implemented | Retroactive traceability | REQ-0031, REQ-0033 |
| 2026-06-29T00:00:00Z | Build Agent (JS) | C1 | `prisma db push` instead of `prisma migrate dev` | Remote DB user lacks CREATE DATABASE permission → shadow DB fails; db push syncs schema without migration history | REQ-0033 |
| 2026-06-29T00:00:00Z | Build Agent (JS) | C1 | Explicit `LLMSkillGapResult` cast in skill-gap-tab.tsx | TypeScript intersection bug with ternary union of two different `UseQueryResult<T>` types — `as LLMSkillGapResult` + explicit annotation resolves without changing runtime | REQ-0033 |
| 2026-06-30T11:35:00Z | AQMS Orchestrator | C1 | Infinity Loop reactivate @ `3551f1e`; BL-0011 closed; sprint focus BL-0009 VPS | Pre-deploy bootstrap; all code gates PASS | REQ-0024, REQ-0027 |
