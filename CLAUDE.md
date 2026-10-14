# CLAUDE.md

## Project Overview

Project Name:
Description:

Current Status:
Current Agile V Cycle:
Current Gate:

---

## Tech Stack

Frontend:
Backend:
Database:
Authentication:
Infrastructure:
Deployment:
Testing:

---

## Architecture

Follow the existing project architecture.

Do not introduce new architectural patterns unless explicitly approved.

Preserve:

- folder structure
- naming conventions
- reusable components
- reusable hooks
- reusable libs
- reusable utilities
- reusable types
- reusable services

Prefer extending existing implementations instead of creating parallel ones.

---

## Rendering Rules

Prefer server-first architecture.

Server components:

- authentication
- metadata
- initial data loading
- layouts
- page shells
- stable UI

Client components:

- interactivity
- forms
- mutations
- dialogs
- browser APIs

Never convert an entire page into a client component because one section is interactive.

---

## State Management

Single source of truth.

Avoid duplicated state.

Prefer the project's established query/cache strategy.

Do not duplicate:

- query keys
- mutation logic
- API calls
- schemas

---

## Coding Rules

Always:

- TypeScript strict
- reusable code
- readable code
- maintainable code
- scalable code
- production-ready code

Avoid:

- duplicated code
- dead code
- commented-out code
- unnecessary abstractions
- unrelated refactoring

---

## Validation

Before considering work complete:

- typecheck
- lint
- tests
- build

Record validation results in:

.agile-v/VALIDATION_SUMMARY.md

---

## Project Memory

Current project state is stored in:

.agile-v/

Always resume from:

.agile-v/STATE.md

---

## Documentation

Update only affected files.

Never duplicate information across:

- CLAUDE.md
- AGENTS.md
- .agile-v/\*
- docs/

---

## Session Workflow

Before coding:

1. Analyze
2. Plan
3. Wait for approval

After approval:

1. Implement
2. Validate
3. Update project memory
4. Write resume point

---

## Resume

Always continue from

.agile-v/STATE.md

unless instructed otherwise.
