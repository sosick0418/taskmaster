// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('List View Filters & Search', () => {
  test('Filter by Status', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');

    // 1. Create tasks with various statuses (2 TODO, 2 IN_PROGRESS, 2 DONE)
    const tasksData = [
      { title: 'Task TODO 1', status: 'TODO' },
      { title: 'Task TODO 2', status: 'TODO' },
      { title: 'Task IN_PROGRESS 1', status: 'IN_PROGRESS' },
      { title: 'Task IN_PROGRESS 2', status: 'IN_PROGRESS' },
      { title: 'Task DONE 1', status: 'DONE' },
      { title: 'Task DONE 2', status: 'DONE' }
    ];

    for (const task of tasksData) {
      await page.click('button:has-text("New Task")');
      await page.fill('input[placeholder*="title" i]', task.title);
      
      // Select status
      const statusSelect = page.locator('select[name="status"], button:has-text("Status")').first();
      if (await statusSelect.isVisible()) {
        await statusSelect.click();
        await page.click(`text="${task.status}"`);
      }
      
      await page.click('button:has-text("Create Task")');
      await page.waitForTimeout(500);
    }

    // 2. Switch to list view
    const listViewButton = page.locator('button[aria-label*="list" i], button:has-text("List")').first();
    if (await listViewButton.isVisible()) {
      await listViewButton.click();
    }

    // 3. Verify all 6 tasks are shown
    for (const task of tasksData) {
      await expect(page.locator(`text="${task.title}"`)).toBeVisible();
    }

    // 4. Open status filter dropdown
    const statusFilterButton = page.locator('button:has-text("Status"), button[aria-label*="status" i]').first();
    await statusFilterButton.click();

    // 5. Uncheck 'Done' status
    const doneCheckbox = page.locator('input[type="checkbox"][value="DONE"], label:has-text("Done") input, label:has-text("DONE") input').first();
    await doneCheckbox.uncheck();

    // 6. Verify only TODO and IN_PROGRESS tasks are shown (4 tasks)
    await expect(page.locator('text="Task TODO 1"')).toBeVisible();
    await expect(page.locator('text="Task TODO 2"')).toBeVisible();
    await expect(page.locator('text="Task IN_PROGRESS 1"')).toBeVisible();
    await expect(page.locator('text="Task IN_PROGRESS 2"')).toBeVisible();
    await expect(page.locator('text="Task DONE 1"')).not.toBeVisible();
    await expect(page.locator('text="Task DONE 2"')).not.toBeVisible();

    // 7. Verify count shows 'Showing 4 of 6 tasks'
    await expect(page.locator('text=/Showing 4 of 6/i')).toBeVisible();

    // 8. Uncheck 'To Do' status
    const todoCheckbox = page.locator('input[type="checkbox"][value="TODO"], label:has-text("To Do") input, label:has-text("TODO") input').first();
    await todoCheckbox.uncheck();

    // 9. Verify only IN_PROGRESS tasks are shown (2 tasks)
    await expect(page.locator('text="Task IN_PROGRESS 1"')).toBeVisible();
    await expect(page.locator('text="Task IN_PROGRESS 2"')).toBeVisible();
    await expect(page.locator('text="Task TODO 1"')).not.toBeVisible();
    await expect(page.locator('text="Task TODO 2"')).not.toBeVisible();

    // 10. Re-check all statuses
    await todoCheckbox.check();
    await doneCheckbox.check();

    // 11. Verify all 6 tasks return
    for (const task of tasksData) {
      await expect(page.locator(`text="${task.title}"`)).toBeVisible();
    }
  });
});
