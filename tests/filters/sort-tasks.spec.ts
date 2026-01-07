// spec: specs/taskmaster-e2e-test-plan.md
// Section 4.1: Sort Tasks

import { test, expect } from '@playwright/test';

test.describe('List View Filters & Search', () => {
  test('Sort Tasks', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await expect(page.getByText(/dev only/i)).toBeVisible({ timeout: 10000 });

    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.clear();
    await emailInput.fill('test@example.com');

    await page.getByRole('button', { name: /test login/i }).click();
    await expect(page).toHaveURL(/\/tasks/, { timeout: 20000 });

    // Wait for page to fully load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible({ timeout: 30000 });

    // Ensure list view is active
    await page.getByRole('button', { name: /list/i }).click();
    await page.waitForTimeout(500);

    // 1. Verify sort button is visible
    const sortButton = page.getByRole('button', { name: /sort/i });
    await expect(sortButton).toBeVisible();

    // 2. Open sort dropdown
    await sortButton.click();
    await page.waitForTimeout(300);

    // 3. Verify sort options are visible
    await expect(page.getByText('Sort by')).toBeVisible();
    await expect(page.getByText('Newest First')).toBeVisible();
    await expect(page.getByText('Oldest First')).toBeVisible();
    await expect(page.getByText('Priority (High → Low)')).toBeVisible();
    await expect(page.getByText('Due Date')).toBeVisible();
    await expect(page.getByText('Title (A → Z)')).toBeVisible();

    // 4. Select 'Oldest First'
    await page.getByRole('menuitem', { name: 'Oldest First' }).click();
    await page.waitForTimeout(500);

    // 5. Open sort dropdown again
    await sortButton.click();
    await page.waitForTimeout(300);

    // 6. Select 'Priority (High → Low)'
    await page.getByRole('menuitem', { name: /Priority/ }).click();
    await page.waitForTimeout(500);

    // 7. Open sort dropdown again
    await sortButton.click();
    await page.waitForTimeout(300);

    // 8. Select 'Title (A → Z)'
    await page.getByRole('menuitem', { name: /Title/ }).click();
    await page.waitForTimeout(500);

    // 9. Open sort dropdown again
    await sortButton.click();
    await page.waitForTimeout(300);

    // 10. Select 'Newest First' (default)
    await page.getByRole('menuitem', { name: 'Newest First' }).click();
    await page.waitForTimeout(500);

    // 11. Final verification
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible();
  });
});
