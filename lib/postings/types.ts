/**
 * Job postings catalog — shared types for Discover, the /api/postings routes
 * and the tracked-job link/resync flow. Dates are ISO strings so every DTO
 * survives unstable_cache JSON serialisation and React Query dehydration.
 */

export const WORKPLACE_TYPES = ['remote', 'hybrid', 'on_site'] as const;
export type WorkplaceType = (typeof WORKPLACE_TYPES)[number];

export const EMPLOYMENT_TYPES = [
  'full_time',
  'part_time',
  'contract',
  'temporary',
  'internship',
] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export type PostingStatus = 'open' | 'closed';

/** Posting row as shown on Discover cards; `description` is only filled by the detail query. */
export type DiscoverPosting = {
  id: string;
  title: string;
  department: string | null;
  description: string | null;
  locationText: string;
  city: string | null;
  region: string | null;
  country: string;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryPeriod: string | null;
  applyUrl: string;
  status: PostingStatus;
  contentHash: string;
  postedAt: string;
  companyId: string;
  companyName: string;
  companyDomain: string | null;
};

export type PostingSearchParams = {
  q?: string;
  country?: string;
  workplaceType?: WorkplaceType;
  employmentType?: EmploymentType;
  salaryExists?: boolean;
  cursor?: string;
  limit?: number;
};

export type PostingSearchResponse = {
  data: DiscoverPosting[];
  meta: {
    total: number;
    limit: number;
    nextCursor: string | null;
  };
};

export type FacetItem = { value: string; count: number };

/** Facet counts for the /discover filter dropdowns. */
export type DiscoverFacets = {
  workplaceType: FacetItem[];
  employmentType: FacetItem[];
};

export type PostingEventType = 'created' | 'updated' | 'closed' | 'reopened';

/** One lifecycle entry in the job "Activity" tab. */
export type PostingEvent = {
  id: string;
  type: PostingEventType;
  fieldName: string | null;
  oldValue: unknown;
  newValue: unknown;
  observedAt: string;
};

/** URL search params for the /discover page. */
export type DiscoverSearchParams = {
  q: string;
  country: string;
  workplaceType: string; // '' | remote | hybrid | on_site
  employmentType: string; // '' | full_time | part_time | ...
  salaryExists: boolean;
};

/** Job columns written from a linked posting — single shape for link, resync and track. */
export type PostingSnapshot = {
  postingId: string;
  postingStatus: PostingStatus;
  workplaceType: WorkplaceType;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  postingDescHash: string;
  postingSyncedAt: Date;
  companySize: string | null;
  companyIndustry: string | null;
  companyHq: string | null;
};
