/** GET /api/postings/:id — full posting including description (session required). */
import { getCachedPostingDetail } from '@/lib/postings/cache';
import { postingIdSchema } from '@/lib/postings/schema';
import { badRequest, notFound, postingsJson, requireSession } from '@/lib/postings/route-helpers';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const parsed = postingIdSchema.safeParse((await params).id);
  if (!parsed.success) return badRequest(parsed.error);

  const posting = await getCachedPostingDetail(parsed.data);
  return posting ? postingsJson(posting) : notFound();
}
