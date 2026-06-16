"use server";

import prisma from "./db";
import { auth } from "@clerk/nextjs/server";
import { JobType, CreateAndEditJobType, createAndEditJobSchema } from "./types";
import { redirect } from "next/navigation";
import { invalidateUserJobCaches } from "@/lib/invalidate-jobs-server";
import {
  getCachedJobs,
  getCachedJob,
  getCachedStats,
  getCachedCharts,
  getCachedJobFilterOptions,
  type StatsResult,
} from "@/lib/jobs/queries";
import type { JobFilterOptions } from "@/lib/jobs/filter-types";

async function authenticateAndRedirect(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }
  return userId;
}

export async function createJobAction(
  values: CreateAndEditJobType
): Promise<JobType | null> {
  const userId = await authenticateAndRedirect();

  try {
    createAndEditJobSchema.parse(values);
    const job: JobType = await prisma.job.create({
      data: {
        ...values,
        clerkId: userId,
      },
    });
    await invalidateUserJobCaches(userId, job.id);
    return job;
  } catch (error) {
    console.error(error);
    return null;
  }
}

type GetAllJobsActionTypes = {
  search?: string;
  jobStatus?: string;
  jobMode?: string;
  monthYear?: string;
  page?: number;
  limit?: number;
};

export async function getAllJobsAction({
  search,
  jobStatus,
  jobMode,
  monthYear,
  page = 1,
  limit = 10,
}: GetAllJobsActionTypes): Promise<{
  jobs: JobType[];
  count: number;
  page: number;
  totalPages: number;
}> {
  const userId = await authenticateAndRedirect();

  try {
    return await getCachedJobs(
      userId,
      search ?? "",
      jobStatus ?? "all",
      jobMode ?? "all",
      monthYear ?? "all",
      page,
      limit
    );
  } catch (error) {
    console.error(error);
    return { jobs: [], count: 0, page: 1, totalPages: 0 };
  }
}

export async function getJobFilterOptionsAction(): Promise<JobFilterOptions> {
  const userId = await authenticateAndRedirect();

  try {
    return await getCachedJobFilterOptions(userId);
  } catch (error) {
    console.error(error);
    return { months: [] };
  }
}

export async function deleteJobAction(id: string): Promise<JobType | null> {
  const userId = await authenticateAndRedirect();

  try {
    const job: JobType = await prisma.job.delete({
      where: { id, clerkId: userId },
    });
    await invalidateUserJobCaches(userId, id);
    return job;
  } catch {
    return null;
  }
}

export async function getSingleJobAction(id: string): Promise<JobType | null> {
  const userId = await authenticateAndRedirect();

  let job: JobType | null = null;
  try {
    job = await getCachedJob(userId, id);
  } catch {
    job = null;
  }

  if (!job) {
    redirect("/dashboard");
  }
  return job;
}

export async function updateJobAction(
  id: string,
  values: CreateAndEditJobType
): Promise<JobType | null> {
  const userId = await authenticateAndRedirect();

  try {
    createAndEditJobSchema.parse(values);
    const job: JobType = await prisma.job.update({
      where: { id, clerkId: userId },
      data: { ...values },
    });
    await invalidateUserJobCaches(userId, id);
    return job;
  } catch {
    return null;
  }
}

export async function getStatsAction(): Promise<StatsResult> {
  const userId = await authenticateAndRedirect();

  try {
    return await getCachedStats(userId);
  } catch {
    redirect("/dashboard");
  }
}

export async function getChartsDataAction(): Promise<
  Array<{ date: string; count: number }>
> {
  const userId = await authenticateAndRedirect();

  try {
    return await getCachedCharts(userId);
  } catch {
    redirect("/dashboard");
  }
}

export async function getAllJobsForDownloadAction(): Promise<JobType[]> {
  const userId = await authenticateAndRedirect();

  try {
    return await prisma.job.findMany({
      where: { clerkId: userId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}
