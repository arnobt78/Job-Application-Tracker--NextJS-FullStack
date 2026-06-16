'use client';

import { useUser } from '@clerk/nextjs';
import { useMemo } from 'react';
import { useInitialNavUser } from '@/context/nav-user-context';
import {
  displayNameFromNavUser,
  navUserSnapshotFromClerk,
  type NavUserSnapshot,
} from '@/lib/auth/nav-user';

type NavUserSession = {
  /** Merged SSR snapshot + live Clerk user */
  effectiveUser: NavUserSnapshot | null;
  displayName: string;
  email: string;
  /** True only when Clerk not loaded and no SSR seed — show pulse, not skeleton mount */
  avatarLoading: boolean;
};

/**
 * Navbar session — SSR snapshot from dashboard layout + live Clerk useUser().
 * Live user wins after isLoaded so /user-profile avatar changes still propagate.
 */
export function useNavUserSession(): NavUserSession {
  const initialNavUser = useInitialNavUser();
  const { user: clerkUser, isLoaded } = useUser();

  const liveSnapshot = useMemo(
    () => (clerkUser ? navUserSnapshotFromClerk(clerkUser) : null),
    [clerkUser]
  );

  const effectiveUser = isLoaded ? liveSnapshot : initialNavUser ?? liveSnapshot;
  const avatarLoading = !isLoaded && !initialNavUser?.id;

  const displayName = effectiveUser
    ? displayNameFromNavUser(effectiveUser)
    : 'User';
  const email = effectiveUser?.primaryEmail ?? '';

  return { effectiveUser, displayName, email, avatarLoading };
}
