// spec: specs/taskmaster-e2e-test-plan.md
// Test: 5.1. View Analytics Overview

import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test('View Analytics Overview', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await expect(page.getByText(/dev only/i)).toBeVisible({ timeout: 10000 });

    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.clear();
    await emailInput.fill('test@example.com');

    await page.getByRole('button', { name: /test login/i }).click();
    await expect(page).toHaveURL(/\/tasks/, { timeout: 20000 });

    // Wait for page to fully load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible({ timeout: 30000 });

    // Navigate to Analytics page directly (more reliable than clicking sidebar)
    await page.goto('http://localhost:3000/analytics');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Verify Analytics page loaded
    await expect(page).toHaveURL(/\/analytics/, { timeout: 10000 });

    // Verify page header 'Analytics' is visible
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible();

    // Verify subheading is visible
    await expect(page.getByText(/track your productivity/i)).toBeVisible();

    // Verify stats cards are visible
    await expect(page.getByText('This Week')).toBeVisible();
    await expect(page.getByText('Subtasks', { exact: true })).toBeVisible();
    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Avg. Completion Time')).toBeVisible();
    await expect(page.getByText('Most Productive')).toBeVisible();

    // Verify charts sections exist
    await expect(page.getByText('Task Activity')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Distribution' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Activity', exact: true })).toBeVisible();
  });
});
