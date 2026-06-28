/**
 * Skill gap computation — compares user's skills against a job description.
 *
 * Matching is case-insensitive substring/alias matching:
 *   matched  — user has the skill the job mentions
 *   missing  — job mentions the skill but user doesn't list it
 *   bonus    — user has the skill but the job doesn't explicitly mention it
 *
 * Not AI-powered — purely keyword based for instant, offline results.
 */

export type SkillGapResult = {
  /** Skills that appear in both user profile and job description */
  matched: string[];
  /** Skills found in job description but absent from user profile */
  missing: string[];
  /** Skills in user profile not explicitly mentioned in job description */
  bonus: string[];
  /** matched / (matched + missing) * 100, or 0 when no relevant skills */
  matchPct: number;
};

/** Normalise a skill string for comparison: lowercase, strip punctuation */
function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9+#.]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** True when `haystack` contains `needle` as a whole word / phrase */
function containsSkill(haystack: string, needle: string): boolean {
  const normalHaystack = normalise(haystack);
  const normalNeedle = normalise(needle);
  if (!normalNeedle) return false;
  // Exact substring match (skill phrases like "react native" match as-is)
  return normalHaystack.includes(normalNeedle);
}

/**
 * Curated skill vocabulary used to extract missing skills from job descriptions.
 * Module-level so it is allocated once, not on every computeSkillGap call.
 */
const COMMON_SKILLS: readonly string[] = [
  'TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#',
  'React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'Node.js', 'Express',
  'FastAPI', 'Django', 'Flask', 'Spring', 'NestJS',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'DynamoDB',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform',
  'GraphQL', 'REST', 'gRPC', 'WebSockets', 'Kafka', 'RabbitMQ',
  'Prisma', 'Drizzle', 'Sequelize', 'TypeORM',
  'TanStack Query', 'Redux', 'Zustand', 'MobX',
  'Tailwind CSS', 'Sass', 'CSS', 'HTML',
  'Git', 'GitHub', 'CI/CD', 'GitHub Actions', 'Jenkins',
  'Figma', 'Storybook', 'Vitest', 'Jest', 'Playwright', 'Cypress',
  'Machine Learning', 'LLM', 'OpenAI', 'PyTorch', 'TensorFlow',
];

/**
 * Compute skill gap between the user's skills and a raw job description string.
 *
 * @param userSkills  Skills from UserProfile.skills[]
 * @param jobDescription  Raw text from Bluedoor job detail or JobAIInsight summary
 */
export function computeSkillGap(
  userSkills: string[],
  jobDescription: string
): SkillGapResult {
  if (!userSkills.length || !jobDescription.trim()) {
    return { matched: [], missing: [], bonus: userSkills, matchPct: 0 };
  }

  const matched: string[] = [];
  const bonus: string[] = [];

  for (const skill of userSkills) {
    if (containsSkill(jobDescription, skill)) {
      matched.push(skill);
    } else {
      bonus.push(skill);
    }
  }

  const userSkillsLower = new Set(userSkills.map(normalise));
  const missing: string[] = [];

  for (const commonSkill of COMMON_SKILLS) {
    const isInJobDesc = containsSkill(jobDescription, commonSkill);
    const isInUserProfile = userSkillsLower.has(normalise(commonSkill));
    if (isInJobDesc && !isInUserProfile) {
      missing.push(commonSkill);
    }
  }

  const total = matched.length + missing.length;
  const matchPct = total > 0 ? Math.round((matched.length / total) * 100) : 0;

  return { matched, missing, bonus, matchPct };
}
