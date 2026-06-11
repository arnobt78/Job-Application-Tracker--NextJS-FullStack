/**
 * Sentry Node.js init — server actions, SSR, API routes (direct ingest, no tunnel).
 */
import * as Sentry from '@sentry/nextjs';
import { getServerSentryOptions } from '@/lib/sentry/config';

Sentry.init(getServerSentryOptions());
