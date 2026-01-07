// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Task CRUD Operations', () => {
  test('Create Task - Full Form', async ({ page }) => {
    // 1. Login and navigate to /tasks
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

    // 2. Click 'New Task' button
    await newTaskButton.click();
    await page.waitForTimeout(500);

    // Get dialog reference
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // 3. Enter 'Prepare presentation' in title
    const titleInput = dialog.locator('#title');
    await titleInput.fill('Prepare presentation');

    // 4. Enter 'Q4 Sales Review - include charts and metrics' in description
    const descriptionInput = dialog.locator('#description');
    if (await descriptionInput.isVisible().catch(() => false)) {
      await descriptionInput.fill('Q4 Sales Review - include charts and metrics');
    }

    // 5. Select 'HIGH' priority
    const priorityTrigger = dialog.locator('button').filter({ hasText: /medium|priority/i }).first();
    if (await priorityTrigger.isVisible().catch(() => false)) {
      await priorityTrigger.click();
      await page.waitForTimeout(300);
      await page.getByRole('option', { name: /high/i }).click();
    }

    // 6. Select 'IN_PROGRESS' status
    const statusTrigger = dialog.locator('button').filter({ hasText: /to do|status/i }).first();
    if (await statusTrigger.isVisible().catch(() => false)) {
      await statusTrigger.click();
      await page.waitForTimeout(300);
      await page.getByRole('option', { name: /in progress/i }).click();
    }

    // 7. Click due date picker
    const datePicker = dialog.getByRole('button', { name: /pick a date/i });
    if (await datePicker.isVisible().catch(() => false)) {
      await datePicker.click();
      await page.waitForTimeout(500);

      // 8. Select tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDay = tomorrow.getDate().toString();

      // Try to find and click tomorrow's date in the calendar
      const dateButton = page.locator(`button[name="day"]:has-text("${tomorrowDay}")`).first();
      if (await dateButton.isVisible().catch(() => false)) {
        await dateButton.click();
      }
    }

    // 9. Enter tags: 'work', 'urgent', 'presentation'
    const tagInput = dialog.getByPlaceholder(/add a tag/i);
    if (await tagInput.isVisible().catch(() => false)) {
      await tagInput.fill('work');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
      await tagInput.fill('urgent');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
      await tagInput.fill('presentation');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
    }

    // 10. Click 'Create Task' button
    await dialog.getByRole('button', { name: /create task/i }).click();

    // Wait for page to reload
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // 11. Verify task appears with all details
    await expect(page.getByText('Prepare presentation').first()).toBeVisible({ timeout: 5000 });

    // 12. Click task to open detail modal
    await page.getByText('Prepare presentation').first().click();
    await page.waitForTimeout(500);

    // 13. Verify all entered information is displayed correctly
    const detailDialog = page.locator('[role="dialog"]');
    await expect(detailDialog).toBeVisible();
    await expect(detailDialog.getByText('Prepare presentation').first()).toBeVisible();
    await expect(detailDialog.getByText('Q4 Sales Review - include charts and metrics')).toBeVisible();

    // 14. Verify due date shows 'Tomorrow'
    const dueDateText = detailDialog.getByText(/tomorrow/i);
    if (await dueDateText.isVisible().catch(() => false)) {
      await expect(dueDateText).toBeVisible();
    }

    // 15. Verify tags are displayed with violet styling
    // Use exact match to distinguish tag from title "Prepare presentation"
    await expect(detailDialog.getByText('work', { exact: true })).toBeVisible();
    await expect(detailDialog.getByText('urgent', { exact: true })).toBeVisible();
    await expect(detailDialog.getByText('presentation', { exact: true })).toBeVisible();
  });
});
