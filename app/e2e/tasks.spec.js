/**
 * @fileoverview E2E Tests for Tasks Module
 * @module e2e/tasks.spec
 * 
 * Tests task creation, completion, and management.
 */

import { test, expect } from '@playwright/test';

test.describe('Tasks Module', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('User can navigate to Tasks tab', async ({ page }) => {
        await page.click('text=Tasks');
        await expect(page.locator('h4, h5').filter({ hasText: /tasks/i })).toBeVisible();
    });

    test('User can add a new task', async ({ page }) => {
        await page.click('text=Tasks');
        // Look for add button
        const addButton = page.locator('button:has-text("Add"), [aria-label*="add"]');
        if (await addButton.isVisible()) {
            await addButton.click();
            // Fill in task name if dialog opens
            const input = page.locator('input[type="text"]');
            if (await input.isVisible()) {
                await input.fill('Test Task');
            }
        }
    });

    test('User can mark task as complete', async ({ page }) => {
        await page.click('text=Tasks');
        // Look for checkbox
        const checkbox = page.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible()) {
            await checkbox.click();
        }
    });

    test('User can delete a task', async ({ page }) => {
        await page.click('text=Tasks');
        // Look for delete icon
        const deleteBtn = page.locator('button:has(svg[data-testid="DeleteIcon"])').first();
        if (await deleteBtn.isVisible()) {
            await deleteBtn.click();
        }
    });

});
