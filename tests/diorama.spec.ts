import { test, expect } from '@playwright/test';

test('the switcher offers Diorama in both languages', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('design', 'diorama'); sessionStorage.setItem('intro-seen', '1'); });
  await page.goto('/pt/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-design', 'diorama');
  await page.getByRole('button', { name: /trocar design/i }).click();
  await expect(page.getByRole('list', { name: 'Opções de design' }).getByRole('button', { name: 'Diorama' })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim())).toBe('#15161a');

  await page.evaluate(() => localStorage.setItem('lang', 'en'));
  await page.goto('/');
  await expect(html).toHaveAttribute('data-design', 'diorama');
  await page.getByRole('button', { name: /switch design/i }).click();
  await expect(page.getByRole('list', { name: 'Design options' }).getByRole('button', { name: 'Diorama' })).toHaveAttribute('aria-pressed', 'true');
});
