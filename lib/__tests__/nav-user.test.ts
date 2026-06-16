import { describe, expect, it } from 'vitest';
import {
  displayNameFromNavUser,
  navUserSnapshotFromClerk,
} from '@/lib/auth/nav-user';

describe('navUserSnapshotFromClerk', () => {
  it('returns null for missing user', () => {
    expect(navUserSnapshotFromClerk(null)).toBeNull();
    expect(navUserSnapshotFromClerk(undefined)).toBeNull();
  });

  it('maps Clerk user fields', () => {
    const snapshot = navUserSnapshotFromClerk({
      id: 'user_1',
      imageUrl: 'https://img.clerk.com/photo.png',
      hasImage: true,
      firstName: 'Jane',
      lastName: 'Doe',
      username: 'jane',
      primaryEmailAddress: { emailAddress: 'jane@example.com' },
    });

    expect(snapshot).toEqual({
      id: 'user_1',
      imageUrl: 'https://img.clerk.com/photo.png',
      hasImage: true,
      firstName: 'Jane',
      lastName: 'Doe',
      username: 'jane',
      primaryEmail: 'jane@example.com',
    });
  });

  it('defaults hasImage false and empty imageUrl when absent', () => {
    const snapshot = navUserSnapshotFromClerk({
      id: 'user_2',
      imageUrl: '',
      firstName: null,
      lastName: null,
      username: null,
      emailAddresses: [{ emailAddress: 'a@b.com' }],
    });

    expect(snapshot?.hasImage).toBe(false);
    expect(snapshot?.imageUrl).toBe('');
    expect(snapshot?.primaryEmail).toBe('a@b.com');
  });
});

describe('displayNameFromNavUser', () => {
  it('prefers full name then username then email', () => {
    expect(
      displayNameFromNavUser({
        firstName: 'A',
        lastName: 'B',
        username: 'ab',
        primaryEmail: 'x@y.com',
      })
    ).toBe('A B');

    expect(
      displayNameFromNavUser({
        firstName: null,
        lastName: null,
        username: 'ab',
        primaryEmail: 'x@y.com',
      })
    ).toBe('ab');

    expect(
      displayNameFromNavUser({
        firstName: null,
        lastName: null,
        username: null,
        primaryEmail: 'x@y.com',
      })
    ).toBe('x@y.com');
  });
});
