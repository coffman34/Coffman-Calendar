/**
 * Debug test to find what selectors exist
 */

import { test, expect } from '@playwright/test';

test('Debug: Check what elements exist', async ({ page }) => {
    await page.goto('http://localhost');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Wait for React to render

    // Check what data-testid elements exist
    const testIds = await page.evaluate(() => {
        const elements = document.querySelectorAll('[data-testid]');
        return Array.from(elements).map(el => el.getAttribute('data-testid'));
    });

    console.log('Found data-testid elements:', testIds);

    // If no data-testid, check what's in the page
    if (testIds.length === 0) {
        const bodyHTML = await page.evaluate(() => document.body.innerHTML.substring(0, 2000));
        console.log('Body HTML sample:', bodyHTML);
    }

    expect(testIds.length).toBeGreaterThan(0);
});
