/**
 * Zod schemas for postings input — shared by /api/postings routes and Discover server actions
 * so both entry points accept exactly the same filters.
 */
import * as z from 'zod';
import { EMPLOYMENT_TYPES, WORKPLACE_TYPES } from '@/lib/postings/types';
import { MAX_SEARCH_LIMIT } from '@/lib/postings/queries';

/** Empty strings and the UI's "all" sentinel mean "no filter". */
const optionalFilter = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === '' || v === 'all' || v == null ? undefined : v), schema.optional());

export const postingIdSchema = z.string().trim().min(1).max(64);

export const postingFacetsSchema = z.object({
  q: optionalFilter(z.string().trim().max(100)),
  country: optionalFilter(z.string().trim().max(60)),
});

export const postingSearchSchema = postingFacetsSchema.extend({
  workplaceType: optionalFilter(z.enum(WORKPLACE_TYPES)),
  employmentType: optionalFilter(z.enum(EMPLOYMENT_TYPES)),
  salaryExists: z.preprocess(
    (v) => v === true || v === 'true' || v === 'yes',
    z.boolean()
  ),
  cursor: optionalFilter(postingIdSchema),
  limit: optionalFilter(z.coerce.number().int().min(1).max(MAX_SEARCH_LIMIT)),
});
