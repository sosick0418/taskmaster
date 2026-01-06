// spec: specs/taskmaster-e2e-test-plan.md
// Section 3.1: Switch to Board View

import { test, expect } from '@playwright/test';

test.describe('Kanban Board & Drag-Drop', () => {
  test('Switch to Board View', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // 2. Verify login page loads
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    
    // 3. Enter test credentials
    const emailInput = page.getByPlaceholder('test@example.com');
    await emailInput.fill('test@example.com');
    
    // 4. Click Test Login button
    await page.getByRole('button', { name: /Test Login/ }).click();
    
    // 5. Wait for redirect to /tasks
    await page.waitForURL('**/tasks');
    await expect(page).toHaveURL(/\/tasks$/);
    
    // 6. Verify default view is 'list' (list icon is active)
    const listButton = page.getByRole('button', { name: /List/ });
    await expect(listButton).toBeVisible();
    await expect(listButton).toHaveClass(/bg-violet-500\/15/);
    
    // 7. Create task with TODO status
    await page.getByRole('button', { name: /New Task/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByPlaceholder(/What needs to be done/).fill('Task TODO');
    await page.getByRole('button', { name: /Create Task/i }).click();
    await page.waitForTimeout(500);
    
    // 8. Create task with IN_PROGRESS status
    await page.getByRole('button', { name: /New Task/i }).click();
    await page.getByPlaceholder(/What needs to be done/).fill('Task IN_PROGRESS');
    
    // Select IN_PROGRESS status
    await page.getByLabel('Status').click();
    await page.getByRole('option', { name: 'In Progress' }).click();
    await page.getByRole('button', { name: /Create Task/i }).click();
    await page.waitForTimeout(500);
    
    // 9. Create task with DONE status
    await page.getByRole('button', { name: /New Task/i }).click();
    await page.getByPlaceholder(/What needs to be done/).fill('Task DONE');
    
    // Select DONE status
    await page.getByLabel('Status').click();
    await page.getByRole('option', { name: 'Done' }).click();
    await page.getByRole('button', { name: /Create Task/i }).click();
    await page.waitForTimeout(500);
    
    // 10. Click board view toggle button (grid icon)
    const boardButton = page.getByRole('button', { name: /Board/ });
    await boardButton.click();
    await page.waitForTimeout(300);
    
    // 11. Verify view changes to kanban board layout
    await expect(boardButton).toHaveClass(/bg-violet-500\/15/);
    
    // 12. Verify 3 columns: 'To Do', 'In Progress', 'Done'
    await expect(page.getByText('To Do', { exact: true })).toBeVisible();
    await expect(page.getByText('In Progress', { exact: true })).toBeVisible();
    await expect(page.getByText('Done', { exact: true })).toBeVisible();
    
    // 13. Verify tasks appear in correct columns based on status
    const toDoColumn = page.locator('[data-column="TODO"]').first();
    const inProgressColumn = page.locator('[data-column="IN_PROGRESS"]').first();
    const doneColumn = page.locator('[data-column="DONE"]').first();
    
    await expect(toDoColumn.getByText('Task TODO')).toBeVisible();
    await expect(inProgressColumn.getByText('Task IN_PROGRESS')).toBeVisible();
    await expect(doneColumn.getByText('Task DONE')).toBeVisible();
    
    // 14. Click list view toggle
    await listButton.click();
    await page.waitForTimeout(300);
    
    // 15. Verify view switches back to list
    await expect(listButton).toHaveClass(/bg-violet-500\/15/);
    
    // 16. Verify all tasks are still visible in list view
    await expect(page.getByText('Task TODO')).toBeVisible();
    await expect(page.getByText('Task IN_PROGRESS')).toBeVisible();
    await expect(page.getByText('Task DONE')).toBeVisible();
    
    // 17. Switch back to board view
    await boardButton.click();
    await page.waitForTimeout(300);
    
    // 18. Refresh page and verify view preference persists
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 19. Verify board view is still active after refresh
    await expect(boardButton).toHaveClass(/bg-violet-500\/15/);
    await expect(page.getByText('To Do', { exact: true })).toBeVisible();
  });
});
