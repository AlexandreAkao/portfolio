import { test, expect, type BrowserContext, type Locator, type Page } from '@playwright/test';
import { STATIONS, clockText, locate, sampleDay, sunAt } from '../src/components/designs/diorama/day';
import { ARRIVAL, RETURN, arrival } from '../src/components/designs/diorama/scene/intro';
import en from '../src/i18n/en.json' with { type: 'json' };
import { education, inProgress } from '../src/data/education';
import { skillGroups } from '../src/data/skills';
import { projects } from '../src/data/projects';

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

for (const [name, timing] of [['arrival', ARRIVAL], ['return', RETURN]] as const) {
  test(`${name}: the model is built at 07:59 in the dark, then the hour turns and the 08:00 sun comes in`, () => {
    const first = arrival(0, timing)!;
    expect(clockText(first.hour!)).toBe('07:59');
    // Only the base is drawn: the cut stands below the floor (y 0)
    expect(first.clip!).toBeLessThan(0);
    // Before the sun: blue light at the window, the room's own lights on, the monitor locked
    expect(first.light!.sun).toBe(0);
    expect(first.light!.moon).toBeGreaterThan(0);
    expect(first.light!.practical).toBeGreaterThan(0);
    expect(first.screens!.main).toBe('lock');
    // The cut climbs past the walls' tops (2.63) before the hour turns: the model is whole at 07:59
    const cuts: number[] = [];
    for (let t = 0; t < timing.turn; t += 0.05) {
      const f = arrival(t, timing)!;
      expect(clockText(f.hour!)).toBe('07:59');
      if (f.clip != null) cuts.push(f.clip);
    }
    expect(cuts.length).toBeGreaterThan(5);
    expect([...cuts].sort((a, b) => a - b)).toEqual(cuts);
    expect(cuts[cuts.length - 1]).toBeGreaterThan(2);
    expect(arrival(timing.turn - 0.01, timing)!.clip ?? null).toBeNull();
    // 08:00: the monitor unlocks, and from then on the room is whole
    const turned = arrival(timing.turn + 0.01, timing)!;
    expect(clockText(turned.hour!)).toBe('08:00');
    expect(turned.screens!.main).toBe('wall');
    expect(turned.clip ?? null).toBeNull();
    // It ends on the 08:00 station's own light, so the day takes over without a jump; then the script is over
    const last = arrival(timing.end - 0.001, timing)!;
    expect(last.light!.sun).toBeCloseTo(5.6, 2);
    expect(last.light!.moon).toBeCloseTo(0, 2);
    expect(last.light!.practical).toBeCloseTo(0, 2);
    last.light!.sunDir.forEach((v, i) => expect(v).toBeCloseTo([1, 0.75, -0.45][i], 2));
    expect(last.light!.sky).toBe('#bdd3ea');
    expect(arrival(timing.end + 0.01, timing)).toBeNull();
    // The page comes in after the hour has turned and before the script is over
    expect(timing.page).toBeGreaterThan(timing.turn);
    expect(timing.page).toBeLessThan(timing.end);
  });
}

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
  // The day's links (on phones they wait out of sight, but one reached by keyboard shows, clear of the header)
  await expect(theDay(page)).toHaveCount(11);
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
  await expect(theDay(page)).toHaveCount(11);
  await expect(theDay(page).first()).toBeVisible();
  await seenWhenFocused(theDay(page).first());
  await seenWhenFocused(theDay(page).last());
  await page.waitForTimeout(1500);
  await expect(page.locator('.dio-stage canvas')).toHaveCount(0);
  expect(errors).toEqual([]);
});

for (const [w, h] of [[1440, 900], [900, 1000]] as const) {
  test(`diorama: without WebGL at ${w}x${h} no card covers the day nav and no clock reads 08:00 over a later chapter`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: w, height: h });
    await page.addInitScript(() => {
      const proto = HTMLCanvasElement.prototype as unknown as { getContext: (...args: unknown[]) => unknown };
      const get = proto.getContext;
      proto.getContext = function (this: HTMLCanvasElement, ...args: unknown[]) {
        return /webgl/i.test(String(args[0])) ? null : get.apply(this, args);
      };
    });
    await arrive(page);
    await expect(page.locator('.dio-stage img[src*="room-0800"]')).toBeVisible();
    for (const id of ['dio-coffee', 'dio-seva', 'dio-study', 'dio-skills', 'dio-projects']) {
      await page.evaluate((i) => document.getElementById(i)!.scrollIntoView({ behavior: 'instant' }), id);
      await page.waitForTimeout(700);
      const state = await page.evaluate(() => {
        const covered = [...document.querySelectorAll<HTMLElement>('.dio-day a')].filter((a) => {
          const r = a.getBoundingClientRect();
          if (r.width === 0 || r.bottom < 0 || r.top > innerHeight) return false;
          const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          return !!hit && !!hit.closest('.dio-card, .dio-hero__copy, .dio-footer');
        }).length;
        const clock = document.querySelector<HTMLElement>('.dio-clock')!;
        const cr = clock.getBoundingClientRect();
        const clockOnScreen = cr.width > 0 && cr.bottom > 0 && cr.top < innerHeight;
        return { covered, stale: clockOnScreen && (clock.textContent ?? '').trim() === '08:00' };
      });
      expect(state, `#${id}`).toEqual({ covered: 0, stale: false });
    }
  });
}

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
  // Only the hour on screen shows in the band (none at 08:00), but all eleven are in the list
  await expect(theDay(page)).toHaveCount(11);
  await expect.poll(() => theDay(page).evaluateAll((links) => links.filter((a) => getComputedStyle(a).opacity !== '0').length)).toBe(0);
  await seenWhenFocused(theDay(page).nth(2));
  await seenWhenFocused(theDay(page).last());
});

test('diorama: on wide screens the room stands in a panel and the day is a page beside it', async ({ page }) => {
  await arrive(page);
  await expect(page.locator('.dio-stage canvas')).toHaveCount(1, { timeout: 20_000 });
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.dioActive ?? 'none')).toBe('arrival');
  const split = await page.evaluate(() => {
    const stage = document.querySelector('.dio-stage')!.getBoundingClientRect();
    const main = document.querySelector('#main-content')!;
    const col = main.getBoundingClientRect();
    const clock = document.querySelector('.dio-clock')!.getBoundingClientRect();
    return {
      stageLeft: stage.left,
      stageRight: Math.round(stage.right),
      colLeft: Math.round(col.left),
      colRight: Math.round(col.right),
      vw: document.documentElement.clientWidth,
      paper: getComputedStyle(main).backgroundColor,
      clockInPanel: clock.left >= stage.left && clock.right <= stage.right && clock.bottom <= stage.bottom,
    };
  });
  expect(split.stageLeft).toBe(0);
  expect(split.stageRight).toBe(split.colLeft);
  expect(split.colRight).toBe(split.vw);
  expect(split.paper).toBe('rgb(241, 236, 227)');
  expect(split.clockInPanel).toBe(true);
  // The index: every hour after this one, in order, each in sight, none moved by the stage
  const links = await theDay(page).evaluateAll((els) =>
    els.map((a) => {
      const r = a.getBoundingClientRect();
      return { href: a.getAttribute('href'), x: Math.round(r.left), y: r.top, opacity: getComputedStyle(a).opacity, transform: getComputedStyle(a).transform };
    }),
  );
  expect(links.map((l) => l.href)).toEqual(STATIONS.slice(1).map((s) => `#dio-${s.id}`));
  for (const l of links) {
    expect(l.opacity, l.href!).toBe('1');
    expect(l.transform, l.href!).toBe('none');
    expect(l.x, l.href!).toBeGreaterThanOrEqual(split.colLeft);
  }
  expect([...links].sort((p, q) => p.y - q.y).map((l) => l.href)).toEqual(links.map((l) => l.href));
});

test('diorama: the hour being read is lit and the others rest a step back, until pointed at', async ({ page }) => {
  await arrive(page);
  await expect(page.locator('.dio-stage canvas')).toHaveCount(1, { timeout: 20_000 });
  await page.evaluate(() => document.getElementById('dio-seva')!.scrollIntoView({ behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.dioActive)).toBe('seva');
  const opacity = (id: string) => page.locator(`#${id}`).evaluate((e) => getComputedStyle(e).opacity);
  await expect.poll(() => opacity('dio-seva')).toBe('1');
  await expect.poll(() => opacity('dio-wms')).toBe('0.4');
  // The section's heading never dims: it names the hours below it
  expect(await page.locator('.dio-section-title').evaluate((e) => getComputedStyle(e.parentElement!).opacity)).toBe('1');
  await page.locator('#dio-wms h3').hover();
  await expect.poll(() => opacity('dio-wms')).toBe('1');
  // Asking for more contrast keeps every hour at full strength
  await page.emulateMedia({ contrast: 'more' });
  await page.mouse.move(5, 5);
  await expect.poll(() => opacity('dio-wms')).toBe('1');
});

test('diorama: on a phone only the hour on screen shows its label, over its object in the band @mobile', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await arrive(page);
  await expect(page.locator('.dio-stage canvas')).toHaveCount(1, { timeout: 20_000 });
  for (const id of ['coffee', 'seva', 'wms', 'skills', 'projects']) {
    await page.evaluate((i) => document.getElementById(`dio-${i}`)!.scrollIntoView(), id);
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.dioActive)).toBe(id);
    await page.waitForTimeout(1500);
    const shown = await page.evaluate(() => {
      const band = document.querySelector('.dio-stage')!.getBoundingClientRect();
      const header = document.querySelector('header')!.getBoundingClientRect();
      return [...document.querySelectorAll<HTMLElement>('.dio-day a')]
        .filter((a) => parseFloat(getComputedStyle(a).opacity) > 0.5)
        .map((a) => {
          const r = a.getBoundingClientRect();
          return { href: a.getAttribute('href'), inBand: r.top >= header.bottom && r.bottom <= band.bottom && r.left >= 0 && r.right <= band.right };
        });
    });
    expect(shown, id).toEqual([{ href: `#dio-${id}`, inBand: true }]);
  }
});

/** What each hour holds in the day's index (wide screens): a section, or a role's company. */
const HOLDS: Record<string, string> = {
  coffee: en['nav.about'],
  seva: 'Seva / Appointally',
  wms: 'AmbevTech · WMS',
  bees: 'AmbevTech · BEES',
  uikit: 'AmbevTech · UIKit',
  nati: 'NATI · UNIFOR',
  funcap: 'FUNCAP',
  study: en['nav.education'],
  skills: en['nav.skills'],
  projects: en['nav.projects'],
  night: en['nav.contact'],
};

test('diorama: the day nav links each chapter by hour', async ({ page }) => {
  await arrive(page);
  const links = page.getByRole('navigation', { name: 'The day' }).getByRole('link');
  const day = STATIONS.slice(1);
  await expect(links).toHaveCount(day.length);
  for (const [i, s] of day.entries()) {
    await expect(links.nth(i)).toHaveAccessibleName(`${clockText(s.hour)} ${HOLDS[s.id]} ${en[`diorama.scene.${s.id}` as keyof typeof en]}`);
    await expect(links.nth(i)).toHaveAttribute('href', `#dio-${s.id}`);
  }
  await expect(links.first()).toHaveAccessibleName('09:00 About Coffee');
  await expect(links.last()).toHaveAccessibleName('22:00 Contact Lights out');
});

test('diorama: on a phone the day nav names each hour by its scene @mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await arrive(page);
  const links = page.getByRole('navigation', { name: 'The day' }).getByRole('link');
  await expect(links.first()).toHaveAccessibleName('09:00 Coffee');
  await expect(links.last()).toHaveAccessibleName('22:00 Lights out');
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
  await expect(page.getByRole('navigation', { name: 'O dia' }).getByRole('link', { name: '13:00 AmbevTech · WMS Um bug' })).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'O dia' }).getByRole('link', { name: '09:00 Sobre Café' })).toHaveCount(1);
  await expect(page.locator('#dio-wms')).toContainText('200+ centros de distribuição');
  expect(errors.filter((e) => /hydrat/i.test(e))).toEqual([]);
});

/** The room's panel on screen, sampled on a grid below the header: anything but the stage and the clock on top of it. */
const overRoom = (page: Page) =>
  page.evaluate(() => {
    const stage = document.querySelector('.dio-stage')!.getBoundingClientRect();
    const top = document.querySelector('header')!.getBoundingClientRect().bottom;
    const hits = new Set<string>();
    for (let i = 0; i <= 6; i++) {
      for (let j = 0; j <= 6; j++) {
        const x = stage.left + 4 + ((stage.width - 8) * i) / 6;
        // The dev server's toolbar sits at the bottom centre: stop short of it
        const y = top + 4 + ((stage.bottom - 80 - top) * j) / 6;
        const el = document.elementFromPoint(x, y);
        // The stage lies under the page's own layer, so a clear point hits the body (or the stage, the clock)
        if (el && el !== document.body && el !== document.documentElement && !el.closest('.dio-stage, .dio-clock')) hits.add(`${el.tagName.toLowerCase()}.${el.className}`.slice(0, 60));
      }
    }
    const cards = [...document.querySelectorAll('.dio-card, .dio-hero__inner, .dio-section-title')]
      .filter((el) => el.getClientRects().length > 0)
      .filter((el) => el.getBoundingClientRect().left < stage.right - 1)
      .map((el) => el.closest('[data-diorama-chapter]')?.id ?? el.className);
    const clock = document.querySelector('.dio-clock')!.getBoundingClientRect();
    return { hits: [...hits], cards, clockInPanel: clock.right <= stage.right && clock.left >= stage.left };
  });

for (const [w, h] of [[1440, 900], [1280, 800], [1024, 768]] as const) {
  test(`diorama: at ${w}x${h} the page never covers the room, and the clock stays in it`, async ({ page }) => {
    test.setTimeout(150_000);
    await page.setViewportSize({ width: w, height: h });
    await arrive(page);
    await expect(page.locator('.dio-stage canvas')).toHaveCount(1, { timeout: 20_000 });
    const ids = await page.locator('[data-diorama-chapter]').evaluateAll((els) => els.map((e) => e.id));
    expect(ids.length).toBe(STATIONS.length);
    for (const id of ids) {
      await page.evaluate((i) => document.getElementById(i)!.scrollIntoView({ behavior: 'instant' }), id);
      await page.waitForTimeout(900);
      expect(await overRoom(page), `at #${id}`).toEqual({ hits: [], cards: [], clockInPanel: true });
    }
  });
}

test('diorama: on a phone the page opens at 08:00 and each card reads its own hour @mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await arrive(page);
  await expect(page.locator('.dio-stage canvas')).toHaveCount(1, { timeout: 20_000 });
  const html = page.locator('html');
  const clock = page.locator('.dio-clock');
  const minutes = async () => {
    const [h, m] = ((await clock.textContent()) ?? '').trim().split(':').map(Number);
    return h * 60 + m;
  };
  await page.waitForTimeout(1500);
  await expect(clock).toHaveText('08:00');
  expect(await html.evaluate((e) => e.dataset.dioActive)).toBe('arrival');
  for (const [id, from, to] of [['dio-seva', 10 * 60 + 30, 10 * 60 + 45], ['dio-wms', 13 * 60, 13 * 60 + 15]] as const) {
    await page.evaluate((i) => document.getElementById(i)!.scrollIntoView(), id);
    await page.waitForTimeout(2000);
    expect(await html.evaluate((e) => e.dataset.dioActive)).toBe(id.replace('dio-', ''));
    const t = await minutes();
    expect(t, `${id} clock`).toBeGreaterThanOrEqual(from);
    expect(t, `${id} clock`).toBeLessThanOrEqual(to);
    // and the card starts right under the band, not a screen below it
    const gap = await page.evaluate((i) => {
      const band = document.querySelector('.dio-stage')!.getBoundingClientRect().bottom;
      return document.querySelector(`#${i} .dio-card`)!.getBoundingClientRect().top - band;
    }, id);
    expect(gap, `${id} card gap`).toBeGreaterThanOrEqual(0);
    expect(gap, `${id} card gap`).toBeLessThanOrEqual(32);
  }
});

/* ------------------------------------------------------------ Task 7: About, Education, Skills, Projects as hours */

test('diorama: every section is an hour of the day, 08:00 to 22:00, in page order', async ({ page }) => {
  await arrive(page);
  const chapters = page.locator('[data-diorama-chapter]');
  const ids = STATIONS.map((s) => s.id);
  await expect(chapters).toHaveCount(ids.length);
  expect(await chapters.evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.dioramaChapter))).toEqual(ids);
  for (const [i, id] of ids.entries()) {
    await expect(chapters.nth(i)).toBeVisible();
    await expect(chapters.nth(i)).toHaveAttribute('data-diorama-hour', clockText(STATIONS.find((s) => s.id === id)!.hour));
  }
});

test('diorama: a deep link starts the day at its hour', async ({ page }) => {
  // Every hour and chapter the stage ever writes, from its first frame
  await page.addInitScript(() => {
    const seen: string[] = [];
    (window as unknown as { __day: string[] }).__day = seen;
    new MutationObserver(() => {
      const clock = document.querySelector('.dio-clock')?.textContent ?? '';
      const at = `${document.documentElement.dataset.dioActive ?? '-'} ${clock}`;
      if (seen[seen.length - 1] !== at) seen.push(at);
    }).observe(document, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['data-dio-active'] });
  });
  await arrive(page, '/#skills');
  await expect(page.locator('.dio-stage canvas')).toHaveCount(1, { timeout: 20_000 });
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => document.documentElement.dataset.dioActive)).toBe('skills');
  await expect(page.locator('.dio-clock')).toHaveText('20:00');
  // The stage's first frame is already at 20:00: it never set off from 08:00
  const day = await page.evaluate(() => (window as unknown as { __day: string[] }).__day.filter((s) => !s.startsWith('-')));
  expect(day[0]).toBe('skills 20:00');
});

test('diorama: the evening hours carry the real content', async ({ page }) => {
  await arrive(page);
  const coffee = page.locator('#dio-coffee .dio-card');
  await expect(coffee.getByRole('heading', { level: 2, name: en['about.title'] })).toBeVisible();
  await expect(coffee).toContainText(en['about.p1']);
  await expect(coffee).toContainText(en['about.p2']);
  // No figures block: its numbers are the next chapters' headlines
  await expect(coffee.locator('dl')).toHaveCount(0);
  await expect(coffee).not.toContainText(en['about.stat.microservices.label']);

  const study = page.locator('#dio-study .dio-card');
  await expect(study.getByRole('heading', { level: 2, name: en['education.title'] })).toBeVisible();
  await expect(study.getByRole('heading', { level: 3 })).toHaveCount(education.length);
  for (const edu of education) {
    await expect(study).toContainText(edu.institution);
    await expect(study).toContainText(edu.period.en);
  }
  await expect(study.getByText(en['education.inProgress'])).toHaveCount(education.filter(inProgress).length);

  const skills = page.locator('#dio-skills .dio-card');
  await expect(skills.getByRole('heading', { level: 2, name: en['skills.title'] })).toBeVisible();
  await expect(skills.getByRole('heading', { level: 3 })).toHaveText(skillGroups.map((g) => g.category.en), { useInnerText: true });
  await expect(skills.getByRole('listitem')).toHaveCount(skillGroups.reduce((n, g) => n + g.skills.length, 0));

  const side = page.locator('#dio-projects .dio-card');
  const personal = projects.filter((p) => p.type === 'personal');
  await expect(side.getByRole('heading', { level: 2, name: en['projects.title'] })).toBeVisible();
  await expect(side.getByRole('heading', { level: 3 })).toHaveText(personal.map((p) => p.title), { useInnerText: true });
  for (const p of personal) {
    await expect(side.getByRole('link', { name: p.github ? `${p.title} on GitHub` : `${p.title}, live site` })).toHaveAttribute('href', (p.github ?? p.live)!);
  }
  // The outbound mark is a drawn icon, out of the accessible name, not a text glyph
  await expect(side.locator('.dio-project a > svg[aria-hidden="true"]')).toHaveCount(personal.length);
  expect(await side.locator('.dio-project a').first().evaluate((a) => getComputedStyle(a, '::after').content)).toBe('none');
});

test('diorama: Martian Mono sets hours, dates and the clock; pills and controls are in Bricolage', async ({ page }) => {
  await arrive(page);
  const family = (sel: string) => page.locator(sel).first().evaluate((e) => getComputedStyle(e).fontFamily);
  for (const sel of ['#dio-skills .dio-tags li', '#dio-wms .dio-toggle', '#dio-projects .dio-tags li', '.dio-socials a']) {
    expect(await family(sel), sel).toMatch(/^"?Bricolage/);
  }
  for (const sel of ['.dio-clock', '#dio-study .dio-degree__when', '#dio-wms .dio-role-line span', '.dio-day time']) {
    expect(await family(sel), sel).toMatch(/^"?Martian Mono/);
  }
  // The clock's tracking stays at the floor or looser
  const tracking = await page.locator('.dio-clock').evaluate((e) => parseFloat(getComputedStyle(e).letterSpacing) / parseFloat(getComputedStyle(e).fontSize));
  expect(tracking).toBeGreaterThanOrEqual(-0.04 - 1e-6);
});

test('diorama: the sections print nothing over the room: every word is in the day\'s page', async ({ page }) => {
  await arrive(page);
  const stageRight = await page.locator('.dio-stage').evaluate((e) => e.getBoundingClientRect().right);
  for (const section of ['hero', 'about', 'experience', 'education', 'skills', 'projects', 'contact']) {
    const bare = await page.evaluate(
      ({ s, right }) => {
        const walker = document.createTreeWalker(document.getElementById(s)!, NodeFilter.SHOW_TEXT);
        const out: string[] = [];
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const el = n.parentElement!;
          const text = (n.textContent ?? '').trim();
          if (!text || el.closest('.dio-clock') || !el.checkVisibility()) continue;
          const r = el.getBoundingClientRect();
          // visually hidden text (1px boxes) is for screen readers only
          if (r.width <= 1 || r.height <= 1) continue;
          if (r.left < right) out.push(text.slice(0, 40));
        }
        return out;
      },
      { s: section, right: stageRight },
    );
    expect(bare, `#${section}`).toEqual([]);
  }
});

test('diorama: each chapter keeps its hour and scene in its text, the hour in the margin beside its first line', async ({ page }) => {
  await arrive(page);
  await expect(page.locator('.dio-kicker')).toHaveCount(0);
  for (const s of STATIONS) {
    const chapter = page.locator(`[data-diorama-chapter="${s.id}"]`);
    const hour = clockText(s.hour);
    const scene = en[`diorama.scene.${s.id}` as keyof typeof en];
    const text = chapter.locator('.dio-hour');
    await expect(text, s.id).toHaveCount(1);
    await expect(text, s.id).toHaveText(new RegExp(`^${hour}\\s+${scene}$`), { useInnerText: true });
    await expect(text.locator('time'), s.id).toHaveAttribute('datetime', hour);
    // Printed in the margin (the scene's name is the room's to show), left of the first line and level with it
    const place = await chapter.evaluate((el) => {
      const time = el.querySelector('.dio-hour time')!.getBoundingClientRect();
      const first = el.querySelector('h1, h2, h3')!.getBoundingClientRect();
      const scene = el.querySelector('.dio-hour__scene')!.getBoundingClientRect();
      return { beside: time.right <= first.left, level: time.top >= first.top - 2 && time.bottom <= first.bottom + 2, sceneHidden: scene.width <= 1 && scene.height <= 1 };
    });
    expect(place, s.id).toEqual({ beside: true, level: true, sceneHidden: true });
    const tree = await chapter.locator(s.id === 'arrival' ? '.dio-hero__inner' : '.dio-card').ariaSnapshot();
    expect(tree, s.id).toContain(hour);
    expect(tree, s.id).toContain(scene);
  }
});

test('diorama: on a phone the clock shows the hour and the chapters print none @mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await arrive(page);
  const sizes = await page.locator('.dio-hour').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return r.width <= 1 && r.height <= 1; }));
  expect(sizes).toEqual(Array(STATIONS.length).fill(true));
});

test('diorama: on a phone the About, Education, Skills and Projects cards start under the band, on their hour @mobile', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await arrive(page);
  await expect(page.locator('.dio-stage canvas')).toHaveCount(1, { timeout: 20_000 });
  const clock = page.locator('.dio-clock');
  for (const id of ['coffee', 'study', 'skills', 'projects', 'night'] as const) {
    await page.evaluate((i) => document.getElementById(`dio-${i}`)!.scrollIntoView(), id);
    await page.waitForTimeout(2000);
    expect(await page.evaluate(() => document.documentElement.dataset.dioActive)).toBe(id);
    const [hh, mm] = ((await clock.textContent()) ?? '').trim().split(':').map(Number);
    const at = STATIONS.find((s) => s.id === id)!.hour * 60;
    expect(hh * 60 + mm, `${id} clock`).toBeGreaterThanOrEqual(at);
    expect(hh * 60 + mm, `${id} clock`).toBeLessThanOrEqual(at + 15);
    const gap = await page.evaluate((i) => {
      const band = document.querySelector('.dio-stage')!.getBoundingClientRect().bottom;
      return document.querySelector(`#dio-${i} .dio-card`)!.getBoundingClientRect().top - band;
    }, id);
    expect(gap, `${id} card gap`).toBeGreaterThanOrEqual(0);
    expect(gap, `${id} card gap`).toBeLessThanOrEqual(32);
  }
});

test('diorama: at 22:00 he turns and the contact names the action', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await arrive(page);
  await expect(page.locator('.dio-stage canvas')).toHaveCount(1, { timeout: 20_000 });
  const contact = page.locator('#contact');
  await contact.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  expect(await page.evaluate(() => document.documentElement.dataset.dioActive)).toBe('night');
  await expect(contact.locator('.dio-card .dio-hour time')).toHaveText('22:00');
  await expect(contact.getByRole('heading', { level: 2, name: en['contact.title'] })).toBeVisible();
  await expect(contact.getByRole('link', { name: 'Email me' })).toHaveAttribute('href', /^mailto:/);
  await expect(contact.getByRole('link', { name: 'Download CV' })).toHaveAttribute('href', /\.pdf$/);
  await expect(contact.getByText(/@gmail\.com$/).filter({ visible: true }).first()).toBeVisible();
  await contact.getByRole('button', { name: 'Copy email address' }).click();
  await expect(contact.getByRole('button', { name: 'Copy email address' })).toHaveText('Copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/@gmail\.com$/);
});

test('diorama: the footer is one quiet row on paper: socials, year, the invitation', async ({ page }) => {
  await arrive(page);
  const footer = page.locator('footer .dio-footer');
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toBeVisible();
  await expect(footer.getByRole('link', { name: 'GitHub' })).toBeVisible();
  await expect(footer).toContainText(String(new Date().getFullYear()));
  await expect(footer).toContainText('Alexandre Akira');
  // the other worlds' footers do not show
  await expect(page.locator('footer [data-design-show="editorial"]')).toBeHidden();
});

/* ------------------------------------------------------------ The arrival: the model is built at 07:59, then the day */

/** The room's code compiled and cached in this browser, so an arrival measures the room, not the dev server's first build. */
async function warmDiorama(context: BrowserContext) {
  const p = await context.newPage();
  await p.addInitScript(() => { localStorage.setItem('design', 'diorama'); localStorage.setItem('lang', 'en'); sessionStorage.setItem('intro-seen', '1'); });
  await p.goto('/');
  await expect(p.locator('#hero .dio-still')).toHaveAttribute('data-gone', '', { timeout: 30_000 });
  await p.close();
}

/** A first visit of the session in Diorama, recording what stands on the page when the curtain goes and whether the arrival is armed later. */
async function firstVisit(page: Page, opts: { blockGl?: boolean } = {}) {
  await page.addInitScript((block) => {
    localStorage.setItem('design', 'diorama'); localStorage.setItem('lang', 'en');
    if (block) {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (/webgl/i.test(type)) return null;
        return (get as (...a: unknown[]) => unknown).call(this, type, ...rest) as never;
      } as typeof get;
    }
    const w = window as unknown as { __dio: { atDone: Record<string, unknown> | null; armedAfterDone: boolean } };
    w.__dio = { atDone: null, armedAfterDone: false };
    document.addEventListener('site-intro:done', () => {
      const html = document.documentElement;
      w.__dio.atDone = {
        gone: !!document.querySelector('#hero .dio-still[data-gone]'),
        clock: document.querySelector('.dio-clock')?.textContent ?? null,
        intro: html.dataset.dioIntro ?? null,
      };
      // An arrival that did not start with the curtain never starts later
      const armed = html.dataset.dioIntro !== undefined;
      new MutationObserver(() => {
        if (!armed && html.dataset.dioIntro !== undefined) w.__dio.armedAfterDone = true;
      }).observe(html, { attributes: true, attributeFilter: ['data-dio-intro'] });
    });
  }, !!opts.blockGl);
  await page.goto('/');
}
const record = (page: Page) => page.evaluate(() => (window as unknown as { __dio: { atDone: Record<string, unknown> | null; armedAfterDone: boolean } }).__dio);

test('diorama: the arrival holds 07:59 until the live room has drawn, builds it, turns 08:00 and hands over the page @mobile', async ({ page, context }) => {
  await warmDiorama(context);
  await firstVisit(page);
  const html = page.locator('html');
  const curtain = page.locator('#site-intro .intro-dio');
  await expect(curtain).toBeVisible();
  await expect(curtain.locator('.intro-dio__a')).toHaveText('07:59');
  // Nothing of the room shows before it is built: the curtain is the dark and the clock
  await expect(curtain.locator('.intro-dio__still')).toBeHidden();
  await expect(html).toHaveAttribute('data-intro', 'done', { timeout: 10_000 });
  // The curtain went because the live room had drawn, not on a timer, and the arrival had begun on it
  expect((await record(page)).atDone).toEqual({ gone: true, clock: '07:59', intro: 'play' });
  await expect(page.locator('header.fixed')).toHaveCSS('opacity', '0');
  await expect(page.locator('.dio-clock')).toHaveText('08:00', { timeout: 4_000 });
  await expect(html).toHaveAttribute('data-dio-intro', 'page', { timeout: 4_000 });
  await expect(html).not.toHaveAttribute('data-dio-intro', /.*/, { timeout: 4_000 });
  await expect(page.locator('header.fixed')).toHaveCSS('opacity', '1');
  await expect(page.locator('.dio-name')).toBeVisible();
});

test('diorama: a scroll gesture during the arrival goes straight to the day', async ({ page, context }) => {
  await warmDiorama(context);
  await firstVisit(page);
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-intro', 'done', { timeout: 10_000 });
  await expect(html).toHaveAttribute('data-dio-intro', 'play');
  await page.mouse.move(400, 400);
  await page.mouse.wheel(0, 120);
  await expect(html).not.toHaveAttribute('data-dio-intro', /.*/, { timeout: 500 });
  await expect(page.locator('header.fixed')).toHaveCSS('opacity', '1');
  // The gesture also scrolls: the clock follows the day from 08:00, never back to 07:59
  await expect(page.locator('.dio-clock')).toHaveText(/^08:/);
});

test('diorama: without WebGL the arrival does not wait, and the page opens on the still', async ({ page, context }) => {
  await warmDiorama(context);
  await firstVisit(page, { blockGl: true });
  const html = page.locator('html');
  // Well before the curtain's cap: the hero knows at once there is no live room
  await expect(html).toHaveAttribute('data-intro', 'done', { timeout: 3_000 });
  await expect(html).not.toHaveAttribute('data-dio-intro', /.*/);
  await expect(page.locator('#hero .dio-still')).toBeVisible();
  await expect(page.locator('header.fixed')).toHaveCSS('opacity', '1');
  expect((await record(page)).armedAfterDone).toBe(false);
});

test('diorama: a room not live by the curtain\'s cap opens the page on the still and never plays late', async ({ page, context }) => {
  await warmDiorama(context);
  // The room's code arrives long after the cap
  await page.route(/scene\/Stage\.tsx/, async (route) => {
    await new Promise((r) => setTimeout(r, 6_000));
    await route.continue();
  });
  await firstVisit(page);
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-intro', 'done', { timeout: 6_000 });
  await expect(html).not.toHaveAttribute('data-dio-intro', /.*/);
  await expect(page.locator('header.fixed')).toHaveCSS('opacity', '1');
  // Whoever waited out the curtain gets the photo at once, not a bare panel
  await expect(page.locator('#hero .dio-still')).toBeVisible();
  // The late room takes over from the still, with no arrival
  await expect(page.locator('#hero .dio-still')).toHaveAttribute('data-gone', '', { timeout: 20_000 });
  await page.waitForTimeout(500);
  expect((await record(page)).armedAfterDone).toBe(false);
  await expect(page.locator('.dio-clock')).toHaveText('08:00');
});

/* ------------------------------------------------------------ The arrival by way of the switcher */

const BLOCK_WEBGL = () => {
  const get = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
    if (/webgl/i.test(type)) return null;
    return (get as (...a: unknown[]) => unknown).call(this, type, ...rest) as never;
  } as typeof get;
};

/** A session opened on Editorial (the default), its curtain already seen, logging every value the arrival's flag takes. */
async function onEditorial(page: Page, path = '/') {
  await page.addInitScript(() => {
    localStorage.setItem('design', 'editorial'); localStorage.setItem('lang', 'en'); sessionStorage.setItem('intro-seen', '1');
    const w = window as unknown as { __flags: string[]; __toPage: number[]; __done: number };
    w.__flags = [];
    w.__toPage = [];
    document.addEventListener('site-intro:done', () => { w.__done = performance.now(); });
    document.addEventListener('DOMContentLoaded', () => {
      new MutationObserver(() => {
        const flag = document.documentElement.dataset.dioIntro ?? '-';
        if (w.__flags[w.__flags.length - 1] !== flag) {
          w.__flags.push(flag);
          if (flag === 'page') w.__toPage.push(performance.now() - w.__done);
        }
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-dio-intro'] });
    });
  });
  await page.goto(path);
  await expect(page.locator('html')).toHaveAttribute('data-design', 'editorial');
}
const flags = (page: Page) => page.evaluate(() => (window as unknown as { __flags: string[] }).__flags);
const toPage = (page: Page) => page.evaluate(() => (window as unknown as { __toPage: number[] }).__toPage);

async function switchWorld(page: Page, label: string) {
  await page.getByRole('button', { name: /switch design/i }).click();
  await page.getByRole('list', { name: 'Design options' }).getByRole('button', { name: label }).click();
}
async function curtainGone(page: Page, timeout = 10_000) {
  await expect(page.locator('html')).toHaveAttribute('data-intro', 'done', { timeout });
}

test('diorama: the first switch to it in a session plays the arrival from the top of the day, the next ones the quick build @mobile', async ({ page, context }) => {
  await warmDiorama(context);
  await onEditorial(page);
  const html = page.locator('html');
  // A little way down the page: the arrival is the day's first minute, so it starts at the top
  await page.evaluate(() => window.scrollTo({ top: 120, behavior: 'instant' }));
  await switchWorld(page, 'Diorama');
  const curtain = page.locator('#site-intro .intro-dio');
  await expect(curtain.locator('.intro-dio__a')).toBeVisible();
  await expect(curtain.locator('.intro-dio__a')).toHaveText('07:59');
  await expect(curtain.locator('.intro-dio__still')).toBeHidden();
  await curtainGone(page);
  await expect(html).toHaveAttribute('data-dio-intro', 'play');
  await expect(page.locator('.dio-clock')).toHaveText('07:59');
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator('.dio-clock')).toHaveText('08:00', { timeout: 4_000 });
  await expect(html).not.toHaveAttribute('data-dio-intro', /.*/, { timeout: 5_000 });
  expect(await flags(page)).toEqual(['play', 'page', '-']);
  await expect(page.locator('header.fixed')).toHaveCSS('opacity', '1');

  // Away and back in the same session: the model is built again, in about half the time
  await switchWorld(page, 'Arcade');
  await expect(html).toHaveAttribute('data-design', 'arcade');
  await curtainGone(page);
  await switchWorld(page, 'Diorama');
  await expect(html).toHaveAttribute('data-design', 'diorama');
  await curtainGone(page);
  await expect(html).toHaveAttribute('data-dio-intro', 'play');
  await expect(page.locator('.dio-clock')).toHaveText('08:00', { timeout: 2_000 });
  await expect(html).not.toHaveAttribute('data-dio-intro', /.*/, { timeout: 4_000 });
  expect(await flags(page)).toEqual(['play', 'page', '-', 'play', 'page', '-']);
  const [whole, quick] = await toPage(page);
  expect(whole).toBeGreaterThan(2_300);
  expect(quick).toBeLessThan(2_000);
  await expect(page.locator('header.fixed')).toHaveCSS('opacity', '1');
});

test("diorama: a switch from deep in the page keeps the reader's place, and the arrival waits for a switch at the top", async ({ page, context }) => {
  await warmDiorama(context);
  await onEditorial(page);
  const html = page.locator('html');
  await page.evaluate(() => window.scrollTo({ top: 2000, behavior: 'instant' }));
  await switchWorld(page, 'Diorama');
  await expect(html).toHaveAttribute('data-design', 'diorama');
  await curtainGone(page);
  expect(await flags(page)).toEqual([]);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await expect(page.locator('header.fixed')).toHaveCSS('opacity', '1');

  await switchWorld(page, 'Arcade');
  await expect(html).toHaveAttribute('data-design', 'arcade');
  await curtainGone(page);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await switchWorld(page, 'Diorama');
  await expect(html).toHaveAttribute('data-design', 'diorama');
  await curtainGone(page);
  await expect(html).toHaveAttribute('data-dio-intro', 'play');
  await expect(html).not.toHaveAttribute('data-dio-intro', /.*/, { timeout: 5_000 });
});

test('diorama: without WebGL a switch does not wait, also once the hero has been up', async ({ page, context }) => {
  await warmDiorama(context);
  await page.addInitScript(BLOCK_WEBGL);
  await onEditorial(page);
  const html = page.locator('html');
  // Deep in the page first: the hero comes up with no arrival, so the switch from the top is the one that tries
  await page.evaluate(() => window.scrollTo({ top: 2000, behavior: 'instant' }));
  await switchWorld(page, 'Diorama');
  await expect(html).toHaveAttribute('data-design', 'diorama');
  await curtainGone(page);
  await switchWorld(page, 'Arcade');
  await expect(html).toHaveAttribute('data-design', 'arcade');
  await curtainGone(page);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await switchWorld(page, 'Diorama');
  await expect(html).toHaveAttribute('data-design', 'diorama');
  // Well before the curtain's 4s cap
  await curtainGone(page, 2_500);
  await expect(html).not.toHaveAttribute('data-dio-intro', /.*/);
  await expect(page.locator('#hero .dio-still')).toBeVisible();
  await expect(page.locator('header.fixed')).toHaveCSS('opacity', '1');
});

test('diorama: without WebGL only the first switch tries the arrival, the next ones are the short curtain', async ({ page, context }) => {
  await warmDiorama(context);
  await page.addInitScript(BLOCK_WEBGL);
  await onEditorial(page);
  const html = page.locator('html');
  await switchWorld(page, 'Diorama');
  await expect(html).toHaveAttribute('data-design', 'diorama');
  await curtainGone(page, 2_500);
  await expect(html).not.toHaveAttribute('data-dio-intro', /.*/);
  await expect(page.locator('#hero .dio-still')).toBeVisible();
  await switchWorld(page, 'Arcade');
  await expect(html).toHaveAttribute('data-design', 'arcade');
  await curtainGone(page);
  await switchWorld(page, 'Diorama');
  // The lit still and 08:00: never again the dark, for a room that cannot come
  await expect(page.locator('#site-intro .intro-dio__b')).toBeVisible();
  await expect(html).toHaveAttribute('data-design', 'diorama');
  await curtainGone(page);
  await expect(html).not.toHaveAttribute('data-dio-intro', /.*/);
});

test('diorama: a switch on a page without the room keeps the short curtain', async ({ page }) => {
  await onEditorial(page, '/blog/');
  await switchWorld(page, 'Diorama');
  await expect(page.locator('html')).toHaveAttribute('data-design', 'diorama');
  await curtainGone(page, 2_000);
  expect(await flags(page)).toEqual([]);
});

test('diorama: touching the switcher starts fetching the room, and not before', async ({ page }) => {
  const room: string[] = [];
  page.on('request', (r) => { if (/scene\/Stage/.test(r.url())) room.push(r.url()); });
  await onEditorial(page);
  await page.waitForTimeout(1_500);
  expect(room, 'a visitor who never touches the switcher never fetches the room').toEqual([]);
  await page.getByRole('button', { name: /switch design/i }).hover();
  await expect.poll(() => room.length, { timeout: 10_000 }).toBeGreaterThan(0);
});

/* ------------------------------------------------------------ A reload: the room comes in, no photo stands in for it */

/** A reload in Diorama, its session's curtain seen, the room's code held back so the wait can be looked at. */
async function reloadWithSlowRoom(page: Page, holdMs: number) {
  await page.addInitScript(() => { localStorage.setItem('design', 'diorama'); localStorage.setItem('lang', 'en'); sessionStorage.setItem('intro-seen', '1'); });
  await page.route(/scene\/Stage\.tsx/, async (route) => {
    await new Promise((r) => setTimeout(r, holdMs));
    await route.continue();
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-design', 'diorama');
}

test('diorama: while the room loads on a reload there is no photo and no clock, only the page, then both arrive together @mobile', async ({ page }) => {
  await reloadWithSlowRoom(page, 2_000);
  // The copy is there at once; the panel is the bare ground
  await expect(page.locator('.dio-name')).toBeVisible();
  await expect(page.locator('#hero .dio-still')).toBeHidden();
  await expect(page.locator('.dio-clock')).toHaveCSS('opacity', '0');
  await page.waitForTimeout(500);
  await expect(page.locator('#hero .dio-still')).toBeHidden();
  // The room has drawn: the clock with it, and the photo never came
  await expect(page.locator('.dio-stage canvas')).toHaveCount(1, { timeout: 20_000 });
  await expect(page.locator('.dio-stage[data-drawn] canvas')).toHaveCSS('opacity', '1', { timeout: 20_000 });
  await expect(page.locator('.dio-clock')).toHaveCSS('opacity', '1');
  await expect(page.locator('#hero .dio-still')).toBeHidden();
});

test('diorama: a reload deep in the day never shows 08:00 while the room loads', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('design', 'diorama'); localStorage.setItem('lang', 'en'); sessionStorage.setItem('intro-seen', '1'); });
  await page.goto('/');
  await expect(page.locator('.dio-stage[data-drawn]')).toHaveCount(1, { timeout: 20_000 });
  await page.evaluate(() => window.scrollTo({ top: 2600, behavior: 'instant' }));
  await expect(page.locator('.dio-clock')).not.toHaveText('08:00', { timeout: 5_000 });
  await page.route(/scene\/Stage\.tsx/, async (route) => {
    await new Promise((r) => setTimeout(r, 1_500));
    await route.continue();
  });
  await page.reload();
  await expect(page.locator('.dio-name')).toBeAttached();
  await expect(page.locator('#hero .dio-still')).toBeHidden();
  await expect(page.locator('.dio-clock')).toHaveCSS('opacity', '0');
  await expect(page.locator('.dio-stage[data-drawn] canvas')).toHaveCSS('opacity', '1', { timeout: 20_000 });
  await expect(page.locator('.dio-clock')).not.toHaveText('08:00');
  await expect(page.locator('#hero .dio-still')).toBeHidden();
});

test('diorama: a room that takes too long gets the photo after all, and still takes over from it', async ({ page }) => {
  await reloadWithSlowRoom(page, 6_500);
  await expect(page.locator('#hero .dio-still')).toBeHidden();
  await expect(page.locator('#hero .dio-still')).toBeVisible({ timeout: 6_000 });
  await expect(page.locator('.dio-clock')).toHaveCSS('opacity', '1');
  await expect(page.locator('#hero .dio-still')).toHaveAttribute('data-gone', '', { timeout: 20_000 });
  await expect(page.locator('.dio-stage[data-drawn] canvas')).toHaveCSS('opacity', '1');
});

/** Contrast helpers run in the page: WCAG ratio of two rgb triples. */
const CONTRAST_JS = `
  window.__rgb = (s) => (s.match(/[\\d.]+/g) || []).slice(0, 4).map(Number);
  window.__lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  window.__L = ([r, g, b]) => 0.2126 * window.__lin(r) + 0.7152 * window.__lin(g) + 0.0722 * window.__lin(b);
  window.__cr = (a, b) => { const [x, y] = [window.__L(a), window.__L(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
`;

test('diorama: the day\'s page keeps its text at 4.5:1 or more', async ({ page }) => {
  await arrive(page);
  await page.addScriptTag({ content: CONTRAST_JS });
  await expect(page.locator('.dio-stage canvas')).toHaveCount(1, { timeout: 20_000 });
  // The day's page is opaque paper: text colour against the nearest opaque ancestor (the dimmed hours are read lit)
  const worst = await page.evaluate(() => {
    const w = window as unknown as Record<string, (...a: any[]) => any>;
    const bgOf = (el: Element | null): number[] => {
      for (let e = el; e; e = e.parentElement) {
        const c = w.__rgb(getComputedStyle(e).backgroundColor);
        if (c.length === 3 || (c[3] ?? 1) > 0.9) return c.slice(0, 3);
      }
      return [255, 255, 255];
    };
    let low = { ratio: 99, text: '' };
    for (const el of document.querySelectorAll('.dio-card *, .dio-footer *, .dio-hero__inner *, .dio-section-title')) {
      const own = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent?.trim());
      if (!own || el.closest('[aria-hidden="true"], .sr-only')) continue;
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || +style.opacity === 0) continue;
      const r = el.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) continue;
      const ratio = w.__cr(w.__rgb(style.color).slice(0, 3), bgOf(el));
      if (ratio < low.ratio) low = { ratio, text: (el.textContent ?? '').trim().slice(0, 40) };
    }
    return low;
  });
  expect(worst.ratio, `the day's page: lowest text contrast at "${worst.text}"`).toBeGreaterThanOrEqual(4.5);
});

test('diorama: the hero copy and the clock read against what is behind them', async ({ page }) => {
  await arrive(page);
  await page.addScriptTag({ content: CONTRAST_JS });
  await expect(page.locator('.dio-stage canvas')).toHaveCount(1, { timeout: 20_000 });
  await expect(page.locator('.dio-still')).toHaveAttribute('data-gone', /.*/, { timeout: 20_000 });
  await page.waitForTimeout(1500);
  const targets = await page.evaluate(() => {
    const w = window as unknown as Record<string, (...a: any[]) => any>;
    // Buttons paint their own fill (rated above); the rest sits on the page (paper here, the ground on phones), the clock on the room
    return [...document.querySelectorAll('.dio-hero__copy *, .dio-clock')]
      .filter((el) => !el.closest('.dio-btn') && Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent?.trim()) && el.getClientRects().length > 0)
      .map((el, i) => {
        el.setAttribute('data-contrast-probe', String(i));
        return { i, text: (el.textContent ?? '').trim().slice(0, 30), color: w.__rgb(getComputedStyle(el).color).slice(0, 3), isClock: el.classList.contains('dio-clock') };
      });
  });
  expect(targets.length).toBeGreaterThan(3);
  // Hide the glyphs, photograph what is behind them, and rate the text colour against every pixel
  await page.addStyleTag({ content: '.dio-hero__copy * { text-shadow: none !important; } .dio-hero__copy *, .dio-clock { color: transparent !important; text-decoration: none !important; -webkit-text-fill-color: transparent !important; }' });
  for (const t of targets) {
    const shot = await page.locator(`[data-contrast-probe="${t.i}"]`).screenshot();
    const ratios = await page.evaluate(async ({ b64, color }) => {
      const w = window as unknown as Record<string, (...a: any[]) => any>;
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      const out: number[] = [];
      for (let p = 0; p < d.length; p += 4) out.push(w.__cr(color, [d[p], d[p + 1], d[p + 2]]));
      return out.sort((a, b) => a - b);
    }, { b64: shot.toString('base64'), color: t.color });
    const p5 = ratios[Math.floor(ratios.length * 0.05)];
    // The clock is display type (WCAG large text: 3:1) and keeps its own soft shadow, which stays in the sample
    const floor = t.isClock ? 3 : 4.5;
    expect(p5, `hero/clock "${t.text}": 5th-percentile contrast against the scene`).toBeGreaterThanOrEqual(floor);
  }
});

test('diorama: the arrival curtain image is not fetched by visitors of other worlds', async ({ browser }) => {
  for (const [world, expected] of [['editorial', 0], ['diorama', 1]] as const) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const hits: string[] = [];
    // Images only: the dev server's toolbar audit re-fetches page images with fetch(), which no visitor does
    page.on('request', (r) => { if (r.resourceType() === 'image' && r.url().includes('room-0800.webp')) hits.push(r.url()); });
    await page.addInitScript((w) => { localStorage.setItem('design', w); localStorage.setItem('lang', 'en'); }, world);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-design', world);
    await expect(page.locator('html')).toHaveAttribute('data-intro', 'done', { timeout: 10_000 });
    if (world === 'diorama') {
      expect(hits.length, 'diorama arrival loads the still').toBeGreaterThanOrEqual(expected);
    } else {
      await page.waitForTimeout(1000);
      expect(hits, `${world} never requests the diorama still`).toEqual([]);
    }
    await context.close();
  }
});

test('diorama: the smooth-scroll guard applies to the home stage only', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('design', 'diorama'); localStorage.setItem('lang', 'en'); sessionStorage.setItem('intro-seen', '1'); });
  // A page with no stage keeps the site's smooth scrolling in this world
  await page.goto('/404');
  await expect(page.locator('html')).toHaveAttribute('data-design', 'diorama');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('smooth');
});

for (const [w, h] of [[1440, 900], [1280, 800]] as const) {
  test(`diorama: at ${w}x${h} shift+tab through the Projects hour keeps each focused link in sight`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: w, height: h });
    await arrive(page);
    await expect(page.locator('.dio-stage canvas')).toHaveCount(1, { timeout: 20_000 });
    await page.evaluate(() => document.getElementById('dio-projects')!.scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(1500);
    const links = page.locator('#dio-projects .dio-card a');
    const n = await links.count();
    expect(n).toBeGreaterThan(2);
    await links.nth(n - 1).focus();
    const seen: string[] = [];
    for (let i = 0; i < n; i++) {
      const state = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        // A link still below the fold is not obscured: the next Tab scrolls to it
        const onScreen = r.top >= 0 && r.bottom <= innerHeight;
        return { text: (el.textContent ?? el.getAttribute('aria-label') ?? '').trim().slice(0, 30), ok: !onScreen || (!!hit && el.contains(hit)), tag: el.tagName };
      });
      if (state.tag === 'A') {
        seen.push(state.text);
        expect(state.ok, `focused "${state.text}" is hit at its centre`).toBe(true);
      }
      await page.keyboard.press('Shift+Tab');
      await page.waitForTimeout(900);
    }
    expect(seen.length).toBeGreaterThan(2);
  });
}

for (const [id, hour] of [['dio-wms', '13:00'], ['dio-uikit', '16:00']] as const) {
  test(`diorama: the clock reads against the real scene at ${hour} (#${id})`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await arrive(page);
    await page.addScriptTag({ content: CONTRAST_JS });
    await expect(page.locator('.dio-stage canvas')).toHaveCount(1, { timeout: 20_000 });
    await page.evaluate((i) => document.getElementById(i)!.scrollIntoView({ behavior: 'instant' }), id);
    await expect(page.locator('.dio-clock')).toHaveText(hour, { timeout: 8000 });
    await page.waitForTimeout(2500);
    const color = await page.evaluate(() => (window as unknown as Record<string, (...a: any[]) => any>).__rgb(getComputedStyle(document.querySelector('.dio-clock')!).color).slice(0, 3));
    await page.addStyleTag({ content: '.dio-clock { color: transparent !important; -webkit-text-fill-color: transparent !important; }' });
    const shot = await page.locator('.dio-clock').screenshot();
    const ratios = await page.evaluate(async ({ b64, color }) => {
      const w = window as unknown as Record<string, (...a: any[]) => any>;
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      const out: number[] = [];
      for (let p = 0; p < d.length; p += 4) out.push(w.__cr(color, [d[p], d[p + 1], d[p + 2]]));
      return out.sort((a, b) => a - b);
    }, { b64: shot.toString('base64'), color });
    expect(ratios[Math.floor(ratios.length * 0.05)], `clock ${hour}: 5th-percentile contrast`).toBeGreaterThanOrEqual(3);
  });
}
