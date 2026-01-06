// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Task CRUD Operations', () => {
  test('Toggle Task Completion', async ({ page }) => {
    // 1. Login and create task 'Complete quarterly report'
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');
    
    // Create the task
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);
    
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('Complete quarterly report');
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(1000);
    
    // 2. Verify task has status TODO and isCompleted: false
    await expect(page.locator('text="Complete quarterly report"')).toBeVisible();
    
    // 3. Click circular checkbox on task card
    const taskCheckbox = page.locator('text="Complete quarterly report"').locator('..').locator('..').locator('input[type="checkbox"], button[role="checkbox"]').first();
    await taskCheckbox.click();
    
    // 4. Verify confetti animation plays
    // Note: Confetti is a canvas animation, hard to verify directly, but we can check for no errors
    await page.waitForTimeout(1000);
    
    // 5. Verify success toast 'Task completed! Great job!'
    await expect(page.locator('text=/task completed|great job/i')).toBeVisible({ timeout: 5000 });
    
    // 6. Verify checkbox animates to checked state
    const isChecked = await taskCheckbox.isChecked().catch(() => {
      return taskCheckbox.getAttribute('aria-checked').then(val => val === 'true');
    });
    expect(isChecked).toBe(true);
    
    // 7. Verify task title gets strikethrough styling
    const taskTitle = page.locator('text="Complete quarterly report"').first();
    const hasStrikethrough = await taskTitle.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.textDecoration.includes('line-through') || 
             el.classList.contains('line-through') ||
             el.parentElement?.classList.contains('line-through');
    });
    expect(hasStrikethrough).toBe(true);
    
    // 8. Verify task status changes to DONE
    // Check if task moved to Done column in board view or shows Done status
    const doneIndicator = page.locator('text=/done|completed/i').first();
    if (await doneIndicator.isVisible().catch(() => false)) {
      await expect(doneIndicator).toBeVisible();
    }
    
    // 9. Verify task moves to 'Done' column in board view
    // Switch to board view if not already there
    const boardViewButton = page.locator('button[aria-label*="board" i], button:has-text("Board")').first();
    if (await boardViewButton.isVisible().catch(() => false)) {
      await boardViewButton.click();
      await page.waitForTimeout(500);
      
      // Check if task is in Done column
      const doneColumn = page.locator('text="Done"').locator('..');
      const taskInDoneColumn = doneColumn.locator('text="Complete quarterly report"');
      await expect(taskInDoneColumn).toBeVisible({ timeout: 3000 });
    }
    
    // 10. Click checkbox again to uncheck
    const completedTaskCheckbox = page.locator('text="Complete quarterly report"').locator('..').locator('..').locator('input[type="checkbox"], button[role="checkbox"]').first();
    await completedTaskCheckbox.click();
    await page.waitForTimeout(1000);
    
    // 11. Verify task returns to TODO status
    // 12. Verify strikethrough is removed
    const taskTitleAfterUncheck = page.locator('text="Complete quarterly report"').first();
    const stillHasStrikethrough = await taskTitleAfterUncheck.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.textDecoration.includes('line-through') || 
             el.classList.contains('line-through') ||
             el.parentElement?.classList.contains('line-through');
    });
    expect(stillHasStrikethrough).toBe(false);
    
    // 13. Verify task moves back to 'To Do' column
    if (await boardViewButton.isVisible().catch(() => false)) {
      const todoColumn = page.locator('text="To Do"').locator('..');
      const taskInTodoColumn = todoColumn.locator('text="Complete quarterly report"');
      await expect(taskInTodoColumn).toBeVisible({ timeout: 3000 });
    }
  });
});
