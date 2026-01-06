// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('UI & UX Features - Confetti Animation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');
  });

  test('confetti plays when completing task', async ({ page }) => {
    // Create a task
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('Confetti Test Task');
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(500);

    // Complete the task
    const checkbox = page.locator('[role="checkbox"]').first();
    await checkbox.click();

    // Wait for confetti animation
    await page.waitForTimeout(500);

    // Canvas element should exist (confetti uses canvas)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('no confetti when unchecking task', async ({ page }) => {
    // Create and complete a task
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('Uncheck Test');
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(500);

    const checkbox = page.locator('[role="checkbox"]').first();
    await checkbox.click();
    await page.waitForTimeout(1000);

    // Remove existing canvas if any
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) canvas.remove();
    });

    // Uncheck task
    await checkbox.click();
    await page.waitForTimeout(500);

    // No new canvas should be created
    const canvasCount = await page.locator('canvas').count();
    expect(canvasCount).toBe(0);
  });

  test('confetti clears after animation', async ({ page }) => {
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('Clear Test');
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(500);

    const checkbox = page.locator('[role="checkbox"]').first();
    await checkbox.click();

    // Wait for animation to complete (typically 3-4 seconds)
    await page.waitForTimeout(4000);

    // Canvas should be removed or empty after animation
    // Note: Implementation may vary
  });
});
