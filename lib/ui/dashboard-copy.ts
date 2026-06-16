/** Dashboard page copy — centralized for header, filters, and results sections */

export const DASHBOARD_COPY = {
  pageHeader: {
    title: 'Application Pipeline',
    subtitle: 'Review, update, and manage every role in your job search',
  },
  filters: {
    title: 'Refine Your Results',
    subtitle:
      'Search and narrow by status, employment type, or application month',
    clearLabel: 'Clear Filters',
  },
  results: {
    title: 'Matching Applications',
    subtitle: 'Roles that fit your current filters',
  },
  addJob: {
    cta: 'New Application',
  },
} as const;
