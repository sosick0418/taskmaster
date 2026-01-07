// spec: specs/taskmaster-e2e-test-plan.md
// Test: 5.3. Priority Distribution Chart

import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test('Priority Distribution Chart', async ({ page }) => {
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

    // Verify distribution section exists
    await expect(page.getByRole('heading', { name: 'Distribution' })).toBeVisible();
    await expect(page.getByText('By Priority')).toBeVisible();

    // Verify priority legend items exist
    await expect(page.getByText('Low').first()).toBeVisible();
    await expect(page.getByText('Medium').first()).toBeVisible();
    await expect(page.getByText('High').first()).toBeVisible();
    await expect(page.getByText('Urgent').first()).toBeVisible();

    // Verify chart area exists
    const chartArea = page.locator('.recharts-wrapper, svg[class*="recharts"]');
    await expect(chartArea.first()).toBeVisible();
  });
});
