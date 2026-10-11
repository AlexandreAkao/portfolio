import { test, expect, type Page } from '@playwright/test';

/**
 * Engineer reads as an Internet-Draft in a pager; Terminal is a shell session;
 * Tape is the career punched into paper tape; Cartoon is a 1960s cartoon's
 * opening titles. Each stages its own hero, about, experience, contact and
 * footer from the shared content.
 */

async function arrive(page: Page, world: string, path = '/') {
  await page.addInitScript((w) => localStorage.setItem('design', w), world);
  await page.goto(path);
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.intro ?? 'none'), { timeout: 15_000 }).toMatch(/done|none/);
}

const rgb = (page: Page, selector: string, prop: string) =>
  page.locator(selector).first().evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

test('Engineer is a draft, not the navy-and-teal template', async ({ page }) => {
  await arrive(page, 'engineer');
  expect(await rgb(page, 'body', 'background-color')).toBe('rgb(246, 247, 248)');
  const hero = page.locator('#hero [data-design-show="engineer"]');
  await expect(hero).toContainText('less draft-akira-full-stack-engineer.txt');
  await expect(hero.getByRole('heading', { name: 'Abstract' })).toBeVisible();
  await expect(hero.getByRole('heading', { name: 'Status of This Memo' })).toBeVisible();
  await expect(hero.getByText('Hi, my name is')).toHaveCount(0);
  // The table of contents leads to every section
  await expect(hero.getByRole('navigation', { name: 'Table of Contents' }).getByRole('link')).toHaveCount(7);
});

test('Engineer numbers its sections, marks figures and keeps details behind toggles', async ({ page }) => {
  await arrive(page, 'engineer');
  await expect(page.locator('#about').getByRole('heading', { name: '1. Introduction' })).toBeVisible();
  await expect(page.locator('#about').getByRole('table')).toContainText('Distribution Centers');
  const exp = page.locator('#experience [data-design-show="engineer"]');
  await exp.scrollIntoViewIfNeeded();
  await expect(exp.locator('mark.rfc-mark', { hasText: '19' }).first()).toBeVisible();
  // The 2 in "B2B" is not a figure
  await expect(exp.locator('mark.rfc-mark', { hasText: /^2$/ })).toHaveCount(0);
  await expect(exp.getByText('Status: Historic').first()).toBeVisible();
  const toggle = exp.getByRole('button', { name: /details/ }).first();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(exp.getByRole('button', { name: /collapse/ }).first()).toHaveAttribute('aria-expanded', 'true');
  await expect(exp.getByText('Implemented event-driven communication with RabbitMQ and Redis')).toBeVisible();
});

test("Engineer's pager line follows the reading and ends on (END)", async ({ page }) => {
  await arrive(page, 'engineer');
  const pager = page.locator('[data-rfc-pager]');
  await expect(pager).toBeVisible();
  await expect(pager).toContainText('Abstract');
  await page.locator('#experience').scrollIntoViewIfNeeded();
  await expect(pager).toContainText('Experience');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(pager).toContainText('(END)');
  // Contact is the author's address, the address in plain sight and copyable
  const contact = page.locator('#contact');
  await expect(contact.getByRole('heading', { name: "6. Author's Address" })).toBeVisible();
  await expect(contact.getByRole('link', { name: 'Email me' })).toHaveAttribute('href', /^mailto:/);
  await expect(contact.getByRole('button', { name: 'Copy email address' })).toBeVisible();
  await expect(page.locator('footer').getByRole('heading', { name: '7. References' })).toBeVisible();
});

test('Engineer speaks Portuguese on /pt/', async ({ page }) => {
  await arrive(page, 'engineer', '/pt/');
  const hero = page.locator('#hero [data-design-show="engineer"]');
  await expect(hero.getByRole('heading', { name: 'Resumo' })).toBeVisible();
  await expect(hero.getByRole('heading', { name: 'Status deste memorando' })).toBeVisible();
  await expect(page.locator('#about').getByRole('heading', { name: '1. Introdução' })).toBeVisible();
  await expect(page.locator('[data-rfc-pager]')).toContainText('Resumo');
});

test('Terminal plays a shell session: whoami, experience.log as a tree, mail, exit', async ({ page }) => {
  await arrive(page, 'terminal');
  const hero = page.locator('#hero [data-design-show="terminal"]');
  await expect(hero.getByText('whoami')).toBeVisible();
  await expect(hero.getByRole('heading', { level: 1 })).toHaveText('Alexandre Akira');
  await expect(hero.getByRole('link', { name: /cv\.pdf/ })).toHaveAttribute('href', /\.pdf$/);
  const exp = page.locator('#experience [data-design-show="terminal"]');
  await exp.scrollIntoViewIfNeeded();
  await expect(exp.getByText('cat experience.log')).toBeVisible();
  await expect(exp.getByRole('heading', { name: 'Experience' })).toHaveCount(1);
  await expect(exp.getByText('└──')).toBeVisible();
  const contact = page.locator('#contact [data-design-show="terminal"]');
  await expect(contact.getByText(/mail .*@gmail\.com/)).toBeVisible();
  await expect(contact.getByRole('link', { name: 'Email me' })).toHaveAttribute('href', /^mailto:/);
  await expect(page.locator('footer [data-design-show="terminal"]')).toContainText('[Process completed]');
});

test('Tape punches real ASCII, charts the career on two tracks and runs out at the end', async ({ page }) => {
  await arrive(page, 'tape');
  const hero = page.locator('#hero [data-design-show="tape"]');
  await expect(hero.getByRole('heading', { level: 1 })).toHaveText('Alexandre Akira');
  await expect(hero.locator('.tape-band svg path')).toHaveCount(1);
  const exp = page.locator('#experience [data-design-show="tape"]');
  await exp.scrollIntoViewIfNeeded();
  await expect(exp.getByRole('img', { name: 'Career on tape, 2019 to now' })).toBeVisible();
  // Concurrent roles never share a track
  const tracks = await exp.locator('.tape-career__bar').evaluateAll((bars) => new Set(bars.map((b) => b.getAttribute('data-track'))).size);
  expect(tracks).toBe(2);
  await expect(exp.locator('.tape-mark[data-active]').first()).toBeVisible();
  await expect(page.locator('footer [data-design-show="tape"]')).toContainText(/End of tape/i);
});

test('the switcher names Tape "Fita" in Portuguese', async ({ page }) => {
  await arrive(page, 'tape', '/pt/');
  await page.getByRole('button', { name: /trocar design/i }).click();
  await expect(page.getByRole('list', { name: 'Opções de design' }).getByRole('button', { name: 'Fita' })).toHaveAttribute('aria-pressed', 'true');
});

test('Cartoon runs the opening titles: the name lettered, the roles billed as credits, THE END in an iris', async ({ page }) => {
  await arrive(page, 'cartoon');
  const hero = page.locator('#hero [data-design-show="cartoon"]');
  // The name is lettered one letter at a time for the eye, and read once
  await expect(hero.getByRole('heading', { level: 1 })).toHaveAccessibleName('Alexandre Akira');
  await expect(hero.locator('.cartoon-stripe')).toHaveText('Senior Full-Stack Engineer');
  await expect(hero.locator('svg.cartoon-char')).toBeVisible();
  const exp = page.locator('#experience [data-design-show="cartoon"]');
  await exp.scrollIntoViewIfNeeded();
  await expect(exp.getByRole('heading', { name: 'Experience' })).toHaveCount(1);
  // Both roles running now share one card, each marked in words
  await expect(exp.locator('.cartoon-pair .cartoon-showing')).toHaveCount(2);
  await expect(exp.locator('.cartoon-pair .cartoon-showing').first()).toHaveText('Now showing');
  const toggle = exp.getByRole('button', { name: /details/ }).first();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(exp.getByRole('button', { name: /collapse/ }).first()).toHaveAttribute('aria-expanded', 'true');
  await expect(exp.getByText('Implemented event-driven communication with RabbitMQ and Redis')).toBeVisible();
  const contact = page.locator('#contact [data-design-show="cartoon"]');
  await expect(contact.getByRole('link', { name: 'Email me' })).toHaveAttribute('href', /^mailto:/);
  await expect(contact.getByRole('button', { name: 'Copy email address' })).toBeVisible();
  const end = page.locator('footer [data-design-show="cartoon"]');
  await expect(end).toContainText('An Alexandre Akira production');
  await expect(end.locator('.cartoon-end__stage')).toHaveAttribute('aria-hidden', 'true');
});

test('Cartoon speaks Portuguese on /pt/, and the switcher calls it "Desenho"', async ({ page }) => {
  await arrive(page, 'cartoon', '/pt/');
  const hero = page.locator('#hero [data-design-show="cartoon"]');
  await expect(hero.locator('.cartoon-stripe')).toHaveText('Desenvolvedor Full-Stack Sênior');
  await expect(page.locator('#experience .cartoon-showing').first()).toHaveText('Em cartaz');
  await expect(page.locator('footer [data-design-show="cartoon"]')).toContainText('Uma produção de Alexandre Akira');
  await page.getByRole('button', { name: /trocar design/i }).click();
  await expect(page.getByRole('list', { name: 'Opções de design' }).getByRole('button', { name: 'Desenho' })).toHaveAttribute('aria-pressed', 'true');
});

test('the four worlds keep text contrast at 4.5:1 or more', async ({ page }) => {
  for (const world of ['engineer', 'terminal', 'tape', 'cartoon']) {
    await arrive(page, world);
    const worst = await page.evaluate(() => {
      const rgb = (s: string) => (s.match(/[\d.]+/g) ?? []).slice(0, 4).map(Number);
      const lin = (c: number) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
      const L = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      const cr = (a: number[], b: number[]) => { const [x, y] = [L(a), L(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
      const bgOf = (el: Element | null): number[] => {
        for (let e = el; e; e = e.parentElement) {
          const c = rgb(getComputedStyle(e).backgroundColor);
          if (c.length === 3 || (c[3] ?? 1) > 0.9) return c.slice(0, 3);
        }
        return [255, 255, 255];
      };
      let low = { ratio: 99, text: '' };
      for (const el of document.querySelectorAll('main *, footer *')) {
        const own = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent?.trim());
        if (!own || !(el as HTMLElement).offsetParent && getComputedStyle(el).position !== 'fixed') continue;
        const style = getComputedStyle(el);
        if (style.visibility === 'hidden' || +style.opacity === 0 || el.closest('[aria-hidden="true"], .sr-only')) continue;
        const ratio = cr(rgb(style.color).slice(0, 3), bgOf(el));
        if (ratio < low.ratio) low = { ratio, text: (el.textContent ?? '').trim().slice(0, 40) };
      }
      return low;
    });
    expect(worst.ratio, `${world}: lowest text contrast at "${worst.text}"`).toBeGreaterThanOrEqual(4.5);
  }
});
