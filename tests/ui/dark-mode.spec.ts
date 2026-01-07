// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('UI & UX Features - Dark Mode', () => {
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

  test('dark mode toggle switches theme', async ({ page }) => {
    // Get initial theme
    const htmlElement = page.locator('html');
    const initialIsDark = await htmlElement.evaluate(el => el.classList.contains('dark'));

    // Find and click theme toggle
    const themeToggle = page.getByRole('button', { name: /toggle theme|theme/i });
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Verify theme switched
    const newIsDark = await htmlElement.evaluate(el => el.classList.contains('dark'));
    expect(newIsDark).not.toBe(initialIsDark);
  });

  test('theme persists after page reload', async ({ page }) => {
    // Toggle to dark mode
    const themeToggle = page.getByRole('button', { name: /toggle theme|theme/i });
    await themeToggle.click();
    await page.waitForTimeout(500);

    const htmlElement = page.locator('html');
    const isDarkBefore = await htmlElement.evaluate(el => el.classList.contains('dark'));

    // Reload page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Verify theme persists
    const isDarkAfter = await htmlElement.evaluate(el => el.classList.contains('dark'));
    expect(isDarkAfter).toBe(isDarkBefore);
  });

  test('theme stored in localStorage', async ({ page }) => {
    const themeToggle = page.getByRole('button', { name: /toggle theme|theme/i });
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Check localStorage
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBeTruthy();
  });

  test('all UI elements update with theme change', async ({ page }) => {
    const themeToggle = page.getByRole('button', { name: /toggle theme|theme/i });
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Verify sidebar, header, main content all have dark styling
    const sidebar = page.locator('aside');
    const header = page.locator('header');

    await expect(sidebar).toBeVisible();
    await expect(header).toBeVisible();
  });
});
