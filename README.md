# Job Application Tracker & Discovery — Next.js, TypeScript, NextAuth v5, Prisma, PostgreSQL, Bluedoor API (+ FastAPI AI Pipeline) FullStack Project

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748)](https://www.prisma.io/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.90-FF4154)](https://tanstack.com/query)
[![NextAuth](https://img.shields.io/badge/NextAuth-v5-purple)](https://authjs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1-6E9F18)](https://vitest.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Phase_2-009688)](https://fastapi.tiangolo.com/)

A production-style, full-stack **job application CRM** — not a generic job board. It helps you track applications you have already submitted, enrich them with live posting data from the free [Bluedoor Job Postings API](https://bluedoor.sh/apis/job-postings), discover new roles to track, visualize your search with charts and KPIs, and (Phase 2) run an AI insights pipeline. Built for learning: App Router SSR, Server Actions, TanStack Query hydration, optimistic UI, multi-layer caching, SSE cross-tab sync, and strict TypeScript end-to-end.

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
- [Bluedoor Enrichment & Discover](#bluedoor-enrichment--discover)
- [Notifications & Email Alerts](#notifications--email-alerts)
- [AI Pipeline (Phase 2)](#ai-pipeline-phase-2)
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

Jobify helps job seekers **organize**, **track**, **enrich**, and **analyze** their job search in one place. Each authenticated user gets a private dashboard where they can:

- Add and manage job applications (position, company, location, status, employment mode)
- Attach an **apply URL** so Bluedoor can enrich the record with live salary, status, and workplace data
- Search and filter their pipeline with URL-synced filters and pagination
- **Discover** 1.8M+ live postings and track any role with one click
- View stats, KPIs, and multiple chart types (monthly trend, weekly velocity, status/mode breakdown)
- Export data as CSV or Excel
- Receive in-app notifications (and optional email) when a tracked posting closes or changes

The app is built as a **learning-oriented full-stack reference**: server-rendered pages for fast first paint, client-side TanStack Query for instant interactions, Prisma + PostgreSQL for persistence, and optional Redis/Sentry/Resend for production polish.

---

## Features

### Core Functionality

| Feature              | Description                                                          |
| -------------------- | -------------------------------------------------------------------- |
| **CRUD**             | Create, read, update, delete job applications                        |
| **Search & filters** | Filter by position/company, status, mode, month (URL-synced)         |
| **Pagination**       | Paginated job list for large datasets                                |
| **Stats dashboard**  | Status cards + KPI row (response rate, interview rate, top job type) |
| **Charts**           | Monthly trend + projection, weekly velocity, status donut, mode bars |
| **Export**           | Download CSV/Excel with monthly grouping                             |
| **Dialogs**          | Add/Edit jobs in modal dialogs (no page navigation)                  |

### Bluedoor Integration (Phase 1)

| Feature               | Description                                                              |
| --------------------- | ------------------------------------------------------------------------ |
| **Live enrichment**   | Match tracked jobs to Bluedoor via apply URL (ATS key, URL, fuzzy match) |
| **Enrichment badges** | LIVE / CLOSED / JD CHANGED / SALARY / Syncing on job cards               |
| **Discover page**     | Search 1.8M+ postings; one-click **Track Application**                   |
| **Nightly cron**      | Batch re-sync linked jobs (`/api/cron/enrich`)                           |
| **Webhook**           | Bluedoor lifecycle events → resync affected jobs                         |

### User Experience

- **NextAuth v5 authentication** — credentials, Google/GitHub OAuth, guest demo sign-in dropdown
- **Custom auth UI** — branded Sign In / Sign Up forms (no hosted provider chrome)
- **Notification bell** — SSE + BroadcastChannel; unread badge + popover list
- **Dark / light / system theme** — via `next-themes`
- **Glassmorphism UI** — `GlassCard`, glass dropdowns, targeted skeletons
- **Responsive layout** — mobile hamburger nav, grid cards on desktop
- **Toast feedback** — success/error notifications via Sonner
- **Form validation** — React Hook Form + Zod (client + server)

### Technical Highlights

- **SSR prefetch + hydration** — data ready on first paint
- **Optimistic mutations** — UI updates before server round-trip
- **Multi-layer cache** — `unstable_cache`, tags, optional Redis read-through
- **Cross-tab sync** — BroadcastChannel + SSE (`/api/jobs/events`)
- **localStorage persist** — jobs/stats/charts cached client-side (not discover/ai)
- **Sentry integration** — optional error tracking with browser tunnel
- **Type-safe end-to-end** — TypeScript + Prisma + Zod

---

## Technology Stack

### Frontend

| Library             | Version | What it does                                                     |
| ------------------- | ------- | ---------------------------------------------------------------- |
| **Next.js**         | 16.x    | React framework — App Router, SSR, Server Actions, Turbopack dev |
| **React**           | 19.x    | UI library with Server/Client Components                         |
| **TypeScript**      | 5.8.x   | Static typing across the codebase                                |
| **Tailwind CSS**    | 3.4.x   | Utility-first styling                                            |
| **shadcn/ui**       | —       | Accessible Radix-based components (Button, Dialog, Select…)      |
| **Lucide React**    | —       | Icon set                                                         |
| **React Hook Form** | 7.x     | Form state with minimal re-renders                               |
| **Zod**             | 3.x     | Schema validation (shared client + server)                       |
| **Recharts**        | 2.x     | Stats page charts (Bar, Area, Pie, Composed)                     |
| **next-themes**     | —       | Theme switching without flash                                    |
| **TanStack Query**  | 5.x     | Server state, cache, optimistic updates, persist                 |
| **Sonner**          | —       | Toast notifications                                              |

### Backend & Data

| Library                    | Version  | What it does                                                |
| -------------------------- | -------- | ----------------------------------------------------------- |
| **Next.js Server Actions** | —        | Type-safe server functions (`"use server"`)                 |
| **Prisma**                 | 6.x      | ORM — type-safe DB queries and migrations                   |
| **PostgreSQL**             | —        | Relational database for job records                         |
| **NextAuth v5**            | 5.x      | Authentication — JWT session, Prisma adapter, OAuth + credentials |
| **Bluedoor API**           | —        | Free job postings API — enrichment + discover (no auth key) |
| **Upstash Redis**          | optional | Read-through cache + SSE invalidation streams               |
| **Resend**                 | optional | Email alerts when postings change                           |
| **exceljs / papaparse**    | —        | Excel/CSV export generation                                 |
| **dayjs**                  | —        | Date formatting in exports and charts                       |

### Phase 2 — Python AI Service

| Library                           | What it does                      |
| --------------------------------- | --------------------------------- |
| **FastAPI**                       | HTTP API for 9-agent LLM pipeline |
| **Ollama**                        | Local LLM (primary)               |
| **Groq / OpenRouter / Anthropic** | Free-tier cloud fallbacks         |

See `python-ai-service/` and `docs/PROJECT_PLAN.md` for the full roadmap.

### Dev & Quality

| Tool       | Purpose                                                                 |
| ---------- | ----------------------------------------------------------------------- |
| **Vitest** | Unit tests (`lib/__tests__`, `hooks/__tests__`, `components/__tests__`) |
| **ESLint** | Linting (`eslint-config-next`)                                          |
| **Sentry** | Optional production error monitoring                                    |

---

## Architecture & Data Flow

Understanding the flow is key to extending this project.

### Read path (SSR → client)

```text
page.tsx (export const dynamic = 'force-dynamic')
  └─ await prefetchQuery on server (QueryClient)
  └─ HydrationBoundary → dehydrate state
       └─ Client component (JobsGrid, StatsContainer, DiscoverResults…)
            └─ useQuery with same queryKey → instant data, no loading flash
                 └─ lib/jobs/queries.ts (unstable_cache + tags + optional Redis)
                      └─ Prisma → PostgreSQL
```

**Why `force-dynamic`?** Every dashboard page is user-specific. SSR prefetch + client cache gives fast first paint without stale public HTML.

### Write path (mutation → invalidation)

```text
User action (CreateJobForm / DiscoverJobCard / DeleteJobButton)
  └─ useJobsMutation (optimistic UI patch)
       └─ Server Action (utils/actions.ts)
            └─ Prisma write
            └─ after() → enrichJob() if applyUrl present (non-blocking)
            └─ invalidateUserJobCaches(userId, jobId?)
                 ├─ revalidateTag / revalidatePath (Next cache)
                 ├─ Redis cache key delete (optional)
                 └─ publishInvalidation → SSE stream
                      └─ useJobsCacheSync → invalidateAllJobQueries (React Query)
                           └─ BroadcastChannel → other browser tabs
```

### Why this pattern?

- **SSR prefetch** eliminates loading spinners on first visit
- **Optimistic updates** make the UI feel instant
- **Tag-based revalidation** keeps server cache correct after mutations
- **SSE + BroadcastChannel** keeps multiple tabs/instances in sync
- **Targeted skeletons** — static chrome always visible; only data slots pulse on cold cache

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
│   │   ├── layout.tsx                # DashboardNav + NotificationsProvider
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # /dashboard — jobs list + Add Job dialog
│   │   │   └── [id]/page.tsx         # /dashboard/[id] — edit dialog via URL
│   │   ├── discover/
│   │   │   ├── page.tsx              # /discover — Bluedoor job search
│   │   │   └── loading.tsx           # Streaming skeleton (static card shells)
│   │   └── stats/
│   │       └── page.tsx              # /stats — analytics + charts
│   ├── sign-in/[[...sign-in]]/       # Custom sign-in page
│   ├── sign-up/[[...sign-up]]/       # Custom sign-up page
│   ├── user-profile/[[...user-profile]]/
│   └── api/
│       ├── jobs/events/route.ts      # SSE invalidation + notification stream
│       ├── bluedoor/webhook/route.ts # Bluedoor lifecycle webhook (HMAC)
│       ├── cron/enrich/route.ts      # Nightly batch re-sync (CRON_SECRET)
│       ├── ai/pipeline/route.ts      # AI proxy → Python FastAPI
│       └── monitoring/route.ts       # Sentry browser tunnel
├── components/
│   ├── layout/                       # NavShell, DashboardNav, NotificationBell…
│   ├── jobs/                         # JobsGrid, JobCardShell, enrichment badge…
│   ├── discover/                     # DiscoverFilters, DiscoverJobCard, results…
│   ├── stats/                        # ApplicationTrendChart, WeeklyVelocity…
│   ├── dialogs/                      # AddJobDialog, EditJobDialog
│   ├── ui/                           # shadcn + GlassCard, glass-dropdown-menu…
│   └── CreateJobForm.tsx, EditJobForm.tsx, StatsContainer.tsx…
├── context/
│   └── notifications-context.tsx     # In-app notification state (max 50)
├── hooks/
│   ├── useJobsMutation.ts            # Optimistic CRUD mutations
│   ├── useJobsCacheSync.ts           # SSE + BroadcastChannel sync
│   ├── useJobsListParams.ts          # URL-driven dashboard filters
│   ├── useAIPipeline.ts              # AI insights mutation
│   └── useGuestSignIn.ts, useNavUserSession.ts…
├── lib/
│   ├── jobs/queries.ts               # Cached Prisma reads (stats, charts, weekly)
│   ├── bluedoor/                     # client.ts, enrich.ts, types.ts
│   ├── ai/pipeline-client.ts         # TypeScript types for AI service
│   ├── notifications/email.ts        # Resend wrapper (no-op without key)
│   ├── jobs-events.ts                # SSE event bus (invalidate | notify)
│   ├── invalidate-jobs.ts            # Client query invalidation
│   ├── invalidate-jobs-server.ts     # Server cache bust
│   ├── query-keys.ts                 # Canonical React Query keys
│   ├── query-persist.ts              # localStorage persist rules
│   └── cache-tags.ts, redis.ts…
├── utils/
│   ├── actions.ts                    # Server Actions (CRUD + Bluedoor + stats)
│   ├── types.ts                      # JobType + Zod schema
│   └── db.ts                         # Prisma client singleton
├── prisma/
│   ├── schema.prisma                 # Job model (+ Bluedoor enrichment fields)
│   └── seed.ts                       # Sample data script
├── python-ai-service/                # Phase 2 — FastAPI 9-agent pipeline
│   ├── app/main.py
│   ├── app/pipeline/agents/          # Extractor → Final Verifier
│   ├── app/llm/router.py             # Ollama → Groq → OpenRouter → Anthropic
│   └── docker-compose.yml
├── proxy.ts                           # NextAuth JWT gate (Next.js 16; auth + legacy redirects)
├── vercel.json                       # Cron schedule + security headers
├── next.config.ts                    # Images, headers, Sentry wrapper
├── .env.example                      # Environment variable template
└── docs/                             # Walkthrough, styling, auth, roadmap
```

---

## Prerequisites

Before you start, install:

| Requirement            | Notes                                |
| ---------------------- | ------------------------------------ |
| **Node.js 20+**        | LTS recommended                      |
| **npm** (or pnpm/yarn) | Package manager                      |
| **PostgreSQL**         | Local Docker, Neon, Supabase, or VPS |
| **PostgreSQL client**  | psql, TablePlus, or pgAdmin          |

Optional: **Upstash Redis**, **Sentry**, **Resend**, **Python 3.11+** (for AI service).

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

```bash
cp .env.example .env.local
```

Fill in **NextAuth secret** and **PostgreSQL URLs** — see [Environment Variables](#environment-variables).

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

**Different port** (if 3000 is busy):

```bash
npm run dev -- -p 3001
```

---

## Environment Variables

> **Minimum to run locally:** `AUTH_SECRET` + `DATABASE_URL` / `DIRECT_URL`.  
> Everything else is optional — the app degrades gracefully without it.

Create `.env.local` in the project root (never commit it). A full template lives in `.env.example`.

### Required

| Variable       | Description                                 | How to get it                                              |
| -------------- | ------------------------------------------- | ---------------------------------------------------------- |
| `AUTH_SECRET`  | JWT signing secret for NextAuth sessions    | `openssl rand -base64 32`                                  |
| `DATABASE_URL` | PostgreSQL connection string                | Neon, Supabase, local Postgres…                            |
| `DIRECT_URL`   | Direct DB URL for Prisma migrations         | Usually same as `DATABASE_URL`                             |

**Demo credentials** (pre-seeded for local dev):

```env
# Sign in with the guest dropdown on /sign-in
Email:    test@user.com
Password: 12345678
```

**OAuth (optional)** — add these to enable Google / GitHub sign-in:

```env
AUTH_GOOGLE_ID=        # Google Cloud Console → OAuth 2.0 → callback: /api/auth/callback/google
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=        # GitHub → Settings → Developer settings → OAuth Apps → callback: /api/auth/callback/github
AUTH_GITHUB_SECRET=
```

**Example local PostgreSQL:**

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/jobify?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/jobify?schema=public"
```

### Optional — Production & Integrations

| Variable                                              | Purpose                                          |
| ----------------------------------------------------- | ------------------------------------------------ |
| `UPSTASH_REDIS_REST_URL`                              | Redis REST endpoint for cache + SSE              |
| `UPSTASH_REDIS_REST_TOKEN`                            | Redis auth token                                 |
| `NEXT_PUBLIC_SENTRY_DSN`                              | Browser error reporting                          |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | Source map upload at build                       |
| `BLUEDOOR_WEBHOOK_SECRET`                             | HMAC verification for Bluedoor webhooks          |
| `CRON_SECRET`                                         | Bearer auth for Vercel cron → `/api/cron/enrich` |
| `RESEND_API_KEY`                                      | Email alerts when postings change                |
| `EMAIL_FROM`                                          | Verified sender address                          |
| `NEXT_PUBLIC_APP_URL`                                 | Base URL for email deep-links                    |
| `AI_SERVICE_URL`                                      | FastAPI base URL (Phase 2)                       |
| `AI_SERVICE_SECRET`                                   | Shared secret for `/api/ai/pipeline` proxy       |

**Without Redis:** in-memory cache + BroadcastChannel (single instance / same browser).  
**Without Sentry:** error boundaries still work; errors are not reported externally.  
**Without Resend:** `sendPostingChangeEmail()` is a graceful no-op.  
**Without AI service:** `/api/ai/pipeline` returns 500; `AiInsightsPanel` shows error state.  
**Bluedoor API:** free, no API key — enrichment and discover work out of the box.

---

## Database Setup

### Schema (Job model)

Defined in `prisma/schema.prisma`:

```prisma
model Job {
  id        String   @id @default(uuid())
  userId    String   // NextAuth user ID (cuid) — row-level isolation
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  position  String
  company   String
  location  String
  status    String   // pending | interview | declined
  mode      String   // full-time | part-time | internship

  applyUrl              String?   // URL user applied through
  bluedoorJobId           String?   // Bluedoor match ID
  bluedoorOrgId           String?
  bluedoorProvider        String?   // greenhouse | lever | ashby | workday
  bluedoorStatus          String?   // active | expired | unknown
  bluedoorWorkplaceType   String?   // remote | hybrid | on_site
  bluedoorSalaryMin       Float?
  bluedoorSalaryMax       Float?
  bluedoorSalaryCurrency  String?
  bluedoorDescHash        String?   // detects JD edits
  bluedoorSyncedAt        DateTime?
  bluedoorChangedAt       DateTime?
}
```

Each job belongs to one NextAuth user via `userId`. Server actions always filter by authenticated `userId`.

### Commands

```bash
npm run prisma:generate   # Generate Prisma Client after schema changes
npm run prisma:push       # Push schema to database (dev)
npm run prisma:studio     # Open visual DB browser
npm run db:seed           # Seed sample data
```

---

## Running the Project

| Command             | Description                                         |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Start dev server (Turbopack) at `localhost:3000`    |
| `npm run build`     | Production build (`prisma generate` + `next build`) |
| `npm start`         | Run production server                               |
| `npm run lint`      | ESLint                                              |
| `npm run typecheck` | TypeScript check                                    |
| `npm test`          | Vitest unit tests (49 tests)                        |

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
| `/discover`       | Protected | Bluedoor job search — filter, track applications   |
| `/stats`          | Protected | Stats cards, KPIs, 4 chart sections                |
| `/profile`        | Protected | User profile (skills, target roles, resume for AI) |

**Legacy redirects** (handled in `proxy.ts`):

| Old URL            | Redirects to |
| ------------------ | ------------ |
| `/add-job`         | `/dashboard` |
| `/jobs`, `/jobs/*` | `/dashboard` |

---

## API Endpoints

This project uses **Server Actions** for most data operations. HTTP routes:

### `GET /api/jobs/events`

- **Purpose:** Server-Sent Events — cache invalidation + in-app notifications
- **Auth:** NextAuth session required (401 if unauthenticated)
- **Used by:** `hooks/useJobsCacheSync.ts`
- **Events:** `{ type: 'invalidate' }` and `{ type: 'notify', payload }`

### `POST /api/bluedoor/webhook`

- **Purpose:** Receive Bluedoor lifecycle events (posting closed, JD changed, etc.)
- **Auth:** HMAC-SHA256 via `BLUEDOOR_WEBHOOK_SECRET`
- **Flow:** Verify signature → `resyncJob()` for affected tracked jobs → notify user

### `GET /api/cron/enrich`

- **Purpose:** Nightly batch re-sync of all Bluedoor-linked jobs
- **Auth:** Bearer `CRON_SECRET` (Vercel cron at 03:00 UTC)
- **Schedule:** Defined in `vercel.json`

### `POST /api/ai/pipeline`

- **Purpose:** Proxy to Python FastAPI 9-agent pipeline
- **Auth:** NextAuth session + `X-Internal-Secret` header
- **Requires:** `AI_SERVICE_URL` + `AI_SERVICE_SECRET`

### `POST /api/monitoring`

- **Purpose:** Sentry browser tunnel (same-origin proxy)
- **Optional:** Only active when `NEXT_PUBLIC_SENTRY_DSN` is set

---

## Server Actions (Backend)

All server-side data logic lives in `utils/actions.ts` with `"use server"`.

| Action                                                              | Purpose                                                     |
| ------------------------------------------------------------------- | ----------------------------------------------------------- |
| `createJobAction(values)`                                           | Create job; triggers `after()` enrichment if `applyUrl` set |
| `getAllJobsAction({ search, jobStatus, jobMode, monthYear, page })` | Paginated filtered list                                     |
| `getJobFilterOptionsAction()`                                       | Distinct months for month filter dropdown                   |
| `getSingleJobAction(id)`                                            | Single job (redirects if not found)                         |
| `updateJobAction(id, values)`                                       | Update job; re-enrich if applyUrl changed                   |
| `deleteJobAction(id)`                                               | Delete job                                                  |
| `getStatsAction()`                                                  | Pending / interview / declined + mode breakdown             |
| `getChartsDataAction()`                                             | Monthly application counts (6 months)                       |
| `getWeeklyChartsDataAction()`                                       | Weekly velocity (12 weeks)                                  |
| `getAllJobsForDownloadAction()`                                     | All jobs for CSV/Excel export                               |
| `enrichJobAction(jobId)`                                            | Manual Bluedoor enrichment trigger                          |
| `searchBluedoorJobsAction(params)`                                  | Discover page — live Bluedoor search                        |
| `getBluedoorJobDetailsAction(jobId)`                                | On-demand full posting detail for modal                     |

**Security pattern** (every action):

```typescript
async function authenticateAndRedirect(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/");
  return userId;
}
```

Prisma queries always include `userId` in `where` clauses so users cannot access each other's data.

---

## Authentication

### NextAuth v5 integration

- **Proxy:** `proxy.ts` — NextAuth JWT gate protects `/dashboard`, `/discover`, `/stats`, `/timeline`, `/profile`
- **Custom UI:** `SignInForm.tsx`, `SignUpForm.tsx` — glassmorphic cards, no hosted provider chrome
- **OAuth:** `AuthOAuthButtons` — `signIn('google')` / `signIn('github')` from `next-auth/react`
- **Demo login:** guest dropdown on sign-in page — `useGuestSignIn` → `signIn('credentials', { email, password })`
- **SSR user:** `dashboard/layout.tsx` → `auth()` → `NavUserProvider`

### Post-auth redirect

After sign-in or sign-up, users land on **`/dashboard`**.

---

## State Management & Caching

### React Query keys (`lib/query-keys.ts`)

```typescript
queryKeys.jobs.list(search, jobStatus, jobMode, monthYear, page)
queryKeys.jobs.filterOptions          // ['jobs', 'filter-options']
queryKeys.stats.all                   // ['stats']
queryKeys.charts.all                  // ['charts']
queryKeys.chartsWeekly.all            // ['charts-weekly']
queryKeys.job.detail(id)              // ['job', id]
queryKeys.discover.search(q, …)       // NOT persisted
queryKeys.discover.detail(jobId)      // NOT persisted
queryKeys.ai.pipeline(jobId)            // NOT persisted
```

### Optimistic mutations (`hooks/useJobsMutation.ts`)

- **Create:** prepends new job to list + bumps stats + charts
- **Delete:** removes job from cache before server confirms
- **Update:** patches job detail + list + stats (if status/mode changed)

On success: `invalidateAllJobQueries` (+ BroadcastChannel).  
On settled: same invalidation without re-broadcast (avoids ping-pong).

### Server cache (`lib/jobs/queries.ts`)

Uses Next.js `unstable_cache` with per-user tags from `lib/cache-tags.ts`. Optional Redis in `lib/redis.ts` adds read-through caching for production.

### localStorage persist (`lib/query-persist.ts`)

Persists `jobs`, `stats`, `charts`, `charts-weekly`, `job` keys — **not** `discover` or `ai` (live/external data).

### Hydration-safe dates

`lib/format-date.ts` formats job dates in **UTC** so SSR and client render identical text (prevents React hydration mismatch).

---

## Bluedoor Enrichment & Discover

### What is Bluedoor?

[Bluedoor Job Postings API](https://bluedoor.sh/apis/job-postings) tracks 1.8M+ US job postings across Greenhouse, Lever, Ashby, Workday, and 30+ ATS providers. **Free, no API key required.**

### Enrichment flow

```text
User saves job with applyUrl
  └─ after() → enrichJob(jobId, userId)
       └─ findBluedoorMatch (ATS key → URL match → fuzzy company+title)
       └─ buildEnrichmentPatch → Prisma update
       └─ invalidateUserJobCaches → SSE → dashboard badge updates
```

**Badges on job cards:** LIVE · CLOSED · JD CHANGED · SALARY · Syncing

### Discover page (`/discover`)

- Glass filter bar (country, workplace, employment type, salary)
- SSR prefetch + TanStack Query with `placeholderData` (no grid flash on filter change)
- **Track Application** uses `useCreateJobMutation` → dashboard updates instantly
- Location strings cleaned (semicolon-joined multi-location → first entry only)

### Key files

| File                                        | Role                                       |
| ------------------------------------------- | ------------------------------------------ |
| `lib/bluedoor/client.ts`                    | API client, search, facets, ATS URL parser |
| `lib/bluedoor/enrich.ts`                    | Match strategies, enrich, resync           |
| `components/discover/discover-job-card.tsx` | Result card + track button                 |
| `components/jobs/job-enrichment-badge.tsx`  | Live status badge                          |

---

## Notifications & Email Alerts

### In-app notifications

- **SSE bus:** `lib/jobs-events.ts` multiplexes `invalidate` and `notify` events
- **Provider:** `context/notifications-context.tsx` — max 50, read/unread state
- **Bell:** `components/layout/notification-bell.tsx` — badge + popover list
- **Cross-tab:** `useJobsCacheSync` relays `notify` via BroadcastChannel `jobify-notifications`

Triggered when Bluedoor resync detects: posting closed, JD changed, salary added.

### Email (optional)

- **Resend:** `lib/notifications/email.ts` — lazy import, no-op without `RESEND_API_KEY`
- Requires `EMAIL_FROM` and `NEXT_PUBLIC_APP_URL` for deep-links

---

## AI Pipeline (Phase 2)

Scaffolded — requires `python-ai-service/` running separately.

### Architecture

```text
AiInsightsPanel (client)
  └─ useAIPipeline → POST /api/ai/pipeline (NextAuth session)
       └─ X-Internal-Secret → FastAPI /pipeline
            └─ 9-agent pipeline:
                 Extractor → Analyzer → Preprocessor → Optimizer
                 → Synthesizer → Validator → Assembler → View → Final Verifier
            └─ LLM fallback: Ollama → Groq → OpenRouter → Anthropic Haiku
```

### Run Python service locally

```bash
cd python-ai-service
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 3000
```

Set in `.env.local`:

```env
AI_SERVICE_URL=http://localhost:3000
AI_SERVICE_SECRET=change-me-in-production
```

See `docs/PROJECT_PLAN.md` for Coolify VPS deployment and n8n automation roadmap.

---

## Components Guide

### Layout & navigation

| Component              | Path                                    | Reuse                                               |
| ---------------------- | --------------------------------------- | --------------------------------------------------- |
| `NavShell`             | `components/layout/nav-shell.tsx`       | Fixed glass navbar chrome                           |
| `DashboardNav`         | `components/layout/dashboard-nav.tsx`   | Authenticated nav + notification bell               |
| `GlassCard`            | `components/ui/glass-card.tsx`          | Frosted card variants (`neutral`, `sky`, `violet`…) |
| `PageSectionHeader`    | `components/ui/page-section-header.tsx` | Icon + title + subtitle + badge                     |
| `GlassDropdownTrigger` | `components/ui/glass-dropdown-menu.tsx` | Shared filter dropdown pattern                      |

### Dashboard

| Component                        | Purpose                                          |
| -------------------------------- | ------------------------------------------------ |
| `JobsGrid` / `JobCardShell`      | Static card chrome; skeleton only on text slots  |
| `JobCard`                        | Single job card + enrichment badge + edit/delete |
| `JobsFilterBar`                  | Glass search + dropdown filters (URL-driven)     |
| `AddJobDialog` / `EditJobDialog` | Modal forms                                      |
| `DownloadDropdown`               | CSV/Excel export                                 |
| `AiInsightsPanel`                | On-demand AI fit score + cover letter (Phase 2)  |

### Discover

| Component                | Purpose                                       |
| ------------------------ | --------------------------------------------- |
| `DiscoverFilters`        | Glass filter bar in `GlassCard variant="sky"` |
| `DiscoverJobCard`        | Result card + Track Application               |
| `DiscoverResults`        | TanStack Query grid + static card shells      |
| `DiscoverResultsToolbar` | Live posting count badge                      |

### Stats

| Component                 | Purpose                                       |
| ------------------------- | --------------------------------------------- |
| `StatsContainer`          | 3 status cards (pending, interview, declined) |
| `StatsKpiRow`             | Response rate, interview rate, top job type   |
| `ApplicationTrendChart`   | Monthly bar + projected line                  |
| `WeeklyVelocityChart`     | 12-week area chart                            |
| `StatusDistributionChart` | Donut chart                                   |
| `ModeDistributionChart`   | Horizontal bar chart                          |

### Forms

Both forms accept a **`standalone`** prop:

- `standalone={true}` — renders outer `GlassCard` (standalone page use)
- `standalone={false}` — form only (inside dialog)

```tsx
<CreateJobForm standalone={false} onSuccess={() => setOpen(false)} />
```

---

## Custom Hooks

| Hook                     | File                        | Purpose                             |
| ------------------------ | --------------------------- | ----------------------------------- |
| `useCreateJobMutation`   | `useJobsMutation.ts`        | Optimistic job creation             |
| `useUpdateJobMutation`   | `useJobsMutation.ts`        | Optimistic job update               |
| `useDeleteJobMutation`   | `useJobsMutation.ts`        | Optimistic job delete               |
| `useJobsCacheSync`       | `useJobsCacheSync.ts`       | SSE + BroadcastChannel invalidation |
| `useJobsListParams`      | `useJobsListParams.ts`      | URL-driven dashboard filter state   |
| `useJobsListBodyLoading` | `useJobsListBodyLoading.ts` | Skeleton only on cold cache         |
| `useAIPipeline`          | `useAIPipeline.ts`          | AI insights mutation                |
| `useGuestSignIn`         | `useGuestSignIn.ts`         | Demo account login flow             |
| `useNavUserSession`      | `useNavUserSession.ts`      | SSR avatar + NextAuth useSession     |

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
  const filters = parseJobsListFiltersFromSearchParamsRecord(
    await searchParams,
  );
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.jobs.list(/* … */),
      queryFn: () =>
        getAllJobsAction({
          /* … */
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.stats.all,
      queryFn: () => getStatsAction(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardPageHeader />
      <JobsFilterSection />
      <JobsResultsToolbar />
      <JobsGrid />
    </HydrationBoundary>
  );
}
```

### Track a job from Discover

```tsx
// components/discover/discover-job-card.tsx
const { mutate, isPending } = useCreateJobMutation();

mutate({
  position: job.title,
  company: job.org_id,
  location: cleanLocation(job.location_text ?? job.country ?? "Unknown"),
  status: JobStatus.Pending,
  mode: toJobMode(job.employment_type),
  applyUrl: job.apply_url,
});
// → optimistic dashboard update + invalidateAllJobQueries + Bluedoor enrichment
```

### Protected middleware

```typescript
// proxy.ts
import { auth } from '@/auth';
const PROTECTED = ['/dashboard', '/discover', '/stats', '/timeline', '/profile'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some(p => pathname === p || pathname.startsWith(p + '/'));
  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
});
```

---

## Testing & Quality

Tests live in `lib/__tests__/`, `hooks/__tests__/`, and `components/__tests__/`.

| Test file                  | Covers                                 |
| -------------------------- | -------------------------------------- |
| `format-date.test.ts`      | UTC date formatting (hydration safety) |
| `query-keys.test.ts`       | Query key shape                        |
| `invalidate-jobs.test.ts`  | Client cache invalidation              |
| `cache-tags.test.ts`       | Per-user cache tags                    |
| `chart-optimistic.test.ts` | Optimistic chart patches               |
| `stats-optimistic.test.ts` | Optimistic stats patches               |
| `filter-params.test.ts`    | URL filter parse/build/clear           |
| `useJobsMutation.test.ts`  | Optimistic list mutations              |

```bash
npm test   # 51 tests
```

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables from `.env.example`
4. Deploy — `npm run build` runs automatically

### Production checklist

- [ ] `AUTH_SECRET` set in Vercel env (generate: `openssl rand -base64 32`)
- [ ] PostgreSQL production database
- [ ] `DATABASE_URL` + `DIRECT_URL` in Vercel env
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain (needed for webhook registration + email links)
- [ ] Optional: `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — Google OAuth (callback: `/api/auth/callback/google`)
- [ ] Optional: `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` — GitHub OAuth (callback: `/api/auth/callback/github`)
- [ ] Optional: Upstash Redis for multi-instance cache/SSE
- [ ] Optional: `CRON_SECRET` for nightly Bluedoor re-sync
- [ ] Optional: `BLUEDOOR_WEBHOOK_SECRET` for live webhook events
- [ ] Optional: Resend (`RESEND_API_KEY` + `EMAIL_FROM`) for email alerts
- [ ] Optional: Sentry DSN + auth token for source maps
- [ ] Optional: Python AI service (`AI_SERVICE_URL` + `AI_SERVICE_SECRET`) on Coolify VPS

See also: `docs/VERCEL_PRODUCTION_GUARDRAILS.md`, `docs/PROJECT_PLAN.md`

---

## Keywords

`Next.js App Router` · `Server Actions` · `Server Components` · `Client Components` · `TypeScript` · `React 19` · `TanStack Query` · `React Query hydration` · `Optimistic UI` · `Prisma ORM` · `PostgreSQL` · `NextAuth v5 authentication` · `Tailwind CSS` · `shadcn/ui` · `Glassmorphism` · `SSR prefetch` · `Cache invalidation` · `Server-Sent Events` · `BroadcastChannel` · `Redis Streams` · `Upstash` · `Bluedoor API` · `Job enrichment` · `Job discovery` · `Resend email` · `FastAPI` · `Ollama` · `LLM pipeline` · `Job tracker CRM` · `Full-stack` · `Zod validation` · `React Hook Form` · `Recharts` · `Dark mode` · `Vercel deployment` · `Sentry monitoring` · `Vitest`

---

## Conclusion

Jobify demonstrates how a modern full-stack application combines **secure authentication**, **type-safe data access**, **live external API enrichment**, **performant multi-layer caching**, and **polished UX** in a single Next.js codebase. Use it to:

- Learn App Router patterns (SSR, Server Actions, Client Components)
- Study production-ready cache and invalidation strategies
- Understand how to integrate a free external API (Bluedoor) without breaking your architecture
- Fork as a starter for dashboards, CRMs, or any CRUD app with live data enrichment
- Teach full-stack concepts with real, runnable code

Explore `docs/PROJECT_WALKTHROUGH.md` for a shorter technical reference, `docs/PROJECT_PLAN.md` for the Phase 2 AI roadmap, and `docs/JOBIFY_TECH_STACK_ANALYSIS.md` for stack deep-dives.

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use, modify, and distribute the code as per the terms of the license.

## Happy Coding! 🎉

This is an **open-source project** - feel free to use, enhance, and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://www.arnobmahmud.com](https://www.arnobmahmud.com).

**Enjoy building and learning!** 🚀

Thank you! 😊
