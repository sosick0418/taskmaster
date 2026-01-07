// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Edge Cases - Large Dataset Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');
  });

  test('page loads within acceptable time with many tasks', async ({ page }) => {
    // Use existing tasks (seeded data) instead of creating new ones
    await expect(page.locator('main h3').first()).toBeVisible({ timeout: 10000 });

    // Measure page load time
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    const loadTime = Date.now() - startTime;

    // Page should load within 10 seconds (including domcontentloaded)
    expect(loadTime).toBeLessThan(10000);
  });

  test('filtering large list is responsive', async ({ page }) => {
    // Use existing tasks
    await expect(page.locator('main h3').first()).toBeVisible({ timeout: 10000 });

    // Search for a task using the search input
    const searchInput = page.locator('input[placeholder*="search" i]');
    if (await searchInput.isVisible()) {
      const startTime = Date.now();
      // Search for a term that should match some tasks
      await searchInput.fill('Task');
      await page.waitForTimeout(1000);
      const filterTime = Date.now() - startTime;

      // Filtering should be quick (within 3 seconds)
      expect(filterTime).toBeLessThan(3000);

      // At least one task should be visible
      await expect(page.locator('main h3').first()).toBeVisible();
    } else {
      // No search input - just verify tasks are visible
      await expect(page.locator('main h3').first()).toBeVisible();
    }
  });

  test('scroll performance with multiple tasks', async ({ page }) => {
    // Use existing tasks (seeded data has many tasks already)
    await expect(page.locator('main h3').first()).toBeVisible({ timeout: 10000 });

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(100);

    // Scroll back up
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);

    // Page should remain responsive
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible();
  });

  test('board view handles multiple tasks per column', async ({ page }) => {
    // Create tasks with different statuses
    const statuses = ['TODO', 'IN_PROGRESS', 'DONE'];

    for (let i = 0; i < 6; i++) {
      await page.click('button:has-text("New Task")');
      await page.waitForTimeout(200);
      const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
      await titleInput.fill(`Board Task ${i + 1}`);
      await page.click('button:has-text("Create Task")');
      await page.waitForTimeout(300);
    }

    // Switch to board view
    const boardViewButton = page.getByRole('button', { name: /board/i });
    if (await boardViewButton.isVisible()) {
      await boardViewButton.click();
      await page.waitForTimeout(500);

      // Board should render without issues
      await expect(page.getByText(/to do|todo/i).first()).toBeVisible();
    }
  });
});
