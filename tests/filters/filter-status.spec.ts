// spec: specs/taskmaster-e2e-test-plan.md
// Section 4.2: Filter by Status

import { test, expect } from '@playwright/test';

test.describe('List View Filters & Search', () => {
  test('Filter by Status', async ({ page }) => {
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

    // 1. Open filters popover
    const filtersButton = page.getByRole('button', { name: /filters/i });
    await filtersButton.click({ force: true });
    await page.waitForTimeout(500);

    // 2. Verify popover content is visible
    const popoverContent = page.locator('[data-slot="popover-content"]');
    await expect(popoverContent).toBeVisible({ timeout: 5000 });

    // 3. Verify status filter options are visible within popover
    await expect(popoverContent.getByRole('button', { name: 'To Do' })).toBeVisible();
    await expect(popoverContent.getByRole('button', { name: 'In Progress' })).toBeVisible();
    await expect(popoverContent.getByRole('button', { name: 'Done' })).toBeVisible();

    // 4. Click 'In Progress' button to toggle it
    const inProgressButton = popoverContent.locator('button').filter({ hasText: 'In Progress' }).first();
    await inProgressButton.click({ force: true });
    await page.waitForTimeout(200);

    // 5. Click 'Done' button to toggle it
    const doneButton = popoverContent.locator('button').filter({ hasText: 'Done' }).first();
    await doneButton.click({ force: true });
    await page.waitForTimeout(200);

    // 6. Close filter popover
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 7. Verify 'To Do' filter is shown as active
    await expect(page.getByText('Active filters:')).toBeVisible();

    // 8. Re-open filters
    await filtersButton.click({ force: true });
    await page.waitForTimeout(500);

    // 9. Click 'Select all' for status
    const selectAllStatus = popoverContent.getByText('Select all').first();
    await selectAllStatus.click({ force: true });
    await page.waitForTimeout(300);

    // 10. Close filter popover
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 11. Verify all tasks are visible (no status filter active)
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible();
  });
});
