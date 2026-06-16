'use client';

import { createContext, useContext } from 'react';
import type { NavUserSnapshot } from '@/lib/auth/nav-user';

/**
 * SSR-seeded Clerk user for navbar — set in dashboard layout from currentUser()
 * so server HTML matches first client paint (no avatar skeleton flash on refresh).
 */
const NavUserContext = createContext<NavUserSnapshot | null>(null);

export function NavUserProvider({
  user,
  children,
}: {
  user: NavUserSnapshot | null;
  children: React.ReactNode;
}) {
  return (
    <NavUserContext.Provider value={user}>{children}</NavUserContext.Provider>
  );
}

/** SSR snapshot only — use useNavUserSession() for merged live + SSR user */
export function useInitialNavUser(): NavUserSnapshot | null {
  return useContext(NavUserContext);
}
