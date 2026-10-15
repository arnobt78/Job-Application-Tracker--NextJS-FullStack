import { test as publicTest, expect as publicExpect } from '@playwright/test';
import { test, expect } from './fixtures';

/**
 * Discover — catalog postings seeded by prisma/seed.ts
 * (40 open: 30 United States + 10 Canada; first page holds 20).
 */
publicTest.describe('discover (unauthenticated)', () => {
  publicTest('redirects to /sign-in without session', async ({ page }) => {
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    await publicExpect(page).toHaveURL(/\/sign-in/, { timeout: 8_000 });
  });

  publicTest('postings API rejects anonymous requests', async ({ request }) => {
    const res = await request.get('/api/postings');
    publicExpect(res.status()).toBe(401);
  });
});

test.describe('discover (authenticated)', () => {
  test('lists open US postings with the real total', async ({ page }) => {
    await page.goto('/discover');
    await expect(page.getByRole('heading', { name: 'Open Postings' })).toBeVisible();
    await expect(page.getByText('Showing 20 of 30 jobs')).toBeVisible({ timeout: 15_000 });
  });

  test('country filter switches to Canadian postings', async ({ page }) => {
    await page.goto('/discover?country=Canada');
    await expect(page.getByText('Showing 10 of 10 jobs')).toBeVisible({ timeout: 15_000 });
  });

  test('text search matches company names', async ({ page }) => {
    await page.goto('/discover?q=Northwind');
    await expect(page.getByText(/Showing \d+ of \d+ jobs/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Northwind Labs').first()).toBeVisible();
  });

  test('postings API paginates with a keyset cursor', async ({ page }) => {
    const first = await page.request.get('/api/postings?limit=5');
    expect(first.status()).toBe(200);
    const body = await first.json();
    expect(body.data).toHaveLength(5);
    // The API has no default country (the UI defaults to United States)
    expect(body.meta.total).toBe(40);
    expect(body.meta.nextCursor).toBeTruthy();

    const next = await page.request.get(`/api/postings?limit=5&cursor=${body.meta.nextCursor}`);
    const nextBody = await next.json();
    expect(nextBody.data[0].id).toBe(body.meta.nextCursor);

    const bad = await page.request.get('/api/postings?employmentType=gig');
    expect(bad.status()).toBe(400);
  });

  test('posting detail and events endpoints', async ({ page }) => {
    const detail = await page.request.get('/api/postings/pst_001');
    expect(detail.status()).toBe(200);
    expect((await detail.json()).description).toContain('What you will do');

    const events = await page.request.get('/api/postings/pst_001/events');
    const types = (await events.json()).data.map((e: { type: string }) => e.type);
    expect(types).toContain('created');
  });
});
