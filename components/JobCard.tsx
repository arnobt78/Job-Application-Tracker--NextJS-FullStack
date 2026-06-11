import { JobType } from '@/utils/types';
import { MapPin, Briefcase, CalendarDays, RadioTower, Pencil } from 'lucide-react';
import Link from 'next/link';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import JobInfo from './JobInfo';
import DeleteJobButton from './DeleteJobButton';
import { GlassCard } from '@/components/ui/glass-card';

function JobCard({ job }: { job: JobType }) {
  const date = new Date(job.createdAt).toLocaleDateString();

  return (
    <GlassCard variant="neutral" className="p-0 overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          {job.position}
        </h3>
        <p className="text-muted-foreground mt-1">{job.company}</p>
      </div>
      <Separator />
      <div className="p-6 grid grid-cols-2 gap-4">
        <JobInfo icon={<Briefcase className="h-4 w-4" />} text={job.mode} />
        <JobInfo icon={<MapPin className="h-4 w-4" />} text={job.location} />
        <JobInfo icon={<CalendarDays className="h-4 w-4" />} text={date} />
        <JobInfo icon={<RadioTower className="h-4 w-4" />} text={job.status} />
      </div>
      <div className="p-6 pt-0 flex gap-4">
        <Button asChild size="sm" className="gap-1">
          <Link href={`/jobs/${job.id}`}>
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </Button>
        <DeleteJobButton id={job.id} />
      </div>
    </GlassCard>
  );
}

export default JobCard;
