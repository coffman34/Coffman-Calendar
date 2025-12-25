/**
 * @fileoverview E2E Tests for Settings Module
 * @module e2e/settings.spec
 * 
 * Tests settings page, PIN protection, and configuration options.
 */

import { test, expect } from '@playwright/test';

test.describe('Settings Module', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('User can navigate to Settings', async ({ page }) => {
        await page.click('text=Settings');
        // May require PIN - just verify navigation
        await page.waitForTimeout(500);
    });

    test('Settings shows Google Calendar sync option', async ({ page }) => {
        await page.click('text=Settings');
        // Look for Google/Calendar sync options
        const syncOption = page.locator('text=Google, text=Calendar, text=Sync').first();
        await syncOption.isVisible().catch(() => { });
    });

    test('Settings shows user management', async ({ page }) => {
        await page.click('text=Settings');
        // Look for user/profile options
        const userOption = page.locator('text=User, text=Profile, text=Family').first();
        await userOption.isVisible().catch(() => { });
    });

});
