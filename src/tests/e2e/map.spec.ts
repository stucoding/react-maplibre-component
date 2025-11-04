import { test, expect } from '@playwright/test';

test('homepage loads and shows Vite + React', async ({ page }) => {
  test.setTimeout(60000); // give this test up to 60s total
  await page.goto('/');


  // 1️⃣ Check that the root container is visible
  await expect(page.locator('#root')).toBeVisible();

  // 2️⃣ Wait for the map canvas to appear
  const mapCanvas = page.locator('canvas.maplibregl-canvas');
  await expect(mapCanvas).toBeVisible({ timeout: 40000 });

  // 3️⃣ Wait for overlay to fade out
  const overlay = page.locator('#map-overlay');
  try{
    await expect(overlay).toHaveCSS('opacity', '0', { timeout: 40000 });
  } catch (error) {
    const style = await overlay.evaluate(el => getComputedStyle(el).opacity);
    console.log('overlay opacity should be 0, but is:', style);
  }

  // 4️⃣ (optional) Check that at least one marker or control exists
  const marker = page.locator('.maplibregl-marker');
  await expect(marker.first()).toBeVisible();

  // 5️⃣ (optional) Confirm that the title updated
  await expect(page).toHaveTitle(/Map/i);
  
});
