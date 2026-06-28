/**
 * GET /api/internal/jobs?clerkId=...
 *
 * Internal route for n8n automation — returns all jobs for a given Clerk user.
 * Auth: X-Internal-Secret header must match AI_SERVICE_SECRET env var.
 *
 * Not exposed to users — used by n8n for digest/stale-app automation workflows.
 */

import prisma from '@/utils/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  // Validate internal secret — reject if missing or wrong
  const secret = process.env.AI_SERVICE_SECRET;
  if (!secret || req.headers.get('x-internal-secret') !== secret) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const clerkId = searchParams.get('clerkId');

  if (!clerkId) {
    return Response.json({ error: 'clerkId required' }, { status: 400 });
  }

  try {
    const jobs = await prisma.job.findMany({
      where: { clerkId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        position: true,
        company: true,
        location: true,
        status: true,
        mode: true,
        applyUrl: true,
        bluedoorJobId: true,
        bluedoorStatus: true,
        bluedoorSyncedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json({ jobs });
  } catch (error) {
    console.error('[internal/jobs] DB error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
