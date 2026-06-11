# Risk Register — Append Only

| RISK-ID | Cycle | Category | Description | Likelihood | Impact | Severity | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|---|---|---|
| RISK-0001 | C1 | Technical | Prisma schema contains unused models (Task, Tour, Token) not tied to Jobify features | Medium | Low | Low | REQ-0020 schema cleanup in C2; document in DECISION_LOG | Build Agent | Open |
| RISK-0002 | C1 | Process | No automated test suite — verification relies on manual audit | High | Medium | High | REQ-0021 automated tests in C2; Red Team manual baseline audit for C1 | Test Designer | Open |
| RISK-0003 | C1 | Security | Clerk keys in .env.local — must never commit | Low | High | Medium | .gitignore enforced; compliance review at Gate 2 | Compliance Auditor | Mitigated |
| RISK-0004 | C1 | Technical | docs/AUTH_UI_IMPLEMENTATION_GUIDE.md references NextAuth; app uses Clerk — confusion risk | Medium | Low | Low | Mark guide as reference-only or adapt for Clerk in C2 (REQ-0019) | Product Owner | Open |

## Severity Matrix Reference

Critical = High × High | High = High × Med | Medium = High × Low or Med × Med | Low = otherwise

## Gate 2 Blockers

RISK-0002 (High) requires documented acceptance or mitigation before Gate 2 approval.
