import { test, expect } from '@playwright/test';

/**
 * Auth smoke tests — verify NextAuth route protection.
 *
 * These tests run without any NextAuth session cookie.
 * Each protected route must redirect to /sign-in (configured in auth.ts pages).
 * No dev server credentials required — redirect is server-side middleware.
 */

const PROTECTED_ROUTES = [
  '/dashboard',
  '/stats',
  '/discover',
  '/timeline',
  '/profile',
  '/team',
];

for (const route of PROTECTED_ROUTES) {
  test(`unauthenticated ${route} redirects to /sign-in`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    // NextAuth redirects synchronously via middleware — URL must contain /sign-in
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 8_000 });
  });
}

test('root / loads without 500', async ({ page }) => {
  const res = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(res?.status()).not.toBe(500);
});

test('wrong password stays on /sign-in', async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill('test@user.com');
  await page.getByLabel('Password').fill('definitely-wrong-password');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('alert').or(page.getByText(/invalid|incorrect/i)).first()).toBeVisible({ timeout: 10_000 });
  await expect(page).toHaveURL(/\/sign-in/);
});
