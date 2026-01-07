// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Task CRUD Operations', () => {
  test('Task with Subtasks', async ({ page }) => {
    // 1. Login and create task 'Website Redesign'
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

    // Create the main task
    await newTaskButton.click();
    await page.waitForTimeout(500);

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const titleInput = dialog.locator('#title');
    await titleInput.fill('Website Redesign');
    await dialog.getByRole('button', { name: /create task/i }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // 2. Click task to open detail modal
    await page.getByText('Website Redesign').first().click();
    await page.waitForTimeout(500);

    // 3. Find the 'Add subtask' button in the detail modal
    const detailDialog = page.locator('[role="dialog"]');
    await expect(detailDialog).toBeVisible();

    const addSubtaskButton = detailDialog.getByRole('button', { name: /add subtask/i });
    await expect(addSubtaskButton).toBeVisible({ timeout: 5000 });
    await addSubtaskButton.click();

    // 4. Type 'Design mockups' and press Enter
    const subtaskInput = detailDialog.getByPlaceholder(/add subtask/i);
    await expect(subtaskInput).toBeVisible();
    await subtaskInput.fill('Design mockups');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // 5. Add second subtask: 'Get feedback'
    // Wait for first subtask to appear before adding next
    await expect(detailDialog.getByText('Design mockups').first()).toBeVisible({ timeout: 5000 });
    await addSubtaskButton.click();
    const subtaskInput2 = detailDialog.getByPlaceholder(/add subtask/i);
    await expect(subtaskInput2).toBeVisible({ timeout: 3000 });
    await subtaskInput2.fill('Get feedback');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // 6. Add third subtask: 'Implement changes'
    // Wait for second subtask to appear before adding next
    await expect(detailDialog.getByText('Get feedback').first()).toBeVisible({ timeout: 5000 });
    await addSubtaskButton.click();
    const subtaskInput3 = detailDialog.getByPlaceholder(/add subtask/i);
    await expect(subtaskInput3).toBeVisible({ timeout: 3000 });
    await subtaskInput3.fill('Implement changes');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // 7. Verify all 3 subtasks appear in list
    await expect(detailDialog.getByText('Design mockups').first()).toBeVisible({ timeout: 5000 });
    await expect(detailDialog.getByText('Get feedback').first()).toBeVisible({ timeout: 5000 });
    await expect(detailDialog.getByText('Implement changes').first()).toBeVisible({ timeout: 5000 });

    // 8. Verify progress shows 0/3 completed
    await expect(detailDialog.getByText(/0.*of.*3|0\/3/i)).toBeVisible();

    // 9. Click checkbox on 'Design mockups' subtask
    const firstSubtaskItem = detailDialog.locator('text="Design mockups"').locator('xpath=ancestor::*[1]').first();
    const firstSubtaskCheckbox = firstSubtaskItem.locator('button').first();
    await firstSubtaskCheckbox.click();
    await page.waitForTimeout(500);

    // 10. Verify progress updates to 1/3
    await expect(detailDialog.getByText(/1.*of.*3|1\/3/i)).toBeVisible({ timeout: 3000 });

    // 11. Complete remaining subtasks
    const secondSubtaskItem = detailDialog.locator('text="Get feedback"').locator('xpath=ancestor::*[1]').first();
    const secondSubtaskCheckbox = secondSubtaskItem.locator('button').first();
    await secondSubtaskCheckbox.click();
    await page.waitForTimeout(500);

    const thirdSubtaskItem = detailDialog.locator('text="Implement changes"').locator('xpath=ancestor::*[1]').first();
    const thirdSubtaskCheckbox = thirdSubtaskItem.locator('button').first();
    await thirdSubtaskCheckbox.click();
    await page.waitForTimeout(500);

    // 12. Verify progress shows 3/3 (100%)
    await expect(detailDialog.getByText(/3.*of.*3|3\/3/i)).toBeVisible({ timeout: 3000 });

    // 13. Close and reopen modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // 14. Verify subtasks persist correctly
    await page.getByText('Website Redesign').first().click();
    await page.waitForTimeout(500);

    const reopenedDialog = page.locator('[role="dialog"]');
    await expect(reopenedDialog.getByText('Design mockups').first()).toBeVisible();
    await expect(reopenedDialog.getByText('Get feedback').first()).toBeVisible();
    await expect(reopenedDialog.getByText('Implement changes').first()).toBeVisible();
    await expect(reopenedDialog.getByText(/3.*of.*3|3\/3/i)).toBeVisible();
  });
});
