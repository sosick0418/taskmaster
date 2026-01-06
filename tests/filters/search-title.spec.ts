// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('List View Filters & Search', () => {
  test('Search Tasks by Title', async ({ page }) => {
    // 1. Login and create tasks: 'Buy groceries', 'Buy coffee', 'Sell old furniture'
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');
    
    // Create test tasks
    const tasks = ['Buy groceries', 'Buy coffee', 'Sell old furniture'];
    for (const taskTitle of tasks) {
      await page.click('button:has-text("New Task")');
      await page.fill('input[placeholder*="title" i]', taskTitle);
      await page.click('button:has-text("Create Task")');
      await page.waitForTimeout(500);
    }

    // 2. Switch to list view
    const listViewButton = page.locator('button[aria-label*="list" i], button:has-text("List")').first();
    if (await listViewButton.isVisible()) {
      await listViewButton.click();
    }

    // 3. Verify all 3 tasks are displayed
    await expect(page.locator('text="Buy groceries"')).toBeVisible();
    await expect(page.locator('text="Buy coffee"')).toBeVisible();
    await expect(page.locator('text="Sell old furniture"')).toBeVisible();

    // 4. Type 'buy' in search input (case-insensitive)
    const searchInput = page.locator('input[placeholder*="search" i]').first();
    await searchInput.fill('buy');

    // 5. Verify only 'Buy groceries' and 'Buy coffee' are shown
    await expect(page.locator('text="Buy groceries"')).toBeVisible();
    await expect(page.locator('text="Buy coffee"')).toBeVisible();
    await expect(page.locator('text="Sell old furniture"')).not.toBeVisible();

    // 6. Verify count shows 'Showing 2 of 3 tasks'
    await expect(page.locator('text=/Showing 2 of 3/i')).toBeVisible();

    // 7. Clear search input
    await searchInput.clear();

    // 8. Verify all 3 tasks reappear
    await expect(page.locator('text="Buy groceries"')).toBeVisible();
    await expect(page.locator('text="Buy coffee"')).toBeVisible();
    await expect(page.locator('text="Sell old furniture"')).toBeVisible();

    // 9. Type 'furniture'
    await searchInput.fill('furniture');

    // 10. Verify only 'Sell old furniture' is shown
    await expect(page.locator('text="Sell old furniture"')).toBeVisible();
    await expect(page.locator('text="Buy groceries"')).not.toBeVisible();
    await expect(page.locator('text="Buy coffee"')).not.toBeVisible();
  });
});
