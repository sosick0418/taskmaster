// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('UI & UX Features - Optimistic Updates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');
  });

  test('checkbox updates immediately without waiting for server', async ({ page }) => {
    // Create a task
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('Optimistic Test');
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(500);

    // Throttle network
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 50 * 1024,
      uploadThroughput: 20 * 1024,
      latency: 500,
    });

    const checkbox = page.locator('[role="checkbox"]').first();
    const startTime = Date.now();

    await checkbox.click();

    // Should be checked immediately (< 200ms)
    await expect(checkbox).toBeChecked();
    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(500);

    // Restore network
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });
  });

  test('no loading spinners for toggle actions', async ({ page }) => {
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('No Spinner Test');
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(500);

    const checkbox = page.locator('[role="checkbox"]').first();
    await checkbox.click();

    // No spinner should appear
    const spinner = page.locator('[role="status"], .spinner, .loading');
    expect(await spinner.count()).toBe(0);
  });

  test('strikethrough applies immediately', async ({ page }) => {
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('Strikethrough Test');
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(500);

    const checkbox = page.locator('[role="checkbox"]').first();
    await checkbox.click();

    // Strikethrough should appear immediately
    const taskTitle = page.getByText('Strikethrough Test').first();

    await page.waitForTimeout(100);

    const hasStrikethrough = await taskTitle.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.textDecoration.includes('line-through') ||
             el.classList.contains('line-through') ||
             el.closest('[class*="line-through"]') !== null;
    });

    expect(hasStrikethrough).toBe(true);
  });

  test('multiple rapid toggles handled correctly', async ({ page }) => {
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('Rapid Toggle Test');
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(500);

    const checkbox = page.locator('[role="checkbox"]').first();

    // Rapidly toggle multiple times
    await checkbox.click();
    await page.waitForTimeout(50);
    await checkbox.click();
    await page.waitForTimeout(50);
    await checkbox.click();
    await page.waitForTimeout(50);

    // Final state should be checked (odd number of clicks)
    await expect(checkbox).toBeChecked();
  });
});
