// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Coffman Calendar
 * 
 * JUNIOR DEV NOTE: Playwright runs real browser tests that simulate
 * user interactions. This catches issues like:
 * - Buttons that exist but aren't wired to anything
 * - Missing UI elements
 * - Broken user flows
 */
export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',

    timeout: 60000,
    use: {
        // Base URL for your dev server
        baseURL: 'http://localhost',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        viewport: { width: 1280, height: 720 },
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    // Start dev server before running tests
    webServer: {
        command: 'npm run dev:test',
        url: 'http://localhost',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
});
