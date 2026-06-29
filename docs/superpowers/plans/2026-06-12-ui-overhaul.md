# UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace sidebar+broken-navbar with unified NavShell-based navigation, add ThemeToggle everywhere, convert Add/Edit Job to glassmorphic dialogs, rename `/jobs` to `/dashboard`.

**Architecture:** NavShell (server component, shared glass chrome) composed by three client nav variants: LandingNav (landing page), AuthNav (sign-in/sign-up), DashboardNav (logged-in pages). Sidebar removed; all links move to DashboardNav top bar. Add/Edit Job use Shadcn Dialog + GlassCard. Route `/dashboard` replaces `/jobs`; middleware redirects `/add-job` and `/jobs/*`.

**Tech Stack:** Next.js 16, React 19, Clerk 6, TanStack Query 5, Shadcn UI (Dialog needs install), Radix UI, Tailwind CSS, Vitest + @testing-library/react

---

## File Map

**New files:**

- `components/layout/nav-shell.tsx` — shared nav chrome (server component)
- `components/layout/auth-nav.tsx` — auth pages navbar (logo + ThemeToggle + Return Home)
- `components/layout/dashboard-nav.tsx` — dashboard navbar (logo + nav links + ThemeToggle + avatar)
- `components/dialogs/add-job-dialog.tsx` — glassmorphic Add Job dialog + trigger
- `components/dialogs/edit-job-dialog.tsx` — glassmorphic Edit Job dialog (trigger or defaultOpen)
- `components/ui/dialog.tsx` — Shadcn Dialog component (generated via CLI)
- `app/(dashboard)/dashboard/page.tsx` — new /dashboard route (jobs list + header)
- `app/(dashboard)/dashboard/[id]/page.tsx` — new /dashboard/[id] route (edit via dialog)
- `components/__tests__/FormComponents.test.tsx` — required prop tests

**Modified files:**

- `components/layout/landing-nav.tsx` — migrate to NavShell, add ThemeToggle
- `components/pages/SignInPageContent.tsx` — replace SiteLogo header with AuthNav
- `components/pages/SignUpPageContent.tsx` — replace SiteLogo header with AuthNav
- `app/(dashboard)/layout.tsx` — remove sidebar grid, use DashboardNav
- `components/FormComponents.tsx` — add `required` prop + asterisk to both components
- `components/CreateJobForm.tsx` — add `onSuccess` + `standalone` props
- `components/EditJobForm.tsx` — add `onSuccess` + `standalone` props
- `components/JobCard.tsx` — EditJobDialog trigger instead of RippleLink
- `hooks/useJobsMutation.ts` — remove `router.push('/jobs')` from useCreateJobMutation
- `proxy.ts` — update protected routes, add /add-job + /jobs redirects
- `utils/links.tsx` — update hrefs to /dashboard

**Kept but no longer imported (not deleted per project rules):**

- `components/Navbar.tsx` — superseded by DashboardNav
- `components/Sidebar.tsx` — superseded by DashboardNav
- `components/LinksDropdown.tsx` — superseded by DashboardNav mobile menu

---

## Task 1: NavShell — shared nav chrome

**Files:**

- Create: `components/layout/nav-shell.tsx`

- [ ] **Step 1: Create NavShell**

```tsx
// components/layout/nav-shell.tsx
import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

type NavShellProps = PropsWithChildren<{ className?: string }>;

/**
 * Shared nav chrome — fixed h-14, glass backdrop-blur, z-50.
 * Server component. LandingNav, AuthNav, DashboardNav all compose this.
 * Wraps PageContainer for consistent max-w-9xl content width.
 */
export function NavShell({ children, className }: NavShellProps) {
  return (
    <header
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-50 h-14 backdrop-blur-sm",
        className,
      )}
    >
      <PageContainer
        as="div"
        className="pointer-events-auto flex h-full items-center justify-between gap-4 bg-transparent"
      >
        {children}
      </PageContainer>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/nav-shell.tsx
git commit -m "feat: add NavShell shared nav chrome component"
```

---

## Task 2: Update LandingNav — add ThemeToggle, migrate to NavShell

**Files:**

- Modify: `components/layout/landing-nav.tsx`

- [ ] **Step 1: Replace LandingNav content**

Full new content for `components/layout/landing-nav.tsx`:

```tsx
"use client";

import { NavShell } from "@/components/layout/nav-shell";
import { SiteLogo } from "@/components/layout/site-logo";
import ThemeToggle from "@/components/ThemeToggle";
import { RippleLink } from "@/components/ui/ripple-link";
import { LANDING_SECTIONS } from "@/lib/ui/landing-sections";
import { cn } from "@/lib/utils";
import { UserPlus } from "lucide-react";

/** Fixed landing page nav — logo scroll-to-top | section links | ThemeToggle + CTA */
export function LandingNav() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <NavShell>
      {/* Logo — click scrolls to hero */}
      <button
        type="button"
        onClick={() => scrollToSection("hero")}
        className="flex h-full shrink-0 items-center rounded-lg transition hover:opacity-90"
        aria-label="Scroll to top"
      >
        <SiteLogo priority linked={false} />
      </button>

      {/* Center section links — hidden on mobile */}
      <nav
        className="hidden h-full items-center gap-0.5 md:flex"
        aria-label="Landing sections"
      >
        {LANDING_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollToSection(section.id)}
            className={cn(
              "flex h-8 items-center rounded-full px-3 text-sm font-medium text-foreground/75",
              "transition hover:bg-white/10 hover:text-foreground",
            )}
          >
            {section.label}
          </button>
        ))}
      </nav>

      {/* Right — ThemeToggle + Create Account CTA */}
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <RippleLink
          href="/sign-up"
          size="sm"
          className="h-9 gap-1.5 rounded-full border border-primary/30 px-4 text-xs sm:h-10 sm:px-5 sm:text-sm"
        >
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Create Account</span>
          <span className="sm:hidden">Sign up</span>
        </RippleLink>
      </div>
    </NavShell>
  );
}
```

- [ ] **Step 2: Verify no broken imports**

```bash
cd /Users/arnob_t78/Projects/ReactJS/react-course/18-nextjs-jobify-app && npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors for these files (other errors may exist — ignore for now).

- [ ] **Step 3: Commit**

```bash
git add components/layout/landing-nav.tsx
git commit -m "feat: migrate LandingNav to NavShell, add ThemeToggle"
```

---

## Task 3: AuthNav — minimal auth page navbar

**Files:**

- Create: `components/layout/auth-nav.tsx`

- [ ] **Step 1: Create AuthNav**

```tsx
// components/layout/auth-nav.tsx
"use client";

import { NavShell } from "@/components/layout/nav-shell";
import { SiteLogo } from "@/components/layout/site-logo";
import ThemeToggle from "@/components/ThemeToggle";
import { RippleLink } from "@/components/ui/ripple-link";
import { Home } from "lucide-react";

/**
 * Minimal navbar for sign-in and sign-up pages.
 * Logo (links to /) on left, ThemeToggle + Return Home button on right.
 */
export function AuthNav() {
  return (
    <NavShell>
      {/* Logo linked to landing page */}
      <SiteLogo priority />

      {/* Right — ThemeToggle + Return Home */}
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <RippleLink
          href="/"
          size="sm"
          className="h-9 gap-1.5 rounded-full border border-primary/30 px-4 text-xs shadow-sm shadow-primary/20 sm:h-10 sm:px-5 sm:text-sm"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Return Home</span>
        </RippleLink>
      </div>
    </NavShell>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/auth-nav.tsx
git commit -m "feat: add AuthNav for sign-in/sign-up pages"
```

---

## Task 4: DashboardNav — full dashboard top navbar

**Files:**

- Create: `components/layout/dashboard-nav.tsx`

- [ ] **Step 1: Create DashboardNav**

```tsx
// components/layout/dashboard-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavShell } from "@/components/layout/nav-shell";
import { SiteLogo } from "@/components/layout/site-logo";
import ThemeToggle from "@/components/ThemeToggle";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AlignLeft, BarChart2, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

/** Dashboard nav links — logo links here, active state tracked by pathname */
const NAV_LINKS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    href: "/stats",
    label: "Stats",
    icon: <BarChart2 className="h-4 w-4" />,
  },
] as const;

/**
 * Full dashboard top navbar — replaces legacy Navbar + Sidebar.
 * Logo left (links /dashboard) | nav pill links center (md+) | ThemeToggle + avatar right.
 * Mobile: hamburger dropdown for nav links.
 */
export function DashboardNav() {
  const pathname = usePathname();

  return (
    <NavShell>
      {/* Left — logo linked to /dashboard */}
      <Link
        href="/dashboard"
        className="flex h-full shrink-0 items-center rounded-lg transition hover:opacity-90"
        aria-label="Go to dashboard"
      >
        <SiteLogo priority linked={false} />
      </Link>

      {/* Center — pill nav links, visible md+ */}
      <nav
        className="hidden h-full items-center gap-0.5 md:flex"
        aria-label="Dashboard navigation"
      >
        {NAV_LINKS.map((link) => {
          const isActive =
            link.href === "/dashboard"
              ? pathname === "/dashboard" || pathname.startsWith("/dashboard/")
              : pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition",
                isActive
                  ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                  : "text-foreground/75 hover:bg-white/10 hover:text-foreground",
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Right — mobile hamburger + ThemeToggle + avatar */}
      <div className="flex items-center gap-2">
        {/* Mobile nav — hamburger dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <AlignLeft className="h-4 w-4" />
              <span className="sr-only">Toggle navigation</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" sideOffset={10} className="w-44">
            {NAV_LINKS.map((link) => (
              <DropdownMenuItem key={link.href} asChild>
                <Link href={link.href} className="flex items-center gap-2">
                  {link.icon}
                  {link.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />
        {/* Avatar with glow — UserProfileDropdown manages its own ring */}
        <div className="rounded-full shadow-sm shadow-primary/20 ring-1 ring-primary/10">
          <UserProfileDropdown />
        </div>
      </div>
    </NavShell>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/dashboard-nav.tsx
git commit -m "feat: add DashboardNav — replaces legacy Navbar + Sidebar"
```

---

## Task 5: FormComponents — add required prop + asterisk

**Files:**

- Create: `components/__tests__/FormComponents.test.tsx`
- Modify: `components/FormComponents.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// components/__tests__/FormComponents.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { CustomFormField, CustomFormSelect } from "@/components/FormComponents";

/** Minimal form context wrapper needed by react-hook-form components */
function WithForm({
  children,
}: {
  children: (ctrl: ReturnType<typeof useForm>["control"]) => React.ReactNode;
}) {
  const { control } = useForm({
    defaultValues: { position: "", status: "pending" },
  });
  return <form>{children(control)}</form>;
}

describe("CustomFormField required prop", () => {
  it("renders no asterisk when required is omitted", () => {
    const { container } = render(
      <WithForm>
        {(control) => <CustomFormField name="position" control={control} />}
      </WithForm>,
    );
    expect(container.querySelector(".text-destructive")).toBeNull();
  });

  it("renders destructive asterisk when required is true", () => {
    const { container } = render(
      <WithForm>
        {(control) => (
          <CustomFormField name="position" control={control} required />
        )}
      </WithForm>,
    );
    expect(container.querySelector(".text-destructive")).not.toBeNull();
    expect(container.querySelector(".text-destructive")?.textContent).toBe("*");
  });
});

describe("CustomFormSelect required prop", () => {
  it("renders no asterisk when required is omitted", () => {
    const { container } = render(
      <WithForm>
        {(control) => (
          <CustomFormSelect
            name="status"
            control={control}
            items={["pending", "interview"]}
            labelText="job status"
          />
        )}
      </WithForm>,
    );
    expect(container.querySelector(".text-destructive")).toBeNull();
  });

  it("renders destructive asterisk when required is true", () => {
    const { container } = render(
      <WithForm>
        {(control) => (
          <CustomFormSelect
            name="status"
            control={control}
            items={["pending", "interview"]}
            labelText="job status"
            required
          />
        )}
      </WithForm>,
    );
    expect(container.querySelector(".text-destructive")).not.toBeNull();
    expect(container.querySelector(".text-destructive")?.textContent).toBe("*");
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd /Users/arnob_t78/Projects/ReactJS/react-course/18-nextjs-jobify-app && npx vitest run components/__tests__/FormComponents.test.tsx 2>&1 | tail -20
```

Expected: tests fail with "required is not a valid prop" or similar type error.

- [ ] **Step 3: Update FormComponents.tsx**

Full new content for `components/FormComponents.tsx`:

```tsx
import { Control } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "./ui/input";

type CustomFormFieldProps = {
  name: string;
  control: Control<any>;
  /** Renders a red asterisk (*) after the label when true */
  required?: boolean;
};

export function CustomFormField({
  name,
  control,
  required = false,
}: CustomFormFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="capitalize">
            {name}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type CustomFormSelectProps = {
  name: string;
  control: Control<any>;
  items: string[];
  labelText?: string;
  /** Renders a red asterisk (*) after the label when true */
  required?: boolean;
};

export function CustomFormSelect({
  name,
  control,
  items,
  labelText,
  required = false,
}: CustomFormSelectProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="capitalize">
            {labelText || name}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="glass-input">
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
export default CustomFormSelect;
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd /Users/arnob_t78/Projects/ReactJS/react-course/18-nextjs-jobify-app && npx vitest run components/__tests__/FormComponents.test.tsx 2>&1 | tail -10
```

Expected: `4 tests passed`.

- [ ] **Step 5: Commit**

```bash
git add components/FormComponents.tsx components/__tests__/FormComponents.test.tsx
git commit -m "feat: add required prop with asterisk to CustomFormField and CustomFormSelect"
```

---

## Task 6: useCreateJobMutation — remove router.push navigation

**Files:**

- Modify: `hooks/useJobsMutation.ts`

The mutation currently calls `router.push('/jobs')` after create. With Add Job as a dialog on `/dashboard`, no navigation is needed — the dialog closes and the optimistic update already shows the new job.

- [ ] **Step 1: Remove useRouter and router.push from useCreateJobMutation**

In `hooks/useJobsMutation.ts`, make these two changes:

1. Remove `useRouter` from the import at the top:

Change:

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
```

To:

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
```

2. Inside `useCreateJobMutation`, remove `const router = useRouter();` and change `onSuccess`:

Change:

```ts
export function useCreateJobMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();
  const { invalidateAfterMutation } = useJobsInvalidation();

  return useMutation({
    // ...
    onSuccess: (data) => {
      if (!data) return;
      toast({ description: 'Job created successfully.' });
      invalidateAfterMutation(data.id);
      router.push('/jobs');
    },
```

To:

```ts
export function useCreateJobMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { invalidateAfterMutation } = useJobsInvalidation();

  return useMutation({
    // ...
    onSuccess: (data) => {
      if (!data) return;
      toast({ description: 'Job created successfully.' });
      invalidateAfterMutation(data.id);
      // No navigation — Add Job is a dialog on /dashboard; caller handles close via mutate() onSuccess callback
    },
```

- [ ] **Step 2: Run existing mutation tests to confirm no regression**

```bash
cd /Users/arnob_t78/Projects/ReactJS/react-course/18-nextjs-jobify-app && npx vitest run hooks/__tests__/useJobsMutation.test.ts 2>&1 | tail -10
```

Expected: all existing tests pass.

- [ ] **Step 3: Commit**

```bash
git add hooks/useJobsMutation.ts
git commit -m "refactor: remove router.push from useCreateJobMutation (Add Job is now a dialog)"
```

---

## Task 7: CreateJobForm — add onSuccess + standalone props

**Files:**

- Modify: `components/CreateJobForm.tsx`

- [ ] **Step 1: Update CreateJobForm**

Full new content for `components/CreateJobForm.tsx`:

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  JobStatus,
  JobMode,
  createAndEditJobSchema,
  CreateAndEditJobType,
} from "@/utils/types";
import { Form } from "@/components/ui/form";
import { Button } from "./ui/button";
import { CustomFormField, CustomFormSelect } from "./FormComponents";
import { useCreateJobMutation } from "@/hooks/useJobsMutation";
import { GlassCard } from "@/components/ui/glass-card";
import { PlusCircle } from "lucide-react";

type CreateJobFormProps = {
  /**
   * Called after successful job creation.
   * Used by AddJobDialog to close the dialog after create.
   */
  onSuccess?: () => void;
  /**
   * When false, renders form content without outer GlassCard wrapper.
   * Set to false when composing inside AddJobDialog (dialog provides its own glass chrome).
   */
  standalone?: boolean;
};

function CreateJobForm({ onSuccess, standalone = true }: CreateJobFormProps) {
  const form = useForm<CreateAndEditJobType>({
    resolver: zodResolver(createAndEditJobSchema),
    defaultValues: {
      position: "",
      company: "",
      location: "",
      status: JobStatus.Pending,
      mode: JobMode.FullTime,
    },
  });

  const { mutate, isPending } = useCreateJobMutation();

  function onSubmit(values: CreateAndEditJobType) {
    // Pass onSuccess as per-call callback — runs after hook-level onSuccess (toast + invalidation)
    mutate(values, { onSuccess: () => onSuccess?.() });
  }

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <h2 className="mb-6 flex items-center gap-2 text-4xl font-semibold capitalize">
          <PlusCircle className="h-8 w-8 text-sky-400" />
          Add Job
        </h2>
        <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CustomFormField name="position" control={form.control} required />
          <CustomFormField name="company" control={form.control} required />
          <CustomFormField name="location" control={form.control} required />
          <CustomFormSelect
            name="status"
            control={form.control}
            labelText="job status"
            items={Object.values(JobStatus)}
            required
          />
          <CustomFormSelect
            name="mode"
            control={form.control}
            labelText="job mode"
            items={Object.values(JobMode)}
            required
          />
          <Button
            type="submit"
            className="self-end capitalize"
            disabled={isPending}
          >
            {isPending ? "Creating..." : "Create Job"}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (!standalone) return formContent;
  return <GlassCard variant="sky">{formContent}</GlassCard>;
}

export default CreateJobForm;
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/arnob_t78/Projects/ReactJS/react-course/18-nextjs-jobify-app && npx tsc --noEmit 2>&1 | grep "CreateJobForm" | head -10
```

Expected: no errors for `CreateJobForm.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/CreateJobForm.tsx
git commit -m "feat: add onSuccess + standalone props to CreateJobForm"
```

---

## Task 8: EditJobForm — add onSuccess + standalone props

**Files:**

- Modify: `components/EditJobForm.tsx`

- [ ] **Step 1: Update EditJobForm**

Full new content for `components/EditJobForm.tsx`:

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import {
  JobStatus,
  JobMode,
  createAndEditJobSchema,
  CreateAndEditJobType,
} from "@/utils/types";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CustomFormField, CustomFormSelect } from "./FormComponents";
import { useQuery } from "@tanstack/react-query";
import { getSingleJobAction } from "@/utils/actions";
import { useUpdateJobMutation } from "@/hooks/useJobsMutation";
import { queryKeys } from "@/lib/query-keys";
import { GlassCard } from "@/components/ui/glass-card";
import { Pencil } from "lucide-react";

type EditJobFormProps = {
  jobId: string;
  /**
   * Called after successful update.
   * Used by EditJobDialog to close the dialog after save.
   */
  onSuccess?: () => void;
  /**
   * When false, renders form content without outer GlassCard wrapper.
   * Set to false when composing inside EditJobDialog.
   */
  standalone?: boolean;
};

function EditJobForm({
  jobId,
  onSuccess,
  standalone = true,
}: EditJobFormProps) {
  const { data } = useQuery({
    queryKey: queryKeys.job.detail(jobId),
    queryFn: () => getSingleJobAction(jobId),
  });

  const form = useForm<CreateAndEditJobType>({
    resolver: zodResolver(createAndEditJobSchema),
    defaultValues: {
      position: "",
      company: "",
      location: "",
      status: JobStatus.Pending,
      mode: JobMode.FullTime,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        position: data.position,
        company: data.company,
        location: data.location,
        status: data.status as JobStatus,
        mode: data.mode as JobMode,
      });
    }
  }, [data, form]);

  const { mutate, isPending } = useUpdateJobMutation(jobId);

  function onSubmit(values: CreateAndEditJobType) {
    // Pass onSuccess as per-call callback — runs after hook-level onSuccess (toast + invalidation)
    mutate(values, { onSuccess: () => onSuccess?.() });
  }

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <h2 className="mb-6 flex items-center gap-2 text-4xl font-semibold capitalize">
          <Pencil className="h-8 w-8 text-violet-400" />
          Edit Job
        </h2>
        <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CustomFormField name="position" control={form.control} required />
          <CustomFormField name="company" control={form.control} required />
          <CustomFormField name="location" control={form.control} required />
          <CustomFormSelect
            name="status"
            control={form.control}
            labelText="job status"
            items={Object.values(JobStatus)}
            required
          />
          <CustomFormSelect
            name="mode"
            control={form.control}
            labelText="job mode"
            items={Object.values(JobMode)}
            required
          />
          <Button
            type="submit"
            className="self-end capitalize"
            disabled={isPending}
          >
            {isPending ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (!standalone) return formContent;
  return <GlassCard variant="violet">{formContent}</GlassCard>;
}

export default EditJobForm;
```

- [ ] **Step 2: Commit**

```bash
git add components/EditJobForm.tsx
git commit -m "feat: add onSuccess + standalone props to EditJobForm"
```

---

## Task 9: Install Shadcn Dialog + AddJobDialog

**Files:**

- Create: `components/ui/dialog.tsx` (via CLI)
- Create: `components/dialogs/add-job-dialog.tsx`

- [ ] **Step 1: Install Shadcn Dialog component**

```bash
cd /Users/arnob_t78/Projects/ReactJS/react-course/18-nextjs-jobify-app && npx shadcn@latest add dialog --yes 2>&1 | tail -10
```

Expected: `components/ui/dialog.tsx` created, `@radix-ui/react-dialog` added to package.json.

- [ ] **Step 2: Verify dialog.tsx was created**

```bash
ls /Users/arnob_t78/Projects/ReactJS/react-course/18-nextjs-jobify-app/components/ui/dialog.tsx
```

Expected: file exists.

- [ ] **Step 3: Create dialogs directory and AddJobDialog**

```bash
mkdir -p /Users/arnob_t78/Projects/ReactJS/react-course/18-nextjs-jobify-app/components/dialogs
```

```tsx
// components/dialogs/add-job-dialog.tsx
"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import CreateJobForm from "@/components/CreateJobForm";

/**
 * Glassmorphic Add Job dialog with trigger button.
 * Renders trigger inline; wraps CreateJobForm in Dialog + GlassCard chrome.
 * On successful create: dialog closes (handled via CreateJobForm onSuccess prop).
 */
export function AddJobDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="gap-2 rounded-full border border-primary/30 shadow-sm shadow-primary/20"
      >
        <PlusCircle className="h-4 w-4" />
        Add Job
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-0 bg-transparent p-0 shadow-none sm:max-w-[660px]">
          {/* GlassCard provides sky glassmorphic chrome; standalone=false skips inner card */}
          <GlassCard variant="sky" className="w-full">
            <DialogHeader className="sr-only">
              <DialogTitle>Add New Job</DialogTitle>
            </DialogHeader>
            <CreateJobForm
              standalone={false}
              onSuccess={() => setOpen(false)}
            />
          </GlassCard>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/ui/dialog.tsx components/dialogs/add-job-dialog.tsx package.json package-lock.json
git commit -m "feat: install Shadcn Dialog, add glassmorphic AddJobDialog"
```

---

## Task 10: EditJobDialog

**Files:**

- Create: `components/dialogs/edit-job-dialog.tsx`

- [ ] **Step 1: Create EditJobDialog**

```tsx
// components/dialogs/edit-job-dialog.tsx
"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import EditJobForm from "@/components/EditJobForm";

type EditJobDialogProps = {
  jobId: string;
  /**
   * When provided, renders as a trigger button.
   * When omitted, use defaultOpen={true} for URL-based access (e.g. /dashboard/[id]).
   */
  showTrigger?: boolean;
  /**
   * Pre-opens the dialog — used when navigating directly to /dashboard/[id].
   * Pair with onExternalClose to navigate away when dialog closes.
   */
  defaultOpen?: boolean;
  /**
   * Called when dialog closes in defaultOpen mode.
   * Typically used to navigate back to /dashboard.
   */
  onExternalClose?: () => void;
};

/**
 * Glassmorphic Edit Job dialog.
 * Two usage modes:
 *  1. showTrigger=true (JobCard): renders an Edit button trigger.
 *  2. defaultOpen=true (URL /dashboard/[id]): opens immediately; onExternalClose navigates back.
 */
export function EditJobDialog({
  jobId,
  showTrigger = false,
  defaultOpen = false,
  onExternalClose,
}: EditJobDialogProps) {
  const [open, setOpen] = useState(defaultOpen);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && !showTrigger) {
      // Dialog closed in URL-access mode — let caller navigate away
      onExternalClose?.();
    }
  };

  return (
    <>
      {showTrigger && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => setOpen(true)}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="border-0 bg-transparent p-0 shadow-none sm:max-w-[660px]">
          {/* GlassCard provides violet glassmorphic chrome; standalone=false skips inner card */}
          <GlassCard variant="violet" className="w-full">
            <DialogHeader className="sr-only">
              <DialogTitle>Edit Job</DialogTitle>
            </DialogHeader>
            <EditJobForm
              jobId={jobId}
              standalone={false}
              onSuccess={() => handleOpenChange(false)}
            />
          </GlassCard>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dialogs/edit-job-dialog.tsx
git commit -m "feat: add glassmorphic EditJobDialog with trigger + defaultOpen modes"
```

---

## Task 11: /dashboard page route

**Files:**

- Create: `app/(dashboard)/dashboard/page.tsx`

This is the new main page: page header (title + Add Job dialog trigger) + SearchForm + JobsList, SSR-prefetched.

- [ ] **Step 1: Create dashboard folder and page**

```bash
mkdir -p /Users/arnob_t78/Projects/ReactJS/react-course/18-nextjs-jobify-app/app/\(dashboard\)/dashboard
```

```tsx
// app/(dashboard)/dashboard/page.tsx
import SearchForm from "@/components/SearchForm";
import JobsList from "@/components/JobsList";
import { AddJobDialog } from "@/components/dialogs/add-job-dialog";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/site-metadata";
import { queryKeys } from "@/lib/query-keys";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getAllJobsAction } from "@/utils/actions";
import { Briefcase } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Dashboard",
  description:
    "View, search, and filter all your job applications. Add new applications and track your progress.",
  path: "/dashboard",
  noIndex: true,
});

type DashboardPageProps = {
  searchParams: Promise<{
    search?: string;
    jobStatus?: string;
    page?: string;
  }>;
};

async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const search = params.search ?? "";
  const jobStatus = params.jobStatus ?? "all";
  const pageNumber = Number(params.page) || 1;

  // SSR prefetch — hydrates client useQuery with no loading state on first paint
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.jobs.list(search, jobStatus, pageNumber),
    queryFn: () => getAllJobsAction({ search, jobStatus, page: pageNumber }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* Page header — static server-rendered; no flash */}
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Briefcase className="h-7 w-7 text-primary" />
            My Jobs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track and manage your job applications
          </p>
        </div>
        {/* AddJobDialog — client component, renders trigger button + dialog */}
        <AddJobDialog />
      </div>

      {/* Filter row — client component with URL search params */}
      <SearchForm />

      {/* Jobs grid — client component, hydrated from SSR prefetch */}
      <JobsList />
    </HydrationBoundary>
  );
}

export default DashboardPage;
```

- [ ] **Step 2: Verify no import errors**

```bash
cd /Users/arnob_t78/Projects/ReactJS/react-course/18-nextjs-jobify-app && npx tsc --noEmit 2>&1 | grep "dashboard/page" | head -10
```

Expected: no errors for this file.

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/dashboard/page.tsx"
git commit -m "feat: add /dashboard page with header, AddJobDialog trigger, SSR prefetch"
```

---

## Task 12: /dashboard/[id] page route

**Files:**

- Create: `app/(dashboard)/dashboard/[id]/page.tsx` (server, SSR prefetch)
- Create: `components/pages/edit-job-dialog-page.tsx` (client, useRouter)

This page supports direct URL access to an edit dialog. Server component prefetches job data into HydrationBoundary so the form has no loading flash; client wrapper provides useRouter for close navigation.

- [ ] **Step 1: Create client wrapper**

```tsx
// components/pages/edit-job-dialog-page.tsx
"use client";

import { useRouter } from "next/navigation";
import { EditJobDialog } from "@/components/dialogs/edit-job-dialog";

type EditJobDialogPageProps = { jobId: string };

/**
 * Client shell for /dashboard/[id] — holds useRouter for dialog close navigation.
 * Job data is pre-fetched by server parent into HydrationBoundary.
 */
export function EditJobDialogPage({ jobId }: EditJobDialogPageProps) {
  const router = useRouter();

  return (
    <EditJobDialog
      jobId={jobId}
      defaultOpen={true}
      onExternalClose={() => router.push("/dashboard")}
    />
  );
}
```

- [ ] **Step 2: Create [id] folder and server page**

```bash
mkdir -p "/Users/arnob_t78/Projects/ReactJS/react-course/18-nextjs-jobify-app/app/(dashboard)/dashboard/[id]"
```

```tsx
// app/(dashboard)/dashboard/[id]/page.tsx
import { EditJobDialogPage } from "@/components/pages/edit-job-dialog-page";
import { queryKeys } from "@/lib/query-keys";
import { getSingleJobAction } from "@/utils/actions";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Edit Job",
  description: "Update or delete a job application in your Jobify tracker.",
  path: "/dashboard",
  noIndex: true,
});

/**
 * Direct URL access to job edit dialog — e.g. /dashboard/abc123.
 * Prefetches job data server-side so EditJobForm has no loading flash.
 * Renders EditJobDialogPage (client) which opens the dialog immediately.
 */
export default async function JobEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.job.detail(id),
    queryFn: () => getSingleJobAction(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EditJobDialogPage jobId={id} />
    </HydrationBoundary>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/dashboard/[id]/page.tsx" components/pages/edit-job-dialog-page.tsx
git commit -m "feat: add /dashboard/[id] route — SSR prefetch + pre-opened EditJobDialog"
```

---

## Task 13: JobCard — EditJobDialog trigger

**Files:**

- Modify: `components/JobCard.tsx`

Replace the `RippleLink href="/jobs/${job.id}"` Edit button with `EditJobDialog showTrigger`.

- [ ] **Step 1: Update JobCard**

Full new content for `components/JobCard.tsx`:

```tsx
import { JobType } from "@/utils/types";
import { MapPin, Briefcase, CalendarDays, RadioTower } from "lucide-react";
import { Separator } from "./ui/separator";
import JobInfo from "./JobInfo";
import DeleteJobButton from "./DeleteJobButton";
import { GlassCard } from "@/components/ui/glass-card";
import { EditJobDialog } from "@/components/dialogs/edit-job-dialog";

function JobCard({ job }: { job: JobType }) {
  const date = new Date(job.createdAt).toLocaleDateString();

  return (
    <GlassCard variant="neutral" className="overflow-hidden p-0">
      <div className="p-4 sm:p-6">
        <h3 className="flex items-center gap-2 text-xl font-semibold">
          <Briefcase className="h-5 w-5 text-primary" />
          {job.position}
        </h3>
        <p className="mt-1 text-muted-foreground">{job.company}</p>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-4 p-4 sm:p-6">
        <JobInfo icon={<Briefcase className="h-4 w-4" />} text={job.mode} />
        <JobInfo icon={<MapPin className="h-4 w-4" />} text={job.location} />
        <JobInfo icon={<CalendarDays className="h-4 w-4" />} text={date} />
        <JobInfo icon={<RadioTower className="h-4 w-4" />} text={job.status} />
      </div>
      <div className="flex gap-4 p-4 sm:p-6 pt-0">
        {/* EditJobDialog with showTrigger renders its own Edit button — replaces RippleLink nav */}
        <EditJobDialog jobId={job.id} showTrigger />
        <DeleteJobButton id={job.id} />
      </div>
    </GlassCard>
  );
}

export default JobCard;
```

- [ ] **Step 2: Commit**

```bash
git add components/JobCard.tsx
git commit -m "feat: replace JobCard edit link with EditJobDialog trigger"
```

---

## Task 14: Dashboard layout — remove sidebar, use DashboardNav

**Files:**

- Modify: `app/(dashboard)/layout.tsx`

- [ ] **Step 1: Update dashboard layout**

Full new content for `app/(dashboard)/layout.tsx`:

```tsx
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { PageContainer } from "@/components/layout/page-container";
import { PropsWithChildren } from "react";

export const dynamic = "force-dynamic";

/**
 * Dashboard layout — full-width top-nav only.
 * Sidebar removed; all nav links are in DashboardNav.
 * Content area starts below fixed h-14 navbar (pt-14 offset).
 */
function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <div className="app-shell-overlay" aria-hidden />
      <div className="relative z-10 flex min-h-screen flex-col">
        <DashboardNav />
        {/* pt-14 clears the fixed h-14 navbar */}
        <PageContainer className="flex-1 py-16 pt-[calc(3.5rem+2rem)]">
          {children}
        </PageContainer>
      </div>
    </div>
  );
}

export default DashboardLayout;
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/arnob_t78/Projects/ReactJS/react-course/18-nextjs-jobify-app && npx tsc --noEmit 2>&1 | grep "layout" | head -10
```

Expected: no errors for layout.tsx.

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/layout.tsx"
git commit -m "feat: remove sidebar from dashboard layout, use DashboardNav"
```

---

## Task 15: Auth pages — use AuthNav

**Files:**

- Modify: `components/pages/SignInPageContent.tsx`
- Modify: `components/pages/SignUpPageContent.tsx`

- [ ] **Step 1: Update SignInPageContent**

Full new content for `components/pages/SignInPageContent.tsx`:

```tsx
"use client";

import SignInForm from "@/components/SignInForm";
import { AuthMarketingPanel } from "@/components/layout/auth-marketing-panel";
import { AuthNav } from "@/components/layout/auth-nav";
import { PageContainer } from "@/components/layout/page-container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SplitContentLayout } from "@/components/layout/split-content-layout";

type SignInPageContentProps = {
  isGuest?: boolean;
};

/** Auth layout — AuthNav top, marketing copy left, form right; pt-14 clears fixed navbar */
export function SignInPageContent({ isGuest = false }: SignInPageContentProps) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      {/* AuthNav: logo + ThemeToggle + Return Home — fixed h-14 */}
      <AuthNav />

      <PageContainer className="flex-1 pb-12 pt-[calc(3.5rem+1.5rem)]">
        <SplitContentLayout
          reverseOnMobile
          minHeight="min-h-[calc(100vh-14rem)]"
          leading={<AuthMarketingPanel variant="sign-in" />}
          trailing={
            <div className="mx-auto w-full max-w-md md:mx-0 md:max-w-none">
              <SignInForm isGuest={isGuest} />
            </div>
          }
        />
      </PageContainer>

      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 2: Update SignUpPageContent**

Full new content for `components/pages/SignUpPageContent.tsx`:

```tsx
"use client";

import SignUpForm from "@/components/SignUpForm";
import { AuthMarketingPanel } from "@/components/layout/auth-marketing-panel";
import { AuthNav } from "@/components/layout/auth-nav";
import { PageContainer } from "@/components/layout/page-container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SplitContentLayout } from "@/components/layout/split-content-layout";

/** Auth layout — AuthNav top, marketing copy left, form right; pt-14 clears fixed navbar */
export function SignUpPageContent() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      {/* AuthNav: logo + ThemeToggle + Return Home — fixed h-14 */}
      <AuthNav />

      <PageContainer className="flex-1 pb-12 pt-[calc(3.5rem+1.5rem)]">
        <SplitContentLayout
          reverseOnMobile
          minHeight="min-h-[calc(100vh-14rem)]"
          leading={<AuthMarketingPanel variant="sign-up" />}
          trailing={
            <div className="mx-auto w-full max-w-md md:mx-0 md:max-w-none">
              <SignUpForm />
            </div>
          }
        />
      </PageContainer>

      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/pages/SignInPageContent.tsx components/pages/SignUpPageContent.tsx
git commit -m "feat: replace standalone logo header with AuthNav in sign-in/sign-up pages"
```

---

## Task 16: Middleware — update routes + add redirects

**Files:**

- Modify: `proxy.ts`

- [ ] **Step 1: Update proxy.ts**

Full new content for `proxy.ts`:

```ts
/**
 * Next.js Proxy — route protection via Clerk (Next.js 16+)
 * Lightweight auth gate before page render; authoritative checks live in server actions.
 *
 * Redirects:
 *   /add-job → /dashboard  (legacy route removed; Add Job is now a dialog)
 *   /jobs/*  → /dashboard  (route renamed to /dashboard)
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/stats",
  "/user-profile(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Redirect legacy /add-job to /dashboard
  if (pathname === "/add-job") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect legacy /jobs routes to /dashboard
  if (pathname.startsWith("/jobs")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

- [ ] **Step 2: Commit**

```bash
git add proxy.ts
git commit -m "feat: update middleware — protect /dashboard, redirect /add-job + /jobs to /dashboard"
```

---

## Task 17: utils/links — update hrefs

**Files:**

- Modify: `utils/links.tsx`

The `links` array is used by legacy `LinksDropdown` (kept but no longer imported in main layout). Update hrefs so if it's referenced anywhere else, it points to correct routes.

- [ ] **Step 1: Update links.tsx**

Full new content for `utils/links.tsx`:

```tsx
import { AreaChart, AppWindow } from "lucide-react";

type NavLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

/**
 * Legacy nav links array — used by LinksDropdown (kept but superseded by DashboardNav).
 * Hrefs updated to new /dashboard route.
 */
const links: NavLink[] = [
  {
    href: "/dashboard",
    label: "all jobs",
    icon: <AppWindow />,
  },
  {
    href: "/stats",
    label: "stats",
    icon: <AreaChart />,
  },
];

export default links;
```

- [ ] **Step 2: Commit**

```bash
git add utils/links.tsx
git commit -m "refactor: update links hrefs to /dashboard, remove /add-job entry"
```

---

## Task 18: Full verification

- [ ] **Step 1: Run all tests**

```bash
cd /Users/arnob_t78/Projects/ReactJS/react-course/18-nextjs-jobify-app && npm run test 2>&1 | tail -20
```

Expected: all tests pass (including new FormComponents tests).

- [ ] **Step 2: Typecheck**

```bash
cd /Users/arnob_t78/Projects/ReactJS/react-course/18-nextjs-jobify-app && npm run typecheck 2>&1 | tail -20
```

Expected: 0 type errors.

- [ ] **Step 3: Lint**

```bash
cd /Users/arnob_t78/Projects/ReactJS/react-course/18-nextjs-jobify-app && npm run lint 2>&1 | tail -20
```

Expected: 0 errors (warnings acceptable).

- [ ] **Step 4: Build**

```bash
cd /Users/arnob_t78/Projects/ReactJS/react-course/18-nextjs-jobify-app && npm run build 2>&1 | tail -30
```

Expected: build succeeds, all routes compiled.

- [ ] **Step 5: Start dev server and manually verify**

```bash
cd /Users/arnob_t78/Projects/ReactJS/react-course/18-nextjs-jobify-app && npm run dev
```

Manual checks:

1. Landing page (`/`) — navbar has logo | section links | ThemeToggle | Create Account
2. Sign-in (`/sign-in`) — AuthNav with logo | ThemeToggle | Return Home; form visible
3. Sign-up (`/sign-up`) — same AuthNav treatment
4. Dashboard (`/dashboard`) — DashboardNav: logo | Dashboard (active) | Stats | ThemeToggle | avatar
5. Click "Add Job" button — glassmorphic sky dialog opens with form + required asterisks
6. Create a job — dialog closes, job appears optimistically in list
7. Click "Edit" on a job card — violet dialog opens with pre-filled form
8. Save edit — dialog closes, card updates immediately
9. Navigate to `/stats` — DashboardNav shows Stats link as active
10. Navigate to `/add-job` — redirects to `/dashboard`
11. Navigate to `/jobs` — redirects to `/dashboard`
12. Toggle dark/light mode on landing, auth, and dashboard pages

- [ ] **Step 6: Commit final state**

```bash
git add -A
git commit -m "chore: ui overhaul complete — NavShell, AuthNav, DashboardNav, dialogs, /dashboard route"
```

---

## Spec Coverage Verification

| Spec Section                                 | Covered By          |
| -------------------------------------------- | ------------------- |
| §1 Route Architecture                        | Task 11, 12, 16, 17 |
| §2a NavShell                                 | Task 1              |
| §2b LandingNav ThemeToggle                   | Task 2              |
| §2c AuthNav                                  | Task 3              |
| §2d DashboardNav                             | Task 4              |
| §3 Dashboard Layout                          | Task 14             |
| §4 Dashboard Page                            | Task 11             |
| §5 AddJobDialog                              | Task 9              |
| §6 EditJobDialog + JobCard + /dashboard/[id] | Task 10, 12, 13     |
| §7 Auth Pages AuthNav                        | Task 15             |
| §8 Landing ThemeToggle                       | Task 2              |
| §9 FormComponents required                   | Task 5              |
| §10 Data flow (no changes)                   | ✓ unchanged         |
| §11 Files list                               | All tasks           |
| §12 Non-goals                                | ✓ not touched       |
