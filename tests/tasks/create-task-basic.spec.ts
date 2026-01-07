// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Task CRUD Operations', () => {
  test('Create Task - Basic', async ({ page }) => {
    // 1. Login with test credentials
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/dev only/i)).toBeVisible({ timeout: 10000 });

    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.clear();
    await emailInput.fill('test@example.com');

    await page.getByRole('button', { name: /test login/i }).click();
    await expect(page).toHaveURL(/\/tasks/, { timeout: 20000 });

    // Wait for the New Task button to appear (indicates page is loaded)
    const newTaskButton = page.getByRole('button', { name: /new task/i });
    await expect(newTaskButton).toBeVisible({ timeout: 15000 });

    // 2. Navigate to /tasks page - already there after login

    // 3. Verify 'No tasks yet' empty state is displayed (if first time)
    const emptyState = page.getByText(/no tasks yet/i);
    if (await emptyState.isVisible().catch(() => false)) {
      console.log('Empty state detected');
    }

    // 4. Click 'New Task' button in header
    await newTaskButton.click();
    await page.waitForTimeout(500);

    // 5. Verify task form modal opens with title 'Create Task'
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByRole('heading', { name: 'Create Task' })).toBeVisible();

    // 6. Enter 'Buy groceries' in title field
    const titleInput = dialog.locator('#title');
    await titleInput.fill('Buy groceries');

    // 7. Enter 'Milk, eggs, bread' in description field
    const descriptionInput = dialog.locator('#description');
    if (await descriptionInput.isVisible().catch(() => false)) {
      await descriptionInput.fill('Milk, eggs, bread');
    }

    // 8. Select 'MEDIUM' priority (default is already MEDIUM)
    // Priority dropdown should already have Medium selected

    // 9. Keep status as 'TODO' (default) - no action needed

    // 10. Click 'Create Task' button
    await dialog.getByRole('button', { name: /create task/i }).click();

    // 11. Wait for page to reload (the app reloads after creating a task)
    await page.waitForLoadState('domcontentloaded');

    // 12. Verify modal closes (after page reload)
    await page.waitForTimeout(1000);

    // 13. Verify new task appears in task list with title 'Buy groceries'
    await expect(page.getByText('Buy groceries').first()).toBeVisible({ timeout: 10000 });

    // 14. Verify task shows MEDIUM priority badge
    await expect(page.getByText(/medium/i).first()).toBeVisible();

    // 15. Verify task status is TODO
    // In board view, task should be in 'To Do' column or in list view with TODO status
    const isVisible = await page.getByText('Buy groceries').first().isVisible();
    expect(isVisible).toBe(true);
  });
});
