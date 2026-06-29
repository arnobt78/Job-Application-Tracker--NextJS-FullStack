/**
 * POST /api/internal/ai-complete
 *
 * Callback endpoint for ARQ background pipeline tasks.
 * Called by python-ai-service/app/tasks/pipeline_task.py when a queued
 * pipeline run finishes — persists the result to JobAIInsight and fires
 * SSE cache invalidation so the dashboard updates without refresh.
 *
 * Auth: X-Internal-Secret header (same secret as AI_SERVICE_SECRET).
 *
 * Body:
 *   job_id   — Prisma Job ID
 *   user_id  — NextAuth user ID (cuid)
 *   result   — PipelineResponse fields (snake_case from Python)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import { invalidateUserJobCaches } from '@/lib/invalidate-jobs-server';

export const dynamic = 'force-dynamic';

type PipelineResult = {
  fit_score?: number | null;
  fit_label?: string | null;
  summary?: string | null;
  cover_letter?: string | null;
  interview_angles?: string[];
  red_flags?: string[];
};

type RequestBody = {
  job_id: string;
  user_id: string;
  result: PipelineResult;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = process.env.AI_SERVICE_SECRET;
  if (!secret || request.headers.get('x-internal-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { job_id: jobId, user_id: userId, result } = body;

  if (!jobId || !userId) {
    return NextResponse.json({ error: 'job_id and user_id are required' }, { status: 400 });
  }

  // Verify the job belongs to this user before writing
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { userId: true },
  });

  if (!job || job.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    await prisma.jobAIInsight.upsert({
      where: { jobId },
      create: {
        jobId,
        userId,
        fitScore: result.fit_score ?? null,
        fitLabel: result.fit_label ?? null,
        summary: result.summary ?? null,
        coverLetter: result.cover_letter ?? null,
        interviewAngles: result.interview_angles ?? [],
        redFlags: result.red_flags ?? [],
      },
      update: {
        fitScore: result.fit_score ?? null,
        fitLabel: result.fit_label ?? null,
        summary: result.summary ?? null,
        coverLetter: result.cover_letter ?? null,
        interviewAngles: result.interview_angles ?? [],
        redFlags: result.red_flags ?? [],
        generatedAt: new Date(),
      },
    });

    await invalidateUserJobCaches(userId, jobId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
