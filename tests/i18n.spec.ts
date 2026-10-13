import { test, expect, type Page } from '@playwright/test';
import { designs } from '../src/data/designs';

/**
 * Portuguese is a peer of English: it has its own home address, its own
 * metadata, and posts link to their translations.
 */

async function settle(page: Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.intro ?? 'none'), { timeout: 15_000 }).toMatch(/done|none/);
}

test('/pt/ opens in Portuguese even when the stored preference is English @mobile', async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('lang', 'en'); sessionStorage.setItem('seeded', '1'); } });
  const response = await page.goto('/pt/');
  expect(response?.status()).toBe(200);
  await settle(page);
  await expect(page.locator('html')).toHaveAttribute('data-lang', 'pt');
  await expect(page).toHaveTitle(/Desenvolvedor de Software Sênior/);
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'pt_BR');
  await expect(page.locator('#experience h2 [data-lang-show="pt"]').filter({ visible: true })).toHaveText('Experiência');
  await page.locator('#experience').scrollIntoViewIfNeeded();
  await expect(page.locator('#experience').getByText('abr 2025 - atual').filter({ visible: true }).first()).toBeVisible();
});

test('the language switch on the home keeps the address in step', async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('lang', 'en'); sessionStorage.setItem('seeded', '1'); } });
  await page.goto('/');
  await settle(page);
  const toggle = page.getByRole('button', { name: /switch to portuguese|mudar para inglês/i });

  await toggle.click();
  await expect(page).toHaveURL(/\/pt\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt');

  await toggle.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('a post links to its translation and the switch opens it', async ({ page }) => {
  await page.goto('/blog/arquitetura-limpa-microsservicos/');
  await settle(page);
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', /\/blog\/clean-architecture-microservices\/$/);
  await expect(page.locator('article h1')).toContainText('Microsserviços');

  await page.getByRole('button', { name: /switch to portuguese|mudar para inglês/i }).click();
  await expect(page).toHaveURL(/\/blog\/clean-architecture-microservices\/$/);
  await expect(page.locator('article h1')).toContainText('Microservices');
  await expect(page.locator('html')).toHaveAttribute('data-lang', 'en');
});

test('post dates print the calendar day they were written on', async ({ page }) => {
  await page.goto('/blog/');
  await expect(page.locator('time', { hasText: 'March 15, 2025' })).toHaveCount(1);
  await expect(page.locator('time', { hasText: '15 de março de 2025' })).toHaveCount(1);
});

test('without JavaScript /pt/ is Portuguese in every hero, not just the headings', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/pt/');
  const hero = page.locator('#hero [data-design-show="editorial"]');
  await expect(hero).toContainText('Desenvolvedor de Software Sênior');
  await expect(hero).toContainText('Atualmente em');
  await expect(hero).not.toContainText('Senior Software Engineer');
  await expect(page.locator('#experience [data-design-show="editorial"]')).toContainText('26 serviços independentes com Clean Architecture');
  await expect(page.locator('#contact').getByRole('link', { name: 'Baixar CV' })).toHaveAttribute('href', '/resume/Alexandre_Akira_ptbr_CV.pdf');
  await context.close();
});

for (const { id: world } of designs) {
  test(`${world}: CV downloads follow the language in the hero and contact @mobile`, async ({ page }) => {
    await page.addInitScript((w) => {
      localStorage.setItem('design', w);
      localStorage.setItem('lang', 'en');
      sessionStorage.setItem('intro-seen', '1');
    }, world);
    await page.goto('/');

    for (const [locale, label, file] of [
      ['en', 'Download CV', '/resume/Alexandre_Akira_en_CV.pdf'],
      ['pt', 'Baixar CV', '/resume/Alexandre_Akira_ptbr_CV.pdf'],
    ] as const) {
      if (locale === 'pt') {
        await page.getByRole('button', { name: /Switch to Portuguese/ }).click();
        await expect(page).toHaveURL(/\/pt\/$/);
      }
      const hero = page.locator(`#hero [data-design-show="${world}"]`);
      await expect(hero.getByRole('link', { name: new RegExp(label) })).toHaveAttribute('href', file);
      const contact = page.locator('#contact');
      await contact.scrollIntoViewIfNeeded();
      await expect(contact.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', file);
      const pdf = await page.request.get(file);
      expect(pdf.status()).toBe(200);
      expect(pdf.headers()['content-type']).toContain('application/pdf');
      expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
      await page.locator('#hero').scrollIntoViewIfNeeded();
    }
  });
}

test('/pt/blog/ is the Portuguese blog index, and its links stay in Portuguese', async ({ page }) => {
  const response = await page.goto('/pt/blog/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Artigos/);
  await expect(page.getByRole('link', { name: 'Alexandre Akira, início' })).toHaveAttribute('href', '/pt/');
});
