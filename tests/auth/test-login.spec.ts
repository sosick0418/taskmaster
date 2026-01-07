// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication & Session Management', () => {
  test('Development Test Login', async ({ page }) => {
    // 1. Verify NODE_ENV is set to 'development'
    // This is assumed to be true when running local tests

    // 2. Navigate to http://localhost:3000/login
    await page.goto('http://localhost:3000/login');

    // 3. Verify 'Dev Only' section is visible (separated by divider)
    await expect(page.getByText(/dev only/i)).toBeVisible();

    // 4. Enter 'test@example.com' in email input field
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.fill('test@example.com');

    // 5. Click 'Test Login (Dev)' button
    const testLoginButton = page.getByRole('button', { name: /test login/i });
    await expect(testLoginButton).toBeVisible();
    await testLoginButton.click();

    // 6. Verify redirect to /tasks page
    await page.waitForURL('**/tasks');
    await expect(page).toHaveURL(/\/tasks/);

    // 7. Verify user is authenticated with email 'test@example.com'
    // Check for user button in header
    const userButton = page.locator('[data-testid="user-button"], button:has-text("test")').first();
    await expect(userButton).toBeVisible();

    // 8. Verify user name 'test' appears in header
    await userButton.click();
    await expect(page.getByText(/test@example\.com/i)).toBeVisible();
  });
});
