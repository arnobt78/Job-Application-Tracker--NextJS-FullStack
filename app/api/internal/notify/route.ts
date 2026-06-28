/**
 * POST /api/internal/notify
 *
 * Internal route for n8n automation — triggers an in-app SSE notification
 * for a specific user. Useful for n8n stale-app alerts, digest reminders, etc.
 *
 * Auth: X-Internal-Secret header must match AI_SERVICE_SECRET env var.
 *
 * Body:
 *   userId       — NextAuth user ID (cuid)
 *   type         — JobsNotificationEvent['notificationType']
 *   jobId        — ID of the related job
 *   message      — Human-readable message shown in the notification bell
 */

import { publishNotification } from '@/lib/jobs-events';
import type { JobsNotificationEvent } from '@/lib/jobs-events';

export const dynamic = 'force-dynamic';

const VALID_TYPES: JobsNotificationEvent['notificationType'][] = [
  'posting_closed',
  'jd_changed',
  'salary_added',
  'posting_reopened',
];

export async function POST(req: Request): Promise<Response> {
  // Validate internal secret
  const secret = process.env.AI_SERVICE_SECRET;
  if (!secret || req.headers.get('x-internal-secret') !== secret) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body: { userId?: string; type?: string; jobId?: string; message?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { userId, type, jobId, message } = body;

  if (!userId || !type || !jobId || !message) {
    return Response.json(
      { error: 'userId, type, jobId, message are required' },
      { status: 400 }
    );
  }

  if (!VALID_TYPES.includes(type as JobsNotificationEvent['notificationType'])) {
    return Response.json(
      { error: `type must be one of: ${VALID_TYPES.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    await publishNotification(
      userId,
      type as JobsNotificationEvent['notificationType'],
      jobId,
      message
    );
    return Response.json({ ok: true });
  } catch (error) {
    console.error('[internal/notify] error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
