/**
 * Server-side pipeline payload builders — the profile is always loaded from the DB,
 * never trusted from the browser. Shared by the stream route, the batch route and
 * the interview-prep background action.
 */

import type { Prisma } from '@prisma/client';
import prisma from '@/utils/db';
import type { PipelineUserProfile } from '@/lib/ai/pipeline-client';

export const PIPELINE_JOB_SELECT = {
  id: true,
  position: true,
  company: true,
  location: true,
  status: true,
  mode: true,
  applyUrl: true,
  bluedoorStatus: true,
  bluedoorWorkplaceType: true,
  bluedoorSalaryMin: true,
  bluedoorSalaryMax: true,
  bluedoorSalaryCurrency: true,
} satisfies Prisma.JobSelect;

/** Signed-in user's AI profile; empty fields when no UserProfile row exists yet. */
export async function loadPipelineUserProfile(userId: string): Promise<PipelineUserProfile> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { resumeText: true, targetRoles: true, skills: true },
  });
  return {
    resume_summary: profile?.resumeText ?? null,
    target_role: profile?.targetRoles?.[0] ?? null,
    skills: profile?.skills ?? [],
  };
}
