/**
 * SSR-safe navbar user snapshot — maps NextAuth Session to a stable shape for first paint.
 * Used in dashboard layout (auth()) and merged with useSession() on the client.
 */
import type { Session } from 'next-auth';

/** Minimal user fields needed for navbar avatar + dropdown label */
export type NavUserSnapshot = {
  id: string;
  imageUrl: string;
  hasImage: boolean;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  primaryEmail: string;
};

/**
 * Map NextAuth session to navbar snapshot — returns null when unauthenticated.
 * firstName/lastName are parsed from session.user.name (NextAuth does not split names).
 */
export function navUserSnapshotFromSession(
  session: Session | null
): NavUserSnapshot | null {
  if (!session?.user?.id) return null;

  const name = session.user.name ?? '';
  const parts = name.trim().split(' ');
  const firstName = parts[0] || null;
  const lastName = parts.slice(1).join(' ') || null;

  return {
    id: session.user.id,
    imageUrl: session.user.image ?? '',
    hasImage: !!session.user.image,
    firstName,
    lastName,
    // NextAuth has no username concept — set null for compatibility
    username: null,
    primaryEmail: session.user.email ?? '',
  };
}

/** Display name for avatar alt text and dropdown label */
export function displayNameFromNavUser(
  user: Pick<
    NavUserSnapshot,
    'firstName' | 'lastName' | 'username' | 'primaryEmail'
  >
): string {
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return full || user.username || user.primaryEmail || 'User';
}
