/** Canonical React Query keys — prefix invalidation uses jobs root key */

export const queryKeys = {
  jobs: {
    all: ['jobs'] as const,
    list: (
      search: string,
      jobStatus: string,
      jobMode: string,
      monthYear: string,
      page: number
    ) => ['jobs', search, jobStatus, jobMode, monthYear, page] as const,
    filterOptions: ['jobs', 'filter-options'] as const,
  },
  stats: {
    all: ['stats'] as const,
  },
  charts: {
    all: ['charts'] as const,
  },
  job: {
    detail: (id: string) => ['job', id] as const,
  },
  // Weekly application velocity — last 12 weeks.
  // Invalidated via chartsTag (same tag as monthly charts).
  chartsWeekly: {
    all: ['charts-weekly'] as const,
  },
  // Discover page — Bluedoor live job search.
  // NOT persisted to localStorage (live external data, should always be fresh).
  discover: {
    all: ['discover'] as const,
    search: (
      q: string,
      country: string,
      workplaceType: string,
      employmentType: string,
      salaryExists: boolean
    ) =>
      ['discover', 'search', q, country, workplaceType, employmentType, salaryExists] as const,
    // Full job detail — fetched on demand when user opens View Details modal
    detail: (jobId: string) => ['discover', 'detail', jobId] as const,
    // Posting lifecycle events — fetched on demand in Posting Activity tab
    events: (bluedoorJobId: string) => ['discover', 'events', bluedoorJobId] as const,
    // Live filter counts from Bluedoor /jobs/facets — staleTime 5 min, not persisted
    facets: (q?: string, country?: string) => ['discover', 'facets', q ?? '', country ?? ''] as const,
  },
  // AI pipeline — per-job insights (fit score, cover letter, interview angles).
  // NOT persisted: LLM output changes each run; user regenerates on demand.
  ai: {
    pipeline: (jobId: string) => ['ai', 'pipeline', jobId] as const,
  },
  // Persisted AI insights — loaded from DB, staleTime Infinity, NOT in localStorage persist scope.
  aiInsight: {
    job: (jobId: string) => ['ai', 'insight', jobId] as const,
  },
  // User profile for AI personalisation — loaded from DB, not persisted to localStorage.
  userProfile: () => ['user-profile'] as const,
  // Global activity timeline — built from Job rows, not persisted.
  timeline: () => ['timeline'] as const,
  // Skill gap analysis — per-job comparison of user profile skills vs job description.
  // NOT persisted: on-demand, live Bluedoor data.
  skillGap: (jobId: string) => ['skill-gap', jobId] as const,
  // Salary intelligence — aggregated from user's enriched jobs.
  // Persisted: invalidated on job CRUD (same as stats).
  salaryIntel: () => ['salary-intel'] as const,
} as const;
