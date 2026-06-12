# Job Tracking Application - Next.js, TypeScript, Clerk, Prisma, React Query, PostgreSQL FullStack Project

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748)](https://www.prisma.io/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.90-FF4154)](https://tanstack.com/query)
[![Clerk](https://img.shields.io/badge/Clerk-6.12-purple)](https://clerk.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1-6E9F18)](https://vitest.dev/)

A production-style, full-stack job application tracker built to teach modern web development patterns: App Router SSR, server actions, typed ORM access, optimistic UI, multi-layer caching, and secure authentication. Track applications, filter and search your pipeline, visualize trends, and export reports—all with a polished glassmorphic UI and dark mode support.

- **Live-Demo:** [https://jobify-tracker.vercel.app/](https://jobify-tracker.vercel.app/)

![Screenshot 2025-07-01 at 15 31 44](https://github.com/user-attachments/assets/48f21eef-d40c-4e44-a585-a6b3f2417ebf) ![Screenshot 2025-07-01 at 14 33 39](https://github.com/user-attachments/assets/29e151c8-2deb-4dcd-8856-febb4c043abf) ![Screenshot 2025-07-01 at 14 48 55](https://github.com/user-attachments/assets/bf1eb91e-3b92-40a8-b78f-83ac1157919f) ![Screenshot 2025-07-01 at 14 51 02](https://github.com/user-attachments/assets/e41cb629-a0f8-4301-b926-969bf3d78cc3)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture & Data Flow](#architecture--data-flow)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Project](#running-the-project)
- [Routes & Pages](#routes--pages)
- [API Endpoints](#api-endpoints)
- [Server Actions (Backend)](#server-actions-backend)
- [Authentication](#authentication)
- [State Management & Caching](#state-management--caching)
- [Components Guide](#components-guide)
- [Custom Hooks](#custom-hooks)
- [Code Examples](#code-examples)
- [Testing & Quality](#testing--quality)
- [Deployment](#deployment)
- [Keywords](#keywords)
- [Conclusion](#conclusion)
- [License](#license)

---

## Overview

Jobify helps job seekers **organize**, **track**, and **analyze** their job search in one place. Each authenticated user gets a private dashboard where they can:

- Add job applications (position, company, location, status, employment mode)
- Search and filter applications
- Edit or delete entries via glassmorphic dialogs
- View statistics and charts (pending, interview, declined)
- Export data as CSV or Excel

The app is built as a **learning-oriented full-stack reference**: server-rendered pages for fast first paint, client-side React Query for instant interactions, and Prisma + PostgreSQL for persistent storage.

---

## Features

### Core Functionality

| Feature             | Description                                         |
| ------------------- | --------------------------------------------------- |
| **CRUD**            | Create, read, update, delete job applications       |
| **Search**          | Filter by position or company name (URL-synced)     |
| **Status filter**   | `all`, `pending`, `interview`, `declined`           |
| **Pagination**      | Paginated job list for large datasets               |
| **Stats dashboard** | Count cards + 6-month trend charts                  |
| **Export**          | Download CSV/Excel with monthly grouping            |
| **Dialogs**         | Add/Edit jobs in modal dialogs (no page navigation) |

### User Experience

- **Clerk authentication** — email/password, OAuth, guest demo sign-in
- **Custom auth UI** — branded Sign In / Sign Up forms (no default Clerk chrome)
- **Dark / light / system theme** — via `next-themes`
- **Responsive layout** — mobile hamburger nav, grid cards on desktop
- **Loading skeletons** — consistent dimensions via `lib/ui/dimensions.ts`
- **Toast feedback** — success/error notifications
- **Form validation** — React Hook Form + Zod (client + server)

### Technical Highlights

- **SSR prefetch + hydration** — data ready on first paint
- **Optimistic mutations** — UI updates before server round-trip
- **Multi-layer cache** — `unstable_cache`, tags, optional Redis read-through
- **Cross-tab sync** — BroadcastChannel + SSE (`/api/jobs/events`)
- **Sentry integration** — optional error tracking with browser tunnel
- **Type-safe end-to-end** — TypeScript + Prisma + Zod

---

## Technology Stack

### Frontend

| Library             | Version | What it does                                                |
| ------------------- | ------- | ----------------------------------------------------------- |
| **Next.js**         | 16.x    | React framework with App Router, SSR, Server Actions        |
| **React**           | 19.x    | UI library with Server/Client Components                    |
| **TypeScript**      | 5.8.x   | Static typing across the codebase                           |
| **Tailwind CSS**    | 3.4.x   | Utility-first styling                                       |
| **shadcn/ui**       | —       | Accessible Radix-based components (Button, Dialog, Select…) |
| **Lucide React**    | —       | Icon set                                                    |
| **React Hook Form** | 7.x     | Form state with minimal re-renders                          |
| **Zod**             | 3.x     | Schema validation (shared client + server)                  |
| **Recharts**        | 2.x     | Stats page bar charts                                       |
| **next-themes**     | —       | Theme switching without flash                               |
| **TanStack Query**  | 5.x     | Server state, cache, optimistic updates                     |

### Backend & Data

| Library                    | Version  | What it does                                  |
| -------------------------- | -------- | --------------------------------------------- |
| **Next.js Server Actions** | —        | Type-safe server functions (`"use server"`)   |
| **Prisma**                 | 6.x      | ORM — type-safe DB queries and migrations     |
| **PostgreSQL**             | —        | Relational database for job records           |
| **Clerk**                  | 6.x      | Authentication, session, user identity        |
| **Upstash Redis**          | optional | Read-through cache + SSE invalidation streams |
| **exceljs / papaparse**    | —        | Excel/CSV export generation                   |
| **dayjs**                  | —        | Date formatting in exports                    |

### Dev & Quality

| Tool       | Purpose                                         |
| ---------- | ----------------------------------------------- |
| **Vitest** | Unit tests (`lib/__tests__`, `hooks/__tests__`) |
| **ESLint** | Linting (`eslint-config-next`)                  |
| **Sentry** | Optional production error monitoring            |

---

## Architecture & Data Flow

Understanding the flow is key to extending this project.

### Read path (SSR → client)

```text
page.tsx (force-dynamic)
  └─ prefetchQuery on server (QueryClient)
  └─ HydrationBoundary → dehydrate state
       └─ Client component (JobsList, StatsContainer…)
            └─ useQuery with same queryKey → instant data, no loading flash
                 └─ lib/jobs/queries.ts (unstable_cache + tags + optional Redis)
                      └─ Prisma → PostgreSQL
```

### Write path (mutation → invalidation)

```text
User action (CreateJobForm / DeleteJobButton)
  └─ useJobsMutation (optimistic UI patch)
       └─ Server Action (utils/actions.ts)
            └─ Prisma write
            └─ invalidateUserJobCaches(userId, jobId?)
                 ├─ revalidateTag / revalidatePath (Next cache)
                 ├─ Redis cache key delete (optional)
                 └─ publishInvalidation → SSE stream
                      └─ useJobsCacheSync → invalidateAllJobQueries (React Query)
```

### Why this pattern?

- **SSR prefetch** eliminates loading spinners on first visit
- **Optimistic updates** make the UI feel instant
- **Tag-based revalidation** keeps server cache correct after mutations
- **SSE + BroadcastChannel** keeps multiple tabs/instances in sync

---

## Project Structure

```bash
18-nextjs-jobify-app/
├── app/                              # Next.js App Router
│   ├── page.tsx                      # Landing page (/)
│   ├── layout.tsx                    # Root layout + providers
│   ├── providers.tsx                 # Theme + React Query providers
│   ├── error.tsx / global-error.tsx  # Error boundaries
│   ├── (dashboard)/                  # Authenticated area (route group)
│   │   ├── layout.tsx                # DashboardNav shell
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # /dashboard — jobs list + Add Job dialog
│   │   │   └── [id]/page.tsx         # /dashboard/[id] — edit dialog via URL
│   │   └── stats/
│   │       └── page.tsx              # /stats — analytics
│   ├── sign-in/[[...sign-in]]/       # Custom sign-in page
│   ├── sign-up/[[...sign-up]]/       # Custom sign-up page
│   ├── user-profile/[[...user-profile]]/
│   └── api/
│       ├── jobs/events/route.ts      # SSE invalidation stream
│       └── monitoring/route.ts       # Sentry browser tunnel
├── components/                       # React components
│   ├── layout/                       # NavShell, LandingNav, DashboardNav, hero…
│   ├── dialogs/                      # AddJobDialog, EditJobDialog
│   ├── pages/                        # HomePage, SignInPageContent…
│   ├── ui/                           # shadcn primitives + GlassCard, SafeImage…
│   ├── JobCard.tsx, JobsList.tsx     # Dashboard list UI
│   ├── CreateJobForm.tsx             # Add job form
│   ├── EditJobForm.tsx               # Edit job form
│   └── SignInForm.tsx, SignUpForm.tsx
├── hooks/
│   ├── useJobsMutation.ts            # Optimistic CRUD mutations
│   ├── useJobsCacheSync.ts           # SSE + BroadcastChannel sync
│   ├── useGuestSignIn.ts             # Demo account login
│   └── useSignUpForm.ts              # Custom sign-up flow
├── lib/
│   ├── jobs/queries.ts               # Cached Prisma reads
│   ├── invalidate-jobs.ts            # Client query invalidation
│   ├── invalidate-jobs-server.ts     # Server cache bust
│   ├── query-keys.ts                 # Canonical React Query keys
│   ├── cache-tags.ts                 # Next.js cache tags per user
│   ├── redis.ts                      # Optional Upstash integration
│   ├── format-date.ts                # Hydration-safe UTC dates
│   └── auth/clerk-oauth.ts           # OAuth redirect URLs
├── utils/
│   ├── actions.ts                    # Server Actions (CRUD + reads)
│   ├── types.ts                      # JobType + Zod schema
│   └── db.ts                         # Prisma client singleton
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── seed.ts                       # Sample data script
├── proxy.ts                          # Clerk middleware (auth + legacy redirects)
├── next.config.ts                    # Images, headers, Sentry wrapper
├── .env.example                      # Environment variable template
└── docs/                             # Additional guides (walkthrough, auth, styling)
```

---

## Prerequisites

Before you start, install:

| Requirement            | Notes                                       |
| ---------------------- | ------------------------------------------- |
| **Node.js 20+**        | LTS recommended (Node 24 default on Vercel) |
| **npm** (or pnpm/yarn) | Package manager                             |
| **PostgreSQL**         | Local Docker, Neon, Supabase, or VPS        |
| **Clerk account**      | Free tier works for development             |

Optional: **Upstash Redis** (production cache/SSE), **Sentry** (error tracking).

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/arnobt78/Job-Application-Tracker--NextJS-FullStack.git
cd Job-Application-Tracker--NextJS-FullStack
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

See [Environment Variables](#environment-variables) below for every key explained.

### 4. Set up the database

```bash
npx prisma generate
npx prisma db push
npm run db:seed   # optional — sample jobs
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

> **Minimum to run locally:** Clerk keys + PostgreSQL `DATABASE_URL` / `DIRECT_URL`.  
> Everything else is optional and the app degrades gracefully without it.

Create `.env.local` in the project root (never commit it). A full template lives in `.env.example`.

### Required

| Variable                            | Description                         | How to get it                                             |
| ----------------------------------- | ----------------------------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key (browser-safe)     | [Clerk Dashboard](https://dashboard.clerk.com) → API Keys |
| `CLERK_SECRET_KEY`                  | Clerk secret key (server only)      | Same as above                                             |
| `DATABASE_URL`                      | PostgreSQL connection string        | Your DB host (Neon, Supabase, local Postgres…)            |
| `DIRECT_URL`                        | Direct DB URL for Prisma migrations | Usually same as `DATABASE_URL`                            |

**Clerk URL settings** (local defaults — already in `.env.example`):

```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_USER_PROFILE_URL=/user-profile
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

Also set **After sign-in URL** and **After sign-up URL** to `/dashboard` in the Clerk Dashboard.

**Example local PostgreSQL:**

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/jobify?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/jobify?schema=public"
```

### Optional (recommended for production)

| Variable                   | Purpose                              |
| -------------------------- | ------------------------------------ |
| `UPSTASH_REDIS_REST_URL`   | Redis REST endpoint for cache + SSE  |
| `UPSTASH_REDIS_REST_TOKEN` | Redis auth token                     |
| `NEXT_PUBLIC_SENTRY_DSN`   | Browser error reporting              |
| `SENTRY_ORG`               | Sentry organization slug             |
| `SENTRY_PROJECT`           | Sentry project slug                  |
| `SENTRY_AUTH_TOKEN`        | Source map upload at build time only |

**Without Redis:** app uses in-memory cache + BroadcastChannel (single instance / same browser).  
**Without Sentry:** error boundaries still work; errors are not reported externally.

---

## Database Setup

### Schema (Job model)

Defined in `prisma/schema.prisma`:

```prisma
model Job {
  id        String   @id @default(uuid())
  clerkId   String   // Clerk user ID — row-level isolation
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  position  String
  company   String
  location  String
  status    String   // pending | interview | declined
  mode      String   // full-time | part-time | internship
}
```

Each job belongs to one Clerk user via `clerkId`. Server actions always filter by authenticated `userId`.

### Commands

```bash
# Generate Prisma Client after schema changes
npm run prisma:generate

# Push schema to database (dev)
npm run prisma:push

# Open visual DB browser
npm run prisma:studio

# Seed sample data
npm run db:seed
```

### Utility scripts

| Script              | Command                     | Purpose                 |
| ------------------- | --------------------------- | ----------------------- |
| Inspect DB          | `npm run db:inspect`        | Debug database contents |
| Seed test user jobs | `npm run db:seed-test-user` | Populate demo data      |
| Fix status values   | `npm run db:fix-status`     | Data cleanup migration  |

---

## Running the Project

| Command             | Description                                         |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Start dev server (Turbopack) at `localhost:3000`    |
| `npm run build`     | Production build (`prisma generate` + `next build`) |
| `npm start`         | Run production server                               |
| `npm run lint`      | ESLint                                              |
| `npm run typecheck` | TypeScript check                                    |
| `npm test`          | Vitest unit tests (20 tests)                        |

**Full verification (recommended before deploy):**

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

---

## Routes & Pages

| Route             | Access    | Description                                        |
| ----------------- | --------- | -------------------------------------------------- |
| `/`               | Public    | Marketing landing page with hero carousel          |
| `/sign-in`        | Public    | Custom sign-in form + OAuth + demo login           |
| `/sign-up`        | Public    | Custom sign-up form + email verification           |
| `/dashboard`      | Protected | Main jobs dashboard (list, search, Add Job dialog) |
| `/dashboard/[id]` | Protected | Opens edit job dialog for direct URL sharing       |
| `/stats`          | Protected | Stats cards + Recharts trend graph                 |
| `/user-profile`   | Protected | Clerk user profile management                      |

**Legacy redirects** (handled in `proxy.ts`):

| Old URL            | Redirects to |
| ------------------ | ------------ |
| `/add-job`         | `/dashboard` |
| `/jobs`, `/jobs/*` | `/dashboard` |

---

## API Endpoints

This project uses **Server Actions** for most data operations. Two HTTP routes exist:

### `GET /api/jobs/events`

- **Purpose:** Server-Sent Events stream for cache invalidation after CRUD
- **Auth:** Clerk session required (401 if unauthenticated)
- **Used by:** `hooks/useJobsCacheSync.ts`
- **Flow:** Client opens EventSource → receives invalidation events → React Query refetches

```typescript
// Simplified client usage (inside useJobsCacheSync)
const source = new EventSource("/api/jobs/events");
source.onmessage = (event) => {
  const { jobId } = JSON.parse(event.data);
  invalidateAllJobQueries(queryClient, jobId, { broadcast: false });
};
```

### `POST /api/monitoring`

- **Purpose:** Sentry browser tunnel (same-origin proxy so ad blockers don't block error reports)
- **Optional:** Only active when `NEXT_PUBLIC_SENTRY_DSN` is set

---

## Server Actions (Backend)

All server-side data logic lives in `utils/actions.ts` with `"use server"`.

| Action                                          | Purpose                               |
| ----------------------------------------------- | ------------------------------------- |
| `createJobAction(values)`                       | Create a new job for current user     |
| `getAllJobsAction({ search, jobStatus, page })` | Paginated, filtered job list          |
| `getSingleJobAction(id)`                        | Single job (redirects if not found)   |
| `updateJobAction(id, values)`                   | Update existing job                   |
| `deleteJobAction(id)`                           | Delete job                            |
| `getStatsAction()`                              | Pending / interview / declined counts |
| `getChartsDataAction()`                         | Monthly application counts (6 months) |
| `getAllJobsForDownloadAction()`                 | All jobs for CSV/Excel export         |

**Security pattern** (every action):

```typescript
async function authenticateAndRedirect(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/");
  return userId;
}
```

Prisma queries always include `clerkId: userId` so users cannot access each other's data.

**Validation** (shared Zod schema):

```typescript
export const createAndEditJobSchema = z.object({
  position: z.string().min(2),
  company: z.string().min(2),
  location: z.string().min(2),
  status: z.nativeEnum(JobStatus),
  mode: z.nativeEnum(JobMode),
});
```

---

## Authentication

### Clerk integration

- **Middleware:** `proxy.ts` protects `/dashboard`, `/stats`, `/user-profile`
- **Custom UI:** `SignInForm.tsx`, `SignUpForm.tsx` — glassmorphic cards, no Clerk footer
- **OAuth:** `AuthOAuthButtons` + `lib/auth/clerk-oauth.ts`
- **Demo login:** `TryDemoAccountButton` + `useGuestSignIn` (test credentials in dev)

### Post-auth redirect

After sign-in or sign-up, users land on **`/dashboard`**.

### Reusing auth in another project

1. Install `@clerk/nextjs`
2. Add `proxy.ts` (or `middleware.ts` on older Next.js) with `clerkMiddleware`
3. Wrap app in `<ClerkProvider>` in root layout
4. Call `auth()` in server actions to get `userId`

---

## State Management & Caching

### React Query keys (`lib/query-keys.ts`)

```typescript
queryKeys.jobs.list(search, jobStatus, page); // ['jobs', search, status, page]
queryKeys.stats.all; // ['stats']
queryKeys.charts.all; // ['charts']
queryKeys.job.detail(id); // ['job', id]
```

### Optimistic mutations (`hooks/useJobsMutation.ts`)

- **Create:** prepends new job to list cache instantly
- **Delete:** removes job from cache before server confirms
- **Update:** patches job detail + list entries

On settle, `invalidateAllJobQueries` ensures server truth wins.

### Server cache (`lib/jobs/queries.ts`)

Uses Next.js `unstable_cache` with per-user tags from `lib/cache-tags.ts`. Optional Redis layer in `lib/redis.ts` adds read-through caching for production.

### Hydration-safe dates

`lib/format-date.ts` formats job dates in **UTC** so SSR and client render identical text (prevents React hydration mismatch):

```typescript
export function formatJobDate(value: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
```

---

## Components Guide

### Layout & navigation

| Component       | Path                                   | Reuse                                                    |
| --------------- | -------------------------------------- | -------------------------------------------------------- |
| `NavShell`      | `components/layout/nav-shell.tsx`      | Fixed glass navbar chrome — compose with any nav content |
| `LandingNav`    | `components/layout/landing-nav.tsx`    | Marketing page nav + theme toggle                        |
| `DashboardNav`  | `components/layout/dashboard-nav.tsx`  | Authenticated top nav with pills + avatar                |
| `PageContainer` | `components/layout/page-container.tsx` | Consistent max-width page wrapper                        |
| `GlassCard`     | `components/ui/glass-card.tsx`         | Frosted card variants (`neutral`, `sky`, `violet`)       |

**Example — reuse NavShell:**

```tsx
import { NavShell } from "@/components/layout/nav-shell";

export function MyNav() {
  return (
    <NavShell>
      <a href="/">Home</a>
      <a href="/about">About</a>
    </NavShell>
  );
}
```

### Dashboard components

| Component                            | Purpose                                   |
| ------------------------------------ | ----------------------------------------- |
| `JobsList`                           | React Query job grid with search params   |
| `JobCard`                            | Single job card with edit dialog + delete |
| `SearchForm`                         | URL-synced search + status filter         |
| `AddJobDialog`                       | Modal with `CreateJobForm`                |
| `EditJobDialog`                      | Modal with `EditJobForm`                  |
| `DownloadDropdown`                   | CSV/Excel export                          |
| `StatsContainer` / `ChartsContainer` | Stats page widgets                        |

### Forms

Both forms accept a **`standalone`** prop:

- `standalone={true}` — renders outer `GlassCard` (standalone page use)
- `standalone={false}` — form only (inside dialog)

```tsx
<CreateJobForm standalone={false} onSuccess={() => setOpen(false)} />
```

### Landing page

| Component               | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| `HeroVisualCarousel`    | SVG carousel with glow + LCP-optimized images |
| `ScrollStagger`         | Viewport-triggered stagger animations         |
| `ScrollParallaxSection` | Subtle parallax sections                      |
| `TryDemoAccountButton`  | One-click demo sign-in                        |

---

## Custom Hooks

| Hook                   | File                  | Purpose                              |
| ---------------------- | --------------------- | ------------------------------------ |
| `useCreateJobMutation` | `useJobsMutation.ts`  | Optimistic job creation              |
| `useUpdateJobMutation` | `useJobsMutation.ts`  | Optimistic job update                |
| `useDeleteJobMutation` | `useJobsMutation.ts`  | Optimistic job delete                |
| `useJobsCacheSync`     | `useJobsCacheSync.ts` | SSE + BroadcastChannel invalidation  |
| `useGuestSignIn`       | `useGuestSignIn.ts`   | Demo account login flow              |
| `useSignUpForm`        | `useSignUpForm.ts`    | Multi-step sign-up with email verify |

**Reuse `useJobsMutation` in another project:**

1. Copy hook + `lib/invalidate-jobs.ts` + `lib/query-keys.ts`
2. Point mutations at your server actions
3. Wrap app in `QueryClientProvider`
4. Optionally add `useJobsCacheSync` for multi-tab sync

---

## Code Examples

### SSR prefetch + client query

```tsx
// app/(dashboard)/dashboard/page.tsx
export const dynamic = "force-dynamic";

async function DashboardPage({ searchParams }) {
  const params = await searchParams;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.jobs.list(
      params.search ?? "",
      params.jobStatus ?? "all",
      1,
    ),
    queryFn: () =>
      getAllJobsAction({
        search: params.search,
        jobStatus: params.jobStatus,
        page: 1,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <JobsList />
    </HydrationBoundary>
  );
}
```

```tsx
// components/JobsList.tsx (client)
"use client";
const { data, isPending } = useQuery({
  queryKey: queryKeys.jobs.list(search, jobStatus, pageNumber),
  queryFn: () => getAllJobsAction({ search, jobStatus, page: pageNumber }),
});
```

### Creating a job (optimistic)

```tsx
const createMutation = useCreateJobMutation();
createMutation.mutate({
  position: "Frontend Engineer",
  company: "Acme Corp",
  location: "Remote",
  status: "pending",
  mode: "full-time",
});
```

### Protected middleware

```typescript
// proxy.ts
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/stats",
  "/user-profile(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (pathname.startsWith("/jobs") || pathname === "/add-job") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (isProtectedRoute(req)) await auth.protect();
});
```

---

## Testing & Quality

Tests live in `lib/__tests__/` and `hooks/__tests__/`.

| Test file                  | Covers                                 |
| -------------------------- | -------------------------------------- |
| `format-date.test.ts`      | UTC date formatting (hydration safety) |
| `query-keys.test.ts`       | Query key shape                        |
| `invalidate-jobs.test.ts`  | Client cache invalidation              |
| `cache-tags.test.ts`       | Per-user cache tags                    |
| `chart-optimistic.test.ts` | Optimistic chart patches               |
| `useJobsMutation.test.ts`  | Optimistic list mutations              |

Run tests:

```bash
npm test
```

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables from `.env.example`
4. Deploy — `npm run build` runs automatically

### Production checklist

- [ ] Clerk production keys (`pk_live_` / `sk_live_`)
- [ ] PostgreSQL production database
- [ ] `DATABASE_URL` + `DIRECT_URL` in Vercel env
- [ ] Clerk redirect URLs include your production domain
- [ ] Optional: Upstash Redis for multi-instance cache/SSE
- [ ] Optional: Sentry DSN + auth token for source maps

See also: `docs/VERCEL_PRODUCTION_GUARDRAILS.md`

---

## Keywords

`Next.js App Router` · `Server Actions` · `Server Components` · `Client Components` · `TypeScript` · `React 19` · `TanStack Query` · `React Query hydration` · `Optimistic UI` · `Prisma ORM` · `PostgreSQL` · `Clerk authentication` · `Tailwind CSS` · `shadcn/ui` · `Glassmorphism` · `SSR prefetch` · `Cache invalidation` · `Server-Sent Events` · `Redis Streams` · `Upstash` · `Job tracker` · `Full-stack` · `Zod validation` · `React Hook Form` · `Recharts` · `Dark mode` · `Vercel deployment` · `Sentry monitoring` · `Vitest`

---

## Conclusion

Jobify demonstrates how a modern full-stack application combines **secure authentication**, **type-safe data access**, **performant caching**, and **polished UX** in a single Next.js codebase. Use it to:

- Learn App Router patterns (SSR, Server Actions, Client Components)
- Study production-ready cache and invalidation strategies
- Fork as a starter for dashboards, CRMs, or any CRUD app
- Teach full-stack concepts with real, runnable code

Explore `docs/PROJECT_WALKTHROUGH.md` for a shorter agent-oriented reference, and `docs/` for deeper guides on auth, styling, and integrations.

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use, modify, and distribute the code as per the terms of the license.

## Happy Coding! 🎉

This is an **open-source project** - feel free to use, enhance, and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://www.arnobmahmud.com](https://www.arnobmahmud.com).

**Enjoy building and learning!** 🚀

Thank you! 😊
