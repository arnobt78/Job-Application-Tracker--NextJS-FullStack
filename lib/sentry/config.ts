/**
 * Shared Sentry init options — single source for client/server/edge configs.
 * Client uses tunnel (/api/monitoring) so ad blockers cannot block ingest.de.sentry.io.
 */

import type { BrowserOptions, EdgeOptions, NodeOptions } from '@sentry/nextjs';

export const SENTRY_TUNNEL_PATH = '/api/monitoring';

const isProduction = process.env.NODE_ENV === 'production';

/** Common ignore list — extension noise, ad-blocker artifacts, benign browser quirks */
const ignoreErrors = [
  'top.GLOBALS',
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications',
  'Non-Error promise rejection captured',
  'Load failed',
  'NetworkError when attempting to fetch resource',
];

function getDsn(): string | undefined {
  return process.env.NEXT_PUBLIC_SENTRY_DSN;
}

/** No-op when DSN unset — zero overhead for local dev without Sentry */
export function isSentryEnabled(): boolean {
  return Boolean(getDsn());
}

/** Server + edge — direct DSN (not blocked server-side) */
export function getServerSentryOptions(): NodeOptions | EdgeOptions {
  return {
    dsn: getDsn(),
    enabled: isSentryEnabled(),
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    debug: false,
    ignoreErrors,
  };
}

/** Browser — routes events through first-party tunnel to bypass ad blockers */
export function getClientSentryOptions(): BrowserOptions {
  return {
    ...getServerSentryOptions(),
    tunnel: SENTRY_TUNNEL_PATH,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  };
}
