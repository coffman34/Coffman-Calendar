import { test, expect } from '@playwright/test';

test.describe('Meals Module', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Wait for hydration
        await expect(page.locator('text=Coffman Family Calendar')).toBeVisible();

        // Navigate to Meals tab
        // Try reliable text selector or id
        const mealsLink = page.getByTestId('nav-meals').or(page.getByText('Meal Planning'));
        await mealsLink.click();
        await expect(page.getByText('Meal Planning', { exact: true })).toBeVisible({ timeout: 10000 });
    });

    test('should allow adding a new meal', async ({ page }) => {
        // Click on a cell (using a generic cell class or just first available generic click)
        // We can target the grid.
        await page.locator('.meal-cell').first().click();

        // Dialog should open
        await expect(page.getByText('Add Meal', { exact: true })).toBeVisible();

        // Fill form
        await page.getByLabel('Meal Name').fill('E2E Test Meal');
        await page.getByLabel('Instructions').fill('Step 1. E2E Instruction');

        // Switch to New Entry tab if needed (logic might default to it if no recipes, or we click it)
        if (await page.getByText('From Recipes').isVisible()) {
            await page.getByText('New Entry').click();
        }

        // Save
        await page.getByRole('button', { name: 'Add Meal' }).click();

        // Verify it appears
        await expect(page.getByText('E2E Test Meal')).toBeVisible();
    });

    test('should allow editing a meal', async ({ page }) => {
        // Assumption: "E2E Test Meal" exists or we create it.
        // Better to create one fresh or handle cleanup.
        // For simplicity, let's just create one here too
        await page.locator('.meal-cell').first().click();
        await page.getByLabel('Meal Name').fill('Meal To Edit');
        await page.getByRole('button', { name: 'Add Meal' }).click();
        await expect(page.getByText('Meal To Edit')).toBeVisible();

        // Click it
        await page.getByText('Meal To Edit').click();

        // Click Edit
        await page.getByRole('button', { name: 'Edit' }).click();

        // Change name
        await page.getByLabel('Meal Name').fill('Edited Meal Name');
        await page.getByRole('button', { name: 'Save Changes' }).click();

        // Verify
        await expect(page.getByText('Edited Meal Name')).toBeVisible();
    });

    test('should generate shopping list', async ({ page }) => {
        // Ensure we have a meal
        await page.locator('.meal-cell').first().click();
        await page.getByLabel('Meal Name').fill('Shopping Meal');
        // Add ingredient
        await page.getByPlaceholder('e.g., 2 cups flour').fill('2 cups flour');
        await page.getByRole('button', { name: 'Add', exact: true }).click();
        await page.getByRole('button', { name: 'Add Meal' }).click();

        // Generate
        await page.getByRole('button', { name: 'Generate List' }).click();

        // Verify popup or toast
        // The previous implementation used a popup
        await expect(page.getByText('Shopping List', { exact: true })).toBeVisible();
        await expect(page.getByText('flour')).toBeVisible();
    });
});
