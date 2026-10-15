/**
 * Link tracked jobs to catalog postings and keep their snapshot in sync.
 *
 * Match priority:
 *   1. Exact normalised applyUrl
 *   2. Same company name + title similarity >= TITLE_MATCH_THRESHOLD
 *
 * Called from:
 *   - utils/actions.ts create/update/team-create (via next/server `after`)
 *   - app/api/extension/jobs (after)
 *   - app/api/cron/enrich (nightly resync of every linked job)
 */

import type { Prisma } from '@prisma/client';
import prisma from '@/utils/db';
import { invalidateUserJobCaches } from '@/lib/invalidate-jobs-server';
import { publishNotification } from '@/lib/jobs-events';
import { sendPostingChangeEmail, type PostingChangeType } from '@/lib/notifications/email';
import type { PostingSnapshot, PostingStatus, WorkplaceType } from '@/lib/postings/types';

export const TITLE_MATCH_THRESHOLD = 0.5;

const SNAPSHOT_POSTING_SELECT = {
  id: true,
  status: true,
  workplaceType: true,
  salaryMin: true,
  salaryMax: true,
  salaryCurrency: true,
  contentHash: true,
  company: { select: { size: true, industry: true, hq: true } },
} satisfies Prisma.JobPostingSelect;

export type SnapshotPosting = Prisma.JobPostingGetPayload<{ select: typeof SNAPSHOT_POSTING_SELECT }>;

/** Single builder for the Job columns copied from a posting (link, track and resync). */
export function buildPostingSnapshot(posting: SnapshotPosting, now = new Date()): PostingSnapshot {
  return {
    postingId: posting.id,
    postingStatus: posting.status as PostingStatus,
    workplaceType: posting.workplaceType as WorkplaceType,
    salaryMin: posting.salaryMin,
    salaryMax: posting.salaryMax,
    salaryCurrency: posting.salaryCurrency,
    postingDescHash: posting.contentHash,
    postingSyncedAt: now,
    companySize: posting.company.size,
    companyIndustry: posting.company.industry,
    companyHq: posting.company.hq,
  };
}

export function findSnapshotPosting(postingId: string): Promise<SnapshotPosting | null> {
  return prisma.jobPosting.findUnique({ where: { id: postingId }, select: SNAPSHOT_POSTING_SELECT });
}

/** Find + store the best catalog match for one tracked job. Best-effort: never throws. */
export async function linkJobToPosting(jobId: string, userId: string): Promise<void> {
  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId, userId },
      select: { applyUrl: true, company: true, position: true },
    });
    if (!job) return;

    const posting = await findPostingMatch(job);
    if (!posting) return;

    // Another job of this user already owns the posting (@@unique userId+postingId) — leave unlinked
    const owner = await prisma.job.findFirst({
      where: { userId, postingId: posting.id, NOT: { id: jobId } },
      select: { id: true },
    });
    if (owner) return;

    await prisma.job.update({
      where: { id: jobId, userId },
      data: { ...buildPostingSnapshot(posting), postingChangedAt: null, postingChangeType: null },
    });
    await invalidateUserJobCaches(userId, jobId);
  } catch (err) {
    console.error('[postings:link] error linking job', jobId, err);
  }
}

type PostingDiff = {
  changeType: PostingChangeType | null;
  salaryEdited: boolean;
};

/** Pure diff between a job's stored snapshot and the posting's current state. */
export function diffSnapshot(
  current: {
    postingStatus: string | null;
    postingDescHash: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryCurrency: string | null;
  },
  next: PostingSnapshot
): PostingDiff {
  const statusChanged = current.postingStatus !== next.postingStatus;
  const descChanged = current.postingDescHash !== next.postingDescHash;
  const salaryAdded =
    current.salaryMin == null &&
    current.salaryMax == null &&
    (next.salaryMin != null || next.salaryMax != null);
  const salaryEdited =
    current.salaryMin !== next.salaryMin ||
    current.salaryMax !== next.salaryMax ||
    current.salaryCurrency !== next.salaryCurrency;

  const changeType: PostingChangeType | null =
    statusChanged && next.postingStatus === 'closed'
      ? 'posting_closed'
      : salaryAdded
        ? 'salary_added'
        : descChanged || statusChanged
          ? 'jd_changed'
          : null;

  return { changeType, salaryEdited };
}

/**
 * Re-sync a linked job with its posting; notifies (SSE bell + email) on closed / salary added / JD change.
 * Returns true when a change was detected.
 */
export async function resyncJob(jobId: string, userId: string, postingId: string): Promise<boolean> {
  try {
    const [posting, current] = await Promise.all([
      findSnapshotPosting(postingId),
      prisma.job.findUnique({
        where: { id: jobId, userId },
        select: {
          position: true,
          company: true,
          postingStatus: true,
          postingDescHash: true,
          salaryMin: true,
          salaryMax: true,
          salaryCurrency: true,
        },
      }),
    ]);
    if (!posting || !current) return false;

    const snapshot = buildPostingSnapshot(posting);
    const { changeType, salaryEdited } = diffSnapshot(current, snapshot);

    await prisma.job.update({
      where: { id: jobId, userId },
      data: {
        ...snapshot,
        ...(changeType ? { postingChangedAt: snapshot.postingSyncedAt, postingChangeType: changeType } : {}),
      },
    });

    if (changeType || salaryEdited) await invalidateUserJobCaches(userId, jobId);
    if (!changeType) return false;

    const detail =
      changeType === 'salary_added' && snapshot.salaryMin != null && snapshot.salaryMax != null
        ? `${snapshot.salaryCurrency ?? 'USD'} ${snapshot.salaryMin.toLocaleString()} – ${snapshot.salaryMax.toLocaleString()}`
        : undefined;
    const label = `${current.position} at ${current.company}`;
    const message =
      changeType === 'posting_closed'
        ? `${label} — posting is now closed`
        : changeType === 'salary_added'
          ? `${label} — salary disclosed${detail ? `: ${detail}` : ''}`
          : `${label} — job description updated`;

    void publishNotification(userId, changeType, jobId, message);
    void sendPostingChangeEmail({
      userId,
      jobId,
      position: current.position,
      company: current.company,
      changeType,
      detail,
    });
    return true;
  } catch (err) {
    console.error('[postings:link] resync failed', jobId, err);
    return false;
  }
}

async function findPostingMatch(job: {
  applyUrl: string | null;
  company: string;
  position: string;
}): Promise<SnapshotPosting | null> {
  if (job.applyUrl) {
    const target = normaliseUrl(job.applyUrl);
    const host = target.split('/')[0];
    const candidates = await prisma.jobPosting.findMany({
      where: { applyUrl: { contains: host, mode: 'insensitive' } },
      select: { ...SNAPSHOT_POSTING_SELECT, applyUrl: true },
      take: 50,
    });
    const exact = candidates.find((p) => normaliseUrl(p.applyUrl) === target);
    if (exact) return exact;
  }

  const sameCompany = await prisma.jobPosting.findMany({
    where: { company: { name: { equals: job.company.trim(), mode: 'insensitive' } } },
    select: { ...SNAPSHOT_POSTING_SELECT, title: true },
    take: 50,
  });

  let best: { posting: SnapshotPosting; score: number } | null = null;
  for (const posting of sameCompany) {
    const score = titleSimilarity(posting.title, job.position);
    if (!best || score > best.score) best = { posting, score };
  }
  return best && best.score >= TITLE_MATCH_THRESHOLD ? best.posting : null;
}

/** Host + path, lowercased, without trailing slash, query or hash. */
export function normaliseUrl(raw: string): string {
  try {
    const u = new URL(raw);
    return `${u.hostname.toLowerCase().replace(/^www\./, '')}${u.pathname.replace(/\/$/, '').toLowerCase()}`;
  } catch {
    return raw.trim().toLowerCase();
  }
}

/** Jaccard similarity over words longer than 2 characters. */
export function titleSimilarity(a: string, b: string): number {
  const words = (s: string) => Array.from(new Set(s.toLowerCase().split(/\W+/).filter((w) => w.length > 2)));
  const wordsA = words(a);
  const wordsB = new Set(words(b));
  const unionSize = new Set(wordsA.concat(Array.from(wordsB))).size;
  if (unionSize === 0) return 0;
  const common = wordsA.filter((w) => wordsB.has(w)).length;
  return common / unionSize;
}
