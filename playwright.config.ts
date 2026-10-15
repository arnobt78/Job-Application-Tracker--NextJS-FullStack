import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config for Jobify.
 *
 * Tests live in tests/e2e/. Run against a running local dev server
 * (`npm run dev` in a separate terminal before `npm run test:e2e`).
 *
 * Auth: the `setup` project signs in the seeded demo account (npm run db:seed)
 * and saves its session; specs importing `test` from ./tests/e2e/fixtures run
 * authenticated with console + network error assertions.
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
    // Signs in the seeded demo account once; authed specs reuse tests/e2e/.auth/user.json
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
  // No webServer block — start `npm run dev` separately to avoid cold-start timeouts
});
