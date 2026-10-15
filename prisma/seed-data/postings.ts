/**
 * 50 deterministic catalog postings (40 open, 10 closed) built from index-based rotations,
 * so every reseed produces identical content. Dates are offsets from the seed run time.
 */
import { createHash } from 'node:crypto';
import { SEED_COMPANIES, type SeedCompany } from './companies';

export const POSTING_COUNT = 50;
export const OPEN_POSTING_COUNT = 40;

const DAY_MS = 24 * 60 * 60 * 1000;

type Role = { title: string; department: string; skills: string[]; summary: string; baseSalary: number };

const ROLES: Role[] = [
  { title: 'Frontend Engineer', department: 'Engineering', skills: ['React', 'TypeScript', 'Next.js', 'CSS', 'Accessibility'], summary: 'build fast, accessible interfaces used by thousands of customers every day', baseSalary: 130_000 },
  { title: 'Backend Engineer', department: 'Engineering', skills: ['Node.js', 'PostgreSQL', 'REST APIs', 'Redis', 'Docker'], summary: 'design reliable services and APIs that power our core product', baseSalary: 135_000 },
  { title: 'Full Stack Engineer', department: 'Engineering', skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'], summary: 'ship features end to end, from database schema to polished UI', baseSalary: 132_000 },
  { title: 'Data Engineer', department: 'Data', skills: ['Python', 'SQL', 'Airflow', 'dbt', 'Spark'], summary: 'own the pipelines that turn raw events into trusted analytics', baseSalary: 138_000 },
  { title: 'DevOps Engineer', department: 'Infrastructure', skills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Observability'], summary: 'keep our platform fast, secure and observable as we scale', baseSalary: 140_000 },
  { title: 'Product Designer', department: 'Design', skills: ['Figma', 'Prototyping', 'User Research', 'Design Systems'], summary: 'shape intuitive product experiences from research to final pixels', baseSalary: 120_000 },
  { title: 'Product Manager', department: 'Product', skills: ['Roadmapping', 'Analytics', 'Stakeholder Management', 'SQL'], summary: 'set direction for a product area and turn customer insight into outcomes', baseSalary: 145_000 },
  { title: 'Mobile Engineer', department: 'Engineering', skills: ['React Native', 'TypeScript', 'Swift', 'Kotlin'], summary: 'craft smooth native experiences for our iOS and Android apps', baseSalary: 134_000 },
  { title: 'Machine Learning Engineer', department: 'AI', skills: ['Python', 'PyTorch', 'MLOps', 'SQL'], summary: 'train, evaluate and deploy models that improve real customer workflows', baseSalary: 155_000 },
  { title: 'QA Automation Engineer', department: 'Engineering', skills: ['Playwright', 'TypeScript', 'Test Automation', 'CI/CD'], summary: 'build the automated test coverage that lets us ship with confidence', baseSalary: 115_000 },
];

const LEVELS = [
  { prefix: '', adjust: 0 },
  { prefix: 'Senior ', adjust: 35_000 },
  { prefix: 'Junior ', adjust: -30_000 },
  { prefix: 'Staff ', adjust: 70_000 },
];

const US_CITIES = [
  { city: 'San Francisco', region: 'CA' },
  { city: 'New York', region: 'NY' },
  { city: 'Austin', region: 'TX' },
  { city: 'Seattle', region: 'WA' },
  { city: 'Boston', region: 'MA' },
  { city: 'Chicago', region: 'IL' },
  { city: 'Denver', region: 'CO' },
];

const CA_CITIES = [
  { city: 'Toronto', region: 'ON' },
  { city: 'Vancouver', region: 'BC' },
  { city: 'Montreal', region: 'QC' },
];

const WORKPLACE_ROTATION = ['remote', 'hybrid', 'on_site'] as const;

export type SeedPostingEvent = {
  type: 'created' | 'updated' | 'closed';
  fieldName: 'salary' | 'description' | null;
  oldValue: unknown;
  newValue: unknown;
  observedAt: Date;
};

export type SeedPosting = {
  id: string;
  company: SeedCompany;
  title: string;
  department: string;
  description: string;
  locationText: string;
  city: string | null;
  region: string | null;
  country: string;
  workplaceType: string;
  employmentType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryPeriod: string | null;
  applyUrl: string;
  status: 'open' | 'closed';
  contentHash: string;
  postedAt: Date;
  closedAt: Date | null;
  events: SeedPostingEvent[];
};

export function seedPostingId(index: number): string {
  return `pst_${String(index + 1).padStart(3, '0')}`;
}

export function hashDescription(description: string): string {
  return createHash('sha256').update(description).digest('hex');
}

function employmentTypeFor(i: number): string {
  switch (i % 10) {
    case 1: return 'contract';
    case 4: return 'part_time';
    case 6: return 'internship';
    case 8: return 'temporary';
    default: return 'full_time';
  }
}

/** Three ATS hosts so CompanyLogo renders a real favicon from the apply URL. */
function applyUrlFor(i: number, slug: string): string {
  const ref = 4_100_000 + i * 137;
  switch (i % 3) {
    case 0: return `https://boards.greenhouse.io/${slug.replace(/-/g, '')}/jobs/${ref}`;
    case 1: return `https://jobs.lever.co/${slug}/${ref.toString(16)}-seed`;
    default: return `https://jobs.ashbyhq.com/${slug}/${ref}`;
  }
}

function buildDescription(company: SeedCompany, title: string, role: Role, revision: 1 | 2): string {
  const paragraphs = [
    `${company.name} is a ${company.size}-person ${company.industry.toLowerCase()} company headquartered in ${company.hq}. We are hiring a ${title} to ${role.summary}.`,
    `What you will do:\n- Partner with product, design and engineering to plan and deliver work in small, frequent releases.\n- Own quality: write tests, review code and improve the tools your team relies on.\n- Share knowledge through documentation, pairing and thoughtful feedback.`,
    `What we are looking for:\n- Hands-on experience with ${role.skills.join(', ')}.\n- Clear written communication and comfort working with distributed teammates.\n- A habit of measuring impact and iterating based on what you learn.`,
    `Benefits: comprehensive health coverage, flexible hours, a yearly learning budget and generous paid time off.`,
  ];
  if (revision === 2) {
    paragraphs.splice(3, 0, `Nice to have: experience mentoring teammates and contributing to architecture decisions.`);
  }
  return paragraphs.join('\n\n');
}

export function buildSeedPostings(now: Date): SeedPosting[] {
  const daysAgo = (days: number) => new Date(now.getTime() - days * DAY_MS);

  return Array.from({ length: POSTING_COUNT }, (_, i) => {
    const company = SEED_COMPANIES[i % SEED_COMPANIES.length];
    const role = ROLES[(i * 3) % ROLES.length];
    const employmentType = employmentTypeFor(i);
    const level = employmentType === 'internship' ? { prefix: '', adjust: 0 } : LEVELS[i % LEVELS.length];
    const title = employmentType === 'internship' ? `${role.title} Intern` : `${level.prefix}${role.title}`;

    const isCanada = i % 4 === 3;
    const workplaceType = WORKPLACE_ROTATION[i % WORKPLACE_ROTATION.length];
    const country = isCanada ? 'Canada' : 'United States';
    const place = isCanada ? CA_CITIES[i % CA_CITIES.length] : US_CITIES[i % US_CITIES.length];
    const locationText =
      workplaceType === 'remote' ? `Remote — ${country}` : `${place.city}, ${place.region}`;

    const hasSalary = ![2, 5, 9].includes(i % 10);
    const hourly = employmentType !== 'full_time' && employmentType !== 'contract';
    const currency = isCanada ? 'CAD' : 'USD';
    let salaryMin: number | null = null;
    let salaryMax: number | null = null;
    if (hasSalary) {
      if (hourly) {
        salaryMin = employmentType === 'internship' ? 28 : 45;
        salaryMax = employmentType === 'internship' ? 42 : 70;
      } else {
        const base = Math.round(((role.baseSalary + level.adjust) * (isCanada ? 1.2 : 1)) / 1000) * 1000;
        salaryMin = base;
        salaryMax = base + 30_000;
      }
    }

    const isOpen = i < OPEN_POSTING_COUNT;
    const postedAt = isOpen ? daysAgo(8 + ((i * 37) % 52)) : daysAgo(60 + (i - OPEN_POSTING_COUNT) * 3);
    const closedAt = isOpen ? null : daysAgo(3 + (i - OPEN_POSTING_COUNT) * 2);
    const descriptionEdited = isOpen && i % 7 === 0;
    const salaryAddedLater = isOpen && i % 5 === 0 && hasSalary;
    const description = buildDescription(company, title, role, descriptionEdited ? 2 : 1);

    const events: SeedPostingEvent[] = [
      { type: 'created', fieldName: null, oldValue: null, newValue: null, observedAt: postedAt },
    ];
    if (salaryAddedLater) {
      events.push({
        type: 'updated',
        fieldName: 'salary',
        oldValue: null,
        newValue: { min: salaryMin, max: salaryMax, currency },
        observedAt: new Date(postedAt.getTime() + 5 * DAY_MS),
      });
    }
    if (descriptionEdited) {
      events.push({
        type: 'updated',
        fieldName: 'description',
        oldValue: { hash: hashDescription(buildDescription(company, title, role, 1)) },
        newValue: { hash: hashDescription(description) },
        observedAt: new Date(postedAt.getTime() + 7 * DAY_MS),
      });
    }
    if (closedAt) {
      events.push({ type: 'closed', fieldName: null, oldValue: 'open', newValue: 'closed', observedAt: closedAt });
    }

    return {
      id: seedPostingId(i),
      company,
      title,
      department: role.department,
      description,
      locationText,
      city: workplaceType === 'remote' ? null : place.city,
      region: workplaceType === 'remote' ? null : place.region,
      country,
      workplaceType,
      employmentType,
      salaryMin,
      salaryMax,
      salaryCurrency: hasSalary ? currency : null,
      salaryPeriod: hasSalary ? (hourly ? 'hour' : 'year') : null,
      applyUrl: applyUrlFor(i, company.slug),
      status: isOpen ? 'open' : 'closed',
      contentHash: hashDescription(description),
      postedAt,
      closedAt,
      events,
    };
  });
}
