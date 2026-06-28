import { describe, expect, it } from 'vitest';
import {
  displayNameFromNavUser,
  navUserSnapshotFromSession,
} from '@/lib/auth/nav-user';
import type { Session } from 'next-auth';

function mockSession(overrides: Partial<Session['user']> = {}): Session {
  return {
    user: {
      id: 'user_1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      image: 'https://example.com/photo.png',
      ...overrides,
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };
}

describe('navUserSnapshotFromSession', () => {
  it('returns null for null session', () => {
    expect(navUserSnapshotFromSession(null)).toBeNull();
  });

  it('returns null when session has no user id', () => {
    const session = mockSession({ id: '' });
    expect(navUserSnapshotFromSession(session)).toBeNull();
  });

  it('maps NextAuth session fields to NavUserSnapshot', () => {
    const snapshot = navUserSnapshotFromSession(mockSession());

    expect(snapshot).toEqual({
      id: 'user_1',
      imageUrl: 'https://example.com/photo.png',
      hasImage: true,
      firstName: 'Jane',
      lastName: 'Doe',
      username: null,
      primaryEmail: 'jane@example.com',
    });
  });

  it('handles missing image', () => {
    const snapshot = navUserSnapshotFromSession(mockSession({ image: null }));
    expect(snapshot?.hasImage).toBe(false);
    expect(snapshot?.imageUrl).toBe('');
  });

  it('handles single-word name', () => {
    const snapshot = navUserSnapshotFromSession(mockSession({ name: 'Jane' }));
    expect(snapshot?.firstName).toBe('Jane');
    expect(snapshot?.lastName).toBeNull();
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
