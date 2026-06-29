/**
 * POST /api/email/inbound
 *
 * Resend inbound email webhook — receives parsed email and auto-creates a job
 * when the email is a job application confirmation.
 *
 * Auth: HMAC-SHA256 signature in Resend-Signature header verified against
 * RESEND_INBOUND_SECRET env var. Always return 200 to avoid Resend retry storms.
 *
 * Flow:
 *   1. Verify Resend-Signature (skip if RESEND_INBOUND_SECRET not set)
 *   2. Extract to/from/subject/text from parsed email body
 *   3. Look up user by UserProfile.inboundEmailAddress
 *   4. Call FastAPI /parse-email for LLM classification
 *   5. If confirmed application (confidence ≥ 0.7): create job + invalidate caches
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import prisma from '@/utils/db';
import { invalidateUserJobCaches } from '@/lib/invalidate-jobs-server';

export const dynamic = 'force-dynamic';

const RESEND_INBOUND_SECRET = process.env.RESEND_INBOUND_SECRET ?? '';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? 'http://localhost:8000';
const AI_SERVICE_SECRET = process.env.AI_SERVICE_SECRET ?? '';

function verifyResendSignature(rawBody: string, signature: string): boolean {
  if (!RESEND_INBOUND_SECRET) return true; // Skip check in dev
  try {
    const expected = createHmac('sha256', RESEND_INBOUND_SECRET)
      .update(rawBody, 'utf8')
      .digest('hex');
    return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

type ResendInboundPayload = {
  to: string | string[];
  from: string;
  subject: string;
  text?: string;
  html?: string;
};

type ParseEmailResponse = {
  is_application_confirmation: boolean;
  company: string | null;
  position: string | null;
  confidence: number;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text();
  const signature = request.headers.get('resend-signature') ?? '';

  // Always return 200 — Resend will retry on non-2xx; avoid double-processing
  if (RESEND_INBOUND_SECRET && !verifyResendSignature(rawBody, signature)) {
    return NextResponse.json({ ok: true });
  }

  let payload: ResendInboundPayload;
  try {
    payload = JSON.parse(rawBody) as ResendInboundPayload;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const toAddr = Array.isArray(payload.to) ? payload.to[0] : payload.to;
  if (!toAddr) return NextResponse.json({ ok: true });

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { inboundEmailAddress: toAddr },
      select: { userId: true },
    });

    if (!profile) return NextResponse.json({ ok: true });

    const emailBody = payload.text ?? payload.html ?? '';

    // Call FastAPI /parse-email for LLM classification
    let parsed: ParseEmailResponse | null = null;
    try {
      const parseRes = await fetch(`${AI_SERVICE_URL}/parse-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': AI_SERVICE_SECRET,
        },
        body: JSON.stringify({
          subject: payload.subject ?? '',
          body: emailBody.slice(0, 4000),
          from_addr: payload.from ?? '',
        }),
        signal: AbortSignal.timeout(15_000),
      });

      if (parseRes.ok) {
        parsed = (await parseRes.json()) as ParseEmailResponse;
      }
    } catch {
      // AI service unavailable — fall through without creating job
    }

    if (parsed?.is_application_confirmation && parsed.confidence >= 0.7) {
      const job = await prisma.job.create({
        data: {
          userId: profile.userId,
          position: parsed.position ?? 'New Application',
          company: parsed.company ?? 'Unknown Company',
          location: 'Remote',
          status: 'pending',
          mode: 'full-time',
        },
      });

      await invalidateUserJobCaches(profile.userId, job.id);
    }
  } catch {
    // Non-critical — log but always return 200
  }

  return NextResponse.json({ ok: true });
}
