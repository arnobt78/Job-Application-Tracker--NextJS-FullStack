import { test as publicTest, expect as publicExpect, type Page } from '@playwright/test';
import { test, expect } from './fixtures';

/**
 * Dashboard CRUD on the shared demo DB — every test creates and deletes only its own
 * `E2E-<timestamp>` row, so seeded data is never touched.
 */
publicTest.describe('dashboard (unauthenticated)', () => {
  publicTest('redirects to /sign-in without session', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await publicExpect(page).toHaveURL(/\/sign-in/, { timeout: 8_000 });
  });
});

/** Innermost element holding both the job heading and its Delete button = the job card. */
function jobCard(page: Page, position: string) {
  return page
    .locator('div', { has: page.getByRole('heading', { name: position, exact: true }) })
    .filter({ has: page.getByRole('button', { name: 'Delete' }) })
    .last();
}

async function deleteJob(page: Page, position: string) {
  await page.goto('/dashboard');
  await expect(page.getByText(/Matching Applications/)).toBeVisible();
  const card = jobCard(page, position);
  if ((await card.count()) === 0) return;
  await card.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('heading', { name: position, exact: true })).toHaveCount(0, { timeout: 5_000 });
  await expect(page.getByText(`${position} at E2E Test Co was deleted from your list`)).toBeVisible({ timeout: 15_000 });
}

test.describe('dashboard CRUD (own rows only)', () => {
  test('create → instant card → edit status → detail page → delete', async ({ page }) => {
    test.setTimeout(90_000);
    const position = `E2E-${Date.now()}`;
    await page.goto('/dashboard');
    await expect(page.getByText(/Matching Applications/)).toBeVisible();

    try {
      // Create
      await page.getByRole('button', { name: 'New Application' }).click();
      const dialog = page.getByRole('dialog');
      await dialog.getByLabel('Position').fill(position);
      await dialog.getByLabel('Company').fill('E2E Test Co');
      await dialog.getByLabel('Location').fill('Remote');

      // Server Action responses stream, so buffer them through route() to read the new job id
      let jobId: string | undefined;
      await page.route('**/dashboard', async (route) => {
        if (route.request().method() !== 'POST') return route.fallback();
        const response = await route.fetch();
        const body = await response.text();
        if (body.includes(position)) jobId ??= body.match(/"id":"([0-9a-f-]{36})"/)?.[1];
        await route.fulfill({ response, body });
      });
      const clickedAt = Date.now();
      await dialog.getByRole('button', { name: 'Add Application' }).click();

      // Optimistic UI: the card renders behind the still-open (aria-modal) dialog before
      // the server round-trip completes, so match it by CSS rather than accessible role
      await expect(page.locator('h3', { hasText: position })).toBeVisible({ timeout: 2_000 });
      expect(Date.now() - clickedAt).toBeLessThan(2_000);

      // Dialog closes once the server confirms; remote demo DB latency varies
      await expect(dialog).toBeHidden({ timeout: 20_000 });
      await page.unroute('**/dashboard');
      expect(jobId, 'created job id in action response').toBeTruthy();

      // Persisted: survives a full reload
      await page.reload();
      await expect(page.getByRole('heading', { name: position, exact: true })).toBeVisible();

      // Edit status through the card's confirm → dialog flow
      const card = jobCard(page, position);
      await card.getByRole('button', { name: 'Edit' }).click();
      await page.getByRole('alertdialog').getByRole('button', { name: 'Edit' }).click();
      const editDialog = page.getByRole('dialog');
      await editDialog.getByRole('button', { name: /Job Status/i }).click();
      await page.getByRole('menuitemradio', { name: /interview/i }).click();
      const savedAt = Date.now();
      await editDialog.getByRole('button', { name: 'Save Application' }).click();
      // Optimistic status renders behind the saving dialog (CSS match, like create above)
      await expect(
        page.locator('div', { has: page.locator('h3', { hasText: position }) }).getByText('interview').last()
      ).toBeVisible({ timeout: 2_000 });
      expect(Date.now() - savedAt).toBeLessThan(2_000);
      await expect(editDialog).toBeHidden({ timeout: 20_000 });
      await expect(jobCard(page, position).getByText('interview')).toBeVisible();

      // Detail route (email deep link) opens the edit dialog for this job
      await page.goto(`/dashboard/${jobId}`);
      await expect(page.getByRole('dialog').getByLabel('Position')).toHaveValue(position);
    } finally {
      await deleteJob(page, position);
    }

    await page.reload();
    await expect(page.getByRole('heading', { name: position, exact: true })).toHaveCount(0);
  });
});
