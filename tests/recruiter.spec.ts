import { test, expect } from '@playwright/test';
import { designs } from '../src/data/designs';

/**
 * A recruiter on a phone should find who Alexandre works for now, and a way to
 * reach him, without scrolling past the hero or hunting through the page.
 */

for (const { id: world } of designs) {
  test(`${world}: the hero names the current companies and links the email @mobile`, async ({ page }) => {
    await page.addInitScript((w) => { localStorage.setItem('design', w); localStorage.setItem('lang', 'en'); }, world);
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.intro ?? 'none'), { timeout: 15_000 }).toMatch(/done|none/);
    const hero = page.locator(`#hero [data-design-show="${world}"]`);
    await expect(hero.getByText(/Currently at/)).toBeVisible();
    await expect(hero.getByText('Seva / Appointally')).toBeVisible();
    await expect(hero.getByRole('link', { name: 'Email' })).toHaveAttribute('href', /^mailto:/);
  });
}

test('the mobile menu closes from inside and carries the CV and the email @mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.intro ?? 'none'), { timeout: 15_000 }).toMatch(/done|none/);

  await page.getByRole('button', { name: 'Open menu' }).click();
  const panel = page.getByRole('navigation', { name: 'Mobile navigation' });
  await expect(panel.getByRole('link', { name: 'Download CV' })).toHaveAttribute('href', /\.pdf$/);
  await expect(panel.getByRole('link', { name: /@/ })).toHaveAttribute('href', /^mailto:/);

  const close = panel.getByRole('button', { name: 'Close menu' });
  await expect(close).toBeFocused();
  await close.click();
  await expect(panel).toBeHidden();
});
