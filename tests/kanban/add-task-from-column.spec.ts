// spec: specs/taskmaster-e2e-test-plan.md
// Section 3.5: Add Task from Column Header

import { test, expect } from '@playwright/test';

test.describe('Kanban Board & Drag-Drop', () => {
  test('Add Task from Column Header', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // 2. Login with test credentials
    await page.getByPlaceholder('test@example.com').fill('test@example.com');
    await page.getByRole('button', { name: /Test Login/ }).click();
    await page.waitForURL('**/tasks');
    
    // 3. Switch to board view
    const boardButton = page.getByRole('button', { name: /Board/ });
    await boardButton.click();
    await page.waitForTimeout(300);
    
    // 4. Verify board view is active with 3 columns
    await expect(page.getByText('To Do', { exact: true })).toBeVisible();
    await expect(page.getByText('In Progress', { exact: true })).toBeVisible();
    await expect(page.getByText('Done', { exact: true })).toBeVisible();
    
    // 5. Click '+' button in 'In Progress' column header
    const inProgressColumn = page.locator('[data-column="IN_PROGRESS"]').first();
    const addButtonInProgress = inProgressColumn.getByRole('button', { name: /add/i }).first();
    await addButtonInProgress.click();
    
    // 6. Verify task form modal opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Create Task' })).toBeVisible();
    
    // 7. Verify status is pre-set to 'IN_PROGRESS'
    const statusSelect = page.getByLabel('Status');
    await expect(statusSelect).toHaveText(/In Progress/);
    
    // 8. Enter task title
    await page.getByPlaceholder(/What needs to be done/).fill('Debug API issue');
    
    // 9. Click 'Create Task' button
    await page.getByRole('button', { name: /Create Task/i }).click();
    await page.waitForTimeout(500);
    
    // 10. Verify task appears directly in 'In Progress' column
    await expect(inProgressColumn.getByText('Debug API issue')).toBeVisible();
    
    // 11. Click '+' button in 'Done' column header
    const doneColumn = page.locator('[data-column="DONE"]').first();
    const addButtonDone = doneColumn.getByRole('button', { name: /add/i }).first();
    await addButtonDone.click();
    
    // 12. Verify task form modal opens again
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // 13. Verify status is pre-set to 'DONE'
    await expect(statusSelect).toHaveText(/Done/);
    
    // 14. Enter task title
    await page.getByPlaceholder(/What needs to be done/).fill('Completed feature');
    
    // 15. Click 'Create Task' button
    await page.getByRole('button', { name: /Create Task/i }).click();
    await page.waitForTimeout(500);
    
    // 16. Verify task appears directly in 'Done' column
    await expect(doneColumn.getByText('Completed feature')).toBeVisible();
    
    // 17. Click '+' button in 'To Do' column header
    const toDoColumn = page.locator('[data-column="TODO"]').first();
    const addButtonToDo = toDoColumn.getByRole('button', { name: /add/i }).first();
    await addButtonToDo.click();
    
    // 18. Verify status is pre-set to 'TODO'
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(statusSelect).toHaveText(/To Do/);
    
    // 19. Enter task title with priority
    await page.getByPlaceholder(/What needs to be done/).fill('Plan sprint meeting');
    
    // 20. Select HIGH priority
    await page.getByLabel('Priority').click();
    await page.getByRole('option', { name: 'High' }).click();
    
    // 21. Create task
    await page.getByRole('button', { name: /Create Task/i }).click();
    await page.waitForTimeout(500);
    
    // 22. Verify task appears in 'To Do' column with HIGH priority badge
    await expect(toDoColumn.getByText('Plan sprint meeting')).toBeVisible();
    
    // 23. Verify all 3 tasks are in their correct columns
    await expect(toDoColumn.getByText('Plan sprint meeting')).toBeVisible();
    await expect(inProgressColumn.getByText('Debug API issue')).toBeVisible();
    await expect(doneColumn.getByText('Completed feature')).toBeVisible();
    
    // 24. Switch to list view and verify tasks are there
    await page.getByRole('button', { name: /List/ }).click();
    await page.waitForTimeout(300);
    
    await expect(page.getByText('Plan sprint meeting')).toBeVisible();
    await expect(page.getByText('Debug API issue')).toBeVisible();
    await expect(page.getByText('Completed feature')).toBeVisible();
  });
});
