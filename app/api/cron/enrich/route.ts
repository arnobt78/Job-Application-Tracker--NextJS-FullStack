/**
 * GET /api/cron/enrich
 *
 * Nightly batch Bluedoor re-sync for all tracked jobs that have a linked
 * bluedoorJobId. Runs via Vercel Cron (see vercel.json schedule).
 *
 * Security: Vercel sends CRON_SECRET as Authorization bearer token.
 * Reject all requests that don't include the correct token.
 *
 * Strategy: process jobs in batches of 10 with 100ms gap to avoid
 * hammering the Bluedoor API (free tier — be polite).
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import { resyncJob } from '@/lib/bluedoor/enrich';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5-minute max — Vercel Pro/Hobby limit

const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 150;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(req: NextRequest) {
  // Validate Vercel Cron secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all jobs that have been linked to Bluedoor
  const jobs = await prisma.job.findMany({
    where: { bluedoorJobId: { not: null } },
    select: { id: true, clerkId: true, bluedoorJobId: true },
    orderBy: { bluedoorSyncedAt: 'asc' }, // oldest synced first
  });

  let synced = 0;
  let failed = 0;

  // Batch processing — avoid overwhelming the free API
  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map((j) => resyncJob(j.id, j.clerkId, j.bluedoorJobId!))
    );

    for (const r of results) {
      if (r.status === 'fulfilled') synced++;
      else failed++;
    }

    // Polite delay between batches
    if (i + BATCH_SIZE < jobs.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  return NextResponse.json({
    ok: true,
    total: jobs.length,
    synced,
    failed,
    batchSize: BATCH_SIZE,
  });
}
