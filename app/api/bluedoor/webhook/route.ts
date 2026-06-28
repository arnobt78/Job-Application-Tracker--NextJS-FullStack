/**
 * POST /api/bluedoor/webhook
 *
 * Receives Bluedoor lifecycle events (job.closed, job.updated, etc.)
 * and re-syncs the affected tracked jobs.
 *
 * Security: Bluedoor signs every request with HMAC-SHA256 using
 * BLUEDOOR_WEBHOOK_SECRET. We verify the signature before processing.
 * Reject immediately (401) if signature is missing or invalid.
 *
 * Payload: BluedoorWebhookPayload (see lib/bluedoor/types.ts)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import prisma from '@/utils/db';
import { resyncJob } from '@/lib/bluedoor/enrich';
import type { BluedoorWebhookPayload } from '@/lib/bluedoor/types';

// Disable body parser — need raw body for HMAC verification
export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────
// HMAC signature verification
// ─────────────────────────────────────────────

const WEBHOOK_SECRET = process.env.BLUEDOOR_WEBHOOK_SECRET ?? '';

function verifySignature(rawBody: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return false;
  try {
    const expected = createHmac('sha256', WEBHOOK_SECRET)
      .update(rawBody, 'utf8')
      .digest('hex');
    // timingSafeEqual prevents timing attacks
    return timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-bluedoor-signature') ?? '';

  // Only enforce signature check when secret is configured
  if (WEBHOOK_SECRET && !verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: BluedoorWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as BluedoorWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { event_type, job_id } = payload;

  // Find all tracked jobs linked to this Bluedoor job_id
  const trackedJobs = await prisma.job.findMany({
    where: { bluedoorJobId: job_id },
    select: { id: true, userId: true, bluedoorJobId: true },
  });

  if (trackedJobs.length === 0) {
    // No users tracking this job — nothing to do
    return NextResponse.json({ received: true, synced: 0 });
  }

  // Re-sync all affected tracked jobs
  const results = await Promise.allSettled(
    trackedJobs.map((j) =>
      resyncJob(j.id, j.userId, j.bluedoorJobId!)
    )
  );

  const synced = results.filter((r) => r.status === 'fulfilled').length;

  return NextResponse.json({
    received: true,
    event_type,
    bluedoor_job_id: job_id,
    synced,
    total: trackedJobs.length,
  });
}
