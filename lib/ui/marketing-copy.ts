/** Shared marketing copy — outcomes-focused, used on landing + auth pages */

export const MARKETING_COPY = {
  hero: {
    eyebrow: 'Job search, organized',
    titleLead: 'job',
    titleHighlight: 'tracking',
    titleTail: 'app',
    body: 'Track every application, spot trends early, and stay interview-ready — with updates that sync across tabs the moment you change anything.',
  },
  stats: {
    heading: 'Built for a',
    headingHighlight: 'serious',
    headingTail: 'job search',
    subheading:
      'Everything you need to stay organized — from first application to final offer.',
    cards: [
      {
        title: 'Real-time sync',
        description:
          'Every tab stays current. Add or edit a job on one screen and see it everywhere instantly.',
      },
      {
        title: 'Analytics charts',
        description:
          'See pending, interview, and declined applications at a glance — know where to focus next.',
      },
      {
        title: 'Export CSV / Excel',
        description:
          'Download your full history for recruiters, coaches, or your own records in one click.',
      },
      {
        title: 'Secure auth',
        description:
          'Sign in safely and keep your pipeline private with protected dashboard access.',
      },
    ],
  },
  features: {
    heading: 'Features that',
    headingHighlight: 'move fast',
    subheading:
      'Pages load with your data already there. Every change you make shows up everywhere — no refresh required.',
    cards: [
      {
        title: 'Full CRUD pipeline',
        body: 'Add, edit, or remove applications and watch lists, stats, and charts update immediately.',
      },
      {
        title: 'Smart filters',
        body: 'Search by role or company and filter by status without losing your place.',
      },
      {
        title: 'Stats dashboard',
        body: 'Live counts for pending, interviews, and declines keep your pipeline honest.',
      },
      {
        title: 'Chart insights',
        body: 'Monthly trends reveal momentum — double down when applications are working.',
      },
      {
        title: 'Instant invalidation',
        body: 'One action updates every open tab and device — your search stays in sync.',
      },
    ],
  },
  about: {
    heading: 'About',
    headingHighlight: 'Jobify',
    body1:
      'Jobify helps you run a professional job search without spreadsheet chaos. One place for every application, every status change, and every insight you need to land your next role.',
    body2:
      'Built for speed and clarity: your dashboard is always current, whether you update from your laptop, phone, or a second browser tab.',
    ctaEyebrow: 'Ready when you are',
    ctaTitle: 'Start tracking your next opportunity in under a minute.',
  },
  'sign-in': {
    eyebrow: 'Welcome back',
    title: 'Pick up your',
    highlight: 'job search',
    body: 'Sign in to manage applications, review analytics, and export your history — everything stays in sync across tabs.',
  },
  'sign-up': {
    eyebrow: 'Get started',
    title: 'Start your',
    highlight: 'job search right',
    body: 'Create a free account and organize every application with filters, charts, and real-time updates on every device.',
  },
} as const;
