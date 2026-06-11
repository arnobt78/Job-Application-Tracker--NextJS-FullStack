# Agile V Skills Registry — 24 Active Skills

<!-- Load agile-v-core FIRST on every session | Apply SCOPE-V on every task -->

## Activation Status: ACTIVE (C1)

All skills below are registered for this project. Orchestrator loads framework skills + role-appropriate agent skills per task.

---

## Framework Skills (6)

| # | Skill | Path | V-Position | Load When |
|---|---|---|---|---|
| 1 | **agile-v-core** | `~/.cursor/skills/agile-v-core/SKILL.md` | All | **Every session — FIRST** |
| 2 | **agile-v-pipeline** | `~/.cursor/skills/agile-v-pipeline/SKILL.md` | Orchestrator | Stage transitions, waves, handoffs |
| 3 | **agile-v-lifecycle** | `~/.cursor/skills/agile-v-lifecycle/SKILL.md` | Orchestrator | C2+, CRs, archival, re-entry |
| 4 | **agile-v-compliance** | `~/.cursor/skills/agile-v-compliance/SKILL.md` | Right + Observe | Gates, CAPA, risk, approvals |
| 5 | **agile-v-quality-gates** | `~/.cursor/skills/agile-v-quality-gates/SKILL.md` | All Build/Verify | Implementation + test design |
| 6 | **agile-v-product-owner** | `~/.cursor/skills/agile-v-product-owner/SKILL.md` | Apex | Backlog, sprint, BL-XXXX → REQ |

---

## Left V — Decomposition Agents (5)

| # | Skill | Path | SCOPE-V Phases | Load When |
|---|---|---|---|---|
| 7 | **requirement-architect** | `~/.cursor/skills/requirement-architect/SKILL.md` | Specify | New features, REQ authoring |
| 8 | **discovery-analyst** | `~/.cursor/skills/discovery-analyst/SKILL.md` | Specify | Messy inputs → hypotheses |
| 9 | **logic-gatekeeper** | `~/.cursor/skills/logic-gatekeeper/SKILL.md` | Constrain | REQ validation, Gate 1 prep |
| 10 | **threat-modeler** | `~/.cursor/skills/threat-modeler/SKILL.md` | Specify | Security/privacy REQs (STRIDE) |
| 11 | **ux-spec-author** | `~/.cursor/skills/ux-spec-author/SKILL.md` | Specify | UX flows, a11y constraints |

---

## Apex — Synthesis Agents (8)

| # | Skill | Path | SCOPE-V Phases | Load When |
|---|---|---|---|---|
| 12 | **build-agent** | `~/.cursor/skills/build-agent/SKILL.md` | Orchestrate, Prove | Generic artifact synthesis |
| 13 | **build-agent-js** ⭐ | `~/.cursor/skills/build-agent-js/SKILL.md` | Orchestrate, Prove | **Primary for this project** |
| 14 | **build-agent-python** | `~/.cursor/skills/build-agent-python/SKILL.md` | Orchestrate | Python backends/scripts |
| 15 | **build-agent-nestjs** | `~/.cursor/skills/build-agent-nestjs/SKILL.md` | Orchestrate | NestJS APIs |
| 16 | **build-agent-embedded** | `~/.cursor/skills/build-agent-embedded/SKILL.md` | Orchestrate | Firmware/C++ |
| 17 | **build-agent-dart** | `~/.cursor/skills/build-agent-dart/SKILL.md` | Orchestrate | Flutter/Dart |
| 18 | **test-designer** | `~/.cursor/skills/test-designer/SKILL.md` | Orchestrate, Prove | TEST_SPEC.md, TC-XXXX |
| 19 | **schematic-generator** | `~/.cursor/skills/schematic-generator/SKILL.md` | Orchestrate | Hardware/HDL (N/A this project) |

---

## Right V — Verification & Compliance Agents (5)

| # | Skill | Path | SCOPE-V Phases | Load When |
|---|---|---|---|---|
| 20 | **red-team-verifier** | `~/.cursor/skills/red-team-verifier/SKILL.md` | Verify | Independent verification |
| 21 | **compliance-auditor** | `~/.cursor/skills/compliance-auditor/SKILL.md` | Verify, Evolve | Decision log, ATM, gates |
| 22 | **documentation-agent** | `~/.cursor/skills/documentation-agent/SKILL.md` | Prove | Docs suite generation |
| 23 | **observability-planner** | `~/.cursor/skills/observability-planner/SKILL.md` | Prove | Metrics, alerts (REQ-0022) |
| 24 | **release-manager** | `~/.cursor/skills/release-manager/SKILL.md` | Verify | Gate 2, rollout, rollback |

---

## Session Protocol (Every Prompt)

```
1. READ  .agile-v/STATE.md + CHECKPOINTS.md
2. LOAD  agile-v-core (+ pipeline/lifecycle/compliance as needed)
3. MAP   User request → REQ-XXXX (halt if none)
4. APPLY SCOPE-V: Specify → Constrain → Orchestrate → Prove → Evolve → Verify
5. LOG   DECISION_LOG.md + TRACE_LOG.md (write-through)
6. STOP  at Human Gates (Gate 1, Gate 2)
7. USE   build-agent-js for code changes in this repo
8. RUN   quality gates before claiming complete
9. NEVER self-verify — Red Team protocol
```

## Skill Load Order by Task Type

| Task | Skills |
|---|---|
| Bug fix | core → quality-gates → build-agent-js → red-team-verifier |
| New feature | core → pipeline → requirement-architect → logic-gatekeeper → build-agent-js → test-designer → red-team-verifier |
| Error/issue | core → systematic-debugging → build-agent-js → red-team-verifier |
| Gate review | core → compliance → validation summary |
| C2 planning | core → lifecycle → product-owner |

⭐ = Primary domain skill for Jobify
