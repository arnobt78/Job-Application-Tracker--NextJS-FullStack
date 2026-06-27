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
  },
  // AI pipeline — per-job insights (fit score, cover letter, interview angles).
  // NOT persisted: LLM output changes each run; user regenerates on demand.
  ai: {
    pipeline: (jobId: string) => ['ai', 'pipeline', jobId] as const,
  },
} as const;
