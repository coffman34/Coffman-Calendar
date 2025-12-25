/**
 * Simple smoke test to verify Playwright works
 */

import { test, expect } from '@playwright/test';

test('Page loads', async ({ page }) => {
    await page.goto('http://localhost');
    // Just wait for something to render
    await page.waitForSelector('body', { timeout: 10000 });
    expect(true).toBe(true);
});

test('Navigation exists', async ({ page }) => {
    await page.goto('http://localhost');
    // Check if any navigation element exists
    const nav = await page.locator('nav, [role="navigation"], [data-testid^="nav-"]').first();
    await expect(nav).toBeVisible({ timeout: 10000 });
});
