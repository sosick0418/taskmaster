// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Edge Cases - Concurrent Updates', () => {
  test('two tabs can view same task list', async ({ page, context }) => {
    // Login in first tab
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');

    // Open second tab
    const page2 = await context.newPage();
    await page2.goto('http://localhost:3000/tasks');

    // Both tabs should show tasks page
    await expect(page.getByRole('heading', { name: /tasks/i })).toBeVisible();
    await expect(page2.getByRole('heading', { name: /tasks/i })).toBeVisible();
  });

  test('task created in one tab appears in another after refresh', async ({ page, context }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');

    // Open second tab
    const page2 = await context.newPage();
    await page2.goto('http://localhost:3000/tasks');

    // Create task in first tab
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('Cross Tab Task');
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(500);

    // Verify in first tab
    await expect(page.getByText('Cross Tab Task')).toBeVisible();

    // Refresh second tab
    await page2.reload();
    await page2.waitForLoadState('networkidle');

    // Should see task in second tab
    await expect(page2.getByText('Cross Tab Task')).toBeVisible();
  });

  test('rapid task creations are handled', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');

    // Rapidly create multiple tasks
    for (let i = 1; i <= 3; i++) {
      await page.click('button:has-text("New Task")');
      await page.waitForTimeout(300);
      const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
      await titleInput.fill(`Rapid Task ${i}`);
      await page.click('button:has-text("Create Task")');
      await page.waitForTimeout(300);
    }

    // Wait for all to complete
    await page.waitForTimeout(1000);

    // All tasks should exist
    await expect(page.getByText('Rapid Task 1')).toBeVisible();
    await expect(page.getByText('Rapid Task 2')).toBeVisible();
    await expect(page.getByText('Rapid Task 3')).toBeVisible();
  });

  test('editing same task from two tabs - last write wins', async ({ page, context }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');

    // Create task
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('Concurrent Edit Task');
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(500);

    // Open second tab
    const page2 = await context.newPage();
    await page2.goto('http://localhost:3000/tasks');
    await page2.waitForTimeout(500);

    // Edit from second tab
    await page2.click('text="Concurrent Edit Task"');
    await page2.waitForTimeout(500);
    const editButton = page2.getByRole('button', { name: /edit/i });
    if (await editButton.isVisible()) {
      await editButton.click();
      const editTitleInput = page2.locator('input[name="title"]').first();
      await editTitleInput.clear();
      await editTitleInput.fill('Tab 2 Edit');
      await page2.click('button:has-text("Save")');
      await page2.waitForTimeout(500);
    }

    // Refresh first tab
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show last edit
    await expect(page.getByText('Tab 2 Edit')).toBeVisible();
  });
});
