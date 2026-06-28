/**
 * PostHog analytics wrapper — lazy singleton init.
 *
 * All functions are no-ops when NEXT_PUBLIC_POSTHOG_KEY is absent
 * so the analytics dependency never blocks development or CI.
 *
 * Usage:
 *   initPostHog()               — call once in PostHogProvider on mount
 *   trackEvent('job_created')   — fire anywhere (client-only)
 *   identifyUser(userId)        — call after NextAuth session resolves
 *   resetAnalyticsUser()        — call on logout
 */

import type posthogLib from 'posthog-js';

// Lazy import to avoid SSR import of browser-only posthog-js
let ph: typeof posthogLib | null = null;

function isClient() {
  return typeof window !== 'undefined';
}

function hasKey() {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
}

/** Initialise PostHog once. Safe to call multiple times (idempotent). */
export function initPostHog(): void {
  if (!isClient() || !hasKey() || ph) return;

  // Dynamic import keeps posthog-js out of the server bundle
  import('posthog-js').then(({ default: posthog }) => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: false, // Manual tracking only — avoids PII capture on form fields
      disable_session_recording: false,
    });
    ph = posthog;
  }).catch(() => {
    // posthog-js load failure is non-fatal
  });
}

/** Track a custom event with optional properties. No-op if PostHog not initialised. */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
): void {
  if (!isClient() || !ph) return;
  ph.capture(event, properties);
}

/** Associate subsequent events with a specific user. Call after NextAuth session resolves. */
export function identifyUser(
  userId: string,
  traits?: Record<string, unknown>
): void {
  if (!isClient() || !ph) return;
  ph.identify(userId, traits);
}

/** Reset analytics identity on logout. */
export function resetAnalyticsUser(): void {
  if (!isClient() || !ph) return;
  ph.reset();
}
