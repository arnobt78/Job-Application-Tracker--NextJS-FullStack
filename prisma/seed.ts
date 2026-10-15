/**
 * Deterministic demo seed — Discover catalog (15 companies, 50 postings + events)
 * and the demo account (test@user.com) with 25 tracked jobs and a profile.
 *
 * Usage:
 *   npm run db:seed    # replace catalog + demo user data (other users untouched)
 *   npm run db:reset   # wipe the whole database, push the schema, then seed
 */

import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { TEST_ACCOUNTS } from '../lib/auth/test-credentials';
import { invalidateUserRedisCaches } from '../lib/redis';
import { SEED_COMPANIES } from './seed-data/companies';
import { buildSeedPostings } from './seed-data/postings';
import { buildSeedJobs, DEMO_PROFILE, DEMO_USER_ID } from './seed-data/jobs';

const prisma = new PrismaClient();

const toJson = (value: unknown) => (value == null ? Prisma.JsonNull : (value as Prisma.InputJsonValue));

async function seedCatalog(now: Date) {
  await prisma.company.deleteMany();

  await prisma.company.createMany({
    data: SEED_COMPANIES.map((c) => ({ id: `cmp_${c.slug}`, ...c, domain: null })),
  });

  const postings = buildSeedPostings(now);
  await prisma.jobPosting.createMany({
    data: postings.map(({ company, events: _events, ...p }) => ({ ...p, companyId: `cmp_${company.slug}` })),
  });
  await prisma.jobPostingEvent.createMany({
    data: postings.flatMap((p) =>
      p.events.map((e) => ({
        postingId: p.id,
        type: e.type,
        fieldName: e.fieldName,
        oldValue: toJson(e.oldValue),
        newValue: toJson(e.newValue),
        observedAt: e.observedAt,
      }))
    ),
  });
  return postings;
}

async function seedDemoUser(postings: ReturnType<typeof buildSeedPostings>, now: Date) {
  const account = TEST_ACCOUNTS['guest-user'];
  await prisma.user.deleteMany({ where: { email: account.email } });

  await prisma.user.create({
    data: {
      id: DEMO_USER_ID,
      name: account.name,
      email: account.email,
      password: await bcrypt.hash(account.password, 12),
      profile: { create: DEMO_PROFILE },
    },
  });

  const jobs = buildSeedJobs(postings, now);
  await prisma.job.createMany({ data: jobs });
  return jobs.length;
}

async function main() {
  const now = new Date();
  const postings = await seedCatalog(now);
  const jobCount = await seedDemoUser(postings, now);
  const purged = await invalidateUserRedisCaches(DEMO_USER_ID);

  console.log(
    `Seeded ${SEED_COMPANIES.length} companies, ${postings.length} postings, ${jobCount} demo jobs; purged ${purged} Redis keys.`
  );
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
