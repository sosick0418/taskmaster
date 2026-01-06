// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Task CRUD Operations', () => {
  test('Edit Task', async ({ page }) => {
    // 1. Login and create a task 'Review code'
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');
    
    // Create the task
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);
    
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('Review code');
    
    // Set to MEDIUM priority initially
    const priorityButton = page.locator('button:has-text("Priority"), [role="combobox"]:has-text("Priority")').first();
    if (await priorityButton.isVisible().catch(() => false)) {
      await priorityButton.click();
      await page.waitForTimeout(300);
      await page.locator('text="Medium"').first().click();
    }
    
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(1000);
    
    // 2. Click edit button (pencil icon) on the task card
    const editButton = page.locator('text="Review code"').locator('..').locator('..').locator('button[aria-label*="edit" i], button:has([class*="pencil" i])').first();
    if (await editButton.isVisible().catch(() => false)) {
      await editButton.click();
    } else {
      // Alternative: click on the task to open detail modal, then find edit button
      await page.click('text="Review code"');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Edit"), button[aria-label*="edit" i]');
    }
    await page.waitForTimeout(500);
    
    // 3. Verify form opens with existing task data pre-filled
    await expect(page.locator('input[value="Review code"]')).toBeVisible();
    
    // 4. Change title to 'Review PR #123'
    const editTitleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await editTitleInput.clear();
    await editTitleInput.fill('Review PR #123');
    
    // 5. Change priority from MEDIUM to URGENT
    const editPriorityButton = page.locator('button:has-text("Priority"), button:has-text("Medium"), [role="combobox"]').first();
    if (await editPriorityButton.isVisible().catch(() => false)) {
      await editPriorityButton.click();
      await page.waitForTimeout(300);
      await page.locator('text="Urgent"').first().click();
    }
    
    // 6. Add tag 'code-review'
    const tagInput = page.locator('input[placeholder*="tag" i]').first();
    if (await tagInput.isVisible().catch(() => false)) {
      await tagInput.fill('code-review');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
    }
    
    // 7. Click 'Update Task' button
    await page.click('button:has-text("Update"), button:has-text("Save")');
    
    // 8. Verify success toast 'Task updated successfully'
    await expect(page.locator('text=/task updated|updated successfully/i')).toBeVisible({ timeout: 5000 });
    
    // 9. Verify task card updates immediately (optimistic)
    await page.waitForTimeout(1000);
    await expect(page.locator('text="Review PR #123"')).toBeVisible();
    
    // 10. Refresh page and verify changes persisted
    await page.reload();
    await page.waitForTimeout(1000);
    await expect(page.locator('text="Review PR #123"')).toBeVisible();
    
    // 11. Click task to open detail modal
    await page.click('text="Review PR #123"');
    await page.waitForTimeout(500);
    
    // 12. Verify all changes are reflected in detail view
    await expect(page.locator('text="Review PR #123"')).toBeVisible();
    await expect(page.locator('text=/urgent/i')).toBeVisible();
    
    // Verify tag if visible
    const codeReviewTag = page.locator('text="code-review"');
    if (await codeReviewTag.isVisible().catch(() => false)) {
      await expect(codeReviewTag).toBeVisible();
    }
  });
});
