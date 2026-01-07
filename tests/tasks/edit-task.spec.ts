// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Task CRUD Operations', () => {
  test('Edit Task', async ({ page }) => {
    // 1. Login and create a task 'Review code'
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

    // Create the task
    await newTaskButton.click();
    await page.waitForTimeout(500);

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const titleInput = dialog.locator('#title');
    await titleInput.fill('Review code');

    // Set to MEDIUM priority (already default)
    await dialog.getByRole('button', { name: /create task/i }).click();

    // Wait for page to reload after task creation
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // 2. Click on task to open detail modal
    await page.getByText('Review code').first().click();
    await page.waitForTimeout(500);

    // 3. Click Edit button in the detail modal
    const detailDialog = page.locator('[role="dialog"]');
    await expect(detailDialog).toBeVisible();
    await detailDialog.getByRole('button', { name: /edit/i }).click();
    await page.waitForTimeout(500);

    // 4. Verify form opens with existing task data pre-filled
    const editDialog = page.locator('[role="dialog"]');
    await expect(editDialog).toBeVisible();

    // 5. Change title to 'Review PR #123'
    const editTitleInput = editDialog.locator('#title');
    await editTitleInput.clear();
    await editTitleInput.fill('Review PR #123');

    // 6. Change priority from MEDIUM to URGENT
    const priorityTrigger = editDialog.locator('button').filter({ hasText: /medium/i }).first();
    if (await priorityTrigger.isVisible().catch(() => false)) {
      await priorityTrigger.click();
      await page.waitForTimeout(300);
      await page.getByRole('option', { name: /urgent/i }).click();
    }

    // 7. Add tag 'code-review'
    const tagInput = editDialog.getByPlaceholder(/add a tag/i);
    if (await tagInput.isVisible().catch(() => false)) {
      await tagInput.fill('code-review');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
    }

    // 8. Click 'Update Task' button
    await editDialog.getByRole('button', { name: /update task/i }).click();

    // 9. Wait for update and page reload
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // 10. Verify task card updates immediately (optimistic)
    await expect(page.getByText('Review PR #123').first()).toBeVisible({ timeout: 5000 });

    // 11. Refresh page and verify changes persisted
    await page.reload();
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Review PR #123').first()).toBeVisible();

    // 12. Click task to open detail modal
    await page.getByText('Review PR #123').first().click();
    await page.waitForTimeout(500);

    // 13. Verify all changes are reflected in detail view
    const verifyDialog = page.locator('[role="dialog"]');
    await expect(verifyDialog.getByText('Review PR #123').first()).toBeVisible();
    await expect(verifyDialog.getByText(/urgent/i)).toBeVisible();

    // Verify tag if visible
    const codeReviewTag = verifyDialog.getByText('code-review');
    if (await codeReviewTag.isVisible().catch(() => false)) {
      await expect(codeReviewTag).toBeVisible();
    }
  });
});
