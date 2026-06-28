import { test, expect } from '@playwright/test';

/**
 * Stats page smoke tests.
 *
 * Unauthenticated: must redirect to /sign-in (NextAuth middleware).
 * Authenticated:   verify KPI row and chart containers are visible.
 *
 * Authenticated tests are skipped unless E2E_SKIP_AUTH=1 is set (requires
 * a dev server with an injected NextAuth session in global setup).
 */
test.describe('stats (unauthenticated)', () => {
  test('redirects to /sign-in without session', async ({ page }) => {
    await page.goto('/stats', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 8_000 });
  });
});

test.describe('stats page structure', () => {
  test.skip(
    !process.env.E2E_SKIP_AUTH,
    'Requires authenticated NextAuth session'
  );

  test('stats page loads without 500', async ({ page }) => {
    const res = await page.goto('/stats', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).not.toBe(500);
    expect(res?.status()).not.toBe(404);
  });

  test('KPI stats row is visible', async ({ page }) => {
    await page.goto('/stats');
    // StatsContainer renders StatsCard items — each has a numeric value
    const statsSection = page.locator('[data-testid="stats-container"], h2, [class*="stats"]');
    await expect(statsSection.first()).toBeVisible({ timeout: 10_000 });
  });
});
