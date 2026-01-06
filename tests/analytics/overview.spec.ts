// spec: specs/taskmaster-e2e-test-plan.md
// Test: 5.1. View Analytics Overview

import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login with test credentials
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');
  });

  test('View Analytics Overview', async ({ page }) => {
    // 1. Navigate to /tasks page
    await page.goto('http://localhost:3000/tasks');
    await page.waitForLoadState('networkidle');

    // 2. Create 5 tasks: 2 TODO, 2 IN_PROGRESS, 1 DONE
    // Task 1: TODO, MEDIUM priority
    await page.click('button:has-text("New Task")');
    await page.fill('input[name="title"]', 'Task 1 - TODO Medium');
    await page.selectOption('select[name="priority"]', 'MEDIUM');
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(500);

    // Task 2: TODO, HIGH priority
    await page.click('button:has-text("New Task")');
    await page.fill('input[name="title"]', 'Task 2 - TODO High');
    await page.selectOption('select[name="priority"]', 'HIGH');
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(500);

    // Task 3: IN_PROGRESS, URGENT priority
    await page.click('button:has-text("New Task")');
    await page.fill('input[name="title"]', 'Task 3 - In Progress Urgent');
    await page.selectOption('select[name="status"]', 'IN_PROGRESS');
    await page.selectOption('select[name="priority"]', 'URGENT');
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(500);

    // Task 4: IN_PROGRESS, LOW priority
    await page.click('button:has-text("New Task")');
    await page.fill('input[name="title"]', 'Task 4 - In Progress Low');
    await page.selectOption('select[name="status"]', 'IN_PROGRESS');
    await page.selectOption('select[name="priority"]', 'LOW');
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(500);

    // Task 5: DONE, MEDIUM priority (completed)
    await page.click('button:has-text("New Task")');
    await page.fill('input[name="title"]', 'Task 5 - Done Medium');
    await page.selectOption('select[name="status"]', 'DONE');
    await page.selectOption('select[name="priority"]', 'MEDIUM');
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(500);

    // 3. Navigate to /analytics page
    await page.goto('http://localhost:3000/analytics');
    await page.waitForLoadState('networkidle');

    // 4. Verify page header 'Analytics' with gradient styling
    const header = page.locator('h1:has-text("Analytics")');
    await expect(header).toBeVisible();
    
    // Verify gradient text class is applied
    const headerClass = await header.locator('.gradient-text').getAttribute('class');
    expect(headerClass).toContain('gradient-text');

    // Verify subheading
    await expect(page.locator('text=Track your productivity and task completion trends')).toBeVisible();

    // 5. Verify StatsOverview cards display
    // Card 1: This Week
    const thisWeekCard = page.locator('div:has(p:text("This Week"))');
    await expect(thisWeekCard).toBeVisible();
    await expect(thisWeekCard.locator('[class*="text-3xl"]')).toBeVisible(); // Value should be visible

    // Card 2: Subtasks
    const subtasksCard = page.locator('div:has(p:text("Subtasks"))');
    await expect(subtasksCard).toBeVisible();

    // Card 3: Current Streak
    const currentStreakCard = page.locator('div:has(p:text("Current Streak"))');
    await expect(currentStreakCard).toBeVisible();
    await expect(currentStreakCard.locator('text=days')).toBeVisible();

    // Card 4: Avg. Completion Time
    const avgCompletionCard = page.locator('div:has(p:text("Avg. Completion Time"))');
    await expect(avgCompletionCard).toBeVisible();

    // Card 5: Most Productive
    const mostProductiveCard = page.locator('div:has(p:text("Most Productive"))');
    await expect(mostProductiveCard).toBeVisible();

    // 6. Verify all 5 stat cards are displayed
    const statCards = page.locator('[class*="grid"][class*="gap-4"] > div');
    await expect(statCards).toHaveCount(5);

    // Verify gradient icons are present in each card
    for (let i = 0; i < 5; i++) {
      const card = statCards.nth(i);
      const icon = card.locator('[class*="bg-gradient-to-br"]');
      await expect(icon).toBeVisible();
    }
  });
});
