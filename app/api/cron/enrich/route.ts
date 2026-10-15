/**
 * GET /api/cron/enrich
 *
 * Nightly re-sync of every tracked job linked to a catalog posting.
 * Detects closed postings, salary additions and JD edits, then notifies the owner.
 * Runs via Vercel Cron (see vercel.json schedule).
 *
 * Security: Vercel sends CRON_SECRET as Authorization bearer token.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import { resyncJob } from '@/lib/postings/link';
import { isAuthorizedCron } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5-minute max — Vercel Pro/Hobby limit

/** Bounded parallelism keeps DB connections well under the pool size. */
const BATCH_SIZE = 10;

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobs = await prisma.job.findMany({
    where: { postingId: { not: null } },
    select: { id: true, userId: true, postingId: true },
    orderBy: { postingSyncedAt: 'asc' }, // oldest synced first
  });

  let changed = 0;
  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((j) => resyncJob(j.id, j.userId, j.postingId!))
    );
    changed += results.filter(Boolean).length;
  }

  return NextResponse.json({ ok: true, total: jobs.length, changed });
}
