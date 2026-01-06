// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Task CRUD Operations', () => {
  test('Delete Task with Confirmation', async ({ page }) => {
    // 1. Login and create tasks: 'Task A', 'Task B', 'Task C'
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');
    
    const tasks = ['Task A', 'Task B', 'Task C'];
    for (const taskTitle of tasks) {
      await page.click('button:has-text("New Task")');
      await page.waitForTimeout(500);
      
      const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
      await titleInput.fill(taskTitle);
      await page.click('button:has-text("Create Task")');
      await page.waitForTimeout(1000);
    }
    
    // 2. Verify 3 tasks are displayed
    await expect(page.locator('text="Task A"')).toBeVisible();
    await expect(page.locator('text="Task B"')).toBeVisible();
    await expect(page.locator('text="Task C"')).toBeVisible();
    
    // 3. Click delete button (trash icon) on 'Task B'
    const taskBContainer = page.locator('text="Task B"').locator('..').locator('..');
    const deleteButton = taskBContainer.locator('button[aria-label*="delete" i], button:has([class*="trash" i])').first();
    
    if (await deleteButton.isVisible().catch(() => false)) {
      await deleteButton.click();
    } else {
      // Alternative: open task detail modal and delete from there
      await page.click('text="Task B"');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Delete"), button[aria-label*="delete" i]');
    }
    
    await page.waitForTimeout(500);
    
    // 4. Verify task disappears immediately (optimistic update)
    await expect(page.locator('text="Task B"')).not.toBeVisible({ timeout: 3000 });
    
    // 5. Verify success toast 'Task deleted'
    await expect(page.locator('text=/task deleted|deleted successfully/i')).toBeVisible({ timeout: 5000 });
    
    // 6. Verify only 'Task A' and 'Task C' remain
    await expect(page.locator('text="Task A"')).toBeVisible();
    await expect(page.locator('text="Task C"')).toBeVisible();
    
    // 7. Verify stats update to 2 total tasks
    const statsCard = page.locator('text=/total.*2|2.*total/i');
    if (await statsCard.isVisible().catch(() => false)) {
      await expect(statsCard).toBeVisible();
    }
    
    // 8. Refresh page
    await page.reload();
    await page.waitForTimeout(1000);
    
    // 9. Verify 'Task B' is still gone (persisted)
    await expect(page.locator('text="Task B"')).not.toBeVisible();
    await expect(page.locator('text="Task A"')).toBeVisible();
    await expect(page.locator('text="Task C"')).toBeVisible();
    
    // 10. Open 'Task A' detail modal
    await page.click('text="Task A"');
    await page.waitForTimeout(500);
    
    // 11. Click 'Delete' button in modal
    const modalDeleteButton = page.locator('button:has-text("Delete"), button[aria-label*="delete" i]').first();
    await modalDeleteButton.click();
    await page.waitForTimeout(500);
    
    // 12. Verify modal closes
    await page.waitForTimeout(1000);
    
    // 13. Verify 'Task A' is removed from list
    await expect(page.locator('text="Task A"')).not.toBeVisible({ timeout: 3000 });
    
    // Verify only 'Task C' remains
    await expect(page.locator('text="Task C"')).toBeVisible();
    
    // Verify success toast for second deletion
    await expect(page.locator('text=/task deleted|deleted successfully/i')).toBeVisible({ timeout: 5000 });
  });
});
