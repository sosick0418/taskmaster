// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Edge Cases - Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');
  });

  test('empty form submission shows validation error', async ({ page }) => {
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    // Try to submit empty form
    await page.click('button:has-text("Create Task")');

    // Should show validation error
    await expect(page.getByText(/title.*required|required.*title/i)).toBeVisible();
  });

  test('XSS payload is escaped', async ({ page }) => {
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('<script>alert("XSS")</script>');
    await page.click('button:has-text("Create Task")');

    await page.waitForTimeout(500);

    // Script should be escaped, not executed
    // Verify the text is displayed as plain text
    const taskText = page.getByText('<script>alert("XSS")</script>');
    await expect(taskText).toBeVisible();

    // Verify no alert dialog appeared (implicit - test would fail if alert blocked)
  });

  test('SQL injection attempt is safely handled', async ({ page }) => {
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill("'; DROP TABLE tasks; --");

    const descInput = page.locator('textarea[name="description"], textarea[placeholder*="description" i]').first();
    if (await descInput.isVisible()) {
      await descInput.fill("Robert'); DROP TABLE tasks;--");
    }

    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(500);

    // Task should be created with literal text (Prisma parameterizes queries)
    await expect(page.getByText("'; DROP TABLE tasks; --")).toBeVisible();
  });

  test('emoji in task title', async ({ page }) => {
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('🎉 Party Task 🎊');
    await page.click('button:has-text("Create Task")');

    await page.waitForTimeout(500);

    // Emoji should display correctly
    await expect(page.getByText('🎉 Party Task 🎊')).toBeVisible();
  });

  test('very long title handling', async ({ page }) => {
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    const longTitle = 'A'.repeat(500);
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill(longTitle);
    await page.click('button:has-text("Create Task")');

    await page.waitForTimeout(500);

    // Should either show validation error or truncate/accept
    const errorMessage = page.getByText(/too long|max.*characters/i);
    const successToast = page.getByText(/task created/i);

    // One of these should be visible
    const hasError = await errorMessage.isVisible().catch(() => false);
    const hasSuccess = await successToast.isVisible().catch(() => false);
    expect(hasError || hasSuccess).toBe(true);
  });

  test('special characters in task', async ({ page }) => {
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('Task with "quotes" & <brackets> and \'apostrophes\'');
    await page.click('button:has-text("Create Task")');

    await page.waitForTimeout(500);

    // Should display correctly with proper escaping
    await expect(page.getByText(/Task with.*quotes/)).toBeVisible();
  });
});
