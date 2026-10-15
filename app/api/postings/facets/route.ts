/** GET /api/postings/facets — workplace/employment counts for open postings (session required). */
import { getCachedPostingFacets } from '@/lib/postings/cache';
import { postingFacetsSchema } from '@/lib/postings/schema';
import { badRequest, postingsJson, requireSession, searchParamsObject } from '@/lib/postings/route-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const parsed = postingFacetsSchema.safeParse(searchParamsObject(req.url));
  if (!parsed.success) return badRequest(parsed.error);

  return postingsJson(await getCachedPostingFacets(parsed.data));
}
