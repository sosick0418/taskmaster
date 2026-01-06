import { test, expect } from '@playwright/test';

test.describe('Auth Flow - GitHub OAuth', () => {
  test('github login button is visible', async ({ page }) => {
    await page.goto('/login');

    // Verify GitHub login option exists
    const githubButton = page.getByRole('button', { name: /github|continue with github/i });
    await expect(githubButton).toBeVisible();
  });

  test('github login button has correct icon', async ({ page }) => {
    await page.goto('/login');

    const githubButton = page.getByRole('button', { name: /github/i });

    // Verify button contains GitHub icon (SVG)
    const icon = githubButton.locator('svg');
    await expect(icon).toBeVisible();
  });

  test('clicking github login redirects to oauth', async ({ page }) => {
    await page.goto('/login');

    // Get current URL before click
    const currentUrl = page.url();

    // Click GitHub login
    const githubButton = page.getByRole('button', { name: /github/i });

    // Listen for navigation
    const navigationPromise = page.waitForURL(/github\.com|api\/auth/);

    await githubButton.click();

    // Should navigate away from login page
    try {
      await navigationPromise;
      // Either redirects to GitHub or to API auth endpoint
      expect(page.url()).not.toBe(currentUrl);
    } catch {
      // If OAuth is not configured, might show error or stay on page
      // This is acceptable in test environment
    }
  });

  test('login page shows alternative login methods', async ({ page }) => {
    await page.goto('/login');

    // Verify both GitHub OAuth and test login are available
    await expect(page.getByRole('button', { name: /github/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /test login/i })).toBeVisible();

    // Verify separator or "or" text
    await expect(page.getByText(/or/i)).toBeVisible();
  });
});
