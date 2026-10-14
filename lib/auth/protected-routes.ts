/**
 * Authenticated route prefixes — single source of truth.
 * Consumed by `proxy.ts` (redirect to /sign-in when no session) and
 * `app/robots.ts` (disallow crawling). Dependency-free so it stays safe
 * inside the proxy bundle.
 */
export const PROTECTED_PREFIXES = [
  '/dashboard',
  '/discover',
  '/stats',
  '/timeline',
  '/profile',
  '/team',
] as const;
