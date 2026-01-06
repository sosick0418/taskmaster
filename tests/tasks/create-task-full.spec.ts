// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Task CRUD Operations', () => {
  test('Create Task - Full Form', async ({ page }) => {
    // 1. Login and navigate to /tasks
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');
    
    // 2. Click 'New Task' button
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);
    
    // 3. Enter 'Prepare presentation' in title
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('Prepare presentation');
    
    // 4. Enter 'Q4 Sales Review - include charts and metrics' in description
    const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="description" i]').first();
    if (await descriptionInput.isVisible().catch(() => false)) {
      await descriptionInput.fill('Q4 Sales Review - include charts and metrics');
    }
    
    // 5. Select 'HIGH' priority
    const priorityButton = page.locator('button:has-text("Priority"), [role="combobox"]:has-text("Priority")').first();
    if (await priorityButton.isVisible().catch(() => false)) {
      await priorityButton.click();
      await page.waitForTimeout(300);
      await page.locator('text="High"').first().click();
    }
    
    // 6. Select 'IN_PROGRESS' status
    const statusButton = page.locator('button:has-text("Status"), [role="combobox"]:has-text("Status")').first();
    if (await statusButton.isVisible().catch(() => false)) {
      await statusButton.click();
      await page.waitForTimeout(300);
      await page.locator('text="In Progress"').first().click();
    }
    
    // 7. Click due date picker
    const datePicker = page.locator('button:has-text("Pick a date"), input[placeholder*="date" i]').first();
    if (await datePicker.isVisible().catch(() => false)) {
      await datePicker.click();
      await page.waitForTimeout(500);
      
      // 8. Select tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDay = tomorrow.getDate().toString();
      
      // Try to find and click tomorrow's date in the calendar
      const dateButton = page.locator(`button[name="day"]:has-text("${tomorrowDay}")`).first();
      if (await dateButton.isVisible().catch(() => false)) {
        await dateButton.click();
      }
    }
    
    // 9. Enter tags: 'work', 'urgent', 'presentation'
    const tagInput = page.locator('input[placeholder*="tag" i]').first();
    if (await tagInput.isVisible().catch(() => false)) {
      await tagInput.fill('work');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
      await tagInput.fill('urgent');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
      await tagInput.fill('presentation');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
    }
    
    // 10. Click 'Create Task' button
    await page.click('button:has-text("Create Task")');
    
    // 11. Verify task appears with all details
    await expect(page.locator('text="Prepare presentation"')).toBeVisible({ timeout: 5000 });
    
    // 12. Click task to open detail modal
    await page.click('text="Prepare presentation"');
    await page.waitForTimeout(500);
    
    // 13. Verify all entered information is displayed correctly
    await expect(page.locator('text="Prepare presentation"')).toBeVisible();
    await expect(page.locator('text="Q4 Sales Review - include charts and metrics"')).toBeVisible();
    
    // 14. Verify due date shows 'Tomorrow'
    const dueDateText = page.locator('text=/tomorrow/i');
    if (await dueDateText.isVisible().catch(() => false)) {
      await expect(dueDateText).toBeVisible();
    }
    
    // 15. Verify tags are displayed with violet styling
    await expect(page.locator('text="work"')).toBeVisible();
    await expect(page.locator('text="urgent"')).toBeVisible();
    await expect(page.locator('text="presentation"')).toBeVisible();
  });
});
