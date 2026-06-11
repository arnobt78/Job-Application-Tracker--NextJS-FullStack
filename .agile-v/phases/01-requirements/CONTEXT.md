# Phase 01 Context — Requirements C1

## Project Snapshot

- **App:** Jobify job tracker (Next.js 14 + Clerk + Prisma + PostgreSQL)
- **State:** Production-ready, deployed to Vercel
- **Live:** https://jobify-tracker.vercel.app/

## Key Files (paths only — read in agent context)

- `proxy.ts` — route protection
- `utils/actions.ts` — server actions (CRUD, stats, export)
- `prisma/schema.prisma` — Job model + legacy models
- `components/` — UI layer
- `app/(dashboard)/` — protected pages

## Constraints

- Auth: Clerk (not NextAuth)
- No automated tests currently
- Schema has unused Task/Tour/Token models

## Human Gate 1 Blocker

INT-0001 pending — see CHECKPOINTS.md
