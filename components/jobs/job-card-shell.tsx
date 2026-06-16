"use client";

import JobCard from "@/components/JobCard";
import JobInfo from "@/components/JobInfo";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobType } from "@/utils/types";
import {
  Briefcase,
  CalendarDays,
  MapPin,
  Pencil,
  RadioTower,
  Trash2,
} from "lucide-react";

type JobCardShellProps = {
  /** When provided, renders the full interactive JobCard */
  job?: JobType;
};

/**
 * Stable job card chrome — icons and buttons always visible.
 * Loading state skeletons only on text slots (title, company, field values).
 */
export function JobCardShell({ job }: JobCardShellProps) {
  if (job) {
    return <JobCard job={job} />;
  }

  return (
    <GlassCard variant="neutral" className="overflow-hidden">
      <div className="pb-2">
        <h3 className="flex items-center gap-2 text-md font-medium">
          <Briefcase className="h-5 w-5 shrink-0 text-primary" />
          <Skeleton className="h-5 w-32" />
        </h3>
        <Skeleton className="mt-1 h-4 w-24" />
      </div>
      <Separator />

      <div className="grid grid-cols-2 gap-2 pt-2 pb-4">
        <JobInfo
          icon={<Briefcase className="h-4 w-4" />}
          text={<Skeleton className="inline-block h-4 w-16" />}
        />
        <JobInfo
          icon={<MapPin className="h-4 w-4" />}
          text={<Skeleton className="inline-block h-4 w-16" />}
        />
        <JobInfo
          icon={<CalendarDays className="h-4 w-4" />}
          text={<Skeleton className="inline-block h-4 w-16" />}
        />
        <JobInfo
          icon={<RadioTower className="h-4 w-4" />}
          text={<Skeleton className="inline-block h-4 w-16" />}
        />
      </div>
      <div className="flex gap-4">
        <Button variant="outline" size="sm" className="gap-2" disabled>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-destructive"
          disabled
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </GlassCard>
  );
}
