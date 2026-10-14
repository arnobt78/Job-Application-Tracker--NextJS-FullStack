import { TeamDashboard } from '@/components/team/team-dashboard';
import { PageSectionHeader } from '@/components/ui/page-section-header';
import { Users2 } from 'lucide-react';

/** /team layout — rendered by page.tsx (hydrated) and loading.tsx (instant shell, cache-only queries) */
export function TeamPageView({ userId }: { userId?: string }) {
  return (
    <>
      <div className="mb-6">
        <PageSectionHeader
          icon={Users2}
          title="Team"
          subtitle="Collaborate on job tracking with colleagues — share applications, invite members, and support each other"
          headingLevel="h1"
        />
      </div>

      <TeamDashboard userId={userId} />
    </>
  );
}
