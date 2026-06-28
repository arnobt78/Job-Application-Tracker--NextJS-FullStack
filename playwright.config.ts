import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config for Jobify.
 *
 * Tests live in tests/e2e/. Run against a running local dev server
 * (`npm run dev` in a separate terminal before `npm run test:e2e`).
 *
 * Auth: Tests that require a logged-in user depend on NextAuth. Most tests
 * rely on route-level redirect checks (unauthenticated) or page-structure
 * smoke tests with a pre-seeded session via E2E_COOKIE (advanced setup).
 *
 * Screenshots and traces are retained on failure for CI artefact upload.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // No webServer block — start `npm run dev` separately to avoid cold-start timeouts
});
