'use client';

import { formatJobDate } from '@/lib/format-date';
import { JobType } from '@/utils/types';
import { MapPin, Briefcase, CalendarDays, RadioTower } from 'lucide-react';
import { Separator } from './ui/separator';
import JobInfo from './JobInfo';
import DeleteJobButton from './DeleteJobButton';
import { GlassCard } from '@/components/ui/glass-card';
import { EditJobDialog } from '@/components/dialogs/edit-job-dialog';

/** Job card — UTC-stable date formatting avoids hydration mismatch (React #418) */
function JobCard({ job }: { job: JobType }) {
  const date = formatJobDate(job.createdAt);

  return (
    <GlassCard variant="neutral" className="overflow-hidden p-0">
      <div className="p-6">
        <h3 className="flex items-center gap-2 text-xl font-semibold">
          <Briefcase className="h-5 w-5 text-primary" />
          {job.position}
        </h3>
        <p className="mt-1 text-muted-foreground">{job.company}</p>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-4 p-6">
        <JobInfo icon={<Briefcase className="h-4 w-4" />} text={job.mode} />
        <JobInfo icon={<MapPin className="h-4 w-4" />} text={job.location} />
        <JobInfo icon={<CalendarDays className="h-4 w-4" />} text={date} />
        <JobInfo icon={<RadioTower className="h-4 w-4" />} text={job.status} />
      </div>
      <div className="flex gap-4 p-6 pt-0">
        <EditJobDialog jobId={job.id} showTrigger />
        <DeleteJobButton id={job.id} />
      </div>
    </GlassCard>
  );
}

export default JobCard;
