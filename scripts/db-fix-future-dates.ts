/**
 * Fix jobs with future createdAt dates (from bad seed data)
 * Run: npx tsx scripts/db-fix-future-dates.ts
 *
 * Sets createdAt/updatedAt to a random date in the past 12 months
 * for any job with createdAt in the future.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function fixFutureDate(oldDate: Date, now: Date): Date {
  const fixed = new Date(oldDate);
  // If same month as now, use random day 1..today (keeps job in same chart bar)
  if (fixed.getMonth() === now.getMonth() && fixed.getFullYear() === now.getFullYear()) {
    fixed.setDate(Math.floor(Math.random() * now.getDate()) + 1);
  } else {
    // Future month: move to random date in past 6 months
    const past = new Date(now);
    past.setMonth(past.getMonth() - Math.floor(Math.random() * 6));
    past.setDate(Math.floor(Math.random() * 28) + 1);
    return past;
  }
  return fixed;
}

async function main() {
  console.log('\n=== Fix Future Job Dates ===\n');

  const now = new Date();
  const futureJobs = await prisma.job.findMany({
    where: { createdAt: { gt: now } },
    select: { id: true, createdAt: true },
  });

  if (futureJobs.length === 0) {
    console.log('No jobs with future dates found. All good!\n');
    return;
  }

  console.log(`Found ${futureJobs.length} job(s) with future createdAt:\n`);

  for (const job of futureJobs) {
    const newDate = fixFutureDate(job.createdAt, now);
    await prisma.job.update({
      where: { id: job.id },
      data: { createdAt: newDate, updatedAt: newDate },
    });
  }

  console.log(`Fixed ${futureJobs.length} job(s). Refresh the stats page.\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
