/**
 * Server-side cache invalidation after CRUD — revalidateTag + revalidatePath + Redis purge + SSE publish.
 * Also used by posting link/resync (after() and cron), which change Job rows outside a user request.
 */
import { revalidatePath, revalidateTag } from 'next/cache';
import { allUserTags } from '@/lib/cache-tags';
import { invalidateUserRedisCaches } from '@/lib/redis';
import { publishInvalidation } from '@/lib/jobs-events';

/**
 * Immediate expiry — the `'max'` profile is stale-while-revalidate, so the first read after a
 * mutation would still get the old cached value (and SSR would hydrate it over fresh client data).
 */
const EXPIRE_NOW = { expire: 0 };

/** Full purge after CRUD — revalidateTag + Redis SCAN delete + SSE. Call before returning response. */
export async function invalidateUserJobCaches(
  userId: string,
  jobId?: string
): Promise<void> {
  revalidatePath('/dashboard');
  revalidatePath('/stats');
  revalidatePath('/dashboard/[id]', 'page');
  revalidatePath('/timeline');

  for (const tag of allUserTags(userId)) {
    revalidateTag(tag, EXPIRE_NOW);
  }

  await invalidateUserRedisCaches(userId);
  await publishInvalidation(userId, jobId);
}
