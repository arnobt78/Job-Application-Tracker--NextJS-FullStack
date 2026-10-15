import path from 'node:path';
import { test as base, expect } from '@playwright/test';

export const AUTH_FILE = path.join(__dirname, '.auth', 'user.json');

/** Third-party noise that is not an app failure (browser extensions, blocked analytics beacons). */
const IGNORED_CONSOLE = [/chrome-extension:\/\//, /Download the React DevTools/];

type Diagnostics = { consoleErrors: string[]; serverErrors: string[] };

/**
 * Authenticated test with health assertions: any console error or 5xx / unexpected 4xx
 * response from our own origin fails the test after it finishes.
 */
export const test = base.extend<{ diagnostics: Diagnostics }>({
  storageState: AUTH_FILE,
  diagnostics: [
    async ({ page, baseURL }, use) => {
      const diagnostics: Diagnostics = { consoleErrors: [], serverErrors: [] };
      page.on('console', (msg) => {
        if (msg.type() !== 'error') return;
        const text = msg.text();
        if (!IGNORED_CONSOLE.some((re) => re.test(text))) diagnostics.consoleErrors.push(text);
      });
      page.on('pageerror', (err) => diagnostics.consoleErrors.push(`pageerror: ${err.message}`));
      page.on('response', (res) => {
        const url = res.url();
        if (!baseURL || !url.startsWith(baseURL)) return;
        if (res.status() >= 500 || (res.status() >= 400 && res.status() !== 401 && res.status() !== 404)) {
          diagnostics.serverErrors.push(`${res.status()} ${res.request().method()} ${url}`);
        }
      });

      await use(diagnostics);

      expect(diagnostics.consoleErrors, 'console errors').toEqual([]);
      expect(diagnostics.serverErrors, 'failed responses').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
