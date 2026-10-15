/** GET /api/postings/:id/events — posting lifecycle history, newest first (session required). */
import { getCachedPostingEvents } from '@/lib/postings/cache';
import { postingIdSchema } from '@/lib/postings/schema';
import { badRequest, postingsJson, requireSession } from '@/lib/postings/route-helpers';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const parsed = postingIdSchema.safeParse((await params).id);
  if (!parsed.success) return badRequest(parsed.error);

  return postingsJson({ data: await getCachedPostingEvents(parsed.data) });
}
