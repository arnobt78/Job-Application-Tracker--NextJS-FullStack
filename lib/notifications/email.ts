/**
 * Resend email wrapper — sends enrichment change alerts to the job owner.
 *
 * Graceful no-op when RESEND_API_KEY is absent (local dev without email).
 * Fetches user email from Clerk API via clerkId stored on the Job record.
 *
 * Called from: lib/bluedoor/enrich.ts resyncJob when changed === true
 */

import prisma from '@/utils/db';

/** Enrichment-triggered change types for the email subject/body */
export type PostingChangeType = 'posting_closed' | 'jd_changed' | 'salary_added';

type SendPostingChangeEmailParams = {
  userId: string;    // Clerk userId (clerkId on Job record)
  jobId: string;
  position: string;
  company: string;
  changeType: PostingChangeType;
  /** Extra context — salary range string when changeType is 'salary_added' */
  detail?: string;
};

const CHANGE_COPY: Record<PostingChangeType, { subject: string; body: string }> = {
  posting_closed: {
    subject: '⚠️ Job posting closed',
    body: 'The live posting for this job has been marked as expired or removed by the employer.',
  },
  jd_changed: {
    subject: '📝 Job description changed',
    body: 'The job description for this posting has been updated since you tracked it.',
  },
  salary_added: {
    subject: '💰 Salary disclosed',
    body: 'Salary information is now available for this posting.',
  },
};

/**
 * Send a posting-change notification email.
 * No-op when RESEND_API_KEY is missing — returns without error.
 */
export async function sendPostingChangeEmail({
  userId,
  jobId,
  position,
  company,
  changeType,
  detail,
}: SendPostingChangeEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // graceful no-op in local dev / unset env

  const from = process.env.EMAIL_FROM ?? 'Jobify <noreply@jobify.app>';

  // Fetch user email from Clerk via admin API
  const email = await fetchUserEmail(userId);
  if (!email) return;

  const copy = CHANGE_COPY[changeType];
  const jobUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/dashboard/${jobId}`;
  const bodyLines = [
    `Hi,`,
    ``,
    `${copy.body}`,
    detail ? `Details: ${detail}` : '',
    ``,
    `Job: ${position} at ${company}`,
    `View application: ${jobUrl}`,
    ``,
    `— Jobify`,
  ]
    .filter((line) => line !== undefined)
    .join('\n');

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from,
      to: email,
      subject: `${copy.subject} — ${position} at ${company}`,
      text: bodyLines,
    });
  } catch (err) {
    // Email failure must not surface to the user or break enrichment
    console.error('[email] send failed:', err);
  }
}

/** Fetch user email from Clerk via server-side Clerk API */
async function fetchUserEmail(userId: string): Promise<string | null> {
  try {
    const { clerkClient } = await import('@clerk/nextjs/server');
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const primary = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId
    );
    return primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
  } catch {
    // Clerk API unavailable — no email to send
    return null;
  }
}

/** Resolve job owner's clerkId from DB (for webhook/cron callers that only have jobId) */
export async function getJobOwnerUserId(jobId: string): Promise<string | null> {
  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { clerkId: true },
    });
    return job?.clerkId ?? null;
  } catch {
    return null;
  }
}
