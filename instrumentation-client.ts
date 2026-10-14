/**
 * Sentry browser init — Next.js client instrumentation hook (runs before hydration).
 * Replaces sentry.client.config.ts, which Turbopack builds never load.
 * Envelopes go to the same-origin /api/monitoring tunnel (ad-blocker safe).
 */
import * as Sentry from '@sentry/nextjs';
import { getClientSentryOptions } from '@/lib/sentry/config';

Sentry.init(getClientSentryOptions());

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
