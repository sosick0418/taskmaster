// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('UI & UX Features - Command Menu (Cmd+K)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');
  });

  test('Cmd+K opens command menu', async ({ page }) => {
    // Press Cmd+K (Mac) or Ctrl+K (Windows/Linux)
    await page.keyboard.press('Meta+k');

    const commandDialog = page.locator('[role="dialog"]');
    await expect(commandDialog).toBeVisible();

    // Search input should be focused
    const searchInput = page.locator('[role="dialog"] input');
    await expect(searchInput).toBeFocused();
  });

  test('command menu shows search results', async ({ page }) => {
    await page.keyboard.press('Meta+k');

    const searchInput = page.locator('[role="dialog"] input');
    await searchInput.fill('task');

    await page.waitForTimeout(200);

    // Should show task-related options
    const createTaskOption = page.getByRole('option', { name: /create.*task/i });
    await expect(createTaskOption).toBeVisible();
  });

  test('selecting option navigates or performs action', async ({ page }) => {
    await page.keyboard.press('Meta+k');

    const searchInput = page.locator('[role="dialog"] input');
    await searchInput.fill('analytics');

    await page.waitForTimeout(200);

    const analyticsOption = page.getByRole('option', { name: /analytics/i }).first();
    await analyticsOption.click();

    await page.waitForURL('**/analytics');
  });

  test('escape closes command menu', async ({ page }) => {
    await page.keyboard.press('Meta+k');

    const commandDialog = page.locator('[role="dialog"]');
    await expect(commandDialog).toBeVisible();

    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    await expect(commandDialog).toBeHidden();
  });

  test('arrow keys navigate options', async ({ page }) => {
    await page.keyboard.press('Meta+k');

    // Press ArrowDown to navigate
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowDown');

    // An option should be selected
    const selectedOption = page.locator('[role="option"][aria-selected="true"]');
    await expect(selectedOption).toBeVisible();
  });

  test('no results message for invalid search', async ({ page }) => {
    await page.keyboard.press('Meta+k');

    const searchInput = page.locator('[role="dialog"] input');
    await searchInput.fill('xyznonexistent123');

    await page.waitForTimeout(300);

    await expect(page.getByText(/no results/i)).toBeVisible();
  });
});
