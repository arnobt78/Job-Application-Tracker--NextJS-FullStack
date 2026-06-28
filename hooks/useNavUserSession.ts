'use client';

import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import { useInitialNavUser } from '@/context/nav-user-context';
import {
  displayNameFromNavUser,
  navUserSnapshotFromSession,
  type NavUserSnapshot,
} from '@/lib/auth/nav-user';

type NavUserSession = {
  /** Merged SSR snapshot + live NextAuth session */
  effectiveUser: NavUserSnapshot | null;
  displayName: string;
  email: string;
  /** True only when session not loaded and no SSR seed — show pulse, not skeleton mount */
  avatarLoading: boolean;
};

/**
 * Navbar session — SSR snapshot from dashboard layout + live NextAuth useSession().
 * Live session wins after status !== 'loading' so profile changes still propagate.
 */
export function useNavUserSession(): NavUserSession {
  const initialNavUser = useInitialNavUser();
  const { data: session, status } = useSession();

  const liveSnapshot = useMemo(
    () => (session ? navUserSnapshotFromSession(session) : null),
    [session]
  );

  const isLoaded = status !== 'loading';
  const effectiveUser = isLoaded ? liveSnapshot : initialNavUser ?? liveSnapshot;
  const avatarLoading = !isLoaded && !initialNavUser?.id;

  const displayName = effectiveUser
    ? displayNameFromNavUser(effectiveUser)
    : 'User';
  const email = effectiveUser?.primaryEmail ?? '';

  return { effectiveUser, displayName, email, avatarLoading };
}
