"use client";

import { formatJobDate } from "@/lib/format-date";
import { JobType } from "@/utils/types";
import {
  MapPin,
  Briefcase,
  CalendarDays,
  RadioTower,
  ExternalLink,
} from "lucide-react";
import { Separator } from "./ui/separator";
import JobInfo from "./JobInfo";
import DeleteJobButton from "./DeleteJobButton";
import { GlassCard } from "@/components/ui/glass-card";
import { EditJobDialog } from "@/components/dialogs/edit-job-dialog";
import { JobEnrichmentBadge } from "@/components/jobs/job-enrichment-badge";
import { AIFitChip } from "@/components/jobs/ai-fit-chip";
import { CompanyLogo } from "@/components/ui/company-logo";
import { extractDomain } from "@/lib/ui/company-logo";

/** Job card — UTC-stable date formatting avoids hydration mismatch (React #418) */
function JobCard({ job }: { job: JobType }) {
  const date = formatJobDate(job.createdAt);

  return (
    <GlassCard variant="neutral" className="overflow-hidden">
      {/* Header row — position + company + live Bluedoor status badge */}
      <div className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex items-center gap-2 text-md font-medium">
            <Briefcase className="h-5 w-5 shrink-0 text-primary" />
            {job.position}
          </h3>
          {/* Bluedoor live posting badge — null-safe, renders nothing when not enriched */}
          <JobEnrichmentBadge job={job} className="mt-0.5 shrink-0" />
          {/* AI fit score — shown only when AI pipeline has run for this job */}
          <AIFitChip fitScore={job.aiInsight?.fitScore} className="mt-0.5 shrink-0" />
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
          <CompanyLogo domain={extractDomain(job.applyUrl)} size={14} className="opacity-80" />
          <span className="text-sm text-muted-foreground">{job.company}</span>
          {/* Company size from Bluedoor /v1/orgs — shown when enriched */}
          {job.companySize && (
            <span className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/70">
              {job.companySize}
            </span>
          )}
        </div>
      </div>

      <Separator />

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-2 pt-2 pb-4">
        <JobInfo icon={<Briefcase className="h-4 w-4" />} text={job.mode} />
        <JobInfo icon={<MapPin className="h-4 w-4" />} text={job.location} />
        <JobInfo icon={<CalendarDays className="h-4 w-4" />} text={date} />
        <JobInfo icon={<RadioTower className="h-4 w-4" />} text={job.status} />
      </div>

      {/* Apply URL link — shown when user saved one */}
      {job.applyUrl ? (
        <div className="mb-3">
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10 hover:border-primary/40"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {job.bluedoorJobId ? "View Posting" : "Apply Link"}
          </a>
        </div>
      ) : null}

      {/* Actions */}
      <div className="flex gap-4">
        <EditJobDialog job={job} showTrigger />
        <DeleteJobButton job={job} />
      </div>
    </GlassCard>
  );
}

export default JobCard;
