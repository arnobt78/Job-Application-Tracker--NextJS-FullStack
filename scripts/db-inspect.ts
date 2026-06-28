/**
 * Database inspection script
 * Run: npx tsx scripts/db-inspect.ts
 *
 * Inspects jobs and userIds to diagnose why jobs may appear empty
 * after resetting the database or switching NextAuth configurations.
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

  const userIdCounts = jobs.reduce<Record<string, number>>((acc, job) => {
    acc[job.userId] = (acc[job.userId] || 0) + 1;
    return acc;
  }, {});

  console.log('Jobs per user (userId):');
  console.log('─'.repeat(60));
  for (const [userId, count] of Object.entries(userIdCounts)) {
    console.log(`  ${userId}: ${count} job(s)`);
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
  console.log('\nWhy jobs appear empty:');
  console.log('  • Jobs are stored with userId (NextAuth user ID — cuid format)');
  console.log('  • Each NextAuth user has a unique cuid generated at account creation');
  console.log('  • DB reset = new user IDs = no matching jobs\n');
  console.log('To see your current user ID:');
  console.log('  1. Log in, open DevTools → Application → Cookies → next-auth.session-token');
  console.log('  2. Or query: SELECT id, email FROM "User";\n');
  console.log('Options:');
  console.log('  A) Reset DB and create a fresh account via /sign-up or OAuth');
  console.log('  B) Re-seed test data: npx tsx prisma/seed.ts\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
