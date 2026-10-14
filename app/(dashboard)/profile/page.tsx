import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';
import { queryKeys } from '@/lib/query-keys';
import { getUserProfileAction } from '@/utils/actions';
import { ProfilePageView } from '@/components/user-profile/profile-page-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'My Profile',
  description: 'Set your skills, target roles, and resume text for personalised AI insights.',
  path: '/profile',
  noIndex: true,
});

/** User profile settings page — SSR-prefetches existing profile so form loads instantly. */
async function UserProfilePage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.userProfile(),
    queryFn: () => getUserProfileAction(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfilePageView />
    </HydrationBoundary>
  );
}

export default UserProfilePage;
