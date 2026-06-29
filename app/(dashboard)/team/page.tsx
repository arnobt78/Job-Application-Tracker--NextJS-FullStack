import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { createPageMetadata } from '@/lib/site-metadata';
import { queryKeys } from '@/lib/query-keys';
import { getTeamAction } from '@/utils/actions';
import { TeamDashboard } from '@/components/team/team-dashboard';
import { PageSectionHeader } from '@/components/ui/page-section-header';
import { Users2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'Team',
  description: 'Collaborate on job tracking with your team — share applications, track referrals, and support each other.',
  path: '/team',
  noIndex: true,
});

async function TeamPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.team.current(),
    queryFn: () => getTeamAction(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="mb-6">
        <PageSectionHeader
          icon={Users2}
          title="Team"
          subtitle="Collaborate on job tracking with colleagues — share applications, invite members, and support each other"
          headingLevel="h1"
        />
      </div>

      <TeamDashboard userId={session.user.id} />
    </HydrationBoundary>
  );
}

export default TeamPage;
