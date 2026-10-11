import { test, expect } from '@playwright/test';

// Engineer is left out while its rework happens on another branch.
const worlds = ['editorial', 'avantgarde', 'creative', 'arcade'];

/** Every link and button a visitor can reach on the home, smaller than a thumb (44px) in either direction. */
function smallTargets() {
  const out: string[] = [];
  for (const el of document.querySelectorAll<HTMLElement>('header a[href], header button, main a[href], main button, footer a[href], footer button')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || el.closest('.sr-only')) continue;
    if (r.width < 44 || r.height < 44) {
      const name = (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40);
      out.push(`${name} ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
  }
  return out;
}

for (const world of worlds) {
  test(`${world}: every control on the home is thumb-sized on a phone @mobile`, async ({ page }) => {
    await page.addInitScript((w) => {
      localStorage.setItem('design', w);
      localStorage.setItem('lang', 'en');
      sessionStorage.setItem('intro-seen', '1');
    }, world);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator(`#hero [data-design-show="${world}"] h1`)).toBeVisible();
    expect(await page.evaluate(smallTargets)).toEqual([]);
  });
}
