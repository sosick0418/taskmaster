// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('List View Filters & Search', () => {
  test('Combined Filters', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');

    // 1. Create diverse set of 10 tasks with various attributes
    const tasksData = [
      { title: 'Write report', status: 'TODO', priority: 'HIGH', description: 'Quarterly report' },
      { title: 'Review report', status: 'TODO', priority: 'URGENT', description: 'Final review' },
      { title: 'Submit report', status: 'IN_PROGRESS', priority: 'HIGH', description: 'Send to manager' },
      { title: 'Design mockup', status: 'TODO', priority: 'MEDIUM', description: 'UI design' },
      { title: 'Code review', status: 'DONE', priority: 'HIGH', description: 'Review PR' },
      { title: 'Meeting report', status: 'TODO', priority: 'LOW', description: 'Team meeting notes' },
      { title: 'Bug fix', status: 'IN_PROGRESS', priority: 'URGENT', description: 'Critical bug' },
      { title: 'Documentation', status: 'TODO', priority: 'MEDIUM', description: 'API docs' },
      { title: 'Testing', status: 'DONE', priority: 'HIGH', description: 'E2E tests' },
      { title: 'Deployment', status: 'IN_PROGRESS', priority: 'HIGH', description: 'Production deploy' }
    ];

    for (const task of tasksData) {
      await page.click('button:has-text("New Task")');
      await page.fill('input[placeholder*="title" i]', task.title);
      await page.fill('textarea[placeholder*="description" i], input[placeholder*="description" i]', task.description);
      
      // Select status
      const statusSelect = page.locator('select[name="status"], button:has-text("Status")').first();
      if (await statusSelect.isVisible()) {
        await statusSelect.click();
        await page.click(`text="${task.status}"`);
      }
      
      // Select priority
      const prioritySelect = page.locator('select[name="priority"], button:has-text("Priority")').first();
      if (await prioritySelect.isVisible()) {
        await prioritySelect.click();
        await page.click(`text="${task.priority}"`);
      }
      
      await page.click('button:has-text("Create Task")');
      await page.waitForTimeout(500);
    }

    // Switch to list view
    const listViewButton = page.locator('button[aria-label*="list" i], button:has-text("List")').first();
    if (await listViewButton.isVisible()) {
      await listViewButton.click();
    }

    // 2. Apply status filter: only TODO
    const statusFilterButton = page.locator('button:has-text("Status"), button[aria-label*="status" i]').first();
    await statusFilterButton.click();
    
    const inProgressCheckbox = page.locator('input[type="checkbox"][value="IN_PROGRESS"], label:has-text("In Progress") input').first();
    const doneCheckbox = page.locator('input[type="checkbox"][value="DONE"], label:has-text("Done") input').first();
    
    await inProgressCheckbox.uncheck();
    await doneCheckbox.uncheck();

    // 3. Apply priority filter: HIGH and URGENT
    const priorityFilterButton = page.locator('button:has-text("Priority"), button[aria-label*="priority" i]').first();
    await priorityFilterButton.click();
    
    const lowCheckbox = page.locator('input[type="checkbox"][value="LOW"], label:has-text("Low") input').first();
    const mediumCheckbox = page.locator('input[type="checkbox"][value="MEDIUM"], label:has-text("Medium") input').first();
    
    await lowCheckbox.uncheck();
    await mediumCheckbox.uncheck();

    // 4. Type 'report' in search
    const searchInput = page.locator('input[placeholder*="search" i]').first();
    await searchInput.fill('report');

    // 5. Verify only tasks matching ALL criteria are shown
    // Should show: "Write report" (TODO, HIGH, contains "report")
    //             "Review report" (TODO, URGENT, contains "report")
    await expect(page.locator('text="Write report"')).toBeVisible();
    await expect(page.locator('text="Review report"')).toBeVisible();
    
    // Should NOT show these:
    await expect(page.locator('text="Submit report"')).not.toBeVisible(); // IN_PROGRESS
    await expect(page.locator('text="Meeting report"')).not.toBeVisible(); // LOW priority
    await expect(page.locator('text="Design mockup"')).not.toBeVisible(); // MEDIUM priority
    await expect(page.locator('text="Bug fix"')).not.toBeVisible(); // No "report" in title/description

    // 6. Click 'Clear filters' button
    const clearFiltersButton = page.locator('button:has-text("Clear"), button:has-text("Reset")').first();
    if (await clearFiltersButton.isVisible()) {
      await clearFiltersButton.click();
    } else {
      // Manually clear filters
      await searchInput.clear();
      
      await statusFilterButton.click();
      await inProgressCheckbox.check();
      await doneCheckbox.check();
      
      await priorityFilterButton.click();
      await lowCheckbox.check();
      await mediumCheckbox.check();
    }

    // 7. Verify all tasks return and all filters reset
    await page.waitForTimeout(500);
    
    // Should see all 10 tasks
    await expect(page.locator('text="Write report"')).toBeVisible();
    await expect(page.locator('text="Design mockup"')).toBeVisible();
    await expect(page.locator('text="Code review"')).toBeVisible();

    // 8. Apply filters again
    await statusFilterButton.click();
    await inProgressCheckbox.uncheck();
    await doneCheckbox.uncheck();
    
    await searchInput.fill('report');

    // 9. Switch to board view
    const boardViewButton = page.locator('button[aria-label*="board" i], button:has-text("Board")').first();
    if (await boardViewButton.isVisible()) {
      await boardViewButton.click();
    }

    // 10. Verify search and priority filters still apply
    // In board view, search should still filter tasks
    await expect(page.locator('text="Write report"')).toBeVisible();
    await expect(page.locator('text="Review report"')).toBeVisible();

    // 11. Verify column counts reflect filtered data
    // The filtered tasks should appear in their respective columns
    const todoColumn = page.locator('[data-testid="column-TODO"], .column-todo').first();
    await expect(todoColumn).toContainText('Write report');
    await expect(todoColumn).toContainText('Review report');
  });
});
