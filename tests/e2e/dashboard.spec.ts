import { test, expect } from '@playwright/test';

/**
 * Dashboard smoke tests.
 *
 * NOTE: These tests require an authenticated NextAuth session.
 * Without a session cookie, the page redirects to /sign-in — tests will
 * be skipped with a meaningful message so CI doesn't fail on bare runners.
 *
 * To set up auth for E2E:
 *   1. Set AUTH_SECRET + seed a test user, then use Playwright's storageState
 *   2. Or set E2E_SKIP_AUTH=1 against a dev server with a pre-seeded session
 *
 * For now these tests validate the unauthenticated redirect to avoid false positives.
 */
test.describe('dashboard (unauthenticated)', () => {
  test('redirects to /sign-in without session', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 8_000 });
  });
});

test.describe('dashboard page structure', () => {
  test.skip(
    !process.env.E2E_SKIP_AUTH,
    'Requires authenticated NextAuth session — set E2E_SKIP_AUTH=1 to run against a dev server with a pre-seeded session'
  );

  test('renders job grid container', async ({ page }) => {
    await page.goto('/dashboard');
    // Container exists regardless of whether jobs are present
    const grid = page.locator('[data-testid="jobs-grid"], .grid');
    await expect(grid.first()).toBeVisible({ timeout: 10_000 });
  });

  test('no unhandled client errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    // Filter out expected third-party noise (Sentry, PostHog beacon)
    const appErrors = errors.filter(
      (e) => !e.includes('clerk') && !e.includes('sentry') && !e.includes('posthog')
    );
    expect(appErrors).toHaveLength(0);
  });
});
