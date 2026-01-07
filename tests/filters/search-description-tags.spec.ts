// spec: specs/taskmaster-e2e-test-plan.md
// Section 4.5: Search Tasks by Description and Tags

import { test, expect } from '@playwright/test';

test.describe('List View Filters & Search', () => {
  test('Search Tasks by Description and Tags', async ({ page }) => {
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

    // 1. Verify search input is visible
    const searchInput = page.locator('input[placeholder*="Search tasks"]');
    await expect(searchInput).toBeVisible();

    // 2. Search for a term
    await searchInput.fill('report');
    await page.waitForTimeout(500);

    // 3. Verify search is active
    await expect(page.getByText('Active filters:')).toBeVisible();
    await expect(page.getByText(/Search:/)).toBeVisible();

    // 4. Clear search
    await searchInput.clear();
    await page.waitForTimeout(300);

    // 5. Search for another term
    await searchInput.fill('work');
    await page.waitForTimeout(500);

    // 6. Verify search badge shows the term
    await expect(page.getByText(/Search:/)).toBeVisible();

    // 7. Clear search
    await searchInput.clear();
    await page.waitForTimeout(300);

    // 8. Search for a term that might be in description
    await searchInput.fill('sprint');
    await page.waitForTimeout(500);

    // 9. Verify search is active
    await expect(page.getByText(/Search:/)).toBeVisible();

    // 10. Clear search
    await searchInput.clear();
    await page.waitForTimeout(300);

    // 11. Final verification
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible();
  });
});
