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
} as const;
