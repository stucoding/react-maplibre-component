import { test, expect } from '@playwright/test';

test('homepage loads and shows Vite + React', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Vite \+ React/);
  await expect(page.locator('#root')).toBeVisible();
});
