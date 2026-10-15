import { test as publicTest, expect as publicExpect } from '@playwright/test';
import { test, expect } from './fixtures';

publicTest.describe('stats (unauthenticated)', () => {
  publicTest('redirects to /sign-in without session', async ({ page }) => {
    await page.goto('/stats', { waitUntil: 'domcontentloaded' });
    await publicExpect(page).toHaveURL(/\/sign-in/, { timeout: 8_000 });
  });
});

test.describe('stats (authenticated)', () => {
  test('status cards, charts and salary intelligence render', async ({ page }) => {
    await page.goto('/stats');
    await expect(page.getByRole('heading', { name: 'Statistics' })).toBeVisible();
    for (const section of ['Monthly Trend', 'Weekly Velocity', 'Application Breakdown']) {
      await expect(page.getByRole('heading', { name: section })).toBeVisible();
    }
    // Seeded linked postings carry salaries, so salary intelligence has data
    await expect(page.getByText('ceiling across linked jobs')).toBeVisible({ timeout: 15_000 });
  });
});
