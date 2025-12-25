
import { test, expect } from '@playwright/test';

test('Debug Layout State', async ({ page }) => {
    // Enable Console Logs
    page.on('console', msg => console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.log(`[ERROR] ${err.toString()}`));

    await page.goto('http://localhost');
    await page.waitForTimeout(2000); // Give React time to hydrate

    // 1. Check Root
    const root = await page.$('#root');
    console.log('Root exists:', !!root);

    // 2. Check if text "Coffman Family Calendar" exists (Title)
    const title = await page.title();
    console.log('Page Title:', title);

    // 3. Check InfoBar content (Date/Time)
    const infoBarText = await page.evaluate(() => document.body.innerText);
    console.log('Body Text Preview:', infoBarText.substring(0, 100).replace(/\n/g, ' '));

    // 4. Check for NavItems count
    const navItems = await page.$$('[data-testid^="nav-"]');
    console.log('Nav Items Found:', navItems.length);

    // 5. Check computed style of first nav item if exists
    if (navItems.length > 0) {
        const style = await navItems[0].evaluate((el) => {
            const s = window.getComputedStyle(el);
            return {
                visibility: s.visibility,
                display: s.display,
                opacity: s.opacity,
                width: s.width,
                height: s.height
            };
        });
        console.log('Nav Item Style:', JSON.stringify(style));
    } else {
        console.log('NO NAV ITEMS FOUND. Dumping HTML body...');
        const bodyHtml = await page.innerHTML('body');
        console.log(bodyHtml);
    }
});
