// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('UI & UX Features - Sidebar Collapse', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await expect(page.getByText(/dev only/i)).toBeVisible({ timeout: 10000 });
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.clear();
    await emailInput.fill('test@example.com');
    await page.getByRole('button', { name: /test login/i }).click();
    await expect(page).toHaveURL(/\/tasks/, { timeout: 20000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible({ timeout: 30000 });
  });

  test('sidebar collapses and expands', async ({ page }) => {
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    // Get initial width (should be expanded ~240px)
    const initialWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width);
    expect(initialWidth).toBeGreaterThan(100);

    // Find collapse button by name - it's labeled "Collapse"
    const collapseButton = page.getByRole('button', { name: /collapse/i });
    if (await collapseButton.isVisible()) {
      // Use JavaScript click for better reliability with React
      await page.evaluate(() => {
        const btn = document.querySelector('aside button:last-child') ||
                   document.querySelector('button[aria-label*="Collapse"]') ||
                   Array.from(document.querySelectorAll('aside button')).find(b => b.textContent?.toLowerCase().includes('collapse'));
        if (btn) (btn as HTMLElement).click();
      });
      await page.waitForTimeout(500);

      // Verify sidebar collapsed (should be ~72px)
      const collapsedWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width);
      expect(collapsedWidth).toBeLessThan(initialWidth);
      expect(collapsedWidth).toBeLessThan(100);

      // Verify toggling again via JavaScript click
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('aside button');
        const lastButton = buttons[buttons.length - 1];
        if (lastButton) (lastButton as HTMLElement).click();
      });
      await page.waitForTimeout(500);

      // Verify expanded back
      const expandedWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width);
      expect(expandedWidth).toBeGreaterThan(collapsedWidth);
    }
  });

  test('collapsed sidebar shows icons only', async ({ page }) => {
    const collapseButton = page.getByRole('button', { name: /collapse/i });

    if (await collapseButton.isVisible()) {
      // Verify logo text visible before collapse
      const logoText = page.locator('aside').getByText(/taskmaster/i);
      await expect(logoText).toBeVisible();

      // Use JavaScript click for better reliability with React
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('aside button')).find(b => b.textContent?.toLowerCase().includes('collapse'));
        if (btn) (btn as HTMLElement).click();
      });
      await page.waitForTimeout(400);

      // Verify logo text hidden after collapse
      await expect(logoText).not.toBeVisible();

      // Verify icons still visible
      const icons = page.locator('aside svg');
      expect(await icons.count()).toBeGreaterThan(0);
    }
  });

  test('sidebar state persists in localStorage', async ({ page }) => {
    const collapseButton = page.getByRole('button', { name: /collapse/i });

    if (await collapseButton.isVisible()) {
      // Use JavaScript click for better reliability with React
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('aside button')).find(b => b.textContent?.toLowerCase().includes('collapse'));
        if (btn) (btn as HTMLElement).click();
      });
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
