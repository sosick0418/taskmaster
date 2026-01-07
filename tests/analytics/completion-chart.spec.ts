// spec: specs/taskmaster-e2e-test-plan.md
// Test: 5.2. Completion Chart Over Time

import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test('Completion Chart Over Time', async ({ page }) => {
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

    // Verify Task Activity chart section exists
    await expect(page.getByText('Task Activity')).toBeVisible();
    await expect(page.getByText('Created vs Completed')).toBeVisible();

    // Verify time filter buttons exist (Daily, Weekly, Monthly)
    await expect(page.getByRole('button', { name: /Daily/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Weekly/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Monthly/i })).toBeVisible();

    // Click different time filters
    await page.getByRole('button', { name: /Weekly/i }).click();
    await page.waitForTimeout(300);

    await page.getByRole('button', { name: /Monthly/i }).click();
    await page.waitForTimeout(300);

    await page.getByRole('button', { name: /Daily/i }).click();
    await page.waitForTimeout(300);

    // Verify chart area exists (Recharts renders SVG)
    const chartArea = page.locator('.recharts-wrapper, svg[class*="recharts"]');
    await expect(chartArea.first()).toBeVisible();
  });
});
