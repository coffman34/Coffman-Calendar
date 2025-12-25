
import { test } from '@playwright/test';

test('Debug Crash', async ({ page }) => {
    const logs = [];
    page.on('console', msg => logs.push(`[CONSOLE] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => logs.push(`[PAGE_ERROR] ${err.toString()}`));

    try {
        await page.goto('http://localhost');
        await page.waitForTimeout(3000);
    } catch (e) {
        logs.push(`[NAV_ERROR] ${e.toString()}`);
    }

    const html = await page.content();
    console.log('--- BROWSER LOGS ---');
    logs.forEach(l => console.log(l));
    console.log('--- PAGE HTML ---');
    console.log(html);
});
