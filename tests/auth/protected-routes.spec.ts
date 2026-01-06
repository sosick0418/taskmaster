// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication & Session Management', () => {
  test('Protected Route Access', async ({ page, context }) => {
    // 1. Clear all cookies and local storage
    await context.clearCookies();
    await page.goto('http://localhost:3000');
    await page.evaluate(() => localStorage.clear());

    // 2. Navigate to http://localhost:3000/tasks (without authentication)
    await page.goto('http://localhost:3000/tasks');

    // 3. Verify redirect to /login page
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/\/login/);

    // 4. Navigate to http://localhost:3000/analytics
    await page.goto('http://localhost:3000/analytics');

    // 5. Verify redirect to /login page
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/\/login/);

    // 6. Navigate to http://localhost:3000/settings
    await page.goto('http://localhost:3000/settings');

    // 7. Verify redirect to /login page
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/\/login/);

    // 8. Perform test login with 'test@example.com'
    await page.goto('http://localhost:3000/login');
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.fill('test@example.com');
    const testLoginButton = page.getByRole('button', { name: /test login/i });
    await testLoginButton.click();
    await page.waitForURL('**/tasks');

    // 9. Navigate to /tasks and verify access is granted
    await page.goto('http://localhost:3000/tasks');
    await expect(page).toHaveURL(/\/tasks/);
    await expect(page.getByRole('heading', { name: /tasks/i })).toBeVisible();

    // 10. Navigate to /analytics and verify access is granted
    await page.goto('http://localhost:3000/analytics');
    await expect(page).toHaveURL(/\/analytics/);
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible();

    // 11. Navigate to /settings and verify access is granted
    await page.goto('http://localhost:3000/settings');
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
  });
});
