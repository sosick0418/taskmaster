// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect, devices } from '@playwright/test';

test.describe('UI & UX Features - Mobile Navigation', () => {
  test.use({ ...devices['iPhone 12'] });

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');
  });

  test('mobile shows hamburger menu', async ({ page }) => {
    // Desktop sidebar should be hidden
    const desktopSidebar = page.locator('aside');
    await expect(desktopSidebar).toBeHidden();

    // Hamburger menu should be visible
    const menuButton = page.getByRole('button', { name: /menu|open menu/i });
    await expect(menuButton).toBeVisible();
  });

  test('hamburger menu opens navigation sheet', async ({ page }) => {
    const menuButton = page.getByRole('button', { name: /menu|open menu/i });
    await menuButton.click();
    await page.waitForTimeout(300);

    // Mobile sheet should open
    const sheet = page.locator('[role="dialog"]');
    await expect(sheet).toBeVisible();

    // Nav links should be visible
    await expect(sheet.getByRole('link', { name: /tasks/i })).toBeVisible();
    await expect(sheet.getByRole('link', { name: /analytics/i })).toBeVisible();
  });

  test('clicking nav link closes sheet and navigates', async ({ page }) => {
    const menuButton = page.getByRole('button', { name: /menu|open menu/i });
    await menuButton.click();
    await page.waitForTimeout(300);

    const sheet = page.locator('[role="dialog"]');
    await sheet.getByRole('link', { name: /analytics/i }).click();

    await page.waitForURL('**/analytics');
    await expect(sheet).toBeHidden();
  });

  test('escape key closes mobile sheet', async ({ page }) => {
    const menuButton = page.getByRole('button', { name: /menu|open menu/i });
    await menuButton.click();
    await page.waitForTimeout(300);

    const sheet = page.locator('[role="dialog"]');
    await expect(sheet).toBeVisible();

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    await expect(sheet).toBeHidden();
  });
});
