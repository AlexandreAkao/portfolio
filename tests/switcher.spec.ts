import { test, expect, type Page } from '@playwright/test';
import { designs } from '../src/data/designs';

const count = designs.length;

/** The designs are the site's premise: a first visit should find them without being told. */

async function settle(page: Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.intro ?? 'none'), { timeout: 15_000 }).toMatch(/done|none/);
}

test('a first visit opens on Editorial @mobile', async ({ page }) => {
  await page.goto('/');
  await settle(page);
  await expect(page.locator('html')).toHaveAttribute('data-design', 'editorial');
  await expect(page.getByRole('button', { name: /switch design/i })).toContainText(/design|editorial/i);
});

test("the hero's invitation switches to the next design", async ({ page }) => {
  await page.goto('/');
  await settle(page);
  const hero = page.locator('#hero [data-design-show="editorial"]');
  await expect(hero.getByText(`One portfolio, ${count} designs.`)).toBeVisible();
  await hero.getByRole('button', { name: 'Switch to Avant-garde' }).click();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.design)).toBe('avantgarde');
  await expect(page.locator('#hero [data-design-show="avantgarde"]').getByRole('button', { name: 'Switch to Engineer' })).toBeVisible();
});

for (const [world, path, shown, other] of [
  ['diorama', '/', 'Diorama', 'Editorial'],
  ['arcade', '/', 'Arcade', 'Editorial'],
  ['tape', '/pt/', 'Fita', 'Editorial'],
  ['editorial', '/', 'Editorial', 'Diorama'],
] as const) {
  test(`the switcher names ${world} from the first paint at ${path}, before it has hydrated`, async ({ page }) => {
    await page.addInitScript((w) => { localStorage.setItem('design', w); sessionStorage.setItem('intro-seen', '1'); }, world);
    // The switcher's code is held back: what shows now is the server's markup and the head script's world
    let release = () => {};
    const held = new Promise<void>((r) => { release = r; });
    await page.route(/islands\/DesignToggle\.tsx/, async (route) => { await held; await route.continue(); });
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const trigger = page.locator('header button[aria-controls="design-options"]');
    await expect(trigger.getByText(shown)).toBeVisible();
    await expect(trigger.getByText(other)).toBeHidden();
    release();
    // Hydrated, it says the same
    await expect(trigger).toHaveAttribute('aria-label', new RegExp(shown));
    await expect(trigger.getByText(shown)).toBeVisible();
    await expect(trigger.getByText(other)).toBeHidden();
  });
}

test('the switcher follows a switch, and names the world after it', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('design', 'editorial'); sessionStorage.setItem('intro-seen', '1'); });
  await page.goto('/');
  const trigger = page.locator('header button[aria-controls="design-options"]');
  await trigger.click();
  await page.getByRole('list', { name: 'Design options' }).getByRole('button', { name: 'Arcade' }).click();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.design)).toBe('arcade');
  await expect(trigger.getByText('Arcade')).toBeVisible();
  await expect(trigger.getByText('Editorial')).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-label', /Arcade/);
});

test('the switcher says what it holds, marks the current design and closes on Escape', async ({ page }) => {
  await page.goto('/');
  await settle(page);
  const trigger = page.getByRole('button', { name: /switch design/i });
  await trigger.click();
  const options = page.getByRole('list', { name: 'Design options' });
  await expect(page.getByText(`Same content, ${count} designs`)).toBeVisible();
  await expect(options.getByRole('button', { name: 'Editorial' })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(options).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('Editorial stages its own about and footer; contact and the other worlds keep the shared ones', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#about [data-design-show="editorial"] .editorial-lede').first()).toBeVisible();
  await expect(page.locator('#about [data-design-hide~="editorial"]').last()).toBeHidden();
  await expect(page.getByRole('heading', { name: 'By the numbers' })).toBeVisible();
  await expect(page.locator('footer [data-design-show="editorial"]')).toContainText('Edition');
  await expect(page.locator('#contact').getByRole('heading', { name: 'Get In Touch' })).toBeVisible();
  // Editorial keeps the shared contact (Engineer, Terminal and Tape stage their own)
  await expect(page.locator('#contact [data-design-show="editorial"], #contact [data-design-hide~="editorial"]')).toHaveCount(0);

  await page.getByRole('button', { name: /switch design/i }).click();
  await page.getByRole('list', { name: 'Design options' }).getByRole('button', { name: 'Arcade' }).click();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.design)).toBe('arcade');
  await expect(page.locator('#about [data-design-hide~="editorial"]').last()).toBeVisible();
  await expect(page.locator('#about [data-design-show="editorial"]')).toBeHidden();
});

test("Editorial's experience leads with the result and keeps the bullets behind details", async ({ page }) => {
  await page.goto('/');
  const exp = page.locator('#experience [data-design-show="editorial"]');
  await exp.scrollIntoViewIfNeeded();
  await expect(exp.getByText('26 independent services built with Clean Architecture')).toBeVisible();
  await expect(exp.getByText(/Architected distributed microservices with Hexagonal Architecture/)).toHaveCount(0);
  await exp.getByRole('button', { name: /details/i }).first().click();
  await expect(exp.getByRole('button', { name: /collapse/i }).first()).toHaveAttribute('aria-expanded', 'true');
  await expect(exp.getByText(/Architected distributed microservices with Hexagonal Architecture/)).toBeVisible();
});

test("Avant-garde's experience keeps each result on the card and the bullets behind details", async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('design', 'avantgarde'); sessionStorage.setItem('intro-seen', '1'); });
  await page.goto('/');
  const exp = page.locator('#experience [data-design-show="avantgarde"]');
  await exp.scrollIntoViewIfNeeded();
  await expect(exp.getByText('26 independent services built with Clean Architecture')).toBeVisible();
  await expect(exp.getByText(/Architected distributed microservices with Hexagonal Architecture/)).toHaveCount(0);
  await exp.getByRole('button', { name: /details/i }).first().click();
  await expect(exp.getByRole('button', { name: /collapse/i }).first()).toHaveAttribute('aria-expanded', 'true');
  await expect(exp.getByText(/Architected distributed microservices with Hexagonal Architecture/)).toBeVisible();
});
