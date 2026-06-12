/** Test account credentials for sign-in dropdown (demo / guest flow) */

export type TestAccountRole = 'guest-user';

export interface TestAccount {
  name: string;
  email: string;
  password: string;
  /** Optional Clerk img.clerk.com URL — robohash used when omitted */
  imageUrl?: string;
}

export const TEST_ACCOUNTS: Record<TestAccountRole, TestAccount> = {
  'guest-user': {
    name: 'Test User',
    email: 'test@user.com',
    password: '12345678',
    imageUrl:
      'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvdXBsb2FkZWQvaW1nXzNGMm53QjBwOWpQdDBxSVQzVW9vOFJPMFF5RyJ9',
  },
};

export const TEST_ACCOUNT_ROLES = Object.keys(TEST_ACCOUNTS) as TestAccountRole[];
