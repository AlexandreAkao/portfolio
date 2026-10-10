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

test('contact names the action, shows the address and copies it', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.intro ?? 'none'), { timeout: 15_000 }).toMatch(/done|none/);
  const contact = page.locator('#contact');
  await contact.scrollIntoViewIfNeeded();

  await expect(contact.getByRole('link', { name: 'Email me' })).toHaveAttribute('href', /^mailto:/);
  await expect(contact.getByRole('link', { name: 'Download CV' })).toHaveAttribute('href', /\.pdf$/);
  await expect(contact.getByText(/@gmail\.com$/)).toBeVisible();

  await contact.getByRole('button', { name: 'Copy email address' }).click();
  await expect(contact.getByRole('button', { name: 'Copy email address' })).toHaveText('Copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/@gmail\.com$/);
});

test('the curtain plays on the home once per session, never on a deep link', async ({ page }) => {
  const intro = () => page.evaluate(() => document.documentElement.dataset.intro ?? 'none');
  await page.goto('/blog/clean-architecture-microservices/');
  expect(await intro()).toBe('none');

  await page.goto('/');
  expect(await intro()).not.toBe('none');
  await expect.poll(intro, { timeout: 15_000 }).toBe('done');

  await page.reload();
  expect(await intro()).toBe('none');
});

test('a scroll gesture ends the curtain instead of being swallowed', async ({ page }) => {
  await page.goto('/');
  await page.mouse.move(400, 400);
  await page.mouse.wheel(0, 300);
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.intro ?? 'none'), { timeout: 1_000 }).toBe('done');
});

test('professional projects are one line each, pointing to Experience', async ({ page }) => {
  await page.goto('/');
  const rows = page.locator('#projects a[href="#experience"]');
  await expect(rows).toHaveCount(4);
  await expect(rows.first()).toContainText('Appointally');
  await expect(rows.first()).toContainText('19 microservices');
});
