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

test('Editorial stages its own about and footer; contact and the other worlds keep the shared ones', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#about [data-design-show="editorial"] .editorial-lede').first()).toBeVisible();
  await expect(page.locator('#about [data-design-hide="editorial"]')).toBeHidden();
  await expect(page.getByRole('heading', { name: 'By the numbers' })).toBeVisible();
  await expect(page.locator('footer [data-design-show="editorial"]')).toContainText('Edition');
  await expect(page.locator('#contact').getByRole('heading', { name: 'Get In Touch' })).toBeVisible();
  await expect(page.locator('#contact [data-design-show], #contact [data-design-hide]')).toHaveCount(0);

  await page.getByRole('button', { name: /switch design/i }).click();
  await page.getByRole('list', { name: 'Design options' }).getByRole('button', { name: 'Arcade' }).click();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.design)).toBe('arcade');
  await expect(page.locator('#about [data-design-hide="editorial"]')).toBeVisible();
  await expect(page.locator('#about [data-design-show="editorial"]')).toBeHidden();
});

test("Editorial's experience leads with the result and keeps the bullets behind details", async ({ page }) => {
  await page.goto('/');
  const exp = page.locator('#experience [data-design-show="editorial"]');
  await exp.scrollIntoViewIfNeeded();
  await expect(exp.getByText('19 microservices on Clean Architecture and CQRS')).toBeVisible();
  await expect(exp.getByText('Implemented event-driven communication with RabbitMQ and Redis')).toHaveCount(0);
  await exp.getByRole('button', { name: /details/i }).first().click();
  await expect(exp.getByRole('button', { name: /collapse/i }).first()).toHaveAttribute('aria-expanded', 'true');
  await expect(exp.getByText('Implemented event-driven communication with RabbitMQ and Redis')).toBeVisible();
});

test("Avant-garde's experience keeps each result on the card and the bullets behind details", async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('design', 'avantgarde'); sessionStorage.setItem('intro-seen', '1'); });
  await page.goto('/');
  const exp = page.locator('#experience [data-design-show="avantgarde"]');
  await exp.scrollIntoViewIfNeeded();
  await expect(exp.getByText('19 microservices on Clean Architecture and CQRS')).toBeVisible();
  await expect(exp.getByText('Implemented event-driven communication with RabbitMQ and Redis')).toHaveCount(0);
  await exp.getByRole('button', { name: /details/i }).first().click();
  await expect(exp.getByRole('button', { name: /collapse/i }).first()).toHaveAttribute('aria-expanded', 'true');
  await expect(exp.getByText('Implemented event-driven communication with RabbitMQ and Redis')).toBeVisible();
});
