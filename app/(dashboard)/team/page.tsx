import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { createPageMetadata } from '@/lib/site-metadata';
import { queryKeys } from '@/lib/query-keys';
import { getTeamAction } from '@/utils/actions';
import { TeamPageView } from '@/components/team/team-page-view';

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
      <TeamPageView userId={session.user.id} />
    </HydrationBoundary>
  );
}

export default TeamPage;
