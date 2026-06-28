/**
 * Resend email wrapper — sends enrichment change alerts to the job owner.
 *
 * Graceful no-op when RESEND_API_KEY is absent (local dev without email).
 * Fetches user email from the DB users table via userId stored on the Job record.
 *
 * Called from: lib/bluedoor/enrich.ts resyncJob when changed === true
 */

import prisma from '@/utils/db';
import { createElement } from 'react';

/** Enrichment-triggered change types for the email subject/body */
export type PostingChangeType = 'posting_closed' | 'jd_changed' | 'salary_added';

type SendPostingChangeEmailParams = {
  userId: string;    // NextAuth user ID (userId on Job record)
  jobId: string;
  position: string;
  company: string;
  changeType: PostingChangeType;
  /** Extra context — salary range string when changeType is 'salary_added' */
  detail?: string;
};

const CHANGE_SUBJECTS: Record<PostingChangeType, string> = {
  posting_closed: '⚠️ Job posting closed',
  jd_changed: '📝 Job description changed',
  salary_added: '💰 Salary disclosed',
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

  const email = await fetchUserEmail(userId);
  if (!email) return;

  const jobUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/dashboard/${jobId}`;
  const subject = `${CHANGE_SUBJECTS[changeType]} — ${position} at ${company}`;

  let html: string;
  let text: string;

  try {
    const { render } = await import('@react-email/render');

    if (changeType === 'posting_closed') {
      const { PostingClosedEmail } = await import('./templates/PostingClosedEmail');
      html = await render(createElement(PostingClosedEmail, { position, company, jobUrl }));
    } else if (changeType === 'jd_changed') {
      const { JdChangedEmail } = await import('./templates/JdChangedEmail');
      html = await render(createElement(JdChangedEmail, { position, company, jobUrl }));
    } else {
      const { SalaryAddedEmail } = await import('./templates/SalaryAddedEmail');
      html = await render(createElement(SalaryAddedEmail, { position, company, jobUrl, salaryRange: detail }));
    }

    // Plain-text fallback for email clients that block HTML
    text = [
      `${subject}`,
      ``,
      `Job: ${position} at ${company}`,
      detail ? `Details: ${detail}` : '',
      `View application: ${jobUrl}`,
      ``,
      `— Jobify`,
    ].filter(Boolean).join('\n');
  } catch {
    // Template render failed — fall back to plain text only
    html = '';
    text = `${subject}\n\nJob: ${position} at ${company}\nView: ${jobUrl}\n\n— Jobify`;
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from,
      to: email,
      subject,
      text,
      ...(html ? { html } : {}),
    });
  } catch (err) {
    // Email failure must not surface to the user or break enrichment
    console.error('[email] send failed:', err);
  }
}

/** Fetch user email from DB by userId */
async function fetchUserEmail(userId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    return user?.email ?? null;
  } catch {
    return null;
  }
}

/** Resolve job owner's userId from DB (for webhook/cron callers that only have jobId) */
export async function getJobOwnerUserId(jobId: string): Promise<string | null> {
  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { userId: true },
    });
    return job?.userId ?? null;
  } catch {
    return null;
  }
}
