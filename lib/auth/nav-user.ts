/**
 * SSR-safe navbar user snapshot — maps Clerk User to a stable shape for first paint.
 * Used in dashboard layout (currentUser) and merged with useUser() on the client.
 */

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

/** Clerk User / currentUser() shape — only fields we read */
type ClerkUserLike = {
  id: string;
  imageUrl: string;
  hasImage?: boolean;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
  emailAddresses?: Array<{ emailAddress: string }>;
} | null | undefined;

/** Map Clerk user to navbar snapshot — returns null when unauthenticated */
export function navUserSnapshotFromClerk(
  user: ClerkUserLike
): NavUserSnapshot | null {
  if (!user?.id) return null;

  const primaryEmail =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses?.[0]?.emailAddress ??
    '';

  return {
    id: user.id,
    imageUrl: user.imageUrl ?? '',
    hasImage: user.hasImage ?? false,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    username: user.username ?? null,
    primaryEmail,
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
