/**
 * Server Actions File
 *
 * This file contains all server-side actions for job management.
 * Server actions in Next.js run on the server, providing secure database access
 * and authentication checks without exposing API routes.
 *
 * Key Concepts:
 * - "use server" directive marks functions as server actions
 * - All database operations use Prisma ORM
 * - Clerk authentication ensures only authenticated users can access data
 * - All actions validate user identity before performing operations
 */
"use server";

import prisma from "./db";
import { auth } from "@clerk/nextjs/server";
import { JobType, CreateAndEditJobType, createAndEditJobSchema } from "./types";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";

/**
 * Helper function to authenticate user and redirect if not authenticated
 *
 * This is a reusable authentication check used by all server actions.
 * It ensures that only logged-in users can perform database operations.
 *
 * @returns The authenticated user's Clerk ID
 * @throws Redirects to home page if user is not authenticated
 */
function authenticateAndRedirect(): string {
  // Clerk's auth() function gets the current user from the request
  const { userId } = auth();

  // If no user ID, redirect to home page (login page)
  if (!userId) {
    redirect("/");
  }
  return userId;
}

/**
 * Server Action: Create a new job application
 *
 * This function:
 * 1. Authenticates the user
 * 2. Validates input data using Zod schema
 * 3. Creates a new job record in the database
 * 4. Associates the job with the authenticated user's Clerk ID
 *
 * @param values - Job data (position, company, location, status, mode)
 * @returns The created job object, or null if creation fails
 */
export async function createJobAction(
  values: CreateAndEditJobType
): Promise<JobType | null> {
  // Commented out: Example of adding artificial delay for testing loading states
  // await new Promise((resolve) => setTimeout(resolve, 3000));

  // Ensure user is authenticated before proceeding
  const userId = authenticateAndRedirect();

  try {
    // Zod schema validation - throws error if data is invalid
    // This ensures data integrity before database operation
    createAndEditJobSchema.parse(values);

    // Prisma create operation
    // ...values spreads all properties from the values object
    // clerkId associates this job with the authenticated user
    const job: JobType = await prisma.job.create({
      data: {
        ...values,
        clerkId: userId,
      },
    });
    return job;
  } catch (error) {
    // Log error for debugging, return null to indicate failure
    console.error(error);
    return null;
  }
}

/**
 * Type definition for getAllJobsAction parameters
 * All fields are optional to support flexible querying
 */
type GetAllJobsActionTypes = {
  search?: string;
  jobStatus?: string;
  page?: number;
  limit?: number;
};

/**
 * Server Action: Get paginated list of jobs with optional search and filter
 *
 * This is the main query function for the jobs list page. It supports:
 * - Search by position or company name
 * - Filter by job status (pending, interview, declined)
 * - Pagination (page number and limit)
 * - User-specific data (only returns jobs for authenticated user)
 *
 * @param search - Optional search term to filter by position or company
 * @param jobStatus - Optional status filter ("all", "pending", "interview", "declined")
 * @param page - Page number (default: 1)
 * @param limit - Number of items per page (default: 10)
 * @returns Object containing jobs array, total count, current page, and total pages
 */
export async function getAllJobsAction({
  search,
  jobStatus,
  page = 1,
  limit = 10,
}: GetAllJobsActionTypes): Promise<{
  jobs: JobType[];
  count: number;
  page: number;
  totalPages: number;
}> {
  const userId = authenticateAndRedirect();
  // Commented out: Example of adding artificial delay for testing loading states
  // await new Promise((resolve) => setTimeout(resolve, 5000));

  try {
    // Start with base where clause: only jobs belonging to authenticated user
    // Prisma.JobWhereInput provides type safety for query conditions
    let whereClause: Prisma.JobWhereInput = {
      clerkId: userId,
    };

    // Add search filter if provided
    // OR condition searches both position and company fields
    // contains performs case-insensitive partial matching
    if (search) {
      whereClause = {
        ...whereClause,
        OR: [
          {
            position: {
              contains: search,
            },
          },
          {
            company: {
              contains: search,
            },
          },
        ],
      };
    }

    // Add status filter if provided and not "all"
    if (jobStatus && jobStatus !== "all") {
      whereClause = {
        ...whereClause,
        status: jobStatus,
      };
    }

    // Calculate skip value for pagination
    // Example: page 2 with limit 10 = skip 10 (skip first 10 items)
    const skip = (page - 1) * limit;

    // Fetch jobs with pagination
    // findMany returns an array of records matching the where clause
    const jobs: JobType[] = await prisma.job.findMany({
      where: whereClause, // Filter conditions (user, search, status)
      skip, // Number of records to skip (for pagination)
      take: limit, // Number of records to return (page size)
      orderBy: {
        createdAt: "desc", // Newest jobs first
      },
    });

    // Get total count of matching records (for pagination calculation)
    // This is a separate query because we need the total, not just the current page
    const count: number = await prisma.job.count({
      where: whereClause, // Same filter as above
    });

    // Calculate total pages needed
    // Math.ceil rounds up (e.g., 25 items / 10 per page = 3 pages)
    const totalPages = Math.ceil(count / limit);

    return { jobs, count, page, totalPages };
  } catch (error) {
    // On error, return empty result set to prevent app crash
    console.error(error);
    return { jobs: [], count: 0, page: 1, totalPages: 0 };
  }
}

/**
 * Server Action: Delete a job application
 *
 * Security: Only deletes jobs that belong to the authenticated user
 * (checked via clerkId in where clause)
 *
 * @param id - The ID of the job to delete
 * @returns The deleted job object, or null if deletion fails
 */
export async function deleteJobAction(id: string): Promise<JobType | null> {
  const userId = authenticateAndRedirect();

  try {
    // Delete operation with compound where clause
    // Both id AND clerkId must match - prevents users from deleting others' jobs
    const job: JobType = await prisma.job.delete({
      where: {
        id,
        clerkId: userId,
      },
    });
    return job;
  } catch (error) {
    // Return null on error (e.g., job not found or doesn't belong to user)
    return null;
  }
}

/**
 * Server Action: Get a single job by ID
 *
 * Used for the job detail/edit page. Ensures user can only access their own jobs.
 * Redirects to jobs list if job not found or doesn't belong to user.
 *
 * @param id - The ID of the job to retrieve
 * @returns The job object, or redirects to /jobs if not found
 */
export async function getSingleJobAction(id: string): Promise<JobType | null> {
  let job: JobType | null = null;
  const userId = authenticateAndRedirect();

  try {
    // findUnique finds a single record by unique identifier
    // clerkId check ensures user can only access their own jobs
    job = await prisma.job.findUnique({
      where: {
        id,
        clerkId: userId,
      },
    });
  } catch (error) {
    job = null;
  }

  // If job not found or doesn't belong to user, redirect to jobs list
  // This prevents unauthorized access and provides better UX than showing error
  if (!job) {
    redirect("/jobs");
  }
  return job;
}

/**
 * Server Action: Update an existing job application
 *
 * Updates job data while ensuring user can only update their own jobs.
 * Uses the same validation schema as createJobAction.
 *
 * @param id - The ID of the job to update
 * @param values - Updated job data (position, company, location, status, mode)
 * @returns The updated job object, or null if update fails
 */
export async function updateJobAction(
  id: string,
  values: CreateAndEditJobType
): Promise<JobType | null> {
  const userId = authenticateAndRedirect();

  try {
    // Update operation with security check (clerkId must match)
    // ...values spreads all updated properties into the data object
    const job: JobType = await prisma.job.update({
      where: {
        id,
        clerkId: userId, // Security: only update own jobs
      },
      data: {
        ...values, // Spread operator updates all provided fields
      },
    });
    return job;
  } catch (error) {
    return null;
  }
}
/**
 * Server Action: Get statistics grouped by job status
 *
 * Uses Prisma's groupBy to count jobs by status. Returns counts for:
 * - pending: Jobs with pending status
 * - interview: Jobs with interview status
 * - declined: Jobs with declined status
 *
 * Used for the stats dashboard page.
 *
 * @returns Object with counts for each status
 */
export async function getStatsAction(): Promise<{
  pending: number;
  interview: number;
  declined: number;
}> {
  const userId = authenticateAndRedirect();
  // Commented out: Example of adding artificial delay for testing loading states
  // await new Promise((resolve) => setTimeout(resolve, 5000));

  try {
    // Prisma groupBy aggregates data by specified field
    // Returns array of objects, one per unique status value
    const stats = await prisma.job.groupBy({
      by: ["status"], // Group by status field
      _count: {
        status: true, // Count occurrences of each status
      },
      where: {
        clerkId: userId, // Only count user's own jobs
      },
    });

    // Transform array into object for easier access
    // Normalize status to lowercase so "Pending"/"pending" both count as pending
    // Example: [{status: "Pending", _count: {status: 6}}] -> {pending: 6}
    const statsObject = stats.reduce((acc, curr) => {
      const normalized = curr.status.toLowerCase();
      if (["pending", "interview", "declined"].includes(normalized)) {
        acc[normalized] = (acc[normalized] || 0) + curr._count.status;
      }
      return acc;
    }, {} as Record<string, number>);

    // Ensure all statuses are present with default value of 0
    // This prevents undefined values if user has no jobs of a certain status
    const defaultStats = {
      pending: 0,
      declined: 0,
      interview: 0,
      ...statsObject, // Override with actual counts if they exist
    };
    return defaultStats;
  } catch (error) {
    // Redirect to jobs page on error
    redirect("/jobs");
  }
}

/**
 * Server Action: Get job application data for charts (last 6 months)
 *
 * Fetches jobs from the last 6 months and groups them by month.
 * Used for displaying application trends over time in charts.
 *
 * @returns Array of objects with date (formatted as "MMM YY") and count
 */
export async function getChartsDataAction(): Promise<
  Array<{ date: string; count: number }>
> {
  const userId = authenticateAndRedirect();

  // Calculate date range: last 6 months, up to current moment (exclude future dates)
  const now = dayjs().toDate();
  const sixMonthsAgo = dayjs().subtract(6, "month").toDate();

  try {
    // Fetch jobs from last 6 months only (exclude future createdAt dates)
    const jobs = await prisma.job.findMany({
      where: {
        clerkId: userId,
        createdAt: {
          gte: sixMonthsAgo,
          lte: now, // Don't show future dates in chart
        },
      },
      orderBy: {
        createdAt: "asc", // Oldest first for chronological chart
      },
    });

    // Group jobs by month and count applications per month
    // reduce() accumulates data into the final array format
    let applicationsPerMonth = jobs.reduce((acc, job) => {
      // Format date as "MMM YY" (e.g., "Oct 25")
      const date = dayjs(job.createdAt).format("MMM YY");

      // Check if we already have an entry for this month
      const existingEntry = acc.find((entry) => entry.date === date);

      if (existingEntry) {
        // Increment count for existing month
        existingEntry.count += 1;
      } else {
        // Create new entry for new month
        acc.push({ date, count: 1 });
      }

      return acc;
    }, [] as Array<{ date: string; count: number }>);

    return applicationsPerMonth;
  } catch (error) {
    redirect("/jobs");
  }
}

/**
 * Server Action: Get all jobs for download/export
 *
 * This function fetches ALL jobs for the authenticated user (no pagination).
 * Used by the download functionality to generate CSV/Excel reports.
 *
 * Note: Unlike getAllJobsAction, this doesn't support filtering or pagination
 * because we want to export the complete job history.
 *
 * @returns Array of all job records for the user, newest first
 */
export async function getAllJobsForDownloadAction(): Promise<JobType[]> {
  const userId = authenticateAndRedirect();

  try {
    // Fetch all jobs (no skip/take = no pagination)
    const jobs: JobType[] = await prisma.job.findMany({
      where: {
        clerkId: userId, // Only user's own jobs
      },
      orderBy: {
        createdAt: "desc", // Newest first
      },
    });
    return jobs;
  } catch (error) {
    // Return empty array on error to prevent download failure
    console.error(error);
    return [];
  }
}
