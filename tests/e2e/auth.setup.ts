import { test as setup, expect } from '@playwright/test';
import { TEST_ACCOUNTS } from '../../lib/auth/test-credentials';
import { AUTH_FILE } from './fixtures';

/** Signs in the seeded demo account once and saves the session for every authed spec. */
setup('authenticate demo user', async ({ page }) => {
  const account = TEST_ACCOUNTS['guest-user'];
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill(account.email);
  await page.getByLabel('Password').fill(account.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
  await expect(page.getByRole('heading').first()).toBeVisible();
  await page.context().storageState({ path: AUTH_FILE });
});
