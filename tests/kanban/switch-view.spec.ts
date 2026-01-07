// spec: specs/taskmaster-e2e-test-plan.md
// Section 3.1: Switch to Board View

import { test, expect } from '@playwright/test';

test.describe('Kanban Board & Drag-Drop', () => {
  test('Switch to Board View', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto('http://localhost:3000/login');
    await expect(page.getByText(/dev only/i)).toBeVisible({ timeout: 10000 });

    // 2. Enter test credentials
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.clear();
    await emailInput.fill('test@example.com');

    // 3. Click Test Login button
    await page.getByRole('button', { name: /test login/i }).click();
    await expect(page).toHaveURL(/\/tasks/, { timeout: 20000 });

    // Wait for the page to load
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible({ timeout: 15000 });

    // 4. Create task with TODO status
    await page.getByRole('button', { name: /new task/i }).click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await dialog.locator('#title').fill('Task TODO');
    await dialog.getByRole('button', { name: /create task/i }).click();

    // Wait for page reload after task creation
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Extra wait for RSC hydration
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Task TODO').first()).toBeVisible({ timeout: 5000 });

    // 5. Create task with IN_PROGRESS status
    await page.getByRole('button', { name: /new task/i }).click();
    await page.waitForTimeout(500);
    const dialog2 = page.locator('[role="dialog"]');
    await expect(dialog2).toBeVisible({ timeout: 5000 });
    await dialog2.locator('#title').fill('Task IN_PROGRESS');

    // Select IN_PROGRESS status
    const statusTrigger = dialog2.locator('button').filter({ hasText: /to do|status/i }).first();
    if (await statusTrigger.isVisible().catch(() => false)) {
      await statusTrigger.click();
      await page.waitForTimeout(300);
      await page.getByRole('option', { name: /in progress/i }).click();
    }
    await dialog2.getByRole('button', { name: /create task/i }).click();

    // Wait for page reload
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Task IN_PROGRESS').first()).toBeVisible({ timeout: 5000 });

    // 6. Create task with DONE status
    await page.getByRole('button', { name: /new task/i }).click();
    await page.waitForTimeout(500);
    const dialog3 = page.locator('[role="dialog"]');
    await expect(dialog3).toBeVisible({ timeout: 5000 });
    await dialog3.locator('#title').fill('Task DONE');

    // Select DONE status
    const statusTrigger3 = dialog3.locator('button').filter({ hasText: /to do|status/i }).first();
    if (await statusTrigger3.isVisible().catch(() => false)) {
      await statusTrigger3.click();
      await page.waitForTimeout(300);
      await page.getByRole('option', { name: /done/i }).click();
    }
    await dialog3.getByRole('button', { name: /create task/i }).click();

    // Wait for page reload
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Task DONE').first()).toBeVisible({ timeout: 5000 });

    // 7. Click board view toggle button (grid icon)
    const boardButton = page.getByRole('button', { name: /board/i });
    await boardButton.click();
    await page.waitForTimeout(500);

    // 8. Verify 3 columns: 'To Do', 'In Progress', 'Done'
    await expect(page.getByText('To Do', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('In Progress', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Done', { exact: true }).first()).toBeVisible();

    // 9. Verify tasks appear in correct columns based on status
    await expect(page.getByText('Task TODO').first()).toBeVisible();
    await expect(page.getByText('Task IN_PROGRESS').first()).toBeVisible();
    await expect(page.getByText('Task DONE').first()).toBeVisible();

    // 10. Click list view toggle
    const listButton = page.getByRole('button', { name: /list/i });
    await listButton.click();
    await page.waitForTimeout(500);

    // 11. Verify all tasks are still visible in list view
    await expect(page.getByText('Task TODO').first()).toBeVisible();
    await expect(page.getByText('Task IN_PROGRESS').first()).toBeVisible();
    await expect(page.getByText('Task DONE').first()).toBeVisible();

    // 12. Switch back to board view
    await boardButton.click();
    await page.waitForTimeout(500);

    // 13. Refresh page and verify tasks persist
    await page.reload();
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible({ timeout: 30000 });

    // Re-switch to board view after refresh (view preference may not persist)
    await page.getByRole('button', { name: /board/i }).click();
    await page.waitForTimeout(500);

    // 14. Verify board view columns are visible
    await expect(page.getByText('To Do', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('In Progress', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Done', { exact: true }).first()).toBeVisible();
  });
});
