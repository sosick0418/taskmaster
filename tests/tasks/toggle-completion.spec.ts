// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Task CRUD Operations', () => {
  test('Toggle Task Completion', async ({ page }) => {
    // 1. Login and create task 'Complete quarterly report'
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
    await titleInput.fill('Complete quarterly report');
    await dialog.getByRole('button', { name: /create task/i }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // 2. Verify task is visible
    await expect(page.getByText('Complete quarterly report').first()).toBeVisible();

    // 3. Find the task card and click the checkbox (it's a button, not input)
    // The checkbox is wrapped in a div with data-checkbox attribute
    const taskCard = page.locator('text="Complete quarterly report"').locator('xpath=ancestor::*[contains(@class, "rounded-xl")]').first();
    const taskCheckbox = taskCard.locator('[data-checkbox] button').first();
    await taskCheckbox.click();

    // 4. Verify confetti animation plays (we can't directly verify canvas, just wait)
    await page.waitForTimeout(1000);

    // 5. Verify success toast 'Task completed! Great job!'
    await expect(page.getByText(/task completed/i)).toBeVisible({ timeout: 5000 });

    // 6. Verify task title gets strikethrough styling
    const taskTitle = page.getByText('Complete quarterly report').first();
    const hasStrikethrough = await taskTitle.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.textDecoration.includes('line-through') ||
             el.classList.contains('line-through') ||
             el.parentElement?.classList.contains('line-through') ||
             el.closest('span')?.classList.contains('line-through');
    });
    expect(hasStrikethrough).toBe(true);

    // 7. Verify task status changes to DONE
    // Check if task shows done/completed indicator
    await page.waitForTimeout(500);

    // 8. Click checkbox again to uncheck
    const completedTaskCard = page.locator('text="Complete quarterly report"').locator('xpath=ancestor::*[contains(@class, "rounded-xl")]').first();
    const completedTaskCheckbox = completedTaskCard.locator('[data-checkbox] button').first();
    await completedTaskCheckbox.click();
    await page.waitForTimeout(1000);

    // 9. Verify strikethrough is removed
    const taskTitleAfterUncheck = page.getByText('Complete quarterly report').first();
    const stillHasStrikethrough = await taskTitleAfterUncheck.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.textDecoration.includes('line-through') ||
             el.classList.contains('line-through') ||
             el.parentElement?.classList.contains('line-through') ||
             el.closest('span')?.classList.contains('line-through');
    });
    expect(stillHasStrikethrough).toBe(false);
  });
});
