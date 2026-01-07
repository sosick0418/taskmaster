// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication & Session Management', () => {
  test('Logout Flow', async ({ page }) => {
    // 1. Login with test credentials (test@example.com)
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');

    // Wait for the dev section to be visible
    await expect(page.getByText(/dev only/i)).toBeVisible({ timeout: 10000 });

    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.clear();
    await emailInput.fill('test@example.com');

    const testLoginButton = page.getByRole('button', { name: /test login/i });
    await testLoginButton.click();

    // Wait for redirect with longer timeout
    await expect(page).toHaveURL(/\/tasks/, { timeout: 20000 });

    // 2. Wait for user button to be visible
    const userButton = page.locator('[data-testid="user-button"]');
    await expect(userButton).toBeVisible({ timeout: 10000 });

    // 3. Click user avatar button in header
    await userButton.click();

    // 4. Verify dropdown menu opens with user info
    await expect(page.getByText(/test@example\.com/i)).toBeVisible({ timeout: 5000 });

    // 5. Click 'Sign out' button in dropdown
    const signOutButton = page.getByRole('menuitem', { name: /sign out/i });
    await signOutButton.click();

    // 6. Verify redirect to landing page (/) or login page
    await expect(page).toHaveURL(/\/(login)?$/, { timeout: 10000 });
  });
});
