// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('UI & UX Features - Page Transitions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');
  });

  test('smooth transition between pages', async ({ page }) => {
    // Navigate from tasks to analytics
    await page.click('a[href="/analytics"]');
    await page.waitForURL('**/analytics');

    // Page should load smoothly
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible();

    // Navigate to settings
    await page.click('a[href="/settings"]');
    await page.waitForURL('**/settings');

    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
  });

  test('scroll position resets on navigation', async ({ page }) => {
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    const scrollBefore = await page.evaluate(() => window.scrollY);
    expect(scrollBefore).toBeGreaterThan(0);

    // Navigate to another page
    await page.click('a[href="/analytics"]');
    await page.waitForURL('**/analytics');

    // Scroll should reset
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter).toBe(0);
  });

  test('browser back button works correctly', async ({ page }) => {
    // Navigate to analytics
    await page.click('a[href="/analytics"]');
    await page.waitForURL('**/analytics');

    // Navigate to settings
    await page.click('a[href="/settings"]');
    await page.waitForURL('**/settings');

    // Go back
    await page.goBack();
    await page.waitForURL('**/analytics');

    // Go back again
    await page.goBack();
    await page.waitForURL('**/tasks');
  });

  test('no layout shift during transitions', async ({ page }) => {
    const header = page.locator('header');
    const initialBox = await header.boundingBox();

    // Navigate
    await page.click('a[href="/analytics"]');
    await page.waitForURL('**/analytics');
    await page.waitForLoadState('networkidle');

    // Header should not shift
    const finalBox = await header.boundingBox();
    expect(finalBox?.y).toBe(initialBox?.y);
    expect(finalBox?.height).toBe(initialBox?.height);
  });
});
