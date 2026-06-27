/**
 * Server-side cache invalidation after CRUD — revalidateTag + revalidatePath + SSE publish.
 */
import { revalidatePath, revalidateTag } from 'next/cache';
import { allUserTags } from '@/lib/cache-tags';
import { deleteCacheKeys } from '@/lib/redis';
import { publishInvalidation } from '@/lib/jobs-events';

/** Purges server cache for dashboard routes after any job CRUD or enrichment */
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

  for (const tag of allUserTags(userId)) {
    revalidateTag(tag, 'max');
  }

  await deleteCacheKeys(...allUserTags(userId));
  await publishInvalidation(userId, jobId);
}
