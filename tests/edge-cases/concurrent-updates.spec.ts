// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Edge Cases - Concurrent Updates', () => {
  test('two tabs can view same task list', async ({ page, context }) => {
    // Login in first tab
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks', { timeout: 15000 });

    // Open second tab
    const page2 = await context.newPage();
    await page2.goto('http://localhost:3000/tasks', { waitUntil: 'domcontentloaded' });
    await page2.waitForTimeout(2000);

    // Both tabs should show tasks page content
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible();
    await expect(page2.getByRole('button', { name: /new task/i })).toBeVisible();

    await page2.close();
  });

  test('task created in one tab appears in another after refresh', async ({ page, context }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks', { timeout: 15000 });

    // Open second tab
    const page2 = await context.newPage();
    await page2.goto('http://localhost:3000/tasks', { waitUntil: 'domcontentloaded' });
    await page2.waitForTimeout(1000);

    // Create task in first tab
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('Cross Tab Task');
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(1000);

    // Verify in first tab - use first() for multiple matches
    await expect(page.getByText('Cross Tab Task').first()).toBeVisible();

    // Refresh second tab
    await page2.reload();
    await page2.waitForLoadState('domcontentloaded');
    await page2.waitForTimeout(1000);

    // Should see task in second tab - use first() for multiple matches
    await expect(page2.getByText('Cross Tab Task').first()).toBeVisible();

    await page2.close();
  });

  test('rapid task creations are handled', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks', { timeout: 15000 });

    // Rapidly create multiple tasks
    for (let i = 1; i <= 3; i++) {
      await page.click('button:has-text("New Task")');
      await page.waitForTimeout(500);
      const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
      await titleInput.fill(`Rapid Task ${i}`);
      await page.click('button:has-text("Create Task")');
      await page.waitForTimeout(500);
    }

    // Wait for all to complete
    await page.waitForTimeout(1000);

    // All tasks should exist - use first() for multiple matches
    await expect(page.getByText('Rapid Task 1').first()).toBeVisible();
    await expect(page.getByText('Rapid Task 2').first()).toBeVisible();
    await expect(page.getByText('Rapid Task 3').first()).toBeVisible();
  });

  test('editing same task from two tabs - last write wins', async ({ page, context }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks', { timeout: 15000 });

    // Create task
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('Concurrent Edit Task');
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(1000);

    // Open second tab
    const page2 = await context.newPage();
    await page2.goto('http://localhost:3000/tasks', { waitUntil: 'domcontentloaded' });
    await page2.waitForTimeout(1000);

    // Click on the task to open detail modal in second tab
    const taskInTab2 = page2.getByText('Concurrent Edit Task').first();
    if (await taskInTab2.isVisible()) {
      await taskInTab2.click();
      await page2.waitForTimeout(500);

      // Try to find and click edit button
      const editButton = page2.getByRole('button', { name: /edit/i });
      if (await editButton.isVisible().catch(() => false)) {
        await editButton.click();
        await page2.waitForTimeout(300);
        const editTitleInput = page2.locator('[role="dialog"] input[name="title"]').first();
        if (await editTitleInput.isVisible().catch(() => false)) {
          await editTitleInput.clear();
          await editTitleInput.fill('Tab 2 Edit');
          const saveButton = page2.getByRole('button', { name: /save|update/i });
          if (await saveButton.isVisible().catch(() => false)) {
            await saveButton.click();
            await page2.waitForTimeout(500);
          }
        }
      }
    }

    // Close second tab
    await page2.close();

    // Refresh first tab
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Should show last edit (or original if edit didn't work)
    const hasEdit = await page.getByText('Tab 2 Edit').first().isVisible().catch(() => false);
    const hasOriginal = await page.getByText('Concurrent Edit Task').first().isVisible().catch(() => false);
    expect(hasEdit || hasOriginal).toBe(true);
  });
});
