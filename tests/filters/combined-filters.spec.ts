// spec: specs/taskmaster-e2e-test-plan.md
// Section 4.6: Combined Filters

import { test, expect } from '@playwright/test';

test.describe('List View Filters & Search', () => {
  test('Combined Filters', async ({ page }) => {
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

    // 1. Verify search input exists
    const searchInput = page.locator('input[placeholder*="Search tasks"]');
    await expect(searchInput).toBeVisible();

    // 2. Test search functionality
    await searchInput.fill('Task');
    await page.waitForTimeout(500);

    // Verify search filter badge appears
    await expect(page.getByText('Active filters:')).toBeVisible();

    // 3. Clear search
    await searchInput.clear();
    await page.waitForTimeout(300);

    // 4. Verify Filters button exists
    const filtersButton = page.getByRole('button', { name: /filters/i });
    await expect(filtersButton).toBeVisible();

    // 5. Click Filters button
    await filtersButton.click({ force: true });
    await page.waitForTimeout(500);

    // 6. Verify popover content is visible (Status and Priority sections)
    const popoverContent = page.locator('[data-slot="popover-content"]');
    await expect(popoverContent).toBeVisible({ timeout: 5000 });

    // 7. Verify filter options within popover
    await expect(popoverContent.getByRole('button', { name: 'To Do' })).toBeVisible();
    await expect(popoverContent.getByRole('button', { name: 'In Progress' })).toBeVisible();
    await expect(popoverContent.getByRole('button', { name: 'Done' })).toBeVisible();

    // 8. Close popover by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 9. Verify Sort button exists
    const sortButton = page.getByRole('button', { name: /sort/i });
    await expect(sortButton).toBeVisible();

    // 10. Click Sort button
    await sortButton.click();
    await page.waitForTimeout(300);

    // 11. Verify sort options
    await expect(page.getByText('Newest First')).toBeVisible();
    await expect(page.getByText('Oldest First')).toBeVisible();

    // 12. Select a sort option
    await page.getByText('Newest First').click();
    await page.waitForTimeout(300);

    // 13. Final verification
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible();
  });
});
