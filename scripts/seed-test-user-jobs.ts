/**
 * Seed random jobs for test@user.com
 * Run: npx tsx scripts/seed-test-user-jobs.ts <CLERK_ID>
 *
 * Deletes existing jobs for the user, then creates new ones in the last 2–3 months
 * with multiple jobs per month (for realistic chart data).
 *
 * Get CLERK_ID from Clerk Dashboard → Users → test@user.com → User ID
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const POSITIONS = [
  'Frontend Developer',
  'Backend Engineer',
  'Full Stack Developer',
  'React Developer',
  'Node.js Developer',
  'Software Engineer',
  'DevOps Engineer',
  'Data Scientist',
  'Product Manager',
  'UX Designer',
  'QA Engineer',
  'Mobile Developer',
];

const COMPANIES = [
  'TechCorp',
  'StartupXYZ',
  'BigTech Inc',
  'CloudNine',
  'DataFlow',
  'CodeCraft',
  'DevHub',
  'InnovateLabs',
  'ScaleUp',
  'NextGen',
  'FutureSoft',
  'DigitalWave',
];

const LOCATIONS = [
  'Remote',
  'New York, NY',
  'San Francisco, CA',
  'Austin, TX',
  'Seattle, WA',
  'Boston, MA',
  'Chicago, IL',
  'Denver, CO',
  'London, UK',
  'Berlin, Germany',
];

const STATUSES = ['pending', 'interview', 'declined'];
const MODES = ['full-time', 'part-time', 'internship'];

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateInMonth(year: number, month: number, maxDay?: number): Date {
  const cap = maxDay ?? 28;
  const day = Math.floor(Math.random() * cap) + 1;
  return new Date(year, month - 1, day);
}

async function main() {
  const clerkId = process.argv[2];

  if (!clerkId) {
    console.error('\nUsage: npx tsx scripts/seed-test-user-jobs.ts <CLERK_ID>\n');
    console.error('Get CLERK_ID from Clerk Dashboard → Users → test@user.com → User ID\n');
    process.exit(1);
  }

  // 1. Delete all existing jobs for this user
  const deleted = await prisma.job.deleteMany({ where: { clerkId } });
  console.log(`\n🗑️  Deleted ${deleted.count} existing job(s) for test@user.com\n`);

  // 2. Generate jobs in last 3 months only, with multiple per month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  const jobs: Array<{
    clerkId: string;
    position: string;
    company: string;
    location: string;
    status: string;
    mode: string;
    createdAt: Date;
    updatedAt: Date;
  }> = [];

  // Jobs per month: 5–12 (random for variety in chart)
  const jobsPerMonth = [8, 10, 6, 12, 5, 9, 7, 11]; // varied counts

  const currentDay = now.getDate();

  for (let i = 0; i < 3; i++) {
    let month = currentMonth - i;
    let year = currentYear;
    if (month <= 0) {
      month += 12;
      year -= 1;
    }
    // For current month, only use days 1..today so chart shows them (no future dates)
    const maxDay = i === 0 ? currentDay : 28;
    const count = jobsPerMonth[i % jobsPerMonth.length];
    for (let j = 0; j < count; j++) {
      const date = randomDateInMonth(year, month, maxDay);
      jobs.push({
        clerkId,
        position: random(POSITIONS),
        company: random(COMPANIES),
        location: random(LOCATIONS),
        status: random(STATUSES),
        mode: random(MODES),
        createdAt: date,
        updatedAt: date,
      });
    }
  }

  for (const job of jobs) {
    await prisma.job.create({ data: job });
  }

  console.log(`✅ Created ${jobs.length} jobs in last 3 months (multiple per month)\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
