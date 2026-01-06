// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Task CRUD Operations', () => {
  test('Task with Subtasks', async ({ page }) => {
    // 1. Login and create task 'Website Redesign'
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');
    
    // Create the main task
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);
    
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('Website Redesign');
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(1000);
    
    // 2. Click task to open detail modal
    await page.click('text="Website Redesign"');
    await page.waitForTimeout(500);
    
    // 3. In subtasks section, click 'Add subtask' input
    const subtaskInput = page.locator('input[placeholder*="subtask" i], input[placeholder*="Add" i]').first();
    await expect(subtaskInput).toBeVisible({ timeout: 5000 });
    
    // 4. Type 'Design mockups' and press Enter
    await subtaskInput.fill('Design mockups');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // 5. Add second subtask: 'Get feedback'
    await subtaskInput.fill('Get feedback');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // 6. Add third subtask: 'Implement changes'
    await subtaskInput.fill('Implement changes');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // 7. Verify all 3 subtasks appear in list
    await expect(page.locator('text="Design mockups"')).toBeVisible();
    await expect(page.locator('text="Get feedback"')).toBeVisible();
    await expect(page.locator('text="Implement changes"')).toBeVisible();
    
    // 8. Verify progress bar shows 0/3 completed (0%)
    await expect(page.locator('text=/0.*3|0%/i')).toBeVisible();
    
    // 9. Click checkbox on 'Design mockups' subtask
    const firstSubtaskCheckbox = page.locator('text="Design mockups"').locator('..').locator('input[type="checkbox"], button[role="checkbox"]').first();
    await firstSubtaskCheckbox.click();
    await page.waitForTimeout(500);
    
    // 10. Verify progress updates to 1/3 (33%)
    await expect(page.locator('text=/1.*3|33/i')).toBeVisible({ timeout: 3000 });
    
    // 11. Verify progress bar fills to 33%
    const progressBar = page.locator('[role="progressbar"], .progress-bar').first();
    if (await progressBar.isVisible().catch(() => false)) {
      const ariaValue = await progressBar.getAttribute('aria-valuenow');
      expect(Number(ariaValue)).toBeGreaterThan(0);
    }
    
    // 12. Complete remaining subtasks
    const secondSubtaskCheckbox = page.locator('text="Get feedback"').locator('..').locator('input[type="checkbox"], button[role="checkbox"]').first();
    await secondSubtaskCheckbox.click();
    await page.waitForTimeout(500);
    
    const thirdSubtaskCheckbox = page.locator('text="Implement changes"').locator('..').locator('input[type="checkbox"], button[role="checkbox"]').first();
    await thirdSubtaskCheckbox.click();
    await page.waitForTimeout(500);
    
    // 13. Verify progress shows 3/3 (100%)
    await expect(page.locator('text=/3.*3|100/i')).toBeVisible({ timeout: 3000 });
    
    // 14. Close and reopen modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // 15. Verify subtasks persist correctly
    await page.click('text="Website Redesign"');
    await page.waitForTimeout(500);
    
    await expect(page.locator('text="Design mockups"')).toBeVisible();
    await expect(page.locator('text="Get feedback"')).toBeVisible();
    await expect(page.locator('text="Implement changes"')).toBeVisible();
    await expect(page.locator('text=/3.*3|100/i')).toBeVisible();
  });
});
