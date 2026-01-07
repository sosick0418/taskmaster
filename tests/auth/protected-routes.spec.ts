// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication & Session Management', () => {
  test('Unauthenticated users are redirected to login', async ({ browser }) => {
    // Use a fresh context to ensure no session
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Navigate to /tasks (without authentication)
    await page.goto('http://localhost:3000/tasks');

    // 2. Verify redirect to /login page
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // 3. Navigate to /analytics
    await page.goto('http://localhost:3000/analytics');

    // 4. Verify redirect to /login page
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // 5. Navigate to /settings
    await page.goto('http://localhost:3000/settings');

    // 6. Verify redirect to /login page
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    await context.close();
  });

  test('Authenticated users can access protected routes', async ({ page }) => {
    // 1. Login first
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/dev only/i)).toBeVisible({ timeout: 10000 });

    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.clear();
    await emailInput.fill('test@example.com');

    const testLoginButton = page.getByRole('button', { name: /test login/i });
    await testLoginButton.click();

    // Wait for redirect
    await expect(page).toHaveURL(/\/tasks/, { timeout: 20000 });

    // 2. Navigate to /tasks and verify access
    await page.goto('http://localhost:3000/tasks');
    await expect(page).toHaveURL(/\/tasks/);

    // 3. Navigate to /analytics and verify access
    await page.goto('http://localhost:3000/analytics');
    await expect(page).toHaveURL(/\/analytics/);

    // 4. Navigate to /settings and verify access
    await page.goto('http://localhost:3000/settings');
    await expect(page).toHaveURL(/\/settings/);
  });
});
