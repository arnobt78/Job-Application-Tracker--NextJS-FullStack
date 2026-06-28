/**
 * Weekly digest — queries all users with job activity in the last 7 days
 * and sends a summary email via Resend.
 * Called by GET /api/cron/weekly-digest (Sunday 09:00 UTC).
 */

import prisma from '@/utils/db';
import { createElement } from 'react';
import type { DigestChange } from './templates/WeeklyDigestEmail';

export async function sendAllWeeklyDigests(): Promise<{ sent: number; skipped: number }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: 0, skipped: 0 };

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekOf = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://jobify.app';

  // Distinct users who have any jobs
  const userGroups = await prisma.job.groupBy({ by: ['clerkId'] });

  let sent = 0;
  let skipped = 0;

  for (const { clerkId } of userGroups) {
    try {
      const [newApps, changedJobs, totalCount] = await Promise.all([
        // New applications this week
        prisma.job.findMany({
          where: { clerkId, createdAt: { gte: sevenDaysAgo } },
          select: { id: true, position: true, company: true, status: true },
          orderBy: { createdAt: 'desc' },
        }),
        // Jobs with Bluedoor posting changes this week
        prisma.job.findMany({
          where: { clerkId, bluedoorChangedAt: { gte: sevenDaysAgo } },
          select: { id: true, position: true, company: true, bluedoorStatus: true },
        }),
        // Total tracked
        prisma.job.count({ where: { clerkId } }),
      ]);

      // Skip users with no activity this week
      if (newApps.length === 0 && changedJobs.length === 0) {
        skipped++;
        continue;
      }

      const email = await fetchUserEmail(clerkId);
      if (!email) { skipped++; continue; }

      const postingChanges: DigestChange[] = changedJobs.map((j) => ({
        position: j.position,
        company: j.company,
        changeType: j.bluedoorStatus === 'expired' ? 'posting_closed' : 'jd_changed',
      }));

      const digestApps = newApps.map((j) => ({
        position: j.position,
        company: j.company,
        status: j.status,
        jobUrl: `${appUrl}/dashboard/${j.id}`,
      }));

      const { render } = await import('@react-email/render');
      const { WeeklyDigestEmail } = await import('./templates/WeeklyDigestEmail');
      const html = await render(
        createElement(WeeklyDigestEmail, {
          weekOf,
          newApps: digestApps,
          postingChanges,
          totalTracked: totalCount,
          appUrl,
        })
      );

      const text = [
        `Jobify Weekly Digest — ${weekOf}`,
        ``,
        newApps.length > 0 ? `New applications (${newApps.length}): ${newApps.map((j) => `${j.position} at ${j.company}`).join(', ')}` : '',
        postingChanges.length > 0 ? `Posting changes (${postingChanges.length}): ${postingChanges.map((j) => `${j.position} at ${j.company}`).join(', ')}` : '',
        ``,
        `Open Jobify: ${appUrl}`,
      ].filter(Boolean).join('\n');

      const { Resend } = await import('resend');
      const resend = new Resend(apiKey);
      const from = process.env.EMAIL_FROM ?? 'Jobify <noreply@jobify.app>';

      await resend.emails.send({
        from,
        to: email,
        subject: `Your Jobify weekly digest — ${weekOf}`,
        text,
        html,
      });

      sent++;
    } catch (err) {
      console.error(`[weekly-digest] failed for clerkId ${clerkId}:`, err);
      skipped++;
    }
  }

  return { sent, skipped };
}

async function fetchUserEmail(userId: string): Promise<string | null> {
  try {
    const { clerkClient } = await import('@clerk/nextjs/server');
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const primary = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId);
    return primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
  } catch {
    return null;
  }
}
