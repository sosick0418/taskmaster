// spec: specs/taskmaster-e2e-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication & Session Management', () => {
  test('Landing Page Navigation', async ({ page }) => {
    // 1. Navigate to http://localhost:3000
    await page.goto('http://localhost:3000');

    // 2. Verify landing page loads with hero section and 'Master Your Tasks' heading
    await expect(page.getByRole('heading', { name: /master your tasks/i })).toBeVisible();

    // 3. Verify 'Sign in' link is visible in header
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();

    // 4. Verify 'Get Started' button is visible
    await expect(page.getByRole('link', { name: /get started/i })).toBeVisible();

    // 5. Click 'View on GitHub' link and verify it opens in new tab
    const githubLink = page.getByRole('link', { name: /view on github/i });
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/sosick0418/taskmaster');
    await expect(githubLink).toHaveAttribute('target', '_blank');

    // 6. Scroll down to features section and verify all 5 feature cards are displayed
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await expect(page.getByText(/kanban board/i)).toBeVisible();
    await expect(page.getByText(/smart lists/i)).toBeVisible();
    await expect(page.getByText(/delightful ux/i)).toBeVisible();
    await expect(page.getByText(/lightning fast/i)).toBeVisible();
    await expect(page.getByText(/secure auth/i)).toBeVisible();

    // 7. Verify footer contains Taskmaster logo and social links
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/taskmaster/i)).toBeVisible();
  });
});
