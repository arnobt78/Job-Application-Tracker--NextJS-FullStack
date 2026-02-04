/**
 * Migrate jobs from old clerkId to new clerkId
 * Run: npx tsx scripts/db-migrate-clerkid.ts <OLD_CLERK_ID> <NEW_CLERK_ID>
 *
 * Use when you switched Clerk apps and want to reassign your old jobs
 * to your new user. Get OLD_CLERK_ID from db-inspect output.
 * Get NEW_CLERK_ID from Clerk Dashboard → Users → your user.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const [oldClerkId, newClerkId] = process.argv.slice(2);

  if (!oldClerkId || !newClerkId) {
    console.error('\nUsage: npx tsx scripts/db-migrate-clerkid.ts <OLD_CLERK_ID> <NEW_CLERK_ID>\n');
    console.error('Run scripts/db-inspect.ts first to see clerkIds in the database.\n');
    process.exit(1);
  }

  const count = await prisma.job.updateMany({
    where: { clerkId: oldClerkId },
    data: { clerkId: newClerkId },
  });

  console.log(`\nMigrated ${count.count} job(s) from ${oldClerkId} to ${newClerkId}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
