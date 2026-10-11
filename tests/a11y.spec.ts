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

test('blog code reads in every world: every syntax token at 4.5:1 or more on its panel', async ({ page }) => {
  for (const world of ['editorial', 'creative', 'avantgarde', 'engineer', 'arcade']) {
    await page.addInitScript((w) => localStorage.setItem('design', w), world);
    await page.goto('/blog/es6-es7-es8-what-feature-is-that/');
    await expect(page.locator('html')).toHaveAttribute('data-design', world);
    const min = await page.evaluate(() => {
      const rgb = (s: string) => (s.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const lin = (c: number) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
      const L = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      const cr = (a: number[], b: number[]) => { const [x, y] = [L(a), L(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
      let lowest = 99;
      for (const pre of document.querySelectorAll('.prose pre')) {
        const bg = rgb(getComputedStyle(pre).backgroundColor);
        for (const s of pre.querySelectorAll('span')) {
          if (s.textContent?.trim() && !s.children.length) lowest = Math.min(lowest, cr(rgb(getComputedStyle(s).color), bg));
        }
      }
      return lowest;
    });
    expect(min, `${world}: lowest code token contrast`).toBeGreaterThanOrEqual(4.5);
  }
});

test('the Avant-garde name is read once, not letter by letter', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('design', 'avantgarde'));
  await page.goto('/');
  await expect(page.locator('#hero [data-design-show="avantgarde"]').getByRole('heading', { level: 1 })).toHaveAccessibleName('Alexandre Akira');
});

test('the mobile menu is a modal dialog that keeps focus inside @mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.intro ?? 'none'), { timeout: 15_000 }).toMatch(/done|none/);
  await page.getByRole('button', { name: 'Open menu' }).click();
  const dialog = page.getByRole('dialog', { name: 'Mobile navigation' });
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
  }
});

test('filters and tabs announce which one is selected', async ({ page }) => {
  await page.goto('/blog/');
  const filters = page.locator('[data-filter-group="en"] .tag-filter');
  await expect(filters.first()).toHaveAttribute('aria-pressed', 'true');
  await filters.nth(1).click();
  await expect(filters.nth(1)).toHaveAttribute('aria-pressed', 'true');
  await expect(filters.first()).toHaveAttribute('aria-pressed', 'false');
});
