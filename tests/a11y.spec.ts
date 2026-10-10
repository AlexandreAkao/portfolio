import { test, expect } from '@playwright/test';

/** Visitors who read without JavaScript, ask for less motion, or need contrast get the same page. */

test('without JavaScript the sections are visible, not stuck at their start state', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('#about h2').locator('xpath=ancestor::*[contains(@style,"opacity")][1]')).toHaveCSS('opacity', '1');
  await context.close();
});

test('reduced motion skips Motion animations instead of fading sections in', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#about').scrollIntoViewIfNeeded();
  const reveal = page.locator('#about h2').locator('xpath=ancestor::*[contains(@style,"opacity")][1]');
  // Without the skip, a 0.5s fade would still be under way after 150ms.
  await page.waitForTimeout(150);
  await expect(reveal).toHaveCSS('opacity', '1', { timeout: 100 });
});

test('Editorial keeps its orange readable: ink on fills, Signal Orange Ink for small text', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-design', 'editorial');
  await expect(page.locator('#contact').getByRole('link', { name: 'Email me' })).toHaveCSS('color', 'rgb(26, 26, 26)');
  const cv = page.locator('#hero [data-design-show="editorial"]').getByRole('link', { name: 'Download CV' });
  await expect(cv).toHaveCSS('color', 'rgb(191, 57, 0)');
});
