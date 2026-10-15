import { sendAllWeeklyDigests } from '@/lib/notifications/weekly-digest';
import { isAuthorizedCron } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';

/** GET /api/cron/weekly-digest — Sunday 09:00 UTC (vercel.json) */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const result = await sendAllWeeklyDigests();
  return Response.json({ ok: true, ...result });
}
