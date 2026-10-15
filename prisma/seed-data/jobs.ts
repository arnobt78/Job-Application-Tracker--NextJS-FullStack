/**
 * Demo user's 25 tracked jobs: 12 linked to catalog postings (one per badge state)
 * and 13 manual entries at companies outside the catalog.
 */
import { employmentToJobMode } from '../../lib/discover/track-helpers';
import type { SeedPosting } from './postings';

export const DEMO_USER_ID = 'seed_demo_user';

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

type LinkState = 'live' | 'salary_added' | 'jd_changed' | 'posting_closed';

/** Posting index → badge state. Indices match the event rules in postings.ts. */
const LINKED: { index: number; state: LinkState; status: string }[] = [
  { index: 0, state: 'salary_added', status: 'interview' },
  { index: 10, state: 'salary_added', status: 'pending' },
  { index: 20, state: 'salary_added', status: 'pending' },
  { index: 7, state: 'jd_changed', status: 'interview' },
  { index: 14, state: 'jd_changed', status: 'pending' },
  { index: 40, state: 'posting_closed', status: 'declined' },
  { index: 43, state: 'posting_closed', status: 'interview' },
  { index: 46, state: 'posting_closed', status: 'declined' },
  { index: 3, state: 'live', status: 'pending' },
  { index: 16, state: 'live', status: 'interview' },
  { index: 25, state: 'live', status: 'pending' },
  { index: 31, state: 'live', status: 'declined' },
];

const MANUAL = [
  { position: 'Frontend Developer', company: 'Vertex Systems', location: 'Remote', status: 'pending', mode: 'full-time', daysAgo: 1, applyUrl: 'https://boards.greenhouse.io/vertexsystems/jobs/5512001' },
  { position: 'React Engineer', company: 'Bluefin Software', location: 'New York, NY', status: 'pending', mode: 'full-time', daysAgo: 4, applyUrl: null },
  { position: 'Software Engineer II', company: 'Copperleaf Digital', location: 'Austin, TX', status: 'interview', mode: 'full-time', daysAgo: 9, applyUrl: 'https://jobs.lever.co/copperleaf/7f1c2a-manual' },
  { position: 'Full Stack Developer', company: 'Sterling Payments', location: 'Toronto, ON', status: 'declined', mode: 'full-time', daysAgo: 13, applyUrl: null },
  { position: 'UI Engineer', company: 'Nimbus AI', location: 'San Francisco, CA', status: 'pending', mode: 'full-time', daysAgo: 18, applyUrl: 'https://jobs.ashbyhq.com/nimbus-ai/88231' },
  { position: 'Web Developer (Part-time)', company: 'Oakridge Insurance', location: 'Chicago, IL', status: 'pending', mode: 'part-time', daysAgo: 24, applyUrl: null },
  { position: 'Frontend Platform Engineer', company: 'Lattice Labs', location: 'Remote', status: 'interview', mode: 'full-time', daysAgo: 31, applyUrl: 'https://boards.greenhouse.io/latticelabs/jobs/5490112' },
  { position: 'Game UI Developer', company: 'Kestrel Games', location: 'Seattle, WA', status: 'declined', mode: 'full-time', daysAgo: 38, applyUrl: null },
  { position: 'Software Engineering Intern', company: 'Meridian Health', location: 'Boston, MA', status: 'pending', mode: 'internship', daysAgo: 45, applyUrl: null },
  { position: 'JavaScript Engineer', company: 'Silverline Logistics', location: 'Denver, CO', status: 'interview', mode: 'full-time', daysAgo: 52, applyUrl: 'https://jobs.lever.co/silverline/3b9e10-manual' },
  { position: 'Mobile Developer', company: 'Trailhead Apps', location: 'Vancouver, BC', status: 'pending', mode: 'full-time', daysAgo: 63, applyUrl: null },
  { position: 'Data Visualization Engineer', company: 'Cascade Data', location: 'Remote', status: 'declined', mode: 'full-time', daysAgo: 71, applyUrl: null },
  { position: 'Embedded UI Developer', company: 'Ironclad Devices', location: 'Austin, TX', status: 'pending', mode: 'part-time', daysAgo: 84, applyUrl: null },
];

function changedAtFor(posting: SeedPosting, state: LinkState): Date | null {
  if (state === 'live') return null;
  if (state === 'posting_closed') return posting.closedAt;
  const field = state === 'salary_added' ? 'salary' : 'description';
  return posting.events.find((e) => e.fieldName === field)?.observedAt ?? null;
}

export function buildSeedJobs(postings: SeedPosting[], now: Date) {
  const linked = LINKED.map(({ index, state, status }) => {
    const posting = postings[index];
    const createdAt = new Date(posting.postedAt.getTime() + 2 * DAY_MS);
    return {
      userId: DEMO_USER_ID,
      position: posting.title,
      company: posting.company.name,
      location: posting.locationText,
      status,
      mode: employmentToJobMode(posting.employmentType),
      applyUrl: posting.applyUrl,
      createdAt,
      updatedAt: createdAt,
      postingId: posting.id,
      postingStatus: posting.status,
      workplaceType: posting.workplaceType,
      salaryMin: posting.salaryMin,
      salaryMax: posting.salaryMax,
      salaryCurrency: posting.salaryCurrency,
      postingDescHash: posting.contentHash,
      postingSyncedAt: new Date(createdAt.getTime() + MINUTE_MS),
      postingChangedAt: changedAtFor(posting, state),
      postingChangeType: state === 'live' ? null : state,
      companySize: posting.company.size,
      companyIndustry: posting.company.industry,
      companyHq: posting.company.hq,
    };
  });

  const manual = MANUAL.map(({ daysAgo, ...job }) => {
    const createdAt = new Date(now.getTime() - daysAgo * DAY_MS);
    return { userId: DEMO_USER_ID, ...job, createdAt, updatedAt: createdAt };
  });

  return [...linked, ...manual];
}

export const DEMO_PROFILE = {
  skills: ['React', 'TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Testing', 'AWS'],
  targetRoles: ['Frontend Engineer', 'Full Stack Engineer'],
  experienceLevel: 'mid',
  resumeText:
    'Frontend-focused full stack engineer with 4 years of experience building React and Next.js products, typed APIs in Node.js, and PostgreSQL data models. Comfortable owning features end to end, writing automated tests and improving performance.',
};
