import { test, expect } from '@playwright/test';
import { STATIONS, clockText, locate, sampleDay, sunAt } from '../src/components/designs/diorama/day';

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
