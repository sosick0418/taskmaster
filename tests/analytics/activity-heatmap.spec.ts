// spec: specs/taskmaster-e2e-test-plan.md
// Test: 5.4. Activity Heatmap

import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test('Activity Heatmap', async ({ page }) => {
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

    // Verify activity heatmap section exists
    await expect(page.getByRole('heading', { name: 'Activity', exact: true })).toBeVisible();
    await expect(page.getByText(/tasks completed this year/i)).toBeVisible();

    // Verify day labels (use exact match to avoid conflicts with full day names)
    await expect(page.getByText('Sun', { exact: true })).toBeVisible();
    await expect(page.getByText('Tue', { exact: true })).toBeVisible();
    await expect(page.getByText('Wed', { exact: true })).toBeVisible();

    // Verify month labels exist
    await expect(page.getByText('Jan').first()).toBeVisible();
    await expect(page.getByText('Feb')).toBeVisible();
    await expect(page.getByText('Mar')).toBeVisible();

    // Verify legend exists
    await expect(page.getByText('Less')).toBeVisible();
    await expect(page.getByText('More')).toBeVisible();
  });
});
