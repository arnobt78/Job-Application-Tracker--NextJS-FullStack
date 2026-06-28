/**
 * Bluedoor Job Postings API — TypeScript types
 *
 * Base URL: https://api.bluedoor.sh/job-postings/v1
 * Auth: none (free, no API key required)
 * Coverage: 1.8M jobs · 60k+ companies · refreshed daily
 * Sources: Greenhouse, Lever, Ashby, Workday, 30+ ATS providers
 */

// ─────────────────────────────────────────────
// Core Entities
// ─────────────────────────────────────────────

export type BluedoorEmploymentType =
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'temporary'
  | 'internship'
  | 'per_diem'
  | 'volunteer'
  | 'unknown';

export type BluedoorWorkplaceType = 'remote' | 'hybrid' | 'on_site';

export type BluedoorJobStatus = 'active' | 'expired';

export type BluedoorProvider =
  | 'greenhouse'
  | 'lever'
  | 'ashby'
  | 'workday'
  | string; // other ATS providers

/** Parsed location block from Bluedoor's NLP inference */
export type BluedoorParsedLocation = {
  raw: string;
  city: string | null;
  region: string | null;
  country: string | null;
  is_remote: boolean;
  confidence: number;
};

/** Full job record returned by GET /v1/jobs/{job_id} or POST /v1/jobs/search with include=description */
export type BluedoorJob = {
  job_id: string;
  org_id: string;
  source_id: string;
  board_id: string;
  provider: BluedoorProvider;
  provider_job_key: string;
  title: string;
  normalized_title: string | null;
  status: BluedoorJobStatus;
  active: boolean;
  location_text: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  department: string | null;
  team: string | null;
  employment_type: string | null; // raw string from ATS
  workplace_type: BluedoorWorkplaceType | null;
  salary_raw: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_period: string | null;
  source_url: string;
  apply_url: string;
  // Only present when ?include=description is requested
  description_text?: string | null;
  event_fields: {
    content_hash: string;
    last_changed_at: string; // ISO-8601
    active_status: string;
  };
  parsed_structured: {
    language?: string;
    location?: BluedoorParsedLocation;
    salary_max?: number | null;
    salary_min?: number | null;
    inferred_at?: string;
    launch_scope?: {
      reason: string;
      included: boolean;
      language: string;
      location?: BluedoorParsedLocation;
      countries?: string[];
    };
    remote_policy?: string | null;
    salary_period?: string | null;
    workplace_type?: string | null;
    salary_currency?: string | null;
  };
};

// ─────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────

/** Parameters for POST /v1/jobs/search */
export type BluedoorSearchParams = {
  q?: string;                         // tokenised search over title + department
  title?: string;                     // title-only search
  active?: boolean;
  status?: BluedoorJobStatus;
  location_text?: string;
  city?: string;
  region?: string;
  country?: string;
  department?: string;
  employment_type?: BluedoorEmploymentType;
  workplace_type?: BluedoorWorkplaceType;
  salary_min?: number;
  salary_max?: number;
  salary_exists?: boolean;
  posted_after?: string;              // ISO-8601
  posted_before?: string;
  updated_after?: string;
  changed_after?: string;
  first_seen_after?: string;
  first_seen_before?: string;
  include?: 'description';
  include_total?: boolean;
  limit?: number;                     // 1–100
  cursor?: string;                    // opaque pagination cursor
};

/** GET /v1/jobs/search response */
export type BluedoorSearchResponse = {
  data: BluedoorJob[];
  meta: {
    total_matching?: number;
    total_matching_unavailable?: boolean;
    limit: number;
    next_cursor?: string;
    order: string;
  };
};

// ─────────────────────────────────────────────
// Facets
// ─────────────────────────────────────────────

export type BluedoorFacetField =
  | 'country'
  | 'region'
  | 'city'
  | 'department'
  | 'employment_type'
  | 'workplace_type'
  | 'remote_policy';

export type BluedoorFacetItem = {
  value: string;
  count: number;
};

export type BluedoorFacetsResponse = {
  data: BluedoorFacetItem[];
  meta: {
    field: BluedoorFacetField;
    count: number;
    limit: number;
  };
};

/** Combined facets for the /discover filter bar — fetched in parallel */
export type DiscoverFacets = {
  workplace_type: BluedoorFacetItem[];
  employment_type: BluedoorFacetItem[];
};

// ─────────────────────────────────────────────
// Job Events (lifecycle)
// ─────────────────────────────────────────────

export type BluedoorEventType =
  | 'job.created'
  | 'job.updated'
  | 'job.closed'
  | 'job.reopened';

export type BluedoorJobEvent = {
  event_id: string;
  event_key: string;
  event_schema_version: string;
  job_id: string;
  org_id: string;
  source_id: string;
  board_id: string;
  provider: BluedoorProvider;
  event_type: BluedoorEventType;
  field_name: string | null;
  old_value: unknown;
  new_value: unknown;
  observed_at: string; // ISO-8601
  source_hash: string;
  metadata: Record<string, unknown>;
};

export type BluedoorJobEventsResponse = {
  data: BluedoorJobEvent[];
  meta: {
    count: number;
    limit: number;
  };
};

// ─────────────────────────────────────────────
// Webhook payload (inbound POST to our /api/bluedoor/webhook)
// ─────────────────────────────────────────────

/**
 * Bluedoor delivers this JSON body when a subscribed job changes.
 * We validate with BLUEDOOR_WEBHOOK_SECRET env var.
 */
export type BluedoorWebhookPayload = {
  event_type: BluedoorEventType;
  job_id: string;
  org_id: string;
  observed_at: string;
  data: Partial<BluedoorJob>;
};

// ─────────────────────────────────────────────
// Enrichment result — what enrich.ts writes to DB
// ─────────────────────────────────────────────

/** Subset of Bluedoor fields we persist on the Job record */
export type JobEnrichmentPatch = {
  bluedoorJobId: string;
  bluedoorOrgId: string;
  bluedoorProvider: string;
  bluedoorStatus: string;       // active | expired | unknown
  bluedoorWorkplaceType: string | null;
  bluedoorSalaryMin: number | null;
  bluedoorSalaryMax: number | null;
  bluedoorSalaryCurrency: string | null;
  bluedoorDescHash: string | null;
  bluedoorSyncedAt: Date;
  bluedoorChangedAt: Date | null;
};

// ─────────────────────────────────────────────
// Discover page — search params parsed from URL
// ─────────────────────────────────────────────

/** URL search params for the /discover page */
export type DiscoverSearchParams = {
  q: string;
  country: string;
  workplaceType: string; // '' | remote | hybrid | on_site
  employmentType: string; // '' | full_time | part_time | ...
  salaryExists: boolean;
};
