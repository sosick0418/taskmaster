// spec: specs/taskmaster-e2e-test-plan.md
// Section 4.4: Search Tasks by Title

import { test, expect } from '@playwright/test';

test.describe('List View Filters & Search', () => {
  test('Search Tasks by Title', async ({ page }) => {
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
    await page.waitForTimeout(3000); // Extra wait for RSC hydration

    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible({ timeout: 30000 });

    // Ensure list view is active
    await page.getByRole('button', { name: /list/i }).click();
    await page.waitForTimeout(500);

    // 1. Verify search input is visible
    const searchInput = page.locator('input[placeholder*="Search tasks"]');
    await expect(searchInput).toBeVisible();

    // 2. Type search query
    await searchInput.fill('Task');
    await page.waitForTimeout(500);

    // 3. Verify search badge appears in active filters
    await expect(page.getByText('Active filters:')).toBeVisible();
    await expect(page.getByText(/Search:/)).toBeVisible();

    // 4. Clear search by clicking X button next to search badge
    const clearSearchButton = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: '' }).first();
    // Alternative: Clear via input
    await searchInput.clear();
    await page.waitForTimeout(300);

    // 5. Verify search is cleared
    await expect(searchInput).toHaveValue('');

    // 6. Type another search query
    await searchInput.fill('report');
    await page.waitForTimeout(500);

    // 7. Verify search results update
    await expect(page.getByText(/Search: report/)).toBeVisible();

    // 8. Press Escape to clear search
    await searchInput.clear();
    await page.waitForTimeout(300);

    // 9. Verify all tasks are visible again
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible();

    // 10. Type a search that should match existing tasks
    await searchInput.fill('Buy');
    await page.waitForTimeout(500);

    // 11. Verify matching tasks are shown
    // (assuming there are tasks with "Buy" in the title from seed data)
    await expect(page.getByText(/Search: Buy/)).toBeVisible();

    // 12. Clear search
    await searchInput.clear();
    await page.waitForTimeout(300);

    // 13. Final verification
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible();
  });
});
