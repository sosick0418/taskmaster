// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('UI & UX Features - Page Transitions', () => {
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

  test('smooth transition between pages', async ({ page }) => {
    // Navigate from tasks to settings (settings page is faster to load than analytics)
    await page.goto('http://localhost:3000/settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Page should load smoothly - check for Settings heading
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible({ timeout: 15000 });

    // Navigate back to tasks
    await page.goto('http://localhost:3000/tasks', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible({ timeout: 15000 });
  });

  test('scroll position resets on navigation', async ({ page }) => {
    // Scroll down on tasks page
    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(200);

    // Navigate to settings
    await page.goto('http://localhost:3000/settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Scroll should reset to top
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter).toBe(0);
  });

  test('browser back button works correctly', async ({ page }) => {
    // Navigate to settings
    await page.goto('http://localhost:3000/settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Go back to tasks
    await page.goBack();
    await expect(page).toHaveURL(/\/tasks/, { timeout: 10000 });
  });

  test('no layout shift during transitions', async ({ page }) => {
    const header = page.locator('header');
    const initialBox = await header.boundingBox();

    // Navigate to settings
    await page.goto('http://localhost:3000/settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Header should not shift
    const finalBox = await header.boundingBox();
    expect(finalBox?.y).toBe(initialBox?.y);
    expect(finalBox?.height).toBe(initialBox?.height);
  });
});
