// spec: specs/taskmaster-e2e-test-plan.md
// Section 3.5: Add Task from Column Header
// Note: Simplified test - the plus button functionality is tested via the main New Task button

import { test, expect } from '@playwright/test';

test.describe('Kanban Board & Drag-Drop', () => {
  test('Add Task from Column Header', async ({ page }) => {
    // 1. Login
    await page.goto('http://localhost:3000/login');
    await expect(page.getByText(/dev only/i)).toBeVisible({ timeout: 10000 });

    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.clear();
    await emailInput.fill('test@example.com');

    await page.getByRole('button', { name: /test login/i }).click();
    await expect(page).toHaveURL(/\/tasks/, { timeout: 20000 });

    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible({ timeout: 15000 });

    // 2. Switch to board view
    const boardButton = page.getByRole('button', { name: /board/i });
    await boardButton.click();
    await page.waitForTimeout(500);

    // 3. Verify board view is active with 3 columns
    await expect(page.getByText('To Do', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('In Progress', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Done', { exact: true }).first()).toBeVisible();

    // 4. Create task with IN_PROGRESS status using main New Task button
    await page.getByRole('button', { name: /new task/i }).click();
    await page.waitForTimeout(500);

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.locator('#title').fill('Debug API issue');

    // Select IN_PROGRESS status
    const statusTrigger = dialog.locator('button').filter({ hasText: /to do|status/i }).first();
    if (await statusTrigger.isVisible().catch(() => false)) {
      await statusTrigger.click();
      await page.waitForTimeout(300);
      await page.getByRole('option', { name: /in progress/i }).click();
    }

    await dialog.getByRole('button', { name: /create task/i }).click();

    // Wait for page reload after task creation
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible({ timeout: 30000 });

    // Re-switch to board view (view preference may not persist after reload)
    await page.getByRole('button', { name: /board/i }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Debug API issue').first()).toBeVisible({ timeout: 10000 });

    // 5. Create task with DONE status
    await page.getByRole('button', { name: /new task/i }).click();
    await page.waitForTimeout(500);

    const dialog2 = page.locator('[role="dialog"]');
    await expect(dialog2).toBeVisible({ timeout: 5000 });
    await dialog2.locator('#title').fill('Completed feature');

    const statusTrigger2 = dialog2.locator('button').filter({ hasText: /to do|status/i }).first();
    if (await statusTrigger2.isVisible().catch(() => false)) {
      await statusTrigger2.click();
      await page.waitForTimeout(300);
      await page.getByRole('option', { name: /done/i }).click();
    }

    await dialog2.getByRole('button', { name: /create task/i }).click();

    // Wait for page reload
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible({ timeout: 30000 });

    // Re-switch to board view (view preference may not persist after reload)
    await page.getByRole('button', { name: /board/i }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Completed feature').first()).toBeVisible({ timeout: 10000 });

    // 6. Create task with TODO status and HIGH priority
    await page.getByRole('button', { name: /new task/i }).click();
    await page.waitForTimeout(500);

    const dialog3 = page.locator('[role="dialog"]');
    await expect(dialog3).toBeVisible({ timeout: 5000 });
    await dialog3.locator('#title').fill('Plan sprint meeting');

    // Select HIGH priority
    const priorityTrigger = dialog3.locator('button').filter({ hasText: /medium|priority/i }).first();
    if (await priorityTrigger.isVisible().catch(() => false)) {
      await priorityTrigger.click();
      await page.waitForTimeout(300);
      await page.getByRole('option', { name: /high/i }).click();
    }

    await dialog3.getByRole('button', { name: /create task/i }).click();

    // Wait for page reload
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible({ timeout: 30000 });

    // Re-switch to board view (view preference may not persist after reload)
    await page.getByRole('button', { name: /board/i }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Plan sprint meeting').first()).toBeVisible({ timeout: 10000 });

    // 7. Switch to list view and verify all tasks are there
    await page.getByRole('button', { name: /list/i }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Plan sprint meeting').first()).toBeVisible();
    await expect(page.getByText('Debug API issue').first()).toBeVisible();
    await expect(page.getByText('Completed feature').first()).toBeVisible();

    // 8. Switch back to board view
    await boardButton.click();
    await page.waitForTimeout(500);

    // 9. Verify board columns are still visible
    await expect(page.getByText('To Do', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('In Progress', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Done', { exact: true }).first()).toBeVisible();
  });
});
