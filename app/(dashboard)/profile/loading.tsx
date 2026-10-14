import { RouteFallbackProvider } from '@/components/providers/route-fallback-provider';
import { ProfilePageView } from '@/components/user-profile/profile-page-view';

/** Instant navigation shell — same view as page.tsx; queries read cache only until the server payload streams in */
export default function ProfileLoading() {
  return (
    <RouteFallbackProvider>
      <ProfilePageView />
    </RouteFallbackProvider>
  );
}
