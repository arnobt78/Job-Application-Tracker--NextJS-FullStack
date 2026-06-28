/**
 * Bluedoor Job Postings API client
 *
 * No authentication required — completely free with high rate limits.
 * All requests go server-side only (Next.js Server Actions / API routes).
 * Base URL: https://api.bluedoor.sh/job-postings/v1
 */

import type {
  BluedoorJob,
  BluedoorFacetsResponse,
  BluedoorJobEventsResponse,
  BluedoorSearchParams,
  BluedoorSearchResponse,
  DiscoverFacets,
} from '@/lib/bluedoor/types';

const BLUEDOOR_BASE = 'https://api.bluedoor.sh/job-postings/v1';

/** Default fetch timeout — search can be slow on large indexes */
const DEFAULT_TIMEOUT_MS = 25_000;
const SEARCH_TIMEOUT_MS = 30_000;

// ─────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────

type BluedoorFetchOptions = RequestInit & { timeoutMs?: number };

async function bluedoorFetch<T>(
  path: string,
  init: BluedoorFetchOptions = {}
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchInit } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${BLUEDOOR_BASE}${path}`, {
      ...fetchInit,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...init.headers,
      },
      // Bypass Next.js fetch cache — Bluedoor data changes daily;
      // unstable_cache in queries.ts handles our own TTL layer.
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new BluedoorApiError(res.status, text);
    }

    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

export class BluedoorApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string
  ) {
    super(`Bluedoor API ${status}: ${body}`);
    this.name = 'BluedoorApiError';
  }
}

/**
 * Bluedoor returns 400 if both `status` and `active` are sent — use one only.
 * Prefer `active: true` for live postings unless caller explicitly sets `status`.
 */
function normalizeSearchParams(
  params: BluedoorSearchParams
): BluedoorSearchParams {
  const { status, active, ...rest } = params;
  if (active !== undefined) {
    return { ...rest, active };
  }
  if (status !== undefined) {
    return { ...rest, status };
  }
  return { ...rest, active: true };
}

// ─────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────

/**
 * POST /v1/jobs/search — primary discovery + enrichment lookup endpoint.
 * Prefers POST over GET to allow large `q` strings without URL length limits.
 */
export async function searchJobs(
  params: BluedoorSearchParams
): Promise<BluedoorSearchResponse> {
  // List search: skip description + exact total — much faster (detail on job page later)
  const body = normalizeSearchParams({
    include_total: false,
    limit: 20,
    ...params,
  });

  return bluedoorFetch<BluedoorSearchResponse>('/jobs/search', {
    method: 'POST',
    body: JSON.stringify(body),
    timeoutMs: SEARCH_TIMEOUT_MS,
  });
}

// ─────────────────────────────────────────────
// Detail
// ─────────────────────────────────────────────

/** GET /v1/jobs/{job_id} — full job detail used by resyncJob in enrich.ts */
export async function getJobDetail(jobId: string): Promise<BluedoorJob> {
  const res = await bluedoorFetch<{ data: BluedoorJob }>(
    `/jobs/${encodeURIComponent(jobId)}?include=description`
  );
  return res.data;
}

/** GET /v1/jobs/{job_id}/events — posting lifecycle events (status changes, JD edits, salary) */
export async function getJobEvents(
  bluedoorJobId: string,
  limit = 20
): Promise<BluedoorJobEventsResponse> {
  return bluedoorFetch<BluedoorJobEventsResponse>(
    `/jobs/${encodeURIComponent(bluedoorJobId)}/events?limit=${limit}`
  );
}

// ─────────────────────────────────────────────
// Facets
// ─────────────────────────────────────────────

/**
 * GET /v1/jobs/facets?field={field} — live bucket counts for one facet field.
 * Called in parallel for workplace_type + employment_type.
 */
async function getFacetField(
  field: string,
  params: { q?: string; country?: string }
): Promise<BluedoorFacetsResponse> {
  const qs = new URLSearchParams({ field, active: 'true' });
  if (params.q) qs.set('q', params.q);
  if (params.country) qs.set('country', params.country);
  return bluedoorFetch<BluedoorFacetsResponse>(`/jobs/facets?${qs.toString()}`);
}

/** Fetch workplace_type + employment_type facet counts in parallel for /discover filters. */
export async function getDiscoverFacets(
  params: { q?: string; country?: string }
): Promise<DiscoverFacets> {
  const [workplaceRes, employmentRes] = await Promise.allSettled([
    getFacetField('workplace_type', params),
    getFacetField('employment_type', params),
  ]);
  return {
    workplace_type: workplaceRes.status === 'fulfilled' ? workplaceRes.value.data : [],
    employment_type: employmentRes.status === 'fulfilled' ? employmentRes.value.data : [],
  };
}

// ─────────────────────────────────────────────
// Webhook subscription
// ─────────────────────────────────────────────

/**
 * POST /v1/webhook_endpoints/subscriptions — register to receive lifecycle events
 * for a specific Bluedoor job (closed, JD updated, salary added).
 * Returns the subscription ID to store in DB for later unsubscribe.
 * Returns null on any failure — enrichment must not be blocked by webhook errors.
 */
export async function registerBluedoorWebhook(
  bluedoorJobId: string
): Promise<string | null> {
  const webhookUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/bluedoor/webhook`
    : null;

  if (!webhookUrl) return null;

  try {
    const res = await bluedoorFetch<{ subscription_id?: string }>(
      '/webhook_endpoints/subscriptions',
      {
        method: 'POST',
        body: JSON.stringify({
          job_id: bluedoorJobId,
          url: webhookUrl,
          events: ['job.updated', 'job.closed', 'job.reopened'],
        }),
      }
    );
    return res.subscription_id ?? null;
  } catch {
    // Best-effort — webhook subscription failure must never break enrichment
    return null;
  }
}

/**
 * DELETE /v1/webhook_endpoints/subscriptions/{id} — unsubscribe when job is deleted.
 * Silent on any error — job is already being deleted.
 */
export async function unregisterBluedoorWebhook(subscriptionId: string): Promise<void> {
  try {
    await bluedoorFetch(`/webhook_endpoints/subscriptions/${encodeURIComponent(subscriptionId)}`, {
      method: 'DELETE',
    });
  } catch {
    // Ignore — job is being deleted regardless
  }
}

// ─────────────────────────────────────────────
// ATS URL Parser — extract provider + key from known ATS URL formats
// Used by enrich.ts to find exact Bluedoor matches without fuzzy search.
// ─────────────────────────────────────────────

export type AtsKey = {
  provider: string;
  providerJobKey: string;
};

/**
 * Parse an apply_url and extract ATS provider + job key.
 * Returns null when the URL doesn't match any known ATS pattern.
 *
 * Supported:
 *   Greenhouse — ?gh_jid=7858723
 *   Lever      — jobs.lever.co/{company}/{uuid}
 *   Ashby      — jobs.ashbyhq.com/{company}/{uuid}
 *   Workday    — {company}.wd*.myworkdayjobs.com/.../{id}
 */
export function parseAtsKey(rawUrl: string): AtsKey | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  // Greenhouse: ?gh_jid=<numeric-id>
  const ghJid = url.searchParams.get('gh_jid');
  if (ghJid) {
    return { provider: 'greenhouse', providerJobKey: ghJid };
  }

  const host = url.hostname.toLowerCase();
  const pathname = url.pathname;

  // Lever: jobs.lever.co/{company}/{uuid}
  if (host === 'jobs.lever.co') {
    const parts = pathname.split('/').filter(Boolean);
    // parts[0] = company, parts[1] = UUID job key
    if (parts.length >= 2 && isUuid(parts[1])) {
      return { provider: 'lever', providerJobKey: parts[1] };
    }
  }

  // Ashby: jobs.ashbyhq.com/{company}/{uuid}
  if (host === 'jobs.ashbyhq.com') {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 2 && isUuid(parts[1])) {
      return { provider: 'ashby', providerJobKey: parts[1] };
    }
  }

  // Workday: {company}.wd1.myworkdayjobs.com or .wd5. etc.
  if (host.includes('myworkdayjobs.com')) {
    // Workday job IDs appear in the last non-empty path segment
    const parts = pathname.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];
    if (lastPart) {
      return { provider: 'workday', providerJobKey: lastPart };
    }
  }

  return null;
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
