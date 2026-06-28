/**
 * Timeline — derives chronological activity events from Job rows.
 *
 * Event sources (all derivable from current schema without a history table):
 *   job_created      — Job.createdAt (always present)
 *   enriched         — Job.bluedoorSyncedAt (Bluedoor first matched this posting)
 *   posting_changed  — Job.bluedoorChangedAt (JD edit, status flip, salary added)
 *   ai_generated     — JobAIInsight.generatedAt (user ran AI pipeline on this job)
 *
 * Result sorted desc by timestamp, capped at 100 events.
 * Wrapped in unstable_cache tagged with jobsTag(userId) so CRUD invalidates it.
 */

import { unstable_cache } from 'next/cache';
import prisma from '@/utils/db';
import { jobsTag } from '@/lib/cache-tags';
import type { TimelineEvent } from '@/utils/types';

async function buildTimelineEvents(userId: string): Promise<TimelineEvent[]> {
  const jobs = await prisma.job.findMany({
    where: { userId },
    select: {
      id: true,
      position: true,
      company: true,
      status: true,
      createdAt: true,
      bluedoorSyncedAt: true,
      bluedoorChangedAt: true,
      bluedoorStatus: true,
      aiInsight: {
        select: { generatedAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    // Fetch enough jobs to generate up to 100 events (4 types × 25 jobs = 100)
    take: 50,
  });

  const events: TimelineEvent[] = [];

  for (const job of jobs) {
    // job_created — always present
    events.push({
      id: `${job.id}:job_created`,
      type: 'job_created',
      jobId: job.id,
      position: job.position,
      company: job.company,
      detail: job.status,
      timestamp: job.createdAt,
    });

    // enriched — Bluedoor matched and fetched posting data
    if (job.bluedoorSyncedAt) {
      events.push({
        id: `${job.id}:enriched`,
        type: 'enriched',
        jobId: job.id,
        position: job.position,
        company: job.company,
        detail: job.bluedoorStatus ?? 'active',
        timestamp: job.bluedoorSyncedAt,
      });
    }

    // posting_changed — JD edit, status change, or salary added
    if (job.bluedoorChangedAt) {
      events.push({
        id: `${job.id}:posting_changed`,
        type: 'posting_changed',
        jobId: job.id,
        position: job.position,
        company: job.company,
        detail: job.bluedoorStatus ?? null,
        timestamp: job.bluedoorChangedAt,
      });
    }

    // ai_generated — user ran AI insights on this job
    if (job.aiInsight) {
      events.push({
        id: `${job.id}:ai_generated`,
        type: 'ai_generated',
        jobId: job.id,
        position: job.position,
        company: job.company,
        detail: null,
        timestamp: job.aiInsight.generatedAt,
      });
    }
  }

  // Sort descending by timestamp, cap at 100
  return events
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 100);
}

/** Cached timeline — invalidated by jobsTag on any CRUD mutation. */
export function getTimelineEvents(userId: string): Promise<TimelineEvent[]> {
  return unstable_cache(
    () => buildTimelineEvents(userId),
    [`timeline-${userId}`],
    { tags: [jobsTag(userId)], revalidate: false }
  )();
}
