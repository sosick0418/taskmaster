// spec: specs/taskmaster-e2e-test-plan.md
// Section 4.3: Filter by Priority

import { test, expect } from '@playwright/test';

test.describe('List View Filters & Search', () => {
  test('Filter by Priority', async ({ page }) => {
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

    // 3. Verify priority filter options are visible within popover
    await expect(popoverContent.getByRole('button', { name: 'Low' })).toBeVisible();
    await expect(popoverContent.getByRole('button', { name: 'Medium' })).toBeVisible();
    await expect(popoverContent.getByRole('button', { name: 'High' })).toBeVisible();
    await expect(popoverContent.getByRole('button', { name: 'Urgent' })).toBeVisible();

    // 4. Click Low to toggle it off
    const lowButton = popoverContent.locator('button').filter({ hasText: 'Low' }).first();
    await lowButton.click({ force: true });
    await page.waitForTimeout(200);

    // 5. Click Medium to toggle it off
    const mediumButton = popoverContent.locator('button').filter({ hasText: 'Medium' }).first();
    await mediumButton.click({ force: true });
    await page.waitForTimeout(200);

    // 6. Close filter popover
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 7. Verify priority filters are shown as active
    await expect(page.getByText('Active filters:')).toBeVisible();

    // 8. Re-open filters and select all priorities
    await filtersButton.click({ force: true });
    await page.waitForTimeout(500);

    // Use 'Select all' for priority section
    const selectAllButtons = popoverContent.getByText('Select all');
    await selectAllButtons.last().click({ force: true }); // Second 'Select all' is for priority
    await page.waitForTimeout(300);

    // 9. Close filter popover
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 10. Final verification
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible();
  });
});
