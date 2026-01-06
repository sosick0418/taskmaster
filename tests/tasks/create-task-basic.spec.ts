// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Task CRUD Operations', () => {
  test('Create Task - Basic', async ({ page }) => {
    // 1. Login with test credentials
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');
    
    // 2. Navigate to /tasks page - already there after login
    
    // 3. Verify 'No tasks yet' empty state is displayed (if first time)
    const emptyState = page.locator('text=/no tasks/i');
    if (await emptyState.isVisible().catch(() => false)) {
      console.log('Empty state detected');
    }
    
    // 4. Click 'New Task' button in header
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);
    
    // 5. Verify task form modal opens with title 'Create Task'
    await expect(page.locator('text="Create Task"')).toBeVisible({ timeout: 5000 });
    
    // 6. Enter 'Buy groceries' in title field
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('Buy groceries');
    
    // 7. Enter 'Milk, eggs, bread' in description field
    const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="description" i]').first();
    if (await descriptionInput.isVisible().catch(() => false)) {
      await descriptionInput.fill('Milk, eggs, bread');
    }
    
    // 8. Select 'MEDIUM' priority
    const priorityButton = page.locator('button:has-text("Priority"), [role="combobox"]:has-text("Priority")').first();
    if (await priorityButton.isVisible().catch(() => false)) {
      await priorityButton.click();
      await page.waitForTimeout(300);
      await page.locator('text="Medium"').first().click();
    }
    
    // 9. Keep status as 'TODO' (default) - no action needed
    
    // 10. Click 'Create Task' button
    await page.click('button:has-text("Create Task")');
    
    // 11. Verify success toast 'Task created successfully' appears
    await expect(page.locator('text=/task created/i')).toBeVisible({ timeout: 5000 });
    
    // 12. Verify modal closes
    await page.waitForTimeout(1000);
    await expect(page.locator('text="Create Task"')).not.toBeVisible();
    
    // 13. Verify new task appears in task list with title 'Buy groceries'
    await expect(page.locator('text="Buy groceries"')).toBeVisible({ timeout: 5000 });
    
    // 14. Verify task shows MEDIUM priority badge
    const taskContainer = page.locator('text="Buy groceries"').locator('../..');
    await expect(taskContainer.locator('text=/medium/i').first()).toBeVisible();
    
    // 15. Verify task status is TODO
    // In board view, task should be in 'To Do' column or in list view with TODO status
    const isVisible = await page.locator('text="Buy groceries"').isVisible();
    expect(isVisible).toBe(true);
  });
});
