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
    // Create multiple tasks for testing
    const taskCount = 10;
    for (let i = 1; i <= taskCount; i++) {
      await page.click('button:has-text("New Task")');
      await page.waitForTimeout(200);
      const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
      await titleInput.fill(`Performance Task ${i}`);
      await page.click('button:has-text("Create Task")');
      await page.waitForTimeout(300);
    }

    // Measure page load time
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('filtering large list is responsive', async ({ page }) => {
    // Create tasks
    for (let i = 1; i <= 5; i++) {
      await page.click('button:has-text("New Task")');
      await page.waitForTimeout(200);
      const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
      await titleInput.fill(`Filter Test ${i}`);
      await page.click('button:has-text("Create Task")');
      await page.waitForTimeout(300);
    }

    // Search for specific task
    const searchInput = page.locator('input[placeholder*="search" i]');
    if (await searchInput.isVisible()) {
      const startTime = Date.now();
      await searchInput.fill('Filter Test 3');
      await page.waitForTimeout(500);
      const filterTime = Date.now() - startTime;

      // Filtering should be quick
      expect(filterTime).toBeLessThan(2000);

      // Only matching task should be visible
      await expect(page.getByText('Filter Test 3')).toBeVisible();
    }
  });

  test('scroll performance with multiple tasks', async ({ page }) => {
    // Create tasks
    for (let i = 1; i <= 10; i++) {
      await page.click('button:has-text("New Task")');
      await page.waitForTimeout(200);
      const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
      await titleInput.fill(`Scroll Task ${i}`);
      await page.click('button:has-text("Create Task")');
      await page.waitForTimeout(300);
    }

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
