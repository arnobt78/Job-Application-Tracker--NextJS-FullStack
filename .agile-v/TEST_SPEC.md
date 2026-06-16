# Test Specification — Cycle C1

<!-- TC-XXXX [Cn] origin cycle | Test Designer owns this file -->

| TC-ID | Cycle | REQ-ID | Title | Type | Priority | Status |
|---|---|---|---|---|---|---|
| TC-0001 | C1 | REQ-0001 | Sign-in redirects to dashboard | Manual/E2E | CRITICAL | Pending |
| TC-0002 | C1 | REQ-0009 | Unauthenticated access to /jobs redirects | Manual/E2E | CRITICAL | Pending |
| TC-0003 | C1 | REQ-0002 | Create job persists to DB | Integration | CRITICAL | Pending |
| TC-0004 | C1 | REQ-0002 | Job list shows user jobs only | Integration | CRITICAL | Pending |
| TC-0005 | C1 | REQ-0002 | Edit job updates fields | Integration | HIGH | Pending |
| TC-0006 | C1 | REQ-0002 | Delete job removes record | Integration | HIGH | Pending |
| TC-0007 | C1 | REQ-0011 | Cross-user job access denied | Security | CRITICAL | Pending |
| TC-0008 | C1 | REQ-0003 | Search by position filters results | Integration | HIGH | Pending |
| TC-0009 | C1 | REQ-0003 | Status filter returns matching jobs | Integration | HIGH | Pending |
| TC-0010 | C1 | REQ-0004 | Pagination returns correct page | Integration | MEDIUM | Pending |
| TC-0011 | C1 | REQ-0005 | Stats counts match DB groupBy | Integration | HIGH | Pending |
| TC-0012 | C1 | REQ-0006 | Chart shows 6-month data | Integration | MEDIUM | Pending |
| TC-0013 | C1 | REQ-0007 | CSV export downloads valid file | Manual | MEDIUM | Pending |
| TC-0014 | C1 | REQ-0007 | Excel export has summary header | Manual | MEDIUM | Pending |
| TC-0015 | C1 | REQ-0008 | Theme toggle switches mode | Manual | LOW | Pending |
| TC-0016 | C1 | REQ-0010 | Invalid form rejected by Zod | Unit | HIGH | Pending |
| TC-0017 | C1 | REQ-0011 | updateJobAction rejects wrong clerkId | Unit/Integration | CRITICAL | Pending |
| TC-0018 | C1 | REQ-0012 | Layout responsive at 375px width | Visual | MEDIUM | Pending |
| TC-0019 | C1 | REQ-0013 | Landing page renders without auth | Manual | MEDIUM | Pending |
| TC-0020 | C1 | REQ-0014 | Loading skeleton visible during fetch | Manual | MEDIUM | Pending |
| TC-0021 | C1 | REQ-0015 | HydrationBoundary prevents double fetch | Integration | HIGH | Pending |
| TC-0022 | C1 | REQ-0016 | prisma generate + migrate succeed | CI | CRITICAL | Pending |
| TC-0023 | C1 | REQ-0017 | npm run build exits 0 | CI | CRITICAL | Pending |
| TC-0024 | C1 | REQ-0018 | db:inspect script runs without error | Manual | LOW | Pending |
| TC-0025 | C1 | REQ-0024 | Agile V governance docs remain synchronized and append-only | Process Audit | HIGH | In Progress |

## Regression Baseline

On C2+, unchanged REQs inherit TC-0001…TC-0025 as regression suite per agile-v-lifecycle.

## Quality Gates (Test Designer)

- [ ] Tests verify external behavior (consumer experience)
- [ ] Realistic data types (strings from forms/CSV)
- [ ] Negative tests included (TC-0007, TC-0016, TC-0017)
- [ ] No self-verification by Build Agent

## Automation Gap

REQ-0021 (C2 backlog) addresses missing automated test runner. Current TCs are specification-only.
