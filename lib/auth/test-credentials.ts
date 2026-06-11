/** Test account credentials for sign-in dropdown (demo / guest flow) */

export type TestAccountRole = 'guest-user';

export interface TestAccount {
  name: string;
  email: string;
  password: string;
}

export const TEST_ACCOUNTS: Record<TestAccountRole, TestAccount> = {
  'guest-user': {
    name: 'Test User',
    email: 'test@user.com',
    password: '12345678',
  },
};

export const TEST_ACCOUNT_ROLES = Object.keys(TEST_ACCOUNTS) as TestAccountRole[];
