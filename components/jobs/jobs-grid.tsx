"use client";

import { JobCardShell } from "@/components/jobs/job-card-shell";
import { useJobsListQuery } from "@/hooks/useJobsListQuery";
import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

/** Job cards grid — shell cards on cold load; keepPreviousData avoids flash on filter change */
export function JobsGrid() {
  const { data, isPending, isFetching } = useJobsListQuery();
  const isInitialLoad = isPending && data === undefined;
  const jobs = data?.jobs ?? [];

  if (!isInitialLoad && jobs.length < 1) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <Briefcase className="h-10 w-10" />
        <h2 className="text-lg font-semibold">No jobs found</h2>
      </div>
    );
  }

  if (isInitialLoad) {
    return (
      <div className="grid w-full gap-8 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <JobCardShell key={i} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-8 md:grid-cols-2",
        isFetching && "opacity-80 transition-opacity"
      )}
    >
      {jobs.map((job) => (
        <JobCardShell key={job.id} job={job} />
      ))}
    </div>
  );
}
