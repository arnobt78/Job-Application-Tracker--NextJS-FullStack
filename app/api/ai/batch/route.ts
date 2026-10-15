/**
 * POST /api/ai/batch — enqueue multiple jobs for background AI analysis via ARQ.
 *
 * Body: { jobIds?: string[] }  — defaults to all user jobs without an AIInsight.
 * Returns: { enqueued: number; taskIds: string[] }
 *
 * Uses ARQ queue (FastAPI /enqueue) so analysis runs in background without
 * blocking the request. SSE streaming (/api/ai/pipeline/stream) remains the
 * primary per-job UX path.
 */

import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import {
  ALL_PIPELINE_OUTPUTS,
  toPipelineJobInput,
  type PipelineJobInput,
  type PipelineUserProfile,
} from '@/lib/ai/pipeline-client';
import { PIPELINE_JOB_SELECT, loadPipelineUserProfile } from '@/lib/ai/pipeline-payload';

export const dynamic = 'force-dynamic';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? 'http://localhost:3000';
const AI_SERVICE_SECRET = process.env.AI_SERVICE_SECRET ?? '';

/** user_id rides along with the profile — the ARQ task reads it for the ai-complete callback. */
type BatchUserData = PipelineUserProfile & { user_id: string };

async function enqueueOne(
  jobData: PipelineJobInput,
  userData: BatchUserData
): Promise<string | null> {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/enqueue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': AI_SERVICE_SECRET,
      },
      body: JSON.stringify({
        job_data: jobData,
        user_data: userData,
        include: ALL_PIPELINE_OUTPUTS,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { task_id?: string };
    return data.task_id ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  let jobIds: string[] | undefined;
  try {
    const body = (await request.json()) as { jobIds?: string[] };
    jobIds = body.jobIds;
  } catch {
    // No body — use all jobs
  }

  // Find jobs without AI insight (or the requested subset)
  const where = {
    userId,
    ...(jobIds ? { id: { in: jobIds } } : {}),
    aiInsight: { is: null },
  };

  const [jobs, profile] = await Promise.all([
    prisma.job.findMany({
      where,
      select: PIPELINE_JOB_SELECT,
      take: 50, // Safety cap — avoid queue flooding
    }),
    loadPipelineUserProfile(userId),
  ]);

  const userData: BatchUserData = { ...profile, user_id: userId };
  const taskIds: string[] = [];

  for (const job of jobs) {
    const taskId = await enqueueOne(toPipelineJobInput(job), userData);
    if (taskId) taskIds.push(taskId);
  }

  return NextResponse.json({ enqueued: taskIds.length, taskIds });
}
