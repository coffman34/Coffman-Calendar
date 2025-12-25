
import { test, expect } from '@playwright/test';

test('Debug: Capture Console Logs', async ({ page }) => {
    // Listen for console logs
    page.on('console', msg => console.log(`BROWSER CONSOLE: ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.log(`BROWSER ERROR: ${err}`));

    await page.goto('http://localhost');

    // Wait for a bit to capture startup errors
    await page.waitForTimeout(5000);

    // Check if root has content
    const rootContent = await page.evaluate(() => document.getElementById('root')?.innerHTML);
    console.log('ROOT CONTENT LENGTH:', rootContent?.length);

    expect(rootContent?.length).toBeGreaterThan(0);
});
