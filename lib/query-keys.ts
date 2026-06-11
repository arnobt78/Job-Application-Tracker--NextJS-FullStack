/** Canonical React Query keys — prefix invalidation uses jobs root key */

export const queryKeys = {
  jobs: {
    all: ['jobs'] as const,
    list: (search: string, jobStatus: string, page: number) =>
      ['jobs', search, jobStatus, page] as const,
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
