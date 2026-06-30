import { toast } from 'sonner';
import type { JobType } from '@/utils/types';
import {
  firstNameFrom,
  setPendingGoodbyeToast,
  setPendingWelcomeToast,
} from '@/lib/notifications/auth-toast-storage';

export {
  setPendingWelcomeToast,
  setPendingGoodbyeToast,
  setWelcomePending,
  consumeWelcomePending,
  firstNameFrom,
} from '@/lib/notifications/auth-toast-storage';

/** Post-login welcome — shown on dashboard after redirect */
export function notifyWelcome(firstName: string): void {
  toast.success(`Hello ${firstName} 👋`, {
    description: 'Welcome! Enjoy tracking your job applications with Jobify.',
    duration: 4500,
  });
}

/** Post-logout farewell — shown on landing after redirect */
export function notifyGoodbye(firstName: string): void {
  toast.success(`Goodbye ${firstName} 👋`, {
    description: 'See you soon again — your applications will be here when you return.',
    duration: 4500,
  });
}

export function notifyAuthError(message: string): void {
  toast.error('Sign in failed', { description: message, duration: 4000 });
}

export function notifySignUpError(message: string): void {
  toast.error('Sign up failed', { description: message, duration: 4000 });
}

export function notifyJobCreated(job: JobType): void {
  toast.success('Application added', {
    description: `${job.position} at ${job.company} is now on your dashboard.`,
    duration: 4000,
  });
}

export function notifyJobCreateError(
  position: string,
  company: string,
  detail?: string
): void {
  toast.error('Could not add application', {
    description:
      detail ??
      `Failed to save ${position} at ${company}. Please try again.`,
    duration: 5000,
  });
}

export function notifyJobUpdated(job: JobType): void {
  toast.success('Application updated', {
    description: `${job.position} at ${job.company} — status: ${job.status}.`,
    duration: 4000,
  });
}

export function notifyJobUpdateError(position: string, company: string): void {
  toast.error('Update failed', {
    description: `Could not update ${position} at ${company}.`,
    duration: 4000,
  });
}

export function notifyJobDeleted(job: JobType): void {
  toast.success('Application removed', {
    description: `${job.position} at ${job.company} was deleted from your list.`,
    duration: 4000,
  });
}

export function notifyJobDeleteError(position: string, company: string): void {
  toast.error('Delete failed', {
    description: `Could not remove ${position} at ${company}.`,
    duration: 4000,
  });
}

// ─────────────────────────────────────────────
// Bluedoor enrichment notifications
// ─────────────────────────────────────────────

/** Shown when Bluedoor enrichment succeeds and updates a card */
export function notifyEnrichmentComplete(company: string): void {
  toast.success('Posting data synced', {
    description: `Live status from ${company} was updated via Bluedoor.`,
    duration: 3500,
  });
}

/** Shown when enrichment is manually triggered but job has no apply URL */
export function notifyEnrichmentNoUrl(): void {
  toast.info('No apply URL found', {
    description: 'Add the apply URL to this job so Jobify can fetch live posting status.',
    duration: 4000,
  });
}

/** Shown when a tracked posting changes status (active → expired) */
export function notifyPostingClosed(position: string, company: string): void {
  toast.warning('Posting closed', {
    description: `${position} at ${company} — the job posting is no longer active.`,
    duration: 6000,
  });
}

/** Shown when salary data appears on a previously salary-less posting */
export function notifySalaryAdded(company: string, min: number, max: number, currency: string): void {
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
  toast.success('Salary disclosed', {
    description: `${company} added compensation: ${fmt(min)} – ${fmt(max)}.`,
    duration: 5000,
  });
}

/** Store welcome name before hard navigation to dashboard */
export function scheduleWelcomeAfterRedirect(displayName: string): void {
  setPendingWelcomeToast(firstNameFrom(displayName));
}

/** Store goodbye name before sign-out redirect */
export function scheduleGoodbyeAfterRedirect(displayName: string): void {
  setPendingGoodbyeToast(firstNameFrom(displayName));
}
