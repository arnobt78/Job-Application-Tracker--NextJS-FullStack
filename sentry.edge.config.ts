/** Sentry Edge init — middleware.ts and edge routes (direct ingest, no tunnel). */
import * as Sentry from '@sentry/nextjs';
import { getServerSentryOptions } from '@/lib/sentry/config';

Sentry.init(getServerSentryOptions());
