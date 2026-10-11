import { test, expect, type Page } from '@playwright/test';
import { designs } from '../src/data/designs';

const worlds = designs.map((d) => d.id);
const webglWorlds = new Set(['avantgarde']);

/** Collect console errors and uncaught exceptions for the life of a page. */
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  return errors;
}

/** Requests that pull in the Three.js scene code; hidden worlds must not trigger them. */
function watchThreeRequests(page: Page) {
  const urls: string[] = [];
  page.on('request', (r) => { if (/three|drei/i.test(new URL(r.url()).pathname)) urls.push(r.url()); });
  return urls;
}

async function arrive(page: Page, world: string, lang: 'en' | 'pt' = 'en') {
  await page.addInitScript(([w, l]) => { localStorage.setItem('design', w); localStorage.setItem('lang', l); }, [world, lang] as const);
  await page.goto('/');
  // The intro curtain arms before first paint and reports "done" when it has lifted.
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.intro ?? 'none'), { timeout: 15_000 }).toMatch(/done|none/);
}

const heroOf = (page: Page, world: string) => page.locator(`#hero [data-design-show="${world}"]`);

async function expectHeroVisible(page: Page, world: string) {
  const hero = heroOf(page, world);
  await expect(hero.locator('astro-island')).not.toHaveAttribute('ssr', /.*/);
  const h1 = hero.locator('h1');
  await expect(h1).toBeVisible();
  await expect.poll(() => h1.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  await expect(h1).toContainText(/Alexandre\s*Akira/);
  // The name must never sit on top of whatever the world prints above it.
  const overlap = await hero.evaluate((root) => {
    const h1 = root.querySelector('h1');
    const above = h1?.previousElementSibling;
    if (!h1 || !above) return false;
    return h1.getBoundingClientRect().top < above.getBoundingClientRect().bottom - 2;
  });
  expect(overlap, 'h1 overlaps the element above it').toBe(false);
}

for (const world of worlds) {
  test(`arrival: ${world} hero is visible, hidden worlds stay cold @mobile`, async ({ page }) => {
    const errors = watchErrors(page);
    const three = watchThreeRequests(page);
    await arrive(page, world);
    await expectHeroVisible(page, world);

    for (const other of worlds.filter((w) => w !== world)) {
      await expect(heroOf(page, other).locator('astro-island')).toHaveAttribute('ssr', /.*/);
    }
    if (webglWorlds.has(world)) {
      await expect(heroOf(page, world).locator('canvas')).toHaveCount(1);
    } else {
      expect(three, 'a world without WebGL must not download Three.js').toEqual([]);
    }
    expect(errors).toEqual([]);
  });
}

test('quick-change: switching worlds hydrates the incoming hero and warms code on intent', async ({ page }) => {
  const errors = watchErrors(page);
  const three = watchThreeRequests(page);
  await arrive(page, 'editorial');
  expect(three).toEqual([]);

  // Touching the switcher is intent: hidden heroes start loading their code.
  const trigger = page.getByRole('button', { name: /switch design/i });
  await trigger.hover();
  await expect.poll(() => three.length, { timeout: 10_000 }).toBeGreaterThan(0);

  for (const [label, world] of [['Avant-garde', 'avantgarde'], ['Arcade', 'arcade'], ['Creative', 'creative']] as const) {
    await trigger.click();
    await page.getByRole('list', { name: 'Design options' }).getByRole('button', { name: label }).click();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.design)).toBe(world);
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.intro), { timeout: 10_000 }).toBe('done');
    await expectHeroVisible(page, world);
  }
  expect(errors).toEqual([]);
});

test('editorial keeps its hero intact after a switch and a scroll', async ({ page }) => {
  const errors = watchErrors(page);
  await arrive(page, 'creative');
  await page.waitForTimeout(5_000); // let idle work settle
  await page.getByRole('button', { name: /switch design/i }).click();
  await page.getByRole('list', { name: 'Design options' }).getByRole('button', { name: 'Editorial' }).click();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.intro), { timeout: 10_000 }).toBe('done');
  await expectHeroVisible(page, 'editorial');
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(400);
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(400);
  await expectHeroVisible(page, 'editorial');
  expect(errors).toEqual([]);
});

test('portuguese visit: no hydration mismatch and the hero speaks pt', async ({ page }) => {
  const errors = watchErrors(page);
  await arrive(page, 'editorial', 'pt');
  await expectHeroVisible(page, 'editorial');
  await expect(heroOf(page, 'editorial')).toContainText('Desenvolvedor Full-Stack Sênior');
  expect(errors).toEqual([]);
});

test('reduced motion: no curtain, hero visible at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = watchErrors(page);
  await arrive(page, 'arcade');
  expect(await page.evaluate(() => document.documentElement.dataset.intro ?? 'none')).toBe('none');
  await expectHeroVisible(page, 'arcade');
  expect(errors).toEqual([]);
});
