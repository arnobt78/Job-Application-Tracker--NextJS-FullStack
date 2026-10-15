import { test as publicTest, expect as publicExpect } from '@playwright/test';
import { test, expect } from './fixtures';

publicTest.describe('profile (unauthenticated)', () => {
  publicTest('redirects to /sign-in without session', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });
    await publicExpect(page).toHaveURL(/\/sign-in/, { timeout: 8_000 });
  });
});

test.describe('profile (authenticated)', () => {
  test('shows the seeded skills, resume and save action', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: 'My Profile' })).toBeVisible();
    await expect(page.getByText('TypeScript', { exact: true }).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('textarea').first()).toHaveValue(/Frontend-focused full stack engineer/);
    await expect(page.getByRole('button', { name: /save/i }).first()).toBeVisible();
  });
});
