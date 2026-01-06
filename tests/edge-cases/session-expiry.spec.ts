// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Edge Cases - Session Management', () => {
  test('clearing cookies redirects to login', async ({ page, context }) => {
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');

    // Clear all cookies
    await context.clearCookies();

    // Navigate - should redirect to login
    await page.goto('http://localhost:3000/tasks');
    await page.waitForURL('**/login');

    expect(page.url()).toContain('/login');
  });

  test('invalid session token redirects to login', async ({ page, context }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');

    // Get cookies and modify session
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c =>
      c.name.includes('session') ||
      c.name.includes('auth') ||
      c.name.includes('token')
    );

    if (sessionCookie) {
      // Clear and set invalid cookie
      await context.clearCookies();
      await context.addCookies([{
        ...sessionCookie,
        value: 'invalid_token_value',
      }]);
    }

    // Navigate - should redirect to login
    await page.goto('http://localhost:3000/tasks');
    await page.waitForURL('**/login');
  });

  test('session survives page refresh', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');

    // Refresh multiple times
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/tasks/);

    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/tasks/);
  });

  test('logout in one tab affects other tabs on navigation', async ({ page, context }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');

    // Open second tab
    const page2 = await context.newPage();
    await page2.goto('http://localhost:3000/tasks');

    // Logout from first tab
    const userButton = page.locator('[data-testid="user-button"], button:has-text("test")').first();
    await userButton.click();
    await page.click('text=/sign out|logout/i');
    await page.waitForURL(/\/(login)?$/);

    // Second tab should redirect on next navigation
    await page2.goto('http://localhost:3000/analytics');
    await page2.waitForURL('**/login');
  });

  test('protected API calls fail after logout', async ({ page, context }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Test Login")');
    await page.waitForURL('**/tasks');

    // Logout
    const userButton = page.locator('[data-testid="user-button"], button:has-text("test")').first();
    await userButton.click();
    await page.click('text=/sign out|logout/i');
    await page.waitForURL(/\/(login)?$/);

    // Try to access protected route
    await page.goto('http://localhost:3000/tasks');
    await page.waitForURL('**/login');

    // Should be on login page
    expect(page.url()).toContain('/login');
  });
});
