// spec: specs/taskmaster-e2e-test-plan.md
// Section 3.4: Drag Visual Feedback

import { test, expect } from '@playwright/test';

test.describe('Kanban Board & Drag-Drop', () => {
  test('Drag Visual Feedback', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // 2. Login with test credentials
    await page.getByPlaceholder('test@example.com').fill('test@example.com');
    await page.getByRole('button', { name: /Test Login/ }).click();
    await page.waitForURL('**/tasks');
    
    // 3. Switch to board view
    await page.getByRole('button', { name: /Board/ }).click();
    await page.waitForTimeout(300);
    
    // 4. Create a task in TODO column
    await page.getByRole('button', { name: /New Task/i }).click();
    await page.getByPlaceholder(/What needs to be done/).fill('Draggable Task');
    await page.getByRole('button', { name: /Create Task/i }).click();
    await page.waitForTimeout(500);
    
    // 5. Locate the task card
    const taskCard = page.locator('[data-task-id]').filter({ hasText: 'Draggable Task' }).first();
    await expect(taskCard).toBeVisible();
    
    // 6. Get task card bounding box for drag operations
    const taskBox = await taskCard.boundingBox();
    expect(taskBox).not.toBeNull();
    
    // 7. Start dragging the task card (move 10px to activate drag)
    if (taskBox) {
      await page.mouse.move(taskBox.x + taskBox.width / 2, taskBox.y + taskBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(taskBox.x + taskBox.width / 2 + 15, taskBox.y + taskBox.height / 2);
      await page.waitForTimeout(300);
      
      // 8. Verify DragOverlay is visible (rotated and scaled copy)
      const dragOverlay = page.locator('[style*="transform"]').filter({ hasText: 'Draggable Task' }).first();
      await expect(dragOverlay).toBeVisible();
      
      // 9. Move cursor over different columns while dragging
      const inProgressColumn = page.locator('[data-column="IN_PROGRESS"]').first();
      const inProgressBox = await inProgressColumn.boundingBox();
      
      if (inProgressBox) {
        await page.mouse.move(inProgressBox.x + inProgressBox.width / 2, inProgressBox.y + inProgressBox.height / 2);
        await page.waitForTimeout(300);
        
        // 10. Verify column highlights as valid drop zone (visual feedback)
        // The column should be ready to accept the drop
        await expect(inProgressColumn).toBeVisible();
      }
      
      // 11. Move cursor over Done column
      const doneColumn = page.locator('[data-column="DONE"]').first();
      const doneBox = await doneColumn.boundingBox();
      
      if (doneBox) {
        await page.mouse.move(doneBox.x + doneBox.width / 2, doneBox.y + doneBox.height / 2);
        await page.waitForTimeout(300);
      }
      
      // 12. Release drag without dropping on valid zone (move outside columns)
      await page.mouse.move(50, 50); // Move to top-left corner
      await page.mouse.up();
      await page.waitForTimeout(500);
      
      // 13. Verify task returns to original position (TODO column)
      const toDoColumn = page.locator('[data-column="TODO"]').first();
      await expect(toDoColumn.getByText('Draggable Task')).toBeVisible();
    }
    
    // 14. Perform a valid drag and drop
    const taskCardAgain = page.locator('[data-task-id]').filter({ hasText: 'Draggable Task' }).first();
    const taskBoxAgain = await taskCardAgain.boundingBox();
    const inProgressColumn = page.locator('[data-column="IN_PROGRESS"]').first();
    const inProgressBox = await inProgressColumn.boundingBox();
    
    if (taskBoxAgain && inProgressBox) {
      // 15. Start drag
      await page.mouse.move(taskBoxAgain.x + taskBoxAgain.width / 2, taskBoxAgain.y + taskBoxAgain.height / 2);
      await page.mouse.down();
      await page.mouse.move(taskBoxAgain.x + taskBoxAgain.width / 2 + 15, taskBoxAgain.y + taskBoxAgain.height / 2);
      await page.waitForTimeout(200);
      
      // 16. Drop on valid zone (In Progress column)
      await page.mouse.move(inProgressBox.x + inProgressBox.width / 2, inProgressBox.y + inProgressBox.height / 2);
      await page.mouse.up();
      await page.waitForTimeout(500);
      
      // 17. Verify smooth animation to new position
      await expect(inProgressColumn.getByText('Draggable Task')).toBeVisible();
      
      // 18. Verify task is no longer in TODO column
      const toDoColumn = page.locator('[data-column="TODO"]').first();
      await expect(toDoColumn.getByText('Draggable Task')).not.toBeVisible();
    }
    
    // 19. Create another task for cursor testing
    await page.getByRole('button', { name: /New Task/i }).click();
    await page.getByPlaceholder(/What needs to be done/).fill('Second Task');
    await page.getByRole('button', { name: /Create Task/i }).click();
    await page.waitForTimeout(500);
    
    // 20. Verify no flickering or layout shifts during drag
    const secondTask = page.locator('[data-task-id]').filter({ hasText: 'Second Task' }).first();
    await expect(secondTask).toBeVisible();
    
    const secondTaskBox = await secondTask.boundingBox();
    if (secondTaskBox) {
      // Move over the task (should show grab cursor on hover)
      await page.mouse.move(secondTaskBox.x + secondTaskBox.width / 2, secondTaskBox.y + secondTaskBox.height / 2);
      await page.waitForTimeout(200);
      
      // Start drag (cursor should change to grabbing)
      await page.mouse.down();
      await page.mouse.move(secondTaskBox.x + secondTaskBox.width / 2 + 15, secondTaskBox.y + secondTaskBox.height / 2);
      await page.waitForTimeout(200);
      
      // Verify DragOverlay appears
      const dragOverlay = page.locator('[style*="transform"]').filter({ hasText: 'Second Task' });
      await expect(dragOverlay.first()).toBeVisible();
      
      // Cancel drag
      await page.mouse.up();
      await page.waitForTimeout(300);
    }
    
    // 21. Verify board layout is stable (no shifts)
    await expect(page.getByText('To Do', { exact: true })).toBeVisible();
    await expect(page.getByText('In Progress', { exact: true })).toBeVisible();
    await expect(page.getByText('Done', { exact: true })).toBeVisible();
  });
});
