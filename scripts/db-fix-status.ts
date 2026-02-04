/**
 * Fix malformed job status values in the database
 * Run: npx tsx scripts/db-fix-status.ts
 *
 * Fixes status values with:
 * - Trailing/leading whitespace (e.g. "declined\n" -> "declined")
 * - Empty string -> "pending"
 *
 * Run db:inspect first to see what needs fixing.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const VALID_STATUSES = ['pending', 'interview', 'declined'] as const;

function normalizeStatus(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return 'pending';
  if (VALID_STATUSES.includes(trimmed as (typeof VALID_STATUSES)[number])) {
    return trimmed;
  }
  return null; // unknown status, don't change
}

async function main() {
  console.log('\n=== Fix Job Status Values ===\n');

  const jobs = await prisma.job.findMany({
    select: { id: true, status: true },
  });

  const toFix: { id: string; from: string; to: string }[] = [];

  for (const job of jobs) {
    const normalized = normalizeStatus(job.status);
    if (normalized && normalized !== job.status) {
      toFix.push({ id: job.id, from: JSON.stringify(job.status), to: normalized });
    }
  }

  if (toFix.length === 0) {
    console.log('No malformed status values found. All good!\n');
    return;
  }

  console.log(`Found ${toFix.length} job(s) with malformed status:\n`);
  for (const { from, to } of toFix) {
    console.log(`  ${from} -> "${to}"`);
  }

  let updated = 0;
  for (const { id, to } of toFix) {
    await prisma.job.update({
      where: { id },
      data: { status: to },
    });
    updated++;
  }

  console.log(`\nFixed ${updated} job(s). Run db:inspect to verify.\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
