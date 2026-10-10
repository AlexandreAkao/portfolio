import { test, expect, type Page } from '@playwright/test';

/** The five designs are the site's premise: a first visit should find them without being told. */

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
  await expect(hero.getByText('One portfolio, 5 designs.')).toBeVisible();
  await hero.getByRole('button', { name: 'Switch to Avant-garde' }).click();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.design)).toBe('avantgarde');
  await expect(page.locator('#hero [data-design-show="avantgarde"]').getByRole('button', { name: 'Switch to Engineer' })).toBeVisible();
});

test('the switcher says what it holds, marks the current design and closes on Escape', async ({ page }) => {
  await page.goto('/');
  await settle(page);
  const trigger = page.getByRole('button', { name: /switch design/i });
  await trigger.click();
  const options = page.getByRole('list', { name: 'Design options' });
  await expect(page.getByText('Same content, 5 designs')).toBeVisible();
  await expect(options.getByRole('button', { name: 'Editorial' })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(options).toBeHidden();
  await expect(trigger).toBeFocused();
});
