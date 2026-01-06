// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('List View Filters & Search', () => {
  test('Filter by Priority', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');

    // 1. Create tasks with priorities: LOW, MEDIUM, HIGH, URGENT (1 of each)
    const tasksData = [
      { title: 'Task LOW Priority', priority: 'LOW' },
      { title: 'Task MEDIUM Priority', priority: 'MEDIUM' },
      { title: 'Task HIGH Priority', priority: 'HIGH' },
      { title: 'Task URGENT Priority', priority: 'URGENT' }
    ];

    for (const task of tasksData) {
      await page.click('button:has-text("New Task")');
      await page.fill('input[placeholder*="title" i]', task.title);
      
      // Select priority
      const prioritySelect = page.locator('select[name="priority"], button:has-text("Priority")').first();
      if (await prioritySelect.isVisible()) {
        await prioritySelect.click();
        await page.click(`text="${task.priority}"`);
      }
      
      await page.click('button:has-text("Create Task")');
      await page.waitForTimeout(500);
    }

    // 2. Switch to list view
    const listViewButton = page.locator('button[aria-label*="list" i], button:has-text("List")').first();
    if (await listViewButton.isVisible()) {
      await listViewButton.click();
    }

    // Verify all 4 tasks displayed
    for (const task of tasksData) {
      await expect(page.locator(`text="${task.title}"`)).toBeVisible();
    }

    // 3. Open priority filter
    const priorityFilterButton = page.locator('button:has-text("Priority"), button[aria-label*="priority" i]').first();
    await priorityFilterButton.click();

    // 4. Select only 'HIGH' and 'URGENT'
    // First uncheck all
    const lowCheckbox = page.locator('input[type="checkbox"][value="LOW"], label:has-text("LOW") input, label:has-text("Low") input').first();
    const mediumCheckbox = page.locator('input[type="checkbox"][value="MEDIUM"], label:has-text("MEDIUM") input, label:has-text("Medium") input').first();
    
    await lowCheckbox.uncheck();
    await mediumCheckbox.uncheck();

    // 5. Verify only 2 tasks with HIGH/URGENT priority show
    await expect(page.locator('text="Task HIGH Priority"')).toBeVisible();
    await expect(page.locator('text="Task URGENT Priority"')).toBeVisible();
    await expect(page.locator('text="Task LOW Priority"')).not.toBeVisible();
    await expect(page.locator('text="Task MEDIUM Priority"')).not.toBeVisible();

    // 6. Select only 'LOW'
    const highCheckbox = page.locator('input[type="checkbox"][value="HIGH"], label:has-text("HIGH") input, label:has-text("High") input').first();
    const urgentCheckbox = page.locator('input[type="checkbox"][value="URGENT"], label:has-text("URGENT") input, label:has-text("Urgent") input').first();
    
    await highCheckbox.uncheck();
    await urgentCheckbox.uncheck();
    await lowCheckbox.check();

    // 7. Verify only LOW priority task shows
    await expect(page.locator('text="Task LOW Priority"')).toBeVisible();
    await expect(page.locator('text="Task MEDIUM Priority"')).not.toBeVisible();
    await expect(page.locator('text="Task HIGH Priority"')).not.toBeVisible();
    await expect(page.locator('text="Task URGENT Priority"')).not.toBeVisible();

    // 8. Clear priority filter (select all)
    await mediumCheckbox.check();
    await highCheckbox.check();
    await urgentCheckbox.check();

    // 9. Verify all 4 tasks return
    for (const task of tasksData) {
      await expect(page.locator(`text="${task.title}"`)).toBeVisible();
    }
  });
});
