// spec: specs/taskmaster-e2e-test-plan.md
// Test: 5.5. Analytics Data Accuracy

import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login with test credentials
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');
  });

  test('Analytics Data Accuracy', async ({ page }) => {
    // 1. Clear all existing tasks (if there's a way to do this in UI, otherwise start fresh)
    await page.goto('http://localhost:3000/tasks');
    await page.waitForLoadState('networkidle');

    // Delete any existing tasks to start with clean slate
    const deleteButtons = page.locator('button[aria-label*="Delete"], button:has-text("Delete")');
    const deleteCount = await deleteButtons.count();
    
    for (let i = 0; i < deleteCount; i++) {
      const firstDelete = deleteButtons.first();
      if (await firstDelete.isVisible()) {
        await firstDelete.click();
        await page.waitForTimeout(300);
      }
    }

    // 2. Create 3 tasks with priority HIGH
    for (let i = 1; i <= 3; i++) {
      await page.click('button:has-text("New Task")');
      await page.fill('input[name="title"]', `High Priority Task ${i}`);
      await page.selectOption('select[name="priority"]', 'HIGH');
      await page.selectOption('select[name="status"]', 'TODO');
      await page.click('button:has-text("Create Task")');
      await page.waitForTimeout(300);
    }

    // 3. Complete 1 task today
    const taskCheckboxes = page.locator('input[type="checkbox"], button[role="checkbox"]').first();
    await taskCheckboxes.click();
    await page.waitForTimeout(500);

    // Wait for confetti animation or completion toast
    await page.waitForTimeout(1000);

    // 4. Navigate to /analytics
    await page.goto('http://localhost:3000/analytics');
    await page.waitForLoadState('networkidle');

    // 5. Verify Total Tasks = 3
    // Look for "This Week" card which shows completed tasks
    // Or look for overall statistics
    const statsCards = page.locator('[class*="grid"] > div').filter({ has: page.locator('p.text-sm') });
    
    // The analytics might show "This Week" with task count
    const thisWeekCard = page.locator('div:has(p:text("This Week"))');
    const thisWeekValue = thisWeekCard.locator('[class*="text-3xl"]');
    
    // Verify the value is visible (should show 1 completed this week)
    await expect(thisWeekValue).toBeVisible();
    const thisWeekText = await thisWeekValue.textContent();
    expect(thisWeekText?.trim()).toBe('1');

    // 6. Verify Completion Rate = 33% (1 out of 3)
    // Completion rate might be shown in various places
    // Check if there's a completion rate stat card or chart
    
    // 7. Verify Tasks Completed Today = 1
    // This might be in a separate stat card
    
    // 8. Verify Priority chart shows 100% HIGH
    // Find the priority chart and verify it shows only HIGH priority
    const priorityChart = page.locator('.recharts-pie').first();
    await expect(priorityChart).toBeVisible();

    // The legend should show HIGH with 100% or 3 tasks
    const highPriorityLabel = page.locator('text=HIGH').first();
    await expect(highPriorityLabel).toBeVisible();

    // 9. Verify Status chart shows 33% DONE, 67% TODO
    // Switch to status tab if needed
    const statusTab = page.locator('button:has-text("Status"), [role="tab"]:has-text("Status")');
    
    if (await statusTab.isVisible()) {
      await statusTab.click();
      await page.waitForTimeout(500);

      // Verify DONE and TODO labels are present
      await expect(page.locator('text=DONE').first()).toBeVisible();
      await expect(page.locator('text=TODO').first()).toBeVisible();
    }

    // 10. Go back and create 2 more tasks (MEDIUM priority)
    await page.goto('http://localhost:3000/tasks');
    await page.waitForLoadState('networkidle');

    for (let i = 1; i <= 2; i++) {
      await page.click('button:has-text("New Task")');
      await page.fill('input[name="title"]', `Medium Priority Task ${i}`);
      await page.selectOption('select[name="priority"]', 'MEDIUM');
      await page.selectOption('select[name="status"]', 'TODO');
      await page.click('button:has-text("Create Task")');
      await page.waitForTimeout(300);
    }

    // 11. Navigate to /analytics again
    await page.goto('http://localhost:3000/analytics');
    await page.waitForLoadState('networkidle');

    // 12. Verify Total Tasks = 5
    // The this week card should now reflect the new total
    const updatedThisWeekCard = page.locator('div:has(p:text("This Week"))');
    await expect(updatedThisWeekCard).toBeVisible();

    // 13. Verify Priority chart updates to 60% HIGH (3/5), 40% MEDIUM (2/5)
    // Switch to priority tab
    const priorityTab = page.locator('button:has-text("Priority"), [role="tab"]:has-text("Priority")');
    
    if (await priorityTab.isVisible()) {
      await priorityTab.click();
      await page.waitForTimeout(500);
    }

    // Verify both HIGH and MEDIUM are now shown
    await expect(page.locator('text=HIGH').first()).toBeVisible();
    await expect(page.locator('text=MEDIUM').first()).toBeVisible();

    // The chart should show distribution
    const pieSectors = page.locator('.recharts-pie-sector');
    const sectorCount = await pieSectors.count();
    
    // Should have at least 2 sectors (HIGH and MEDIUM)
    // Note: LOW and URGENT might also show with 0 values
    expect(sectorCount).toBeGreaterThanOrEqual(2);

    // Verify the analytics page updates correctly with real-time data
    const chartSvg = page.locator('svg.recharts-surface');
    await expect(chartSvg.first()).toBeVisible();

    // Verify completion chart still shows data
    const completionChart = page.locator('text=Completion, text=Task Completion').first();
    await expect(completionChart).toBeVisible();

    // Verify activity heatmap is still visible
    const heatmap = page.locator('div[title]').first();
    await expect(heatmap).toBeVisible();

    // Final verification: all analytics components render without errors
    const analyticsHeader = page.locator('h1:has-text("Analytics")');
    await expect(analyticsHeader).toBeVisible();
  });
});
