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

export const dynamic = 'force-dynamic';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? 'http://localhost:3000';
const AI_SERVICE_SECRET = process.env.AI_SERVICE_SECRET ?? '';

async function enqueueOne(
  jobData: Record<string, unknown>,
  userId: string
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
        user_data: { user_id: userId },
        include: ['fit_score', 'summary', 'cover_letter', 'interview_angles'],
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

  const jobs = await prisma.job.findMany({
    where,
    select: {
      id: true,
      position: true,
      company: true,
      location: true,
      status: true,
      mode: true,
      applyUrl: true,
      bluedoorStatus: true,
      bluedoorWorkplaceType: true,
      bluedoorSalaryMin: true,
      bluedoorSalaryMax: true,
      bluedoorSalaryCurrency: true,
    },
    take: 50, // Safety cap — avoid queue flooding
  });

  const taskIds: string[] = [];

  for (const job of jobs) {
    const jobData = {
      job_id: job.id,
      position: job.position,
      company: job.company,
      location: job.location,
      status: job.status,
      mode: job.mode,
      apply_url: job.applyUrl ?? null,
      bluedoor_status: job.bluedoorStatus ?? null,
      bluedoor_workplace_type: job.bluedoorWorkplaceType ?? null,
      bluedoor_salary_min: job.bluedoorSalaryMin ?? null,
      bluedoor_salary_max: job.bluedoorSalaryMax ?? null,
      bluedoor_salary_currency: job.bluedoorSalaryCurrency ?? null,
    };
    const taskId = await enqueueOne(jobData, userId);
    if (taskId) taskIds.push(taskId);
  }

  return NextResponse.json({ enqueued: taskIds.length, taskIds });
}
