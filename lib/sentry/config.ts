/**
 * Shared Sentry init options — single source for client/server/edge configs.
 * Client uses tunnel (/api/monitoring) so ad blockers cannot block ingest.de.sentry.io.
 */

import type { BrowserOptions, EdgeOptions, NodeOptions } from '@sentry/nextjs';

export const SENTRY_TUNNEL_PATH = '/api/monitoring';

type SentryBeforeSend = NonNullable<NodeOptions['beforeSend']>;
type SentryErrorEvent = Parameters<SentryBeforeSend>[0];

const isProduction = process.env.NODE_ENV === 'production';

/** Benign browser quirks and ad-blocker artifacts — safe to drop in every runtime */
const ignoreErrors: Array<string | RegExp> = [
  'top.GLOBALS',
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications',
  'Non-Error promise rejection captured',
  'Script error.',
];

/**
 * Browser-only: user-side network drops, navigation aborts, stale-deploy chunks.
 * Kept off server/edge so real upstream timeouts (e.g. AI service AbortSignal) still report.
 */
const clientOnlyIgnoreErrors: Array<string | RegExp> = [
  'AbortError',
  // Offline / aborted fetches: Chrome · Safari · Firefox wording
  'Failed to fetch',
  'Load failed',
  'NetworkError when attempting to fetch resource',
  // Stale tab after a deploy requests chunks that no longer exist (Turbopack · webpack wording)
  /Failed to load chunk/,
  /Loading (CSS )?chunk [\w-]+ failed/,
  /ChunkLoadError/,
];

/** Code injected by extensions / translators — never our bundle */
const THIRD_PARTY_PATTERNS: RegExp[] = [
  /(chrome|moz|safari|safari-web)-extension:\/\//i,
  /grammarly/i,
  /googletranslate|translate\.google/i,
];

/** Browser-only: drop events whose frames originate from extension URLs */
const denyUrls: RegExp[] = [/^(chrome|moz|safari|safari-web)-extension:\/\//i];

/**
 * Drop an event when every stack frame comes from third-party injected code.
 * Events with at least one app frame are kept so real bugs are never hidden.
 */
export function sentryBeforeSend(event: SentryErrorEvent): SentryErrorEvent | null {
  const frames =
    event.exception?.values?.flatMap((value) => value.stacktrace?.frames ?? []) ?? [];

  if (frames.length > 0) {
    const allThirdParty = frames.every((frame) =>
      THIRD_PARTY_PATTERNS.some((pattern) =>
        pattern.test(`${frame.filename ?? ''} ${frame.abs_path ?? ''}`)
      )
    );
    return allThirdParty ? null : event;
  }

  const message = event.message ?? event.exception?.values?.[0]?.value ?? '';
  return THIRD_PARTY_PATTERNS.some((pattern) => pattern.test(message)) ? null : event;
}

/** Browser bundle — only NEXT_PUBLIC_* is inlined at build time */
export function getClientDsn(): string | undefined {
  return process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || undefined;
}

/** Server/edge/tunnel — server-only alias first, public DSN as fallback */
export function getServerDsn(): string | undefined {
  return (
    process.env.SENTRY_DSN?.trim() ||
    process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() ||
    undefined
  );
}

/** Production builds only — local `next dev` never reports to the dashboard */
function isEnabled(dsn: string | undefined): boolean {
  return Boolean(dsn) && isProduction;
}

/** Browser SDK active — gates client-side helpers such as Sentry.setUser */
export function isSentryEnabled(): boolean {
  return isEnabled(getClientDsn());
}

/** Vercel preview vs production stay separable in Sentry (NODE_ENV is "production" for both) */
function getEnvironment(vercelEnv: string | undefined): string {
  return vercelEnv || process.env.NODE_ENV || 'development';
}

const sharedOptions = {
  tracesSampleRate: isProduction ? 0.1 : 1.0,
  debug: false,
  ignoreErrors,
  beforeSend: sentryBeforeSend,
};

/** Server + edge — direct DSN (not blocked server-side) */
export function getServerSentryOptions(): NodeOptions | EdgeOptions {
  const dsn = getServerDsn();
  return {
    ...sharedOptions,
    dsn,
    enabled: isEnabled(dsn),
    environment: getEnvironment(process.env.VERCEL_ENV),
  };
}

/** Browser — routes events through first-party tunnel to bypass ad blockers */
export function getClientSentryOptions(): BrowserOptions {
  const dsn = getClientDsn();
  return {
    ...sharedOptions,
    dsn,
    enabled: isEnabled(dsn),
    environment: getEnvironment(process.env.NEXT_PUBLIC_VERCEL_ENV),
    ignoreErrors: [...ignoreErrors, ...clientOnlyIgnoreErrors],
    tunnel: SENTRY_TUNNEL_PATH,
    denyUrls,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  };
}
