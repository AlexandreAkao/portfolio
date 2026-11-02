import { test, expect, type Locator, type Page } from '@playwright/test';
import { STATIONS, clockText, locate, sampleDay, sunAt } from '../src/components/designs/diorama/day';
import en from '../src/i18n/en.json' with { type: 'json' };

test('the switcher offers Diorama in both languages', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('design', 'diorama'); sessionStorage.setItem('intro-seen', '1'); });
  await page.goto('/pt/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-design', 'diorama');
  await page.getByRole('button', { name: /trocar design/i }).click();
  await expect(page.getByRole('list', { name: 'Opções de design' }).getByRole('button', { name: 'Diorama' })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim())).toBe('#15161a');

  await page.evaluate(() => localStorage.setItem('lang', 'en'));
  await page.goto('/');
  await expect(html).toHaveAttribute('data-design', 'diorama');
  await page.getByRole('button', { name: /switch design/i }).click();
  await expect(page.getByRole('list', { name: 'Design options' }).getByRole('button', { name: 'Diorama' })).toHaveAttribute('aria-pressed', 'true');
});

test('clockText formats hours and minutes', () => {
  expect(clockText(8)).toBe('08:00'); expect(clockText(17.75)).toBe('17:45'); expect(clockText(22)).toBe('22:00');
});
test('STATIONS run the day in order, one per chapter', () => {
  expect(STATIONS.map((s) => s.id)).toEqual(['arrival','coffee','seva','wms','bees','uikit','nati','funcap','study','skills','projects','night']);
  expect(STATIONS.map((s) => clockText(s.hour))).toEqual(['08:00','09:00','10:30','13:00','14:30','16:00','17:00','17:45','19:00','20:00','21:00','22:00']);
  expect(STATIONS.filter((s) => s.label).map((s) => s.id)).toEqual(STATIONS.slice(1, -1).map((s) => s.id));
});
test('locate holds the camera through a chapter and moves only in the last travel', () => {
  expect(locate(-50, [0, 3000, 4000], 600)).toEqual({ i: 0, u: 0, move: 0 });
  const mid = locate(1000, [0, 3000, 4000], 600); expect(mid.i).toBe(0); expect(mid.u).toBeCloseTo(1 / 3); expect(mid.move).toBe(0);
  expect(locate(2700, [0, 3000, 4000], 600).move).toBeCloseTo(0.5);
  expect(locate(3000, [0, 3000, 4000], 600)).toMatchObject({ i: 1, u: 0, move: 0 });
  expect(locate(9999, [0, 3000, 4000], 600)).toEqual({ i: 1, u: 1, move: 1 });
});
test('sunAt: daylight by day, the lamp at dusk, dark at night, brighter fill than the lab', () => {
  expect(sunAt(13).sun).toBeGreaterThan(sunAt(8).sun); expect(sunAt(22).sun).toBe(0);
  expect(sunAt(19).lamp).toBeGreaterThan(sunAt(13).lamp); expect(sunAt(10.5).hemi).toBeGreaterThanOrEqual(1.2);
});
test('sampleDay lands on a station, blends poses between two', () => {
  const at = sampleDay({ i: 3, u: 0, move: 0 }); expect(at.active).toBe('wms'); expect(at.hour).toBe(13); expect(at.poseFrom).toBe('think');
  const half = sampleDay({ i: 3, u: 0.9, move: 0.5 }); expect(half.poseTo).toBe('typing'); expect(half.poseMix).toBeCloseTo(0.5);
  expect(sampleDay({ i: 10, u: 1, move: 1 }).turn).toBe(1);
});

/* ------------------------------------------------------------ Task 2 follow-ups */

test('clockText rounds to the nearest minute', () => {
  expect(clockText(13.1)).toBe('13:06'); expect(clockText(9.9999)).toBe('10:00'); expect(clockText(23.999)).toBe('00:00');
});
test('locate never moves before the travel starts, even when travel is longer than the chapter', () => {
  expect(locate(1000, [1000, 1300, 2000], 600).move).toBe(0);
  expect(locate(1150, [1000, 1300, 2000], 600).move).toBeCloseTo(0.5);
});

/* ------------------------------------------------------------ Task 4: the stage and the hero */

const hero = (page: Page) => page.locator('#hero [data-design-show="diorama"]');

async function arrive(page: Page, path = '/') {
  await page.addInitScript(() => {
    localStorage.setItem('design', 'diorama'); localStorage.setItem('lang', 'en'); sessionStorage.setItem('intro-seen', '1');
  });
  await page.goto(path);
  await expect(page.locator('html')).toHaveAttribute('data-design', 'diorama');
}

const theDay = (page: Page) => page.getByRole('navigation', { name: 'The day' }).getByRole('link');

/** Focus a link and expect a sighted keyboard user to see it: opaque, in the viewport, below the header, on top. */
async function seenWhenFocused(link: Locator) {
  await link.focus();
  await expect(link).toBeFocused();
  await expect
    .poll(() =>
      link.evaluate((el) => {
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return { opacity: getComputedStyle(el).opacity, belowHeader: r.top >= 64, inView: r.bottom <= innerHeight + 1 && r.left >= 0 && r.right <= innerWidth, onTop: !!hit && el.contains(hit) };
      }),
    )
    .toEqual({ opacity: '1', belowHeader: true, inView: true, onTop: true });
}

test('diorama: the hero copy is readable before WebGL and the canvas arrives @mobile', async ({ page }) => {
  // Hold the stage's code until the copy has been read: the copy never waits on WebGL.
  let release = () => {};
  const gate = new Promise<void>((r) => { release = r; });
  await page.route(/\/scene\/Stage\.tsx/, async (route) => { await gate; await route.continue(); });
  await arrive(page);
  await expect(hero(page).getByRole('heading', { level: 1, name: 'Alexandre Akira' })).toBeVisible();
  await expect(hero(page).getByRole('link', { name: 'Email', exact: true })).toHaveAttribute('href', /^mailto:/);
  await expect(hero(page).getByRole('link', { name: 'View my work' })).toHaveAttribute('href', '#experience');
  await expect(hero(page).getByText(/Currently at/)).toBeVisible();
  await expect(page.locator('.dio-stage canvas')).toHaveCount(0);
  // The day's links wait out of sight, but one reached by keyboard shows, clear of the header
  await expect(theDay(page)).toHaveCount(10);
  await seenWhenFocused(theDay(page).first());
  release();
  await expect(page.locator('.dio-stage canvas')).toHaveCount(1, { timeout: 20_000 });
});

test('diorama: at 320x568 the band and the hero copy fit without scrolling @mobile', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await arrive(page);
  const bottom = async (name: string) => (await hero(page).getByRole('link', { name, exact: true }).boundingBox())!;
  const email = await bottom('Email');
  const cv = await bottom('Download CV');
  expect(email.y + email.height).toBeLessThanOrEqual(568);
  expect(cv.y + cv.height).toBeLessThanOrEqual(568);
  // and both sit below the band, not under it
  const band = (await page.locator('.dio-stage').boundingBox())!;
  expect(email.y).toBeGreaterThanOrEqual(band.y + band.height);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('diorama: switching away removes the stage', async ({ page }) => {
  await arrive(page);
  await expect(page.locator('.dio-stage canvas')).toHaveCount(1, { timeout: 20_000 });
  await page.getByRole('button', { name: /switch design/i }).click();
  await page.getByRole('list', { name: 'Design options' }).getByRole('button', { name: 'Editorial' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-design', 'editorial');
  await expect(page.locator('.dio-stage')).not.toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.dioActive ?? 'none')).toBe('none');
});

test('diorama: without WebGL the still stands in and the day still navigates @mobile', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    const proto = HTMLCanvasElement.prototype as unknown as { getContext: (...args: unknown[]) => unknown };
    const get = proto.getContext;
    proto.getContext = function (this: HTMLCanvasElement, ...args: unknown[]) {
      return /webgl/i.test(String(args[0])) ? null : get.apply(this, args);
    };
  });
  await arrive(page);
  await expect(page.locator('.dio-stage img[src*="room-0800"]')).toBeVisible();
  await expect(theDay(page)).toHaveCount(10);
  await expect(theDay(page).first()).toBeVisible();
  await seenWhenFocused(theDay(page).first());
  await seenWhenFocused(theDay(page).last());
  await page.waitForTimeout(1500);
  await expect(page.locator('.dio-stage canvas')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('diorama: without WebGL the page ground is the 08:00 ground the live stage paints', async ({ page, context }) => {
  await arrive(page);
  await expect(page.locator('.dio-stage canvas')).toHaveCount(1, { timeout: 20_000 });
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.dioActive ?? 'none')).toBe('arrival');
  const live = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

  const still = await context.newPage();
  await still.addInitScript(() => {
    const proto = HTMLCanvasElement.prototype as unknown as { getContext: (...args: unknown[]) => unknown };
    const get = proto.getContext;
    proto.getContext = function (this: HTMLCanvasElement, ...args: unknown[]) {
      return /webgl/i.test(String(args[0])) ? null : get.apply(this, args);
    };
  });
  await arrive(still);
  await expect(still.locator('.dio-stage img[src*="room-0800"]')).toBeVisible();
  expect(await still.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(live);
});

test('diorama: on phones the whole day stays in the accessibility tree @mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await arrive(page);
  await expect(page.locator('.dio-stage canvas')).toHaveCount(1, { timeout: 20_000 });
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.dioActive ?? 'none')).toBe('arrival');
  // Only the hour on screen shows in the band (none at 08:00), but all ten are in the list
  await expect(theDay(page)).toHaveCount(10);
  await expect.poll(() => theDay(page).evaluateAll((links) => links.filter((a) => getComputedStyle(a).opacity !== '0').length)).toBe(0);
  await seenWhenFocused(theDay(page).nth(2));
  await seenWhenFocused(theDay(page).last());
});

test('diorama: at the wide hours the day is an agenda beside the room, and each hour travels to its object', async ({ page }) => {
  await arrive(page);
  await expect(page.locator('.dio-stage canvas')).toHaveCount(1, { timeout: 20_000 });
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.dioActive ?? 'none')).toBe('arrival');
  await page.waitForTimeout(600);
  const read = () =>
    page.evaluate(() => {
      const copy = document.querySelector('#hero [data-design-show="diorama"] .dio-hero__copy')!.getBoundingClientRect();
      const links = [...document.querySelectorAll<HTMLElement>('.dio-day a')].map((a) => {
        const r = a.getBoundingClientRect();
        return { id: a.getAttribute('href'), x: r.left, y: r.top, right: r.right, bottom: r.bottom, opacity: getComputedStyle(a).opacity, current: a.getAttribute('aria-current') };
      });
      return { copyRight: copy.right, vh: innerHeight, links };
    });

  // 08:00: ten opaque labels, clear of the copy, inside the first viewport, in hour order, none on another
  const wide = await read();
  expect(wide.links.map((l) => l.opacity)).toEqual(Array(10).fill('1'));
  for (const l of wide.links) {
    expect(l.x).toBeGreaterThanOrEqual(wide.copyRight);
    expect(l.bottom).toBeLessThanOrEqual(wide.vh);
  }
  const order = [...wide.links].sort((p, q) => (Math.abs(p.y - q.y) > 1 ? p.y - q.y : p.x - q.x)).map((l) => l.id);
  expect(order).toEqual(wide.links.map((l) => l.id));
  for (const [i, p] of wide.links.entries()) {
    for (const q of wide.links.slice(i + 1)) {
      const apart = p.right <= q.x || q.right <= p.x || p.bottom <= q.y || q.bottom <= p.y;
      expect(apart, `${p.id} overlaps ${q.id}`).toBe(true);
    }
  }

  // 09:00 (a coffee chapter injected after the hero): the camera closes in and the coffee label leaves the agenda for its object
  await page.evaluate(() => {
    const coffee = Object.assign(document.createElement('section'), { id: 'dio-coffee' });
    coffee.dataset.dioramaChapter = 'coffee';
    coffee.style.height = '150vh';
    document.querySelector('#hero')!.after(coffee);
  });
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const top = document.getElementById('dio-coffee')!.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: top - 64 + 40, behavior: 'instant' });
  });
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.dioActive)).toBe('coffee');
  await page.waitForTimeout(2000);
  const close = await read();
  const before = wide.links.find((l) => l.id === '#dio-coffee')!;
  const after = close.links.find((l) => l.id === '#dio-coffee')!;
  expect(after.current).toBe('true');
  expect(after.opacity).toBe('1');
  expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeGreaterThan(80);
});

test('diorama: the day nav links each chapter by hour', async ({ page }) => {
  await arrive(page);
  const links = page.getByRole('navigation', { name: 'The day' }).getByRole('link');
  const day = STATIONS.slice(1, -1);
  await expect(links).toHaveCount(day.length);
  for (const [i, s] of day.entries()) {
    await expect(links.nth(i)).toHaveAccessibleName(`${clockText(s.hour)} ${en[`diorama.scene.${s.id}` as keyof typeof en]}`);
    await expect(links.nth(i)).toHaveAttribute('href', `#dio-${s.id}`);
  }
  await expect(links.first()).toHaveAccessibleName('09:00 Coffee');
  await expect(links.last()).toHaveAccessibleName('21:00 Side projects');
});

/* ------------------------------------------------------------ Task 5: Experience as six hours */

test('diorama: each role is an hour, in order, with its impact on the face', async ({ page }) => {
  await arrive(page);
  const chapters = page.locator('#experience [data-diorama-chapter]');
  await expect(chapters).toHaveCount(6);
  const ids = ['seva', 'wms', 'bees', 'uikit', 'nati', 'funcap'];
  expect(await chapters.evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.dioramaChapter))).toEqual(ids);
  for (const [i, id] of ids.entries()) {
    const s = STATIONS.find((x) => x.id === id)!;
    await expect(chapters.nth(i)).toHaveAttribute('data-diorama-hour', clockText(s.hour));
  }
  await expect(page.locator('#dio-wms')).toContainText('200+ distribution centers');
});

test('diorama: opening details re-measures the day', async ({ page }) => {
  await arrive(page);
  await expect(page.locator('.dio-stage canvas')).toHaveCount(1, { timeout: 20_000 });
  const toggle = page.locator('#dio-wms button[aria-expanded]');
  await toggle.scrollIntoViewIfNeeded();
  // The island hydrates on visibility: retry until the click lands on a live button
  await expect(async () => {
    if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true', { timeout: 1000 });
  }).toPass({ timeout: 15_000 });
  await page.evaluate(() => {
    const top = document.getElementById('dio-funcap')!.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: top - 64 + 40, behavior: 'instant' });
  });
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => document.documentElement.dataset.dioActive)).toBe('funcap');
});

test('diorama: the day speaks Portuguese on /pt/', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    localStorage.setItem('design', 'diorama'); localStorage.setItem('lang', 'pt'); sessionStorage.setItem('intro-seen', '1');
  });
  await page.goto('/pt/');
  await expect(page.getByRole('navigation', { name: 'O dia' }).getByRole('link', { name: '13:00 Um bug' })).toHaveCount(1);
  await expect(page.locator('#dio-wms')).toContainText('200+ centros de distribuição');
  expect(errors.filter((e) => /hydrat/i.test(e))).toEqual([]);
});

test('diorama: at the wms hour the card stands in the viewport\'s right column', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await arrive(page);
  await expect(page.locator('.dio-stage canvas')).toHaveCount(1, { timeout: 20_000 });
  await page.evaluate(() => {
    const top = document.getElementById('dio-wms')!.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: top - 64 + 40, behavior: 'instant' });
  });
  await page.waitForTimeout(800);
  const left = await page.locator('#dio-wms .dio-card').evaluate((el) => el.getBoundingClientRect().left / innerWidth);
  expect(left).toBeGreaterThanOrEqual(0.55);
});

test('diorama: close in, only the active hour keeps its full pill; names stay in the links', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await arrive(page);
  await expect(page.locator('.dio-stage canvas')).toHaveCount(1, { timeout: 20_000 });
  await page.evaluate(() => {
    const top = document.getElementById('dio-wms')!.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: top - 64 + 40, behavior: 'instant' });
  });
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.dioActive)).toBe('wms');
  await page.waitForTimeout(2500);
  const names = page.locator('.dio-day a .dio-day__name');
  const wide = await names.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width > 4));
  expect(wide.filter(Boolean)).toHaveLength(1);
  await expect(theDay(page).nth(0)).toHaveAccessibleName('09:00 Coffee');
  await theDay(page).nth(0).hover();
  await expect.poll(() => names.first().evaluate((e) => e.getBoundingClientRect().width > 4)).toBe(true);
});
