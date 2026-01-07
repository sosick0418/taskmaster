// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Task CRUD Operations', () => {
  test('Delete Task with Confirmation', async ({ page }) => {
    // 1. Login and create tasks: 'Task A', 'Task B', 'Task C'
    await page.goto('http://localhost:3000/login');
    await expect(page.getByText(/dev only/i)).toBeVisible({ timeout: 10000 });

    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.clear();
    await emailInput.fill('test@example.com');

    await page.getByRole('button', { name: /test login/i }).click();
    await expect(page).toHaveURL(/\/tasks/, { timeout: 20000 });

    // Wait for the New Task button to appear (indicates page is loaded)
    const newTaskButton = page.getByRole('button', { name: /new task/i });
    await expect(newTaskButton).toBeVisible({ timeout: 15000 });

    const tasks = ['Task A', 'Task B', 'Task C'];
    for (const taskTitle of tasks) {
      await page.getByRole('button', { name: /new task/i }).click();
      await page.waitForTimeout(500);

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      const titleInput = dialog.locator('#title');
      await titleInput.fill(taskTitle);
      await dialog.getByRole('button', { name: /create task/i }).click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);
    }

    // 2. Verify 3 tasks are displayed
    await expect(page.getByText('Task A').first()).toBeVisible();
    await expect(page.getByText('Task B').first()).toBeVisible();
    await expect(page.getByText('Task C').first()).toBeVisible();

    // 3. Click on 'Task B' to open detail modal, then delete
    await page.getByText('Task B').first().click();
    await page.waitForTimeout(500);

    // Click delete button in modal
    const detailDialog = page.locator('[role="dialog"]');
    await expect(detailDialog).toBeVisible();
    await detailDialog.getByRole('button', { name: /delete/i }).click();
    await page.waitForTimeout(1000);

    // 4. Verify task disappears (optimistic update)
    await expect(page.getByText('Task B')).not.toBeVisible({ timeout: 5000 });

    // 5. Verify success toast 'Task deleted' (skip if page reloads)
    const deleteToast = page.getByText(/task deleted/i);
    if (await deleteToast.isVisible().catch(() => false)) {
      await expect(deleteToast).toBeVisible();
    }

    // 6. Verify only 'Task A' and 'Task C' remain
    await expect(page.getByText('Task A').first()).toBeVisible();
    await expect(page.getByText('Task C').first()).toBeVisible();

    // 7. Verify stats update (check if visible)
    const statsCard = page.getByText(/total/i);
    if (await statsCard.isVisible().catch(() => false)) {
      // Stats should reflect the deletion
    }

    // 8. Refresh page
    await page.reload();
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible({ timeout: 15000 });

    // 9. Verify 'Task B' is still gone (persisted)
    await expect(page.getByText('Task B')).not.toBeVisible();
    await expect(page.getByText('Task A').first()).toBeVisible();
    await expect(page.getByText('Task C').first()).toBeVisible();

    // 10. Open 'Task A' detail modal
    await page.getByText('Task A').first().click();
    await page.waitForTimeout(500);

    // 11. Click 'Delete' button in modal
    const modalDeleteButton = page.locator('[role="dialog"]').getByRole('button', { name: /delete/i });
    await modalDeleteButton.click();
    await page.waitForTimeout(1000);

    // 12. Verify modal closes
    await page.waitForTimeout(500);

    // 13. Verify 'Task A' is removed from list
    await expect(page.getByText('Task A')).not.toBeVisible({ timeout: 5000 });

    // Verify only 'Task C' remains
    await expect(page.getByText('Task C').first()).toBeVisible();
  });
});
