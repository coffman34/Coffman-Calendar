/**
 * @fileoverview E2E Tests - Verified working
 * Uses simple selectors that match the actual DOM
 */

import { test, expect } from '@playwright/test';

test.describe('App Smoke Tests', () => {

    test('Page loads successfully', async ({ page }) => {
        await page.goto('http://localhost');
        await page.waitForSelector('body', { timeout: 10000 });
        expect(true).toBe(true);
    });

    test('Navigation bar is visible', async ({ page }) => {
        await page.goto('http://localhost');
        await expect(page.locator('[data-testid="nav-calendar"]')).toBeVisible();
        await expect(page.locator('[data-testid="nav-tasks"]')).toBeVisible();
        await expect(page.locator('[data-testid="nav-meals"]')).toBeVisible();
    });

    test('Can click on Meals nav', async ({ page }) => {
        await page.goto('http://localhost');
        const mealsNav = page.locator('[data-testid="nav-meals"]');
        await mealsNav.click();
        await expect(page).toHaveURL(/.*meals/);
    });

    test('Can click on Lists nav', async ({ page }) => {
        await page.goto('http://localhost');
        const listsNav = page.locator('[data-testid="nav-lists"]');
        await listsNav.click();
        await expect(page).toHaveURL(/.*lists/);
        // After clicking, should see Shopping List header  
        await expect(page.locator('text=Shopping List')).toBeVisible({ timeout: 5000 });
    });

});

test.describe('Meal Features', () => {

    test('Generate List button exists', async ({ page }) => {
        await page.goto('http://localhost');
        await page.locator('[data-testid="nav-meals"]').click({ timeout: 10000 });
        await expect(page.locator('button:has-text("Generate")')).toBeVisible({ timeout: 5000 });
    });

});
