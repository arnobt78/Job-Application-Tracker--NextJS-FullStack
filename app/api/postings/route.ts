/**
 * GET /api/postings — search open catalog postings (session required).
 * Query: q, country, workplaceType, employmentType, salaryExists, cursor, limit.
 */
import { getCachedPostingSearch } from '@/lib/postings/cache';
import { postingSearchSchema } from '@/lib/postings/schema';
import { badRequest, postingsJson, requireSession, searchParamsObject } from '@/lib/postings/route-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const parsed = postingSearchSchema.safeParse(searchParamsObject(req.url));
  if (!parsed.success) return badRequest(parsed.error);

  return postingsJson(await getCachedPostingSearch(parsed.data));
}
