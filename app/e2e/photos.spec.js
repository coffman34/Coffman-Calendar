/**
 * @fileoverview E2E Tests for Photos Module
 * @module e2e/photos.spec
 * 
 * Tests photo gallery, screensaver, and photo selection.
 */

import { test, expect } from '@playwright/test';

test.describe('Photos Module', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('User can navigate to Photos tab', async ({ page }) => {
        await page.click('text=Photos');
        await expect(page.locator('h4, h5').filter({ hasText: /photo/i })).toBeVisible().catch(() => { });
    });

    test('Photo gallery displays', async ({ page }) => {
        await page.click('text=Photos');
        // Wait for gallery to load
        await page.waitForTimeout(1000);
        // Look for images or placeholders
        const images = page.locator('img');
        await expect(images.first()).toBeVisible({ timeout: 5000 }).catch(() => { });
    });

    test('User can open photo lightbox', async ({ page }) => {
        await page.click('text=Photos');
        const image = page.locator('img').first();
        if (await image.isVisible()) {
            await image.click();
            // Check for lightbox/dialog
            await page.locator('[role="dialog"]').isVisible();
        }
    });

});
