# Change Log — Append Only

<!-- CR-XXXX format | Flow: Req Architect → Logic Gatekeeper → Human Gate 1 -->

| CR-ID | Cycle | Affected REQ | Change | Rationale | Impact (ART/TC) | Requested By | Status |
|---|---|---|---|---|---|---|---|
| — | — | — | No change requests yet | C1 bootstrap | — | — | — |
| UI-2026-06-11 | C1 | REQ-0013, REQ-0023 | Landing + custom auth UI shipped | User UI session | ART-0031…0035 | Agent | Done `f660eb9` |
| UI-2026-06-12 | C1 | REQ-0012, REQ-0019 | NavShell + dashboard/auth nav unification | UI extension | ART-0041…0044 | Agent | Done `be950be` |
| UI-2026-06-13a | C1 | REQ-0020 | Prisma Task/Tour/Token removed; Job indexes | Schema cleanup | ART-0007 | Agent | Done `998d3a5` |
| UI-2026-06-13b | C1 | REQ-0001, REQ-0014 | Sonner + sign-in preview + auth toasts | UX polish | ART-0045…0048 | Agent | Done `8ac2e6d` |
| UI-2026-06-13c | C1 | REQ-0014, REQ-0013 | Instant shells; remove loading.tsx; auth toast fix | Perf UX | ART-0049…0050 | Agent | Done `cc72b0b` |
| UI-2026-06-13d | C1 | REQ-0003, REQ-0014 | Dashboard jobs split + useJobsListQuery | Perf UX | ART-0051…0054 | Agent | Done `4efaf37` |
| UI-2026-06-16a | C1 | REQ-0003, REQ-0012, REQ-0014 | Dashboard redesign + optimistic portfolio stats | Dashboard UX | ART-0055+ | Agent | Done `4914d29` |
| UI-2026-06-16b | C1 | REQ-0014, REQ-0012 | Shell skeletons + filter layout UX | Loading UX | — | Agent | Done `93cddf6` |
| UI-2026-06-16c | C1 | REQ-0014, REQ-0015, REQ-0019 | SSR hydrate + persist + body loading + nav avatar | Cache perf | — | Agent | Done `37f8525` |
| UI-2026-06-16d | C1 | REQ-0015 | onSettled invalidateAllJobQueries choke-point | Invalidation | — | Agent | Done `66bc670` |

## Change Request Template

```
CR-XXXX | Cycle: CN | REQ: REQ-XXXX
Change: [description]
Rationale: [why]
Impact: ART-XXXX, TC-XXXX
Requested by: [name/role]
Approved: Pending / Approved / Rejected
```
