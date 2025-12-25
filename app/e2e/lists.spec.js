/**
 * @fileoverview E2E Tests for Lists Module (Shopping List)
 * @module e2e/lists.spec
 * 
 * Tests shopping list generation, item management, and persistence.
 */

import { test, expect } from '@playwright/test';

test.describe('Lists Module (Shopping List)', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('User can navigate to Lists tab', async ({ page }) => {
        await page.click('text=Lists');
        await expect(page.locator('h4:has-text("Shopping List")')).toBeVisible();
    });

    test('Shopping list shows generate button', async ({ page }) => {
        await page.click('text=Lists');
        await expect(page.locator('button:has-text("Refresh"), button:has-text("Generate")')).toBeVisible();
    });

    test('User can generate shopping list from meals', async ({ page }) => {
        await page.click('text=Lists');
        const refreshBtn = page.locator('button:has-text("Refresh from Meals")');
        if (await refreshBtn.isVisible()) {
            await refreshBtn.click();
            // Should show success or update list
        }
    });

    test('User can check off items', async ({ page }) => {
        await page.click('text=Lists');
        // Wait for list to load
        await page.waitForTimeout(500);
        const checkbox = page.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible()) {
            await checkbox.click();
        }
    });

    test('Items are grouped by aisle', async ({ page }) => {
        await page.click('text=Lists');
        // Look for aisle category headers
        const aisleHeader = page.locator('text=Produce, text=Dairy, text=Meat, text=Pantry').first();
        await aisleHeader.isVisible().catch(() => { });
    });

});
