# Phase 1 Completion — Discover Enhancements + Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete missing Phase 1 features: View Details modal, cursor pagination on /discover, SSE notification system, notification center bell, and Resend email alerts.

**Architecture:** Extend the existing SSE bus (lib/jobs-events.ts) with typed notification events alongside invalidation events. Client accumulates notifications in a React context. /discover gets full JD modal via getJobDetail and infinite query pagination. Resend emails are no-op when RESEND_API_KEY absent.

**Tech Stack:** Next.js 16, TanStack Query 5 (useInfiniteQuery), React context, Resend email, existing SSE + BroadcastChannel infrastructure.

## Global Constraints

- `export const dynamic = "force-dynamic"` on every page.tsx
- Server code only in page.tsx / actions.ts / lib/. Client code only in components/ / hooks/.
- All CRUD + enrichment mutations must call `invalidateAllJobQueries` (client) + `invalidateUserJobCaches` (server).
- SSE/BroadcastChannel cross-tab sync must not break.
- `useQueryBodyLoading` — skeleton only on cold cache.
- Persist scope: jobs/stats/charts/job — NOT discover.
- No `cacheComponents: true`.
- Resend: graceful no-op when `RESEND_API_KEY` absent.
- TypeScript strict — no `any`.
- `npm run lint && npm run typecheck && npm run test && npm run build` must pass after every task.

---

### Task 1: SSE Notification Event System

**Files:**
- Modify: `lib/jobs-events.ts` — add `JobsNotificationEvent` type + `publishNotification()`
- Modify: `app/api/jobs/events/route.ts` — multiplex both event types
- Modify: `hooks/useJobsCacheSync.ts` — handle `notify` events, callback to consumer
- New: `context/notifications-context.tsx` — accumulate notifications, expose count + list
- Modify: `app/(dashboard)/layout.tsx` — wrap with NotificationsProvider

**Interfaces:**
- Produces: `useNotifications()` hook → `{ notifications, unreadCount, markAllRead }`
- `publishNotification(userId, type, jobId, message)` callable from enrich.ts

- [ ] Extend `lib/jobs-events.ts` with notification event type and publisher
- [ ] Multiplex in SSE route — send both invalidate + notify events
- [ ] Extend `useJobsCacheSync` to accept optional `onNotification` callback
- [ ] Create `context/notifications-context.tsx` with provider + hook
- [ ] Wrap dashboard layout in NotificationsProvider
- [ ] Run lint + typecheck + test — PASS

---

### Task 2: Notification Bell Component

**Files:**
- New: `components/layout/notification-bell.tsx` — bell icon + unread badge + dropdown list
- Modify: `components/layout/dashboard-nav.tsx` — add NotificationBell before ThemeToggle

**Interfaces:**
- Consumes: `useNotifications()` from Task 1
- No new server actions needed

- [ ] Create `components/layout/notification-bell.tsx`
- [ ] Add to `components/layout/dashboard-nav.tsx`
- [ ] Run lint + typecheck + test — PASS

---

### Task 3: Discover View Details Modal

**Files:**
- Modify: `utils/actions.ts` — add `getBluedoorJobDetailsAction(jobId)`
- Modify: `lib/query-keys.ts` — add `discover.detail(jobId)`
- New: `components/discover/discover-job-details-modal.tsx` — full JD modal
- Modify: `components/discover/discover-job-card.tsx` — add "View Details" button trigger

**Interfaces:**
- Consumes: `getJobDetail(jobId)` from `lib/bluedoor/client.ts` (already exists)
- Query key: `queryKeys.discover.detail(jobId)` → `['discover', 'detail', jobId]`

- [ ] Add `getBluedoorJobDetailsAction` to `utils/actions.ts`
- [ ] Add `discover.detail` to `lib/query-keys.ts`
- [ ] Create `components/discover/discover-job-details-modal.tsx`
- [ ] Add View Details button to `components/discover/discover-job-card.tsx`
- [ ] Run lint + typecheck + test — PASS

---

### Task 4: Discover Cursor Pagination (Load More)

**Files:**
- Modify: `utils/actions.ts` — `searchBluedoorJobsAction` accepts optional `cursor?: string`
- Modify: `lib/query-keys.ts` — discover.search stays same (useInfiniteQuery uses it)
- Modify: `components/discover/discover-results.tsx` — switch to `useInfiniteQuery`, add Load More button
- Modify: `app/(dashboard)/discover/page.tsx` — use `prefetchInfiniteQuery`

**Interfaces:**
- `searchBluedoorJobsAction({ ..., cursor?: string })` → `BluedoorSearchResponse`
- `useInfiniteQuery` pageParam = `cursor: string | undefined`
- Next cursor from `data.pages[last].meta.next_cursor`

- [ ] Add `cursor` param to `searchBluedoorJobsAction`
- [ ] Update `discover/page.tsx` to use `prefetchInfiniteQuery`
- [ ] Switch `DiscoverResults` to `useInfiniteQuery` + flatten pages
- [ ] Add Load More button that calls `fetchNextPage()`
- [ ] Run lint + typecheck + test — PASS

---

### Task 5: Resend Email Alerts

**Files:**
- New: `lib/notifications/email.ts` — Resend client wrapper, graceful no-op
- Modify: `lib/bluedoor/enrich.ts` — call `sendPostingChangeEmail` on status change in `resyncJob`
- `.env.local` docs: `RESEND_API_KEY` + `EMAIL_FROM`

**Interfaces:**
- `sendPostingChangeEmail({ userId, jobId, position, company, changeType })` → `Promise<void>`
- `changeType: 'posting_closed' | 'jd_changed' | 'salary_added'`
- Uses Prisma to fetch user email from Clerk (via clerkId → Clerk API)

- [ ] Install `resend`: `npm install resend`
- [ ] Create `lib/notifications/email.ts`
- [ ] Call from `resyncJob` when `changed === true`
- [ ] Run lint + typecheck + test — PASS

---
