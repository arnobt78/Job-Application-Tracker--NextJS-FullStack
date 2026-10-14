/**
 * Server-side cache invalidation after CRUD — revalidateTag + revalidatePath + SSE publish.
 *
 * Two invalidation strategies:
 *   invalidateUserJobCaches        — full purge (CRUD path): busts Next.js cache + Redis + SSE
 *   revalidateUserJobsDataCache    — lightweight (after() path): busts Next.js cache + SSE only
 *     Used from after() callbacks to avoid a SCAN race where the after() invalidation misses a
 *     Redis key that was re-populated between the pre-response full purge and the after() run.
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
  // Discover page shows live Bluedoor data — invalidate so enrichment badge
  // reflects updated status on next visit without stale SSR data
  revalidatePath('/discover');
  revalidatePath('/timeline');

  for (const tag of allUserTags(userId)) {
    revalidateTag(tag, EXPIRE_NOW);
  }

  await invalidateUserRedisCaches(userId);
  await publishInvalidation(userId, jobId);
}

/**
 * Lightweight invalidation for after() callbacks (org metadata, webhook updates).
 * Busts Next.js data cache and notifies SSE clients without running a Redis SCAN.
 * Redis was already fully purged by the pre-response invalidateUserJobCaches call;
 * running SCAN again risks a race where a freshly-populated key gets deleted after
 * a client already received fresh data.
 */
export async function revalidateUserJobsDataCache(
  userId: string,
  jobId?: string
): Promise<void> {
  revalidatePath('/dashboard');
  revalidatePath('/stats');
  revalidatePath('/dashboard/[id]', 'page');
  revalidatePath('/discover');
  revalidatePath('/timeline');

  for (const tag of allUserTags(userId)) {
    revalidateTag(tag, EXPIRE_NOW);
  }

  await publishInvalidation(userId, jobId);
}
