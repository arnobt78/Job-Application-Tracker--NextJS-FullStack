/**
 * POST /api/extension/jobs — create a job from the browser extension.
 *
 * Auth: Authorization: Bearer <extensionToken>
 * Body: { position, company, location?, applyUrl?, mode? }
 * Returns: { id, position, company } on success.
 *
 * Fires SSE invalidation so the dashboard updates immediately without refresh.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import { invalidateUserJobCaches } from '@/lib/invalidate-jobs-server';
import { after } from 'next/server';
import { enrichJob } from '@/lib/bluedoor/enrich';

export const dynamic = 'force-dynamic';

type ExtensionJobBody = {
  position: string;
  company: string;
  location?: string;
  applyUrl?: string;
  mode?: string;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Bearer token auth
  const authHeader = request.headers.get('Authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: 'Missing auth token' }, { status: 401 });
  }

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { extensionToken: token },
      select: { userId: true },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Invalid extension token' }, { status: 401 });
    }

    const { userId } = profile;

    let body: ExtensionJobBody;
    try {
      body = (await request.json()) as ExtensionJobBody;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (!body.position?.trim() || !body.company?.trim()) {
      return NextResponse.json({ error: 'position and company are required' }, { status: 400 });
    }

    const job = await prisma.job.create({
      data: {
        userId,
        position: body.position.trim(),
        company: body.company.trim(),
        location: body.location?.trim() ?? 'Remote',
        status: 'pending',
        mode: body.mode ?? 'full-time',
        applyUrl: body.applyUrl?.trim() ?? null,
      },
    });

    // Invalidate caches so dashboard refreshes via SSE
    await invalidateUserJobCaches(userId, job.id);

    // Fire Bluedoor enrichment if apply URL was provided
    if (job.applyUrl) {
      after(async () => { await enrichJob(job.id, userId); });
    }

    return NextResponse.json({ id: job.id, position: job.position, company: job.company });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
