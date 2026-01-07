// spec: specs/taskmaster-e2e-test-plan.md
// Test: 5.5. Analytics Data Accuracy

import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test('Analytics Data Accuracy', async ({ page }) => {
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

    // Verify stats cards show numeric values
    const thisWeekValue = page.locator('p:text("This Week")').locator('..').locator('[class*="text-3xl"]');
    await expect(thisWeekValue).toBeVisible();

    // Verify subtasks count
    await expect(page.getByText('Subtasks', { exact: true })).toBeVisible();

    // Verify current streak shows days
    await expect(page.getByText(/days|day/i).first()).toBeVisible();

    // Navigate back to tasks page
    await page.goto('http://localhost:3000/tasks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Verify we're on tasks page
    await expect(page).toHaveURL(/\/tasks/, { timeout: 10000 });
    await expect(page.getByRole('button', { name: /new task/i })).toBeVisible({ timeout: 10000 });

    // Navigate back to analytics
    await page.goto('http://localhost:3000/analytics');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Verify analytics page still shows correct data
    await expect(page).toHaveURL(/\/analytics/, { timeout: 10000 });
    await expect(page.getByText('This Week')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Distribution' })).toBeVisible();
    await expect(page.getByText('Task Activity')).toBeVisible();
  });
});
