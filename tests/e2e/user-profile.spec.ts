import { test, expect } from '@playwright/test';

/**
 * User profile page smoke tests.
 *
 * Unauthenticated: must redirect to /sign-in.
 * Authenticated:   verify form fields (skills tag input, resume textarea) are present.
 */
test.describe('user-profile (unauthenticated)', () => {
  test('redirects to /sign-in without session', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 8_000 });
  });
});

test.describe('user-profile page structure', () => {
  test.skip(
    !process.env.E2E_SKIP_AUTH,
    'Requires authenticated NextAuth session'
  );

  test('page loads without 500', async ({ page }) => {
    const res = await page.goto('/profile', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).not.toBe(500);
  });

  test('skills input and resume textarea are present', async ({ page }) => {
    await page.goto('/profile');
    // Skills tag input renders an <input> element for the tag entry
    const skillsInput = page.getByPlaceholder(/skill/i).first();
    await expect(skillsInput).toBeVisible({ timeout: 10_000 });

    // Resume textarea
    const resumeArea = page.locator('textarea').first();
    await expect(resumeArea).toBeVisible();
  });

  test('save button is present', async ({ page }) => {
    await page.goto('/profile');
    const saveBtn = page.getByRole('button', { name: /save/i });
    await expect(saveBtn).toBeVisible({ timeout: 10_000 });
  });
});
