/**
 * Sentry browser init — Next.js client instrumentation hook (runs before hydration).
 * Replaces sentry.client.config.ts, which Turbopack builds never load.
 * Envelopes go to the same-origin /api/monitoring tunnel (ad-blocker safe).
 */
import * as Sentry from '@sentry/nextjs';
import { getClientSentryOptions } from '@/lib/sentry/config';

Sentry.init({
  ...getClientSentryOptions(),
  // Default 'route' lifecycle sends a session envelope on every client navigation;
  // one session per page load keeps crash-free stats without the request noise
  integrations: (defaults) => [
    ...defaults.filter((integration) => integration.name !== 'BrowserSession'),
    Sentry.browserSessionIntegration({ lifecycle: 'page' }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
