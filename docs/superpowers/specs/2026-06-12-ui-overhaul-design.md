# Jobify UI Overhaul — Design Spec

**Date:** 2026-06-12  
**Scope:** Landing · Auth · Dashboard nav/layout · Route refactor · Add/Edit Job dialogs  
**Approach:** B — NavShell base + 3 focused nav components

---

## 1. Route Architecture

| Old Route                           | New Route         | Action                                           |
| ----------------------------------- | ----------------- | ------------------------------------------------ |
| `/add-job`                          | removed           | Redirect `/add-job` → `/dashboard` in middleware |
| `/jobs`                             | `/dashboard`      | Rename folder; main dashboard page               |
| `/jobs/[id]`                        | `/dashboard/[id]` | Rename folder; job edit via dialog               |
| `/stats`                            | `/stats`          | Unchanged                                        |
| `/user-profile/[[...user-profile]]` | same              | Unchanged                                        |

**Middleware (`proxy.ts`):** Protect `/dashboard`, `/dashboard/:path*`, `/stats`, `/user-profile/:path*`. Remove guards for `/add-job`, `/jobs`.

**Folder structure after rename:**

```
app/(dashboard)/
  layout.tsx                  ← no sidebar; uses DashboardNav
  dashboard/
    page.tsx                  ← jobs list + Add Job dialog trigger (force-dynamic, SSR prefetch)
    [id]/
      page.tsx                ← prefetch single job, renders EditJobDialog defaultOpen
  stats/
    page.tsx                  ← unchanged
```

---

## 2. Navigation Architecture

### 2a. `NavShell` (`components/layout/nav-shell.tsx`)

- Server component (no hooks — pure chrome)
- Fixed `h-14`, `glass-nav` backdrop-blur, `z-50`, `inset-x-0 top-0`
- Wraps `PageContainer` inside for max-w-9xl content width
- Accepts `children: React.ReactNode`
- Replaces `LANDING_CHROME_HEIGHT_CLASS` / `LANDING_CHROME_SHELL_CLASS` constants for all navs
- `LandingNav`, `AuthNav`, `DashboardNav` are client components that compose `NavShell`

### 2b. `LandingNav` (update existing `components/layout/landing-nav.tsx`)

- Add `<ThemeToggle />` between section nav links and "Create Account" CTA
- No structural changes

### 2c. `AuthNav` (new `components/layout/auth-nav.tsx`)

- Client component (uses `useRouter`)
- Left: `SiteLogo` linked to `/`
- Right: `ThemeToggle` + "Return Home" `RippleLink` href="/"
  - Return Home style: `House` icon + label, glassmorphic `border border-primary/30 shadow-sm shadow-primary/20 rounded-full`
- Used by `SignInPageContent` and `SignUpPageContent` (replace current standalone `SiteLogo` header)

### 2d. `DashboardNav` (new `components/layout/dashboard-nav.tsx`) — replaces `Navbar.tsx` + `Sidebar.tsx`

- Client component (uses `usePathname` for active link state)
- **Left:** `SiteLogo` linked to `/dashboard`
- **Center (md+):** `Dashboard` (href `/dashboard`) + `Stats` (href `/stats`) as pill buttons
  - Active: `bg-primary/10 text-primary` ring; Inactive: `text-foreground/75 hover:bg-white/10`
- **Right:** `ThemeToggle` + `UserProfileDropdown` (existing component, shadow-glow avatar)
- **Mobile (< md):** hamburger `DropdownMenu` showing Dashboard + Stats links (replace `LinksDropdown`)

---

## 3. Dashboard Layout (`app/(dashboard)/layout.tsx`)

Remove:

- `lg:grid-cols-5` grid
- `glass-sidebar` div + `<Sidebar />`
- Import of `Navbar` + `Sidebar`

Add:

- `<DashboardNav />` sticky at top
- Full-width `<PageContainer>` wrapping `{children}`

```tsx
// Before: app-shell > grid (sidebar col-1 | content col-4)
// After:  app-shell > DashboardNav sticky + PageContainer flex-col
```

---

## 4. Dashboard Page (`/dashboard`)

**`app/(dashboard)/dashboard/page.tsx`** — SSR, `force-dynamic`:

- Prefetch jobs query → `HydrationBoundary`
- Renders `DashboardPageContent` (server shell — static header + client boundary)

**Page header (static, SSR):**

```
[Briefcase icon] My Jobs                    [+ Add Job button]
Track and manage your job applications
```

- Title: `text-3xl font-bold`
- Subtitle: `text-muted-foreground text-sm`
- "Add Job" trigger: `RippleButton` with `PlusCircle` icon, glassmorphic style

**Below header:** `SearchForm` (existing) + `JobsList` (existing) inside `HydrationBoundary`

---

## 5. Add Job Dialog (`components/dialogs/add-job-dialog.tsx`)

- Shadcn `Dialog` component
- Trigger: `RippleButton` (glassmorphic, `PlusCircle` icon, "Add Job" label)
- `DialogContent`: `GlassCard variant="sky"` wrapper, shadow glow `shadow-lg shadow-sky-500/20`
- Form: inline `CreateJobForm` fields (no outer card wrapper since dialog provides it)
- `useCreateJobMutation` receives `onSuccess` callback → `setOpen(false)` + toast
- Mandatory `*` on labels via `CustomFormField` update (add `required` prop)

---

## 6. Edit Job Dialog (`components/dialogs/edit-job-dialog.tsx`)

- Same glass dialog treatment as Add Job
- Props: `job: JobType`, `open: boolean`, `onOpenChange: (open: boolean) => void`
- Form: inline `EditJobForm` fields
- `useEditJobMutation` onSuccess: `onOpenChange(false)` + toast + cache invalidation

**`JobCard` update:**

- Replace `RippleLink href={/jobs/${job.id}}` Edit button with `EditJobDialog` trigger
- `EditJobDialog` rendered inline on each card, controlled via local `useState`

**`/dashboard/[id]/page.tsx`:**

- Server: prefetch single job → `HydrationBoundary`
- Client: renders `EditJobDialog defaultOpen={true}` — supports direct URL edit link
- On dialog close: `router.push('/dashboard')`

---

## 7. Auth Pages Updates

**`SignInPageContent` + `SignUpPageContent`:**

- Remove standalone `<PageContainer className="py-6"><SiteLogo /></PageContainer>` header
- Add `<AuthNav />` at top (same glass sticky nav used on landing)
- Keep `SplitContentLayout` + `AuthMarketingPanel` + form content unchanged
- `ThemeToggle` in `AuthNav` provides dark/light mode on auth pages

**`app/sign-in/[[...sign-in]]/page.tsx`** + `app/sign-up/[[...sign-up]]/page.tsx`:

- No structural changes needed; `AuthNav` rendered inside `SignInPageContent`

---

## 8. Landing Page Updates

**`LandingNav`:** Add `<ThemeToggle />` right of section nav links, left of "Create Account" CTA.

---

## 9. Form Field Updates

**`CustomFormField` in `FormComponents.tsx`:**

- Add optional `required?: boolean` prop
- When `required=true`, append `<span className="text-destructive ml-0.5">*</span>` after label text

**`CustomFormSelect`:**

- Same `required` prop treatment

---

## 10. Data Flow (unchanged architecture)

- `force-dynamic` on all dashboard pages
- SSR prefetch in `page.tsx` → `dehydrate` → `HydrationBoundary` → client `useQuery`
- CRUD via `utils/actions.ts` → `invalidateUserJobCaches()` → BroadcastChannel cross-tab sync
- `useJobsMutation.ts` optimistic updates unchanged
- `useJobsCacheSync.ts` (SSE Redis Streams) unchanged

---

## 11. Files Created / Modified

**New files:**

- `components/layout/nav-shell.tsx`
- `components/layout/auth-nav.tsx`
- `components/layout/dashboard-nav.tsx`
- `components/dialogs/add-job-dialog.tsx`
- `components/dialogs/edit-job-dialog.tsx`
- `app/(dashboard)/dashboard/page.tsx` (rename from `/jobs/page.tsx`)
- `app/(dashboard)/dashboard/[id]/page.tsx` (rename from `/jobs/[id]/page.tsx`)

**Modified files:**

- `components/layout/landing-nav.tsx` — add ThemeToggle
- `components/layout/auth-nav.tsx` — replaces standalone SiteLogo in auth pages
- `app/(dashboard)/layout.tsx` — remove sidebar grid, use DashboardNav
- `components/pages/SignInPageContent.tsx` — use AuthNav
- `components/pages/SignUpPageContent.tsx` — use AuthNav
- `components/JobCard.tsx` — EditJobDialog trigger
- `components/FormComponents.tsx` — required prop + asterisk
- `proxy.ts` (middleware) — update protected routes
- `utils/links.tsx` — update hrefs to `/dashboard`

**Deprecated (keep file, no longer imported):**

- `components/Navbar.tsx` — superseded by DashboardNav
- `components/Sidebar.tsx` — superseded by DashboardNav
- `components/LinksDropdown.tsx` — superseded by DashboardNav mobile menu

---

## 12. Non-Goals

- No changes to SSR/cache/SSE/invalidation logic
- No new DB schema or actions
- No changes to `StatsContainer`, `ChartsContainer`, `UserProfileDropdown`
- No Sentry config changes
- No new authentication flows
