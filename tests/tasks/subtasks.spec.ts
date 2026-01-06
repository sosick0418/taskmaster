import { test, expect } from '@playwright/test';

test.describe('Task CRUD - Subtasks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByRole('button', { name: /test login/i }).click();
    await page.waitForURL('/tasks');

    // Create a parent task
    await page.getByRole('button', { name: /new task/i }).click();
    await page.getByLabel(/title/i).fill('Parent Task');
    await page.getByRole('button', { name: /create task/i }).click();
    await page.waitForTimeout(500);
  });

  test('add subtask to task', async ({ page }) => {
    // Open task detail
    await page.getByText('Parent Task').click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Add subtask
    const addSubtaskButton = modal.getByRole('button', { name: /add subtask/i });
    await addSubtaskButton.click();

    const subtaskInput = modal.getByPlaceholder(/subtask|add item/i);
    await subtaskInput.fill('First subtask');
    await subtaskInput.press('Enter');

    // Verify subtask appears
    await expect(modal.getByText('First subtask')).toBeVisible();
  });

  test('complete subtask updates progress', async ({ page }) => {
    // Open task and add subtasks
    await page.getByText('Parent Task').click();

    const modal = page.locator('[role="dialog"]');
    const addSubtaskButton = modal.getByRole('button', { name: /add subtask/i });
    await addSubtaskButton.click();

    const subtaskInput = modal.getByPlaceholder(/subtask|add item/i);
    await subtaskInput.fill('Subtask 1');
    await subtaskInput.press('Enter');

    await page.waitForTimeout(200);

    // Complete the subtask
    const subtaskCheckbox = modal.locator('[role="checkbox"]').last();
    await subtaskCheckbox.click();

    // Progress should update
    await expect(modal.getByText(/1.*1|100%|complete/i)).toBeVisible();
  });

  test('delete subtask', async ({ page }) => {
    // Open task and add subtask
    await page.getByText('Parent Task').click();

    const modal = page.locator('[role="dialog"]');
    const addSubtaskButton = modal.getByRole('button', { name: /add subtask/i });
    await addSubtaskButton.click();

    const subtaskInput = modal.getByPlaceholder(/subtask|add item/i);
    await subtaskInput.fill('Subtask to delete');
    await subtaskInput.press('Enter');

    await page.waitForTimeout(200);

    // Delete subtask
    const deleteSubtaskButton = modal.getByRole('button', { name: /delete.*subtask|remove/i }).first();
    if (await deleteSubtaskButton.isVisible()) {
      await deleteSubtaskButton.click();
    } else {
      // Try hover to reveal delete button
      const subtaskItem = modal.getByText('Subtask to delete');
      await subtaskItem.hover();
      await modal.getByRole('button', { name: /delete|remove/i }).last().click();
    }

    await page.waitForTimeout(200);

    // Subtask should be removed
    await expect(modal.getByText('Subtask to delete')).not.toBeVisible();
  });

  test('multiple subtasks show progress bar', async ({ page }) => {
    await page.getByText('Parent Task').click();

    const modal = page.locator('[role="dialog"]');

    // Add multiple subtasks
    const addSubtaskButton = modal.getByRole('button', { name: /add subtask/i });

    for (const name of ['Subtask 1', 'Subtask 2', 'Subtask 3']) {
      await addSubtaskButton.click();
      const subtaskInput = modal.getByPlaceholder(/subtask|add item/i);
      await subtaskInput.fill(name);
      await subtaskInput.press('Enter');
      await page.waitForTimeout(200);
    }

    // Progress bar should be visible
    const progressBar = modal.locator('[role="progressbar"], [class*="progress"]');
    await expect(progressBar.first()).toBeVisible();

    // Complete one subtask
    const firstCheckbox = modal.locator('[role="checkbox"]').nth(1);
    await firstCheckbox.click();

    // Progress should show 1/3 or 33%
    await expect(modal.getByText(/1.*3|33%/i)).toBeVisible();
  });
});
