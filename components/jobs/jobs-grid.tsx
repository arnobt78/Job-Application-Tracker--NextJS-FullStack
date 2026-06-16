"use client";

import { JobCardShell } from "@/components/jobs/job-card-shell";
import { useJobsListBodyLoading } from "@/hooks/useJobsListBodyLoading";
import { Briefcase } from "lucide-react";

/** Job cards grid — shell cards only on true cold load; SSR-hydrated cache skips skeleton on refresh */
export function JobsGrid() {
  const { data, bodyLoading } = useJobsListBodyLoading();
  const jobs = data?.jobs ?? [];

  if (!bodyLoading && jobs.length < 1) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <Briefcase className="h-10 w-10" />
        <h2 className="text-lg font-semibold">No jobs found</h2>
      </div>
    );
  }

  if (bodyLoading) {
    return (
      <div className="grid w-full gap-8 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <JobCardShell key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid w-full gap-8 md:grid-cols-2">
      {jobs.map((job) => (
        <JobCardShell key={job.id} job={job} />
      ))}
    </div>
  );
}
