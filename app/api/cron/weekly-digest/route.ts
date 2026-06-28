import { sendAllWeeklyDigests } from '@/lib/notifications/weekly-digest';

export const dynamic = 'force-dynamic';

/** GET /api/cron/weekly-digest — Sunday 09:00 UTC (vercel.json) */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const result = await sendAllWeeklyDigests();
  return Response.json({ ok: true, ...result });
}
