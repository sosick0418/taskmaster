// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('List View Filters & Search', () => {
  test('Search Tasks by Description and Tags', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');

    // 1. Create task 'Q1 Planning' with description 'Budget allocation meeting' and tag 'finance'
    await page.click('button:has-text("New Task")');
    await page.fill('input[placeholder*="title" i]', 'Q1 Planning');
    await page.fill('textarea[placeholder*="description" i], input[placeholder*="description" i]', 'Budget allocation meeting');
    
    // Add tag 'finance'
    const tagInput = page.locator('input[placeholder*="tag" i]').first();
    if (await tagInput.isVisible()) {
      await tagInput.fill('finance');
      await tagInput.press('Enter');
    }
    
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(500);

    // 2. Create task 'Team Standup' with description 'Daily sync' and tag 'meeting'
    await page.click('button:has-text("New Task")');
    await page.fill('input[placeholder*="title" i]', 'Team Standup');
    await page.fill('textarea[placeholder*="description" i], input[placeholder*="description" i]', 'Daily sync');
    
    // Add tag 'meeting'
    const tagInput2 = page.locator('input[placeholder*="tag" i]').first();
    if (await tagInput2.isVisible()) {
      await tagInput2.fill('meeting');
      await tagInput2.press('Enter');
    }
    
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(500);

    // Switch to list view
    const listViewButton = page.locator('button[aria-label*="list" i], button:has-text("List")').first();
    if (await listViewButton.isVisible()) {
      await listViewButton.click();
    }

    // 3. Type 'budget' in search
    const searchInput = page.locator('input[placeholder*="search" i]').first();
    await searchInput.fill('budget');

    // 4. Verify 'Q1 Planning' is shown (matches description)
    await expect(page.locator('text="Q1 Planning"')).toBeVisible();
    await expect(page.locator('text="Team Standup"')).not.toBeVisible();

    // 5. Clear and type 'finance'
    await searchInput.clear();
    await searchInput.fill('finance');

    // 6. Verify 'Q1 Planning' is shown (matches tag)
    await expect(page.locator('text="Q1 Planning"')).toBeVisible();
    await expect(page.locator('text="Team Standup"')).not.toBeVisible();

    // 7. Type 'meeting'
    await searchInput.clear();
    await searchInput.fill('meeting');

    // 8. Verify both tasks are shown ('meeting' in tag and description)
    await expect(page.locator('text="Q1 Planning"')).toBeVisible();
    await expect(page.locator('text="Team Standup"')).toBeVisible();
  });
});
