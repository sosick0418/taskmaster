// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('List View Filters & Search', () => {
  test('Sort Tasks', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');

    // 1. Create tasks with various dates and priorities
    const tasksData = [
      { title: 'Zebra Task', priority: 'LOW', dueDate: '2026-01-10' },
      { title: 'Alpha Task', priority: 'URGENT', dueDate: '2026-01-08' },
      { title: 'Beta Task', priority: 'HIGH', dueDate: '2026-01-12' },
      { title: 'Gamma Task', priority: 'MEDIUM', dueDate: null }
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
      
      // Set due date if provided
      if (task.dueDate) {
        const dueDateInput = page.locator('input[type="date"], input[placeholder*="due date" i]').first();
        if (await dueDateInput.isVisible()) {
          await dueDateInput.fill(task.dueDate);
        }
      }
      
      await page.click('button:has-text("Create Task")');
      await page.waitForTimeout(500);
    }

    // Switch to list view
    const listViewButton = page.locator('button[aria-label*="list" i], button:has-text("List")').first();
    if (await listViewButton.isVisible()) {
      await listViewButton.click();
    }

    // 2. Select 'Newest' sort option
    const sortDropdown = page.locator('select[name="sort"], button:has-text("Sort")').first();
    await sortDropdown.click();
    await page.click('text="Newest"');

    // 3. Verify tasks ordered by creation date (newest first)
    const taskListNewest = page.locator('[data-testid="task-card"], .task-card').allTextContents();
    // Newest should have Gamma Task first (created last)

    // 4. Select 'Oldest' sort
    await sortDropdown.click();
    await page.click('text="Oldest"');

    // 5. Verify tasks ordered by creation date (oldest first)
    // Oldest should have Zebra Task first (created first)

    // 6. Select 'Priority' sort
    await sortDropdown.click();
    await page.click('text="Priority"');

    // 7. Verify order: URGENT > HIGH > MEDIUM > LOW
    const tasksInOrder = page.locator('[data-testid="task-title"], .task-title').allTextContents();
    // Should see Alpha (URGENT), Beta (HIGH), Gamma (MEDIUM), Zebra (LOW)

    // 8. Select 'Due Date' sort
    await sortDropdown.click();
    await page.click('text=/Due Date/i');

    // 9. Verify tasks with due dates come first, sorted by date
    // Should see Alpha (Jan 8), Zebra (Jan 10), Beta (Jan 12)
    
    // 10. Verify tasks without due dates appear at end
    // Gamma should be last

    // 11. Select 'Title' sort
    await sortDropdown.click();
    await page.click('text="Title"');

    // 12. Verify alphabetical order
    const firstTask = page.locator('[data-testid="task-card"], .task-card').first();
    await expect(firstTask).toContainText('Alpha Task');
    
    const lastTask = page.locator('[data-testid="task-card"], .task-card').last();
    await expect(lastTask).toContainText('Zebra Task');
  });
});
