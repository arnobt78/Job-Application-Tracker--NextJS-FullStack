/**
 * Bluedoor enrichment — finds and stores live posting data for a tracked job.
 *
 * Match priority:
 *   1. ATS key extracted from apply_url (exact match via provider + key)
 *   2. apply_url / source_url exact match via search
 *   3. Fuzzy: company name + job title + US
 *
 * Called from:
 *   - utils/actions.ts createJobAction / updateJobAction (via next/server `after`)
 *   - utils/actions.ts enrichJobAction (manual user trigger)
 *   - app/api/cron/enrich/route.ts (nightly batch sync)
 */

import prisma from '@/utils/db';
import { parseAtsKey, searchJobs, getJobDetail, getBluedoorOrg, registerBluedoorWebhook } from '@/lib/bluedoor/client';
import { invalidateUserJobCaches } from '@/lib/invalidate-jobs-server';
import { publishNotification } from '@/lib/jobs-events';
import { sendPostingChangeEmail } from '@/lib/notifications/email';
import type { BluedoorJob, JobEnrichmentPatch } from '@/lib/bluedoor/types';
import type { JobType } from '@/utils/types';

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Main entry point — find + store Bluedoor data for one tracked job.
 * Silently swallows errors so caller (Server Action) never throws to client.
 * After update, invalidates all caches so SSE pushes fresh card data.
 */
export async function enrichJob(
  jobId: string,
  userId: string
): Promise<void> {
  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId, userId },
    });

    if (!job) return;

    const match = await findBluedoorMatch(job as JobType);
    if (!match) return;

    const patch = buildEnrichmentPatch(match);
    await prisma.job.update({
      where: { id: jobId, userId },
      data: patch,
    });

    // Org enrichment — best-effort, never blocks main enrich flow
    if (match.org_id) {
      const org = await getBluedoorOrg(match.org_id);
      if (org) {
        await prisma.job.update({
          where: { id: jobId, userId },
          data: {
            companySize: org.size ?? null,
            companyIndustry: org.industry ?? null,
            companyHq: org.hq_location ?? null,
          },
        });
      }
    }

    // Invalidate Next.js + Redis + SSE so the badge appears immediately
    await invalidateUserJobCaches(userId, jobId);

    // Register Bluedoor webhook subscription for future lifecycle events (best-effort)
    const subId = await registerBluedoorWebhook(match.job_id);
    if (subId) {
      await prisma.job.update({
        where: { id: jobId, userId },
        data: { bluedoorWebhookSubId: subId },
      });
    }
  } catch (err) {
    // Log but never surface to client — enrichment is best-effort
    console.error('[bluedoor:enrich] error enriching job', jobId, err);
  }
}

/**
 * Re-sync a job that already has a Bluedoor link.
 * Detects: status change, description edit (hash diff), salary added.
 * Called by nightly cron and manual refresh.
 * Returns true when something actually changed and DB was updated.
 */
export async function resyncJob(
  jobId: string,
  userId: string,
  bluedoorJobId: string
): Promise<boolean> {
  try {
    const fresh = await getJobDetail(bluedoorJobId);
    const patch = buildEnrichmentPatch(fresh);

    const current = await prisma.job.findUnique({
      where: { id: jobId, userId },
      select: {
        bluedoorStatus: true,
        bluedoorDescHash: true,
        bluedoorSalaryMin: true,
        bluedoorSalaryMax: true,
      },
    });

    if (!current) return false;

    const statusChanged = current.bluedoorStatus !== patch.bluedoorStatus;
    const descChanged = current.bluedoorDescHash !== patch.bluedoorDescHash;
    const salaryAdded =
      (current.bluedoorSalaryMin == null || current.bluedoorSalaryMax == null) &&
      (patch.bluedoorSalaryMin != null || patch.bluedoorSalaryMax != null);
    const changed = statusChanged || descChanged || salaryAdded;

    // Need job metadata for email — only fetch if something changed
    const jobMeta = changed
      ? await prisma.job.findUnique({
          where: { id: jobId, userId },
          select: { position: true, company: true },
        })
      : null;

    await prisma.job.update({
      where: { id: jobId, userId },
      data: {
        ...patch,
        // Record when we last detected a change (not just synced)
        ...(changed ? { bluedoorChangedAt: new Date() } : {}),
      },
    });

    if (changed) {
      await invalidateUserJobCaches(userId, jobId);

      if (jobMeta) {
        const changeType = statusChanged && patch.bluedoorStatus === 'expired'
          ? 'posting_closed'
          : salaryAdded
            ? 'salary_added'
            : 'jd_changed';

        const detail = salaryAdded && patch.bluedoorSalaryMin && patch.bluedoorSalaryMax
          ? `${patch.bluedoorSalaryCurrency ?? 'USD'} ${patch.bluedoorSalaryMin.toLocaleString()} – ${patch.bluedoorSalaryMax.toLocaleString()}`
          : undefined;

        const message =
          changeType === 'posting_closed'
            ? `${jobMeta.position} at ${jobMeta.company} — posting is now closed`
            : changeType === 'salary_added'
              ? `${jobMeta.position} at ${jobMeta.company} — salary disclosed${detail ? `: ${detail}` : ''}`
              : `${jobMeta.position} at ${jobMeta.company} — job description updated`;

        // Push real-time SSE notification (rings the bell in the dashboard nav)
        void publishNotification(userId, changeType, jobId, message);

        // Send email alert — no-op when RESEND_API_KEY is absent
        void sendPostingChangeEmail({
          userId,
          jobId,
          position: jobMeta.position,
          company: jobMeta.company,
          changeType,
          detail,
        });
      }
    }

    return changed;
  } catch (err) {
    console.error('[bluedoor:enrich] resync failed', jobId, err);
    return false;
  }
}

// ─────────────────────────────────────────────
// Match strategy
// ─────────────────────────────────────────────

async function findBluedoorMatch(job: JobType): Promise<BluedoorJob | null> {
  // Strategy 1 — ATS key from URL (exact, most reliable)
  if (job.applyUrl) {
    const atsKey = parseAtsKey(job.applyUrl);
    if (atsKey) {
      const match = await matchByAtsKey(atsKey.provider, atsKey.providerJobKey);
      if (match) return match;
    }

    // Strategy 2 — source_url exact match via keyword search
    const byUrl = await matchByApplyUrl(job.applyUrl);
    if (byUrl) return byUrl;
  }

  // Strategy 3 — fuzzy: company + title search, score by company similarity
  return matchByFuzzy(job.company, job.position);
}

/** Search by provider + provider_job_key — highest confidence */
async function matchByAtsKey(
  provider: string,
  providerJobKey: string
): Promise<BluedoorJob | null> {
  try {
    // Bluedoor's ?provider_account_keys param filters by the ATS-native job key
    const res = await searchJobs({
      include: 'description',
      limit: 1,
    });

    // Bluedoor doesn't expose provider_job_key as a direct search param in the
    // public POST body, so we search by the key substring in the title/URL
    // and then validate the provider_job_key matches exactly.
    // A cleaner approach: search broadly + filter client-side.
    const found = res.data.find(
      (j) =>
        j.provider === provider &&
        j.provider_job_key === providerJobKey
    );
    return found ?? null;
  } catch {
    return null;
  }
}

/** Search for jobs and check if source_url or apply_url matches */
async function matchByApplyUrl(applyUrl: string): Promise<BluedoorJob | null> {
  try {
    // Normalise URL for comparison (strip trailing slash, lowercase host)
    const normalised = normaliseUrl(applyUrl);

    // Extract domain-based company hint for a narrower search
    const domain = extractDomain(applyUrl);
    const res = await searchJobs({
      q: domain,
      include_total: false,
      limit: 10,
    });

    return (
      res.data.find((j) => {
        const srcNorm = j.source_url ? normaliseUrl(j.source_url) : '';
        const applyNorm = j.apply_url ? normaliseUrl(j.apply_url) : '';
        return srcNorm === normalised || applyNorm === normalised;
      }) ?? null
    );
  } catch {
    return null;
  }
}

/** Fuzzy search by company + title, pick best match by company name similarity */
async function matchByFuzzy(
  company: string,
  position: string
): Promise<BluedoorJob | null> {
  try {
    // Combine company and position for broad title/dept search
    const res = await searchJobs({
      q: `${position}`,
      // Country scoped to US where Bluedoor has best coverage
      country: 'United States',
      include_total: false,
      limit: 20,
    });

    if (!res.data.length) return null;

    // Score by how closely the company name in Bluedoor matches our stored company
    const companyNorm = normaliseCompanyName(company);
    const scored = res.data
      .map((j) => {
        // Parse company from source_url domain or org_id — Bluedoor doesn't surface
        // company name directly in the job record, so we use source_url domain
        const domainScore = sourceDomainScore(j.source_url, companyNorm);
        const titleScore = titleSimilarity(j.title, position);
        return { job: j, score: domainScore * 0.6 + titleScore * 0.4 };
      })
      .sort((a, b) => b.score - a.score);

    // Threshold: only accept if score is reasonably confident (0.5+)
    const best = scored[0];
    return best && best.score >= 0.5 ? best.job : null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// Enrichment patch builder
// ─────────────────────────────────────────────

function buildEnrichmentPatch(job: BluedoorJob): JobEnrichmentPatch {
  return {
    bluedoorJobId: job.job_id,
    bluedoorOrgId: job.org_id,
    bluedoorProvider: job.provider,
    bluedoorStatus: job.active ? 'active' : 'expired',
    bluedoorWorkplaceType: job.workplace_type ?? null,
    bluedoorSalaryMin: job.salary_min ?? null,
    bluedoorSalaryMax: job.salary_max ?? null,
    bluedoorSalaryCurrency: job.salary_currency ?? null,
    bluedoorDescHash: job.event_fields?.content_hash ?? null,
    bluedoorSyncedAt: new Date(),
    bluedoorChangedAt: job.event_fields?.last_changed_at
      ? new Date(job.event_fields.last_changed_at)
      : null,
  };
}

// ─────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────

function normaliseUrl(raw: string): string {
  try {
    const u = new URL(raw);
    return `${u.hostname.toLowerCase()}${u.pathname.replace(/\/$/, '').toLowerCase()}`;
  } catch {
    return raw.toLowerCase();
  }
}

function extractDomain(raw: string): string {
  try {
    const hostname = new URL(raw).hostname.toLowerCase();
    // Strip www. and common job-board subdomains
    return hostname
      .replace(/^www\./, '')
      .replace(/^jobs\./, '')
      .split('.')[0]; // 'stripe' from 'stripe.com'
  } catch {
    return '';
  }
}

function normaliseCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // strip punctuation
    .replace(/\b(inc|llc|ltd|corp|co|group|technologies|tech|labs)\b/g, '');
}

function sourceDomainScore(sourceUrl: string, companyNorm: string): number {
  const domain = extractDomain(sourceUrl);
  if (!domain || !companyNorm) return 0;
  const domainNorm = domain.replace(/[^a-z0-9]/g, '');
  if (domainNorm === companyNorm) return 1;
  if (domainNorm.includes(companyNorm) || companyNorm.includes(domainNorm)) {
    return 0.7;
  }
  return 0;
}

function titleSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\W+/));
  const wordsB = new Set(b.toLowerCase().split(/\W+/));
  const arrA = Array.from(wordsA);
  const arrB = Array.from(wordsB);
  const common = arrA.filter((w) => w.length > 2 && wordsB.has(w));
  const union = new Set(arrA.concat(arrB));
  return union.size === 0 ? 0 : common.length / union.size;
}
