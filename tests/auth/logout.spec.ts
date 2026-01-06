// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication & Session Management', () => {
  test('Logout Flow', async ({ page, context }) => {
    // 1. Login with test credentials (test@example.com)
    await page.goto('http://localhost:3000/login');
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.fill('test@example.com');
    const testLoginButton = page.getByRole('button', { name: /test login/i });
    await testLoginButton.click();
    await page.waitForURL('**/tasks');

    // 2. Navigate to /tasks page
    await expect(page).toHaveURL(/\/tasks/);

    // 3. Click user avatar button in header
    const userButton = page.locator('[data-testid="user-button"], button:has-text("test")').first();
    await expect(userButton).toBeVisible();
    await userButton.click();

    // 4. Verify dropdown menu opens with user info
    await expect(page.getByText(/test@example\.com/i)).toBeVisible();

    // 5. Click 'Sign out' button in dropdown
    const signOutButton = page.getByRole('menuitem', { name: /sign out/i });
    await expect(signOutButton).toBeVisible();
    await signOutButton.click();

    // 6. Verify redirect to landing page (/) or login page
    await page.waitForURL(/\/(login)?$/);
    const currentUrl = page.url();
    expect(currentUrl === 'http://localhost:3000/' || currentUrl.includes('/login')).toBeTruthy();

    // 7. Attempt to navigate to /tasks
    await page.goto('http://localhost:3000/tasks');

    // 8. Verify redirect back to /login
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/\/login/);

    // 9. Verify session cookies are cleared
    const cookies = await context.cookies();
    const authCookies = cookies.filter(cookie => 
      cookie.name.includes('session') || 
      cookie.name.includes('auth') ||
      cookie.name.includes('token')
    );
    expect(authCookies.length).toBe(0);
  });
});
