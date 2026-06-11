# Build Manifest — Cycle C1

<!-- ART-XXXX.N suffix on revision | Maps requirements to code artifacts -->

| ART-ID | Cycle | Type | Path | REQ-IDs | Status |
|---|---|---|---|---|---|
| ART-0001 | C1 | Middleware | `middleware.ts` | REQ-0001, REQ-0009 | Baseline |
| ART-0002 | C1 | Page | `app/sign-in/[[...sign-in]]/page.tsx` | REQ-0001 | Baseline |
| ART-0003 | C1 | Page | `app/sign-up/[[...sign-up]]/page.tsx` | REQ-0001 | Baseline |
| ART-0004 | C1 | Server Actions | `utils/actions.ts` | REQ-0002, REQ-0003, REQ-0004, REQ-0011, REQ-0005, REQ-0006, REQ-0007 | Baseline |
| ART-0005 | C1 | Component | `components/CreateJobForm.tsx` | REQ-0002, REQ-0010 | Baseline |
| ART-0006 | C1 | Component | `components/EditJobForm.tsx` | REQ-0002, REQ-0010 | Baseline |
| ART-0007 | C1 | Schema | `prisma/schema.prisma` | REQ-0002, REQ-0016 | Baseline |
| ART-0008 | C1 | Component | `components/SearchForm.tsx` | REQ-0003 | Baseline |
| ART-0009 | C1 | Component | `components/JobsList.tsx` | REQ-0003, REQ-0015 | Baseline |
| ART-0010 | C1 | Component | `components/ButtonContainer.tsx` | REQ-0004 | Baseline |
| ART-0011 | C1 | Component | `components/StatsContainer.tsx` | REQ-0005 | Baseline |
| ART-0012 | C1 | Component | `components/StatsCard.tsx` | REQ-0005 | Baseline |
| ART-0013 | C1 | Component | `components/ChartsContainer.tsx` | REQ-0006 | Baseline |
| ART-0014 | C1 | Component | `components/DownloadDropdown.tsx` | REQ-0007 | Baseline |
| ART-0015 | C1 | Function | `getAllJobsForDownloadAction` in `utils/actions.ts` | REQ-0007 | Baseline |
| ART-0016 | C1 | Component | `components/ThemeToggle.tsx` | REQ-0008 | Baseline |
| ART-0017 | C1 | Provider | `components/theme-provider.tsx` | REQ-0008 | Baseline |
| ART-0018 | C1 | Types | `utils/types.ts` | REQ-0010 | Baseline |
| ART-0019 | C1 | Component | `components/Sidebar.tsx` | REQ-0012 | Baseline |
| ART-0020 | C1 | Component | `components/Navbar.tsx` | REQ-0012 | Baseline |
| ART-0021 | C1 | Layout | `app/(dashboard)/layout.tsx` | REQ-0012 | Baseline |
| ART-0022 | C1 | Page | `app/page.tsx` | REQ-0013 | Baseline |
| ART-0023 | C1 | Loading | `app/(dashboard)/jobs/loading.tsx`, `stats/loading.tsx` | REQ-0014 | Baseline |
| ART-0024 | C1 | UI | `components/ui/skeleton.tsx` | REQ-0014 | Baseline |
| ART-0025 | C1 | UI | `components/ui/toast.tsx`, `use-toast.ts`, `toaster.tsx` | REQ-0014 | Baseline |
| ART-0026 | C1 | Provider | `app/providers.tsx` | REQ-0015 | Baseline |
| ART-0027 | C1 | DB Client | `utils/db.ts` | REQ-0016 | Baseline |
| ART-0028 | C1 | Config | `package.json` | REQ-0017 | Baseline |
| ART-0029 | C1 | Docs | `README.md` | REQ-0017 | Baseline |
| ART-0030 | C1 | Scripts | `scripts/*.ts`, `prisma/seed.ts` | REQ-0018 | Baseline |

## Build Commands

```bash
npm run dev          # Development
npm run build        # Production build (includes prisma generate)
npm run lint         # ESLint
npm run db:seed      # Seed database
```

## Synthesis Notes (C1)

Baseline artifacts pre-exist. Future changes enter at Stage 3 (Synthesis) with delta ART revisions (e.g., ART-0004.2).
