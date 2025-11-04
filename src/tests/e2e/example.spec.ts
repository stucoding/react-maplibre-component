import { test, expect } from '@playwright/test';

test('homepage loads and shows map', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#root')).toBeVisible();
  
});
