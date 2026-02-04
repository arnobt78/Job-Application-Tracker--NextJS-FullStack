/**
 * Database inspection script
 * Run: npx tsx scripts/db-inspect.ts
 *
 * Inspects jobs and clerkIds to diagnose why jobs may appear empty
 * after switching Clerk applications (new API keys = new user IDs).
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Jobify DB Inspection ===\n');

  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Total jobs in database: ${jobs.length}\n`);

  if (jobs.length === 0) {
    console.log('Database is empty. Add jobs via the app.\n');
    return;
  }

  const clerkIdCounts = jobs.reduce<Record<string, number>>((acc, job) => {
    acc[job.clerkId] = (acc[job.clerkId] || 0) + 1;
    return acc;
  }, {});

  console.log('Jobs per Clerk user (clerkId):');
  console.log('─'.repeat(60));
  for (const [clerkId, count] of Object.entries(clerkIdCounts)) {
    console.log(`  ${clerkId}: ${count} job(s)`);
  }

  // Status breakdown (helps debug stats mismatch)
  const statusCounts = jobs.reduce<Record<string, number>>((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {});
  console.log('\nJobs per status (helps debug stats total mismatch):');
  console.log('─'.repeat(60));
  for (const [status, count] of Object.entries(statusCounts)) {
    console.log(`  "${status}": ${count} job(s)`);
  }
  const knownStatuses = ['pending', 'interview', 'declined'];
  const unknownCount = Object.entries(statusCounts).reduce(
    (sum, [s, c]) => (knownStatuses.includes(s.toLowerCase()) ? sum : sum + c),
    0
  );
  if (unknownCount > 0) {
    console.log(`\n  ⚠️  ${unknownCount} job(s) have non-standard status (won't appear in stats)`);
  }

  console.log('\n' + '─'.repeat(60));
  console.log('\nWhy jobs appear empty after switching Clerk apps:');
  console.log('  • Jobs are stored with clerkId (Clerk user ID)');
  console.log('  • Each Clerk application has its own user IDs');
  console.log('  • New Clerk app = new user ID = no matching jobs\n');
  console.log('To see your current Clerk user ID:');
  console.log('  1. Log in, open DevTools → Application → Cookies');
  console.log('  2. Or check Clerk Dashboard → Users\n');
  console.log('Options:');
  console.log('  A) Use old Clerk API keys to see old jobs');
  console.log('  B) Migrate jobs to new user:');
  console.log('     npm run db:migrate-clerkid -- <OLD_CLERK_ID> <NEW_CLERK_ID>');
  console.log('     (OLD = from list above, NEW = from Clerk Dashboard → Users)\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
