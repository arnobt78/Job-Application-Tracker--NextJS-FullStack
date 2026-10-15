import { test, expect } from './fixtures';

/**
 * Every authenticated route renders its real content (not just the shell)
 * with no console errors and no failed same-origin requests (fixture assertions).
 */
const ROUTES = [
  { path: '/dashboard', heading: 'Application Pipeline', content: /Matching Applications/ },
  { path: '/discover', heading: 'Discover Jobs', content: /Showing \d+ of \d+ jobs/ },
  { path: '/stats', heading: 'Statistics', content: /Monthly Trend/ },
  { path: '/timeline', heading: /timeline|activity/i, content: /Linked to posting|Application added|Posting/i },
  { path: '/profile', heading: 'My Profile', content: /Target Roles|Skills/ },
  { path: '/team', heading: 'Team', content: /team/i },
];

for (const route of ROUTES) {
  test(`${route.path} renders without errors`, async ({ page }) => {
    const res = await page.goto(route.path);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: route.heading }).first()).toBeVisible();
    await expect(page.getByText(route.content).first()).toBeVisible({ timeout: 15_000 });
  });
}

test('client navigation between dashboard routes stays error-free', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Application Pipeline' })).toBeVisible();

  for (const [label, heading] of [
    ['Discover', 'Discover Jobs'],
    ['Stats', 'Statistics'],
    ['Dashboard', 'Application Pipeline'],
  ] as const) {
    await page.getByRole('navigation').getByRole('link', { name: label }).first().click();
    await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
  }
});
