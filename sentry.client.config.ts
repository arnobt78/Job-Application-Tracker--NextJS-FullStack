/**
 * Sentry browser init — tunnel sends envelopes to /api/monitoring (ad-blocker safe).
 */
import * as Sentry from '@sentry/nextjs';
import { getClientSentryOptions } from '@/lib/sentry/config';

Sentry.init(getClientSentryOptions());
