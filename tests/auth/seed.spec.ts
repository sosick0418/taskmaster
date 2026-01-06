import { test } from '@playwright/test';

test('auth seed setup', async ({ page }) => {
  await page.goto('http://localhost:3000');
});
