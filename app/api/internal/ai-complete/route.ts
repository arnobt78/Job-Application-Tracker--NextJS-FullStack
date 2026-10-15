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
 *   result   — PipelineResponse.model_dump() (nested snake_case from Python)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import { invalidateUserJobCaches } from '@/lib/invalidate-jobs-server';
import { pipelineResultToInsight } from '@/lib/ai/insight-mapper';
import type { PipelineResponse } from '@/lib/ai/pipeline-client';

export const dynamic = 'force-dynamic';

type RequestBody = {
  job_id: string;
  user_id: string;
  result: Partial<PipelineResponse>;
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

  if (!jobId || !userId || !result) {
    return NextResponse.json({ error: 'job_id, user_id and result are required' }, { status: 400 });
  }

  // Verify the job belongs to this user before writing
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { userId: true },
  });

  if (!job || job.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const insight = pipelineResultToInsight(result);

  try {
    await prisma.jobAIInsight.upsert({
      where: { jobId },
      create: { jobId, userId, ...insight },
      update: { ...insight, generatedAt: new Date() },
    });

    await invalidateUserJobCaches(userId, jobId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[ai-complete] failed to persist insight:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
