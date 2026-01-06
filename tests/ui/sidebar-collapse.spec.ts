// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('UI & UX Features - Sidebar Collapse', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');
  });

  test('sidebar collapses and expands', async ({ page }) => {
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    // Get initial width
    const initialWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width);

    // Find and click collapse button
    const collapseButton = page.locator('aside button').filter({ hasText: /collapse/i }).first();
    if (await collapseButton.isVisible()) {
      await collapseButton.click();
      await page.waitForTimeout(400);

      // Verify sidebar collapsed
      const collapsedWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width);
      expect(collapsedWidth).toBeLessThan(initialWidth);

      // Expand again
      await collapseButton.click();
      await page.waitForTimeout(400);

      const expandedWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width);
      expect(expandedWidth).toBeGreaterThan(collapsedWidth);
    }
  });

  test('collapsed sidebar shows icons only', async ({ page }) => {
    const collapseButton = page.locator('aside button').filter({ hasText: /collapse/i }).first();

    if (await collapseButton.isVisible()) {
      // Verify logo text visible before collapse
      const logoText = page.locator('aside').getByText(/taskmaster/i);
      await expect(logoText).toBeVisible();

      await collapseButton.click();
      await page.waitForTimeout(400);

      // Verify logo text hidden after collapse
      await expect(logoText).not.toBeVisible();

      // Verify icons still visible
      const icons = page.locator('aside svg');
      expect(await icons.count()).toBeGreaterThan(0);
    }
  });

  test('sidebar state persists in localStorage', async ({ page }) => {
    const collapseButton = page.locator('aside button').filter({ hasText: /collapse/i }).first();

    if (await collapseButton.isVisible()) {
      await collapseButton.click();
      await page.waitForTimeout(400);

      // Check localStorage
      const storedState = await page.evaluate(() =>
        localStorage.getItem('taskmaster-sidebar-collapsed') ||
        localStorage.getItem('sidebar-collapsed')
      );
      expect(storedState).toBe('true');

      // Reload and verify persists
      await page.reload();
      await page.waitForLoadState('networkidle');

      const sidebar = page.locator('aside');
      const width = await sidebar.evaluate(el => el.getBoundingClientRect().width);
      expect(width).toBeLessThan(150); // Collapsed state
    }
  });
});
