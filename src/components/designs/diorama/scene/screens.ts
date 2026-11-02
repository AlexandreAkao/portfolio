/**
 * What the monitors and the tablet show, drawn on 2D canvases. Every word
 * comes from src/data or src/i18n; anything illustrative beyond the CV (log
 * lines, IDs, chart values, product tiles, quiz answers) carries the locale's
 * sample-data mark.
 *
 * Drawers work in a logical frame 1280 units wide (height follows the
 * canvas's aspect), so a screen of any resolution shares one layout.
 */
import * as THREE from 'three';
import { experiences } from '@data/experience';
import { projects } from '@data/projects';
import { skillGroups } from '@data/skills';
import { t, type Locale } from '@i18n/utils';
import type { ScreenId } from '../day';
import { leafCanvas } from './textures';

const MONO = '"Martian Mono Variable", ui-monospace, monospace';
const SANS = '"Bricolage Grotesque Variable", system-ui, sans-serif';
const CODE = '"JetBrains Mono", ui-monospace, monospace';

const LOGICAL_W = 1280;

/** Set once the world's fonts have loaded (or failed to); screens wait for it, then redraw. */
let fontsIn = false;
if (typeof document !== 'undefined') {
  Promise.all([
    document.fonts.load(`400 20px ${MONO}`),
    document.fonts.load(`600 20px ${MONO}`),
    document.fonts.load(`200 80px ${SANS}`),
    document.fonts.load(`700 40px ${SANS}`),
    document.fonts.load(`400 20px ${CODE}`),
    document.fonts.load(`700 20px ${CODE}`),
  ])
    .catch(() => undefined)
    .then(() => {
      fontsIn = true;
    });
}

type Ctx = CanvasRenderingContext2D;
interface Frame {
  ctx: Ctx;
  W: number;
  H: number;
  locale: Locale;
}

/* ------------------------------------------------------------- the data */

const byCompany = (company: string) => {
  for (const e of experiences) {
    if (e.company === company) return e;
    const sub = e.subEntries?.find((s) => s.company === company);
    if (sub) return sub;
  }
  throw new Error(`No experience for ${company}`);
};

const SEVA = byCompany('Seva / Appointally');
const UIKIT = byCompany('AmbevTech - UIKit');
const PERSONAL = projects.filter((p) => p.type === 'personal');
const NOW = experiences.filter((e) => e.period.en.endsWith('Present')).map((e) => e.company);
const SKILLS = new Set(skillGroups.flatMap((g) => g.skills));
const known = (names: string[]) => names.filter((n) => SKILLS.has(n));

/** Appointally's domains as the Seva summary and bullets name them. */
const SEVA_SERVICES: [string, string?][] = [
  ['appointments'],
  ['clients'],
  ['staff schedules'],
  ['catalogs'],
  ['search', 'rag'],
  ['subscriptions'],
  ['payments', 'stripe'],
  ['billing'],
  ['webhooks'],
  ['notifications'],
  ['files', 'fastapi'],
  ['auth', 'cognito'],
  ['rbac'],
];

/* -------------------------------------------------------------- helpers */

function font(ctx: Ctx, weight: number, size: number, family: string) {
  ctx.font = `${weight} ${size}px ${family}`;
}

/** Sets the largest font up to `size` at which `text` fits in `maxW`. */
function fit(ctx: Ctx, text: string, maxW: number, weight: number, size: number, family: string) {
  let s = size;
  font(ctx, weight, s, family);
  while (s > 8 && ctx.measureText(text).width > maxW) {
    s -= 1;
    font(ctx, weight, s, family);
  }
  return s;
}

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function fillRR(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string) {
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

/** A window title bar with the three dots and a centred title. */
function chrome({ ctx, W, H }: Frame, title: string, bg: string, bar = '#181c22', ink = '#8b949e') {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = bar;
  ctx.fillRect(0, 0, W, 44);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(26 + i * 24, 22, 7, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = ink;
  font(ctx, 400, 16, MONO);
  ctx.textAlign = 'center';
  ctx.fillText(title, W / 2, 23);
  ctx.textAlign = 'left';
}

/** The sample-data mark, bottom right, legible from across the room. */
function sampleMark({ ctx, W, H, locale }: Frame, light = false) {
  const text = t('diorama.sample', locale);
  font(ctx, 500, 24, MONO);
  const w = ctx.measureText(text).width + 36;
  const x = W - w - 24;
  const y = H - 24 - 46;
  fillRR(ctx, x, y, w, 46, 23, light ? 'rgba(23,24,27,0.86)' : 'rgba(241,236,227,0.92)');
  ctx.fillStyle = light ? '#f1ece3' : '#17181b';
  ctx.fillText(text, x + 18, y + 24);
}

function statusBar({ ctx, W, H }: Frame, text: string) {
  ctx.fillStyle = '#161b22';
  ctx.fillRect(0, H - 36, W, 36);
  ctx.fillStyle = '#8b949e';
  font(ctx, 400, 14, MONO);
  ctx.fillText(text, 24, H - 17);
}

/** Editor tabs under the title bar; the first is active. */
function tabs({ ctx, W }: Frame, names: string[]) {
  ctx.fillStyle = '#161b22';
  ctx.fillRect(0, 44, W, 42);
  font(ctx, 400, 15, MONO);
  let x = 0;
  names.forEach((name, i) => {
    const w = ctx.measureText(name).width + 48;
    if (i === 0) {
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(x, 44, w, 42);
      ctx.fillStyle = '#f2a65a';
      ctx.fillRect(x, 44, w, 3);
    }
    ctx.fillStyle = i === 0 ? '#e6edf3' : '#6e7681';
    ctx.fillText(name, x + 24, 66);
    ctx.fillStyle = '#21262d';
    ctx.fillRect(x + w - 1, 52, 1, 26);
    x += w;
  });
}

type Tok = [string, string];
const K = '#ff7b72';
const P = '#79c0ff';
const S = '#a5d6ff';
const N = '#d2a8ff';
const D = '#c9d1d9';

/** Code lines with a line gutter; a caret after the last token when `blink`. */
function codeLines({ ctx }: Frame, lines: Tok[][], y0: number, lh: number, blink: boolean) {
  font(ctx, 400, 22, CODE);
  lines.forEach((parts, i) => {
    const y = y0 + i * lh;
    ctx.fillStyle = '#484f58';
    ctx.textAlign = 'right';
    ctx.fillText(String(i + 1), 64, y);
    ctx.textAlign = 'left';
    let x = 96;
    for (const [text, color] of parts) {
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      x += ctx.measureText(text).width;
    }
    if (blink && i === lines.length - 1) {
      ctx.fillStyle = '#e6edf3';
      ctx.fillRect(x + 4, y - 14, 12, 28);
    }
  });
}

const q = (s: string) => `'${s}'`;
const list = (items: string[]) => items.map(q).join(', ');

/* ---------------------------------------------------------- wallpaper */

let leaves: HTMLCanvasElement[] | null = null;

/** The dark monstera wallpaper from the reference photo, without the clock. */
function wallpaper(w: number, h: number, dim: boolean) {
  leaves ??= [leafCanvas('#1f4a2c', '#3f7a4c'), leafCanvas('#2b5e36', '#4f8f5a'), leafCanvas('#173a23', '#2f6a3e')];
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  const sx = w / 1280;
  const sy = h / 720;
  ctx.fillStyle = '#0b1a10';
  ctx.fillRect(0, 0, w, h);
  const spots: [number, number, number, number, number][] = [
    [120, 760, 620, -0.5, 0],
    [420, 820, 700, 0.15, 1],
    [880, 780, 640, 0.6, 2],
    [1150, 700, 560, 0.95, 0],
    [640, 300, 520, 2.9, 1],
    [-40, 260, 480, 2.2, 2],
    [1300, 180, 520, -2.5, 1],
    [300, 520, 420, -0.9, 2],
    [980, 470, 440, 0.9, 1],
  ];
  for (const [x, y, s, r, k] of spots) {
    ctx.save();
    ctx.translate(x * sx, y * sy);
    ctx.rotate(r);
    ctx.drawImage(leaves[k], (-s / 2) * sx, -s * sx, s * sx, s * sx);
    ctx.restore();
  }
  const g = ctx.createRadialGradient(w / 2, h / 2, 100 * sx, w / 2, h / 2, w * 0.7);
  g.addColorStop(0, 'rgba(0,0,0,0.05)');
  g.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  if (dim) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, w, h);
  }
  return c;
}

/* ------------------------------------------------------------ drawers */

function off({ ctx, W, H }: Frame) {
  ctx.fillStyle = '#060607';
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, W * 0.6, H);
  g.addColorStop(0, 'rgba(255,255,255,0.05)');
  g.addColorStop(0.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function clockFace({ ctx, W, H }: Frame, clock: string, lock: boolean) {
  ctx.textAlign = 'center';
  ctx.fillStyle = lock ? 'rgba(242,238,230,0.8)' : 'rgba(242,238,230,0.92)';
  font(ctx, 200, (H / 720) * 168, SANS);
  ctx.fillText(clock, W / 2, H / 2 - 6);
  if (lock) {
    ctx.fillStyle = 'rgba(242,238,230,0.62)';
    font(ctx, 400, 22, MONO);
    ctx.fillText('alexandreakira.dev', W / 2, H / 2 + 104);
  }
  ctx.textAlign = 'left';
}

/** akira.ts: who he is, as a typed object. */
function code(f: Frame, blink: boolean) {
  chrome(f, 'portfolio — akira.ts', '#0d1117');
  tabs(f, ['akira.ts', 'Button.tsx']);
  const lines: Tok[][] = [
    [['export const ', K], ['akira', N], [' = {', D]],
    [['  role', P], [': ', D], [q(t('hero.title', f.locale)), S], [',', D]],
    [['  since', P], [': ', D], ['2018', P], [',', D]],
    [['  now', P], [': [', D], [list(NOW), S], ['],', D]],
    [['  backend', P], [': [', D], [list(known(['C#', '.NET', 'Node.js', 'NestJS', 'Go'])), S], ['],', D]],
    [['  frontend', P], [': [', D], [list(known(['TypeScript', 'React', 'Next.js', 'Astro'])), S], ['],', D]],
    [['  infra', P], [': [', D], [list(known(['AWS', 'Azure', 'Kubernetes', 'Terraform'])), S], ['],', D]],
    [['  ai', P], [': [', D], [list(known(['RAG', 'LLM Integration', 'Claude'])), S], ['],', D]],
    [['  uikit', P], [': { ', D], ['components', P], [': ', D], ['52', P], [', ', D], ['coverage', P], [': ', D], [q('95%+'), S], [' },', D]],
    [['};', D]],
  ];
  codeLines(f, lines, 128, 44, blink);
  statusBar(f, 'main  ✓ 0 problems   TypeScript   UTF-8');
}

/** Appointally's 26 services on one board, the payment flow on the outbox. */
function arch(f: Frame) {
  const { ctx, W } = f;
  chrome(f, 'appointally / architecture', '#0f1216');
  ctx.fillStyle = '#e6edf3';
  fit(ctx, SEVA.impact![f.locale], W - 96, 700, 36, SANS);
  ctx.fillText(SEVA.impact![f.locale], 48, 92);
  ctx.fillStyle = '#8b949e';
  font(ctx, 400, 15, MONO);
  ctx.fillText(['NestJS', 'MongoDB', 'Redis', 'Stripe', 'Kubernetes'].filter((n) => SEVA.tech.includes(n)).join(' · '), 48, 130);

  const cols = 7;
  const gx = 14;
  const gy = 24;
  const x0 = 48;
  const y0 = 166;
  const bw = (W - 2 * x0 - (cols - 1) * gx) / cols;
  const bh = 70;
  const busY = y0 + 3 * bh + 2 * gy + 34;
  const PAY = SEVA_SERVICES.findIndex(([n]) => n === 'payments');
  const slot = (i: number) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    return {
      x: x0 + c * (bw + gx) + (r === 3 ? (bw + gx) * 2 : 0),
      y: r < 3 ? y0 + r * (bh + gy) : busY + 56,
      above: r < 3,
    };
  };

  // Every service hangs off the bus
  for (let i = 0; i < 26; i++) {
    const { x, y, above } = slot(i);
    ctx.strokeStyle = i === PAY ? '#f2a65a' : '#30363d';
    ctx.lineWidth = i === PAY ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(x + bw / 2, y + (above ? bh : 0));
    ctx.lineTo(x + bw / 2, busY);
    ctx.stroke();
  }
  ctx.strokeStyle = '#3fb950';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(x0, busY);
  ctx.lineTo(W - x0, busY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#3fb950';
  font(ctx, 600, 15, MONO);
  ctx.fillText('azure service bus', x0, busY + 30);
  ctx.fillText('transactional outbox', x0, busY + 54);

  for (let i = 0; i < 26; i++) {
    const { x, y } = slot(i);
    const named = SEVA_SERVICES[i];
    rr(ctx, x, y, bw, bh, 8);
    ctx.fillStyle = named ? '#161b22' : '#12161b';
    ctx.fill();
    ctx.strokeStyle = i === PAY ? '#f2a65a' : named ? '#3a414a' : '#262b31';
    ctx.lineWidth = i === PAY ? 2.5 : 1.5;
    ctx.stroke();
    if (!named) {
      fillRR(ctx, x + 14, y + bh / 2 - 4, bw * 0.42, 8, 4, '#20262d');
      continue;
    }
    const [name, tech] = named;
    ctx.fillStyle = i === PAY ? '#f6c18c' : '#d5dce3';
    fit(ctx, name, bw - 24, 500, 14, MONO);
    ctx.fillText(name, x + 12, tech ? y + 25 : y + bh / 2 + 1);
    if (tech) {
      ctx.fillStyle = i === PAY ? '#c9874a' : '#6e7681';
      font(ctx, 400, 12, MONO);
      ctx.fillText(tech, x + 12, y + 48);
    }
  }
}

/** The WMS stock-reservation race, the lock that fixed it. Illustrative. */
function trace(f: Frame) {
  const { ctx, W } = f;
  chrome(f, 'wms · stock-reservation · trace', '#0b0d10');
  const lines: [string, string][] = [
    ['#8b949e', '14:02:11.204  INFO   reserve  order=7731 sku=BR-33018 qty=40'],
    ['#8b949e', '14:02:11.209  INFO   reserve  order=7732 sku=BR-33018 qty=25'],
    ['#f85149', '14:02:11.311  ERROR  stock below zero  sku=BR-33018  on_hand=-12'],
    ['#f85149', '               ↳ both reads saw on_hand=53 before either write'],
    ['#8b949e', '14:02:11.312  WARN   retry 1/3  order=7732'],
    ['#d29922', '# root cause: no lock between read and write on the reservation'],
    ['', ''],
    ['#58a6ff', '+ await using lock = await redis.lock(`stock:${sku}`, { ttl: 2000 })'],
    ['#58a6ff', '+ const onHand = await stock.read(sku)'],
    ['', ''],
    ['#3fb950', '14:31:40.018  INFO   reserve  order=7731 ok  on_hand=13'],
    ['#3fb950', '14:31:40.026  INFO   reserve  order=7732 waited 8ms  on_hand=13 < 25  rejected'],
  ];
  const y0 = 82;
  const lh = 44;
  ctx.fillStyle = 'rgba(248,81,73,0.12)';
  ctx.fillRect(0, y0 + 2 * lh - 22, W, 2 * lh);
  font(ctx, 400, 20, CODE);
  lines.forEach(([c, text], i) => {
    if (!text) return;
    ctx.fillStyle = c;
    ctx.fillText(text, 40, y0 + i * lh);
  });
  sampleMark(f);
}

/** BEES B2B on the tablet: a storefront of blocks. Illustrative. */
function store(f: Frame) {
  const { ctx, W, H } = f;
  ctx.fillStyle = '#f4f1ea';
  ctx.fillRect(0, 0, W, H);
  // app bar
  ctx.fillStyle = '#17181b';
  ctx.fillRect(0, 0, W, 118);
  ctx.fillStyle = '#f2a65a';
  font(ctx, 800, 54, SANS);
  ctx.fillText(projects.find((p) => p.title.startsWith('BEES'))!.title, 48, 62);
  fillRR(ctx, W - 132, 30, 84, 58, 14, '#2a2c31');
  ctx.fillStyle = '#f2a65a';
  ctx.beginPath();
  ctx.arc(W - 56, 34, 15, 0, Math.PI * 2);
  ctx.fill();
  // search, chips
  fillRR(ctx, 48, 148, W - 96, 70, 35, '#e4dfd5');
  fillRR(ctx, 84, 176, 300, 14, 7, '#c4bdb1');
  [180, 140, 210, 160, 130].forEach((w, i, all) => {
    const x = 48 + all.slice(0, i).reduce((a, b) => a + b + 18, 0);
    fillRR(ctx, x, 246, w, 50, 25, i === 0 ? '#17181b' : '#e4dfd5');
  });
  // product tiles
  const cols = 4;
  const gap = 24;
  const tw = (W - 96 - gap * (cols - 1)) / cols;
  const th = (H - 330 - 110 - gap) / 2;
  const tones = ['#c9822f', '#7a8a3a', '#a8442f', '#2f4a6b', '#d6a640', '#3c5a3a', '#8a4e26', '#5b6b7a'];
  for (let i = 0; i < 8; i++) {
    const x = 48 + (i % cols) * (tw + gap);
    const y = 326 + Math.floor(i / cols) * (th + gap);
    fillRR(ctx, x, y, tw, th, 18, '#ffffff');
    const imgH = th * 0.46;
    fillRR(ctx, x + 14, y + 14, tw - 28, imgH, 12, '#efeae1');
    // a can or a bottle, as a silhouette
    const cx = x + tw / 2;
    const base = y + 14 + imgH - 10;
    if (i % 2) {
      fillRR(ctx, cx - imgH * 0.22, base - imgH * 0.72, imgH * 0.44, imgH * 0.72, 10, tones[i]);
    } else {
      fillRR(ctx, cx - imgH * 0.18, base - imgH * 0.52, imgH * 0.36, imgH * 0.52, 8, tones[i]);
      fillRR(ctx, cx - imgH * 0.07, base - imgH * 0.78, imgH * 0.14, imgH * 0.3, 5, tones[i]);
    }
    fillRR(ctx, x + 18, y + imgH + 30, tw * 0.7, 14, 7, '#d6d0c5');
    fillRR(ctx, x + 18, y + imgH + 54, tw * 0.45, 14, 7, '#e4dfd5');
    fillRR(ctx, x + 18, y + th - 40, tw * 0.32, 22, 8, '#17181b');
    ctx.fillStyle = '#f2a65a';
    ctx.beginPath();
    ctx.arc(x + tw - 40, y + th - 30, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#17181b';
    ctx.fillRect(x + tw - 50, y + th - 32, 20, 4);
    ctx.fillRect(x + tw - 42, y + th - 40, 4, 20);
  }
  sampleMark(f, true);
}

/** A tiny component in a tile: the kinds a UI kit is made of. */
function glyph(ctx: Ctx, kind: number, cx: number, cy: number, s: number) {
  const ink = '#17181b';
  const acc = '#f2a65a';
  const soft = '#d9dde3';
  switch (kind % 10) {
    case 0: // button
      fillRR(ctx, cx - s * 0.36, cy - s * 0.12, s * 0.72, s * 0.24, s * 0.12, ink);
      break;
    case 1: // toggle
      fillRR(ctx, cx - s * 0.24, cy - s * 0.12, s * 0.48, s * 0.24, s * 0.12, acc);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(cx + s * 0.12, cy, s * 0.09, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 2: // checkbox
      fillRR(ctx, cx - s * 0.13, cy - s * 0.13, s * 0.26, s * 0.26, s * 0.05, ink);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = s * 0.05;
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.07, cy);
      ctx.lineTo(cx - s * 0.01, cy + s * 0.06);
      ctx.lineTo(cx + s * 0.08, cy - s * 0.06);
      ctx.stroke();
      break;
    case 3: // input
      rr(ctx, cx - s * 0.38, cy - s * 0.12, s * 0.76, s * 0.24, s * 0.05);
      ctx.strokeStyle = '#9aa1ab';
      ctx.lineWidth = 2;
      ctx.stroke();
      fillRR(ctx, cx - s * 0.3, cy - s * 0.03, s * 0.3, s * 0.06, s * 0.03, soft);
      break;
    case 4: // avatar
      ctx.fillStyle = '#2f6a3a';
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.17, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 5: // slider
      fillRR(ctx, cx - s * 0.36, cy - s * 0.025, s * 0.72, s * 0.05, s * 0.025, soft);
      fillRR(ctx, cx - s * 0.36, cy - s * 0.025, s * 0.4, s * 0.05, s * 0.025, acc);
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.arc(cx + s * 0.04, cy, s * 0.07, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 6: // badge
      fillRR(ctx, cx - s * 0.2, cy - s * 0.09, s * 0.4, s * 0.18, s * 0.09, '#3fb950');
      break;
    case 7: // tabs
      for (let k = 0; k < 3; k++) fillRR(ctx, cx - s * 0.36 + k * s * 0.25, cy - s * 0.04, s * 0.2, s * 0.08, s * 0.03, k === 0 ? ink : soft);
      fillRR(ctx, cx - s * 0.36, cy + s * 0.08, s * 0.2, s * 0.025, 1, acc);
      break;
    case 8: // radio
      ctx.strokeStyle = ink;
      ctx.lineWidth = s * 0.035;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.055, 0, Math.PI * 2);
      ctx.fill();
      break;
    default: // progress
      fillRR(ctx, cx - s * 0.36, cy - s * 0.04, s * 0.72, s * 0.08, s * 0.04, soft);
      fillRR(ctx, cx - s * 0.36, cy - s * 0.04, s * 0.5, s * 0.08, s * 0.04, '#58a6ff');
  }
}

/** UIKit's 52 components as a Storybook-like grid. */
function storybook(f: Frame) {
  const { ctx, W, H } = f;
  chrome(f, 'uikit · storybook', '#f6f7f9', '#e8ebef', '#5b636d');
  // sidebar
  ctx.fillStyle = '#eceff3';
  ctx.fillRect(0, 44, 220, H - 44);
  for (let i = 0; i < 13; i++) {
    const y = 76 + i * 40;
    if (i === 2) fillRR(ctx, 12, y - 14, 196, 34, 6, '#f2a65a');
    fillRR(ctx, i % 4 === 0 ? 24 : 40, y - 2, 70 + ((i * 37) % 80), 10, 5, i === 2 ? '#17181b' : '#c3c9d1');
  }
  // header
  const [count, coverage] = UIKIT.impact![f.locale].split(' · ');
  ctx.fillStyle = '#17181b';
  font(ctx, 700, 40, SANS);
  ctx.fillText('UIKit', 252, 92);
  ctx.fillStyle = '#5b636d';
  font(ctx, 400, 16, MONO);
  ctx.fillText(count, 252, 134);
  font(ctx, 600, 18, MONO);
  const bw = ctx.measureText(coverage).width + 40;
  fillRR(ctx, W - 32 - bw, 68, bw, 46, 23, '#1f7a3a');
  ctx.fillStyle = '#ffffff';
  ctx.fillText(coverage, W - 32 - bw + 20, 92);
  // 52 tiles
  const cols = 13;
  const rows = 4;
  const gap = 8;
  const x0 = 252;
  const y0 = 168;
  const tw = (W - x0 - 32 - gap * (cols - 1)) / cols;
  const th = (H - y0 - 28 - gap * (rows - 1)) / rows;
  for (let i = 0; i < cols * rows; i++) {
    const x = x0 + (i % cols) * (tw + gap);
    const y = y0 + Math.floor(i / cols) * (th + gap);
    fillRR(ctx, x, y, tw, th, 8, '#ffffff');
    rr(ctx, x, y, tw, th, 8);
    ctx.strokeStyle = '#dde1e6';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    glyph(ctx, i * 7 + Math.floor(i / cols), x + tw / 2, y + th * 0.42, tw);
    fillRR(ctx, x + 10, y + th - 24, tw * (0.4 + ((i * 13) % 5) * 0.08), 8, 4, '#d9dde3');
  }
}

/** Athena: a quiz card. Illustrative. */
function athena(f: Frame) {
  const { ctx, W, H } = f;
  ctx.fillStyle = '#1d2238';
  ctx.fillRect(0, 0, W, H);
  // top bar
  ctx.fillStyle = '#f1ece3';
  font(ctx, 700, 46, SANS);
  ctx.fillText('Athena', 56, 64);
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i < 3 ? '#f2a65a' : i === 3 ? '#f1ece3' : 'rgba(241,236,227,0.25)';
    ctx.beginPath();
    ctx.arc(W - 330 + i * 30, 64, i === 3 ? 9 : 7, 0, Math.PI * 2);
    ctx.fill();
  }
  // the card
  const cx = 150;
  const cw = W - 300;
  const cy = 120;
  const ch = H - cy - 96;
  fillRR(ctx, cx, cy, cw, ch, 22, '#f1ece3');
  fillRR(ctx, cx + 48, cy + 44, 90, 34, 17, '#17181b');
  ctx.fillStyle = '#f1ece3';
  font(ctx, 600, 17, MONO);
  ctx.fillText('4/10', cx + 64, cy + 62);
  fillRR(ctx, cx + 48, cy + 108, cw * 0.78, 22, 11, '#3a3a40');
  fillRR(ctx, cx + 48, cy + 144, cw * 0.52, 22, 11, '#3a3a40');
  const letters = ['A', 'B', 'C', 'D'];
  letters.forEach((letter, i) => {
    const y = cy + 190 + i * 72;
    const chosen = i === 2;
    fillRR(ctx, cx + 48, y, cw - 96, 60, 14, chosen ? '#2f6a3a' : '#e4ded3');
    ctx.fillStyle = chosen ? '#f1ece3' : '#17181b';
    ctx.beginPath();
    ctx.arc(cx + 84, y + 30, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = chosen ? '#2f6a3a' : '#f1ece3';
    font(ctx, 700, 18, MONO);
    ctx.textAlign = 'center';
    ctx.fillText(letter, cx + 84, y + 31);
    ctx.textAlign = 'left';
    fillRR(ctx, cx + 122, y + 23, (cw - 260) * (0.35 + ((i * 29) % 7) * 0.07), 14, 7, chosen ? 'rgba(241,236,227,0.75)' : '#bfb6a8');
    if (chosen) {
      ctx.strokeStyle = '#f1ece3';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx + cw - 104, y + 30);
      ctx.lineTo(cx + cw - 94, y + 40);
      ctx.lineTo(cx + cw - 74, y + 19);
      ctx.stroke();
      ctx.lineCap = 'butt';
    }
  });
  sampleMark(f);
}

/** Unifall: a body-motion signal with the fall, and the skeleton. Illustrative. */
function chart(f: Frame) {
  const { ctx, W, H } = f;
  chrome(f, 'unifall', '#0d1117');
  ctx.fillStyle = '#e6edf3';
  font(ctx, 700, 40, SANS);
  ctx.fillText('Unifall', 48, 96);
  // the skeleton models it ran, from the CV
  font(ctx, 500, 15, MONO);
  let x = 220;
  for (const m of ['COCO', 'BODY25', 'MPI']) {
    const w = ctx.measureText(m).width + 28;
    rr(ctx, x, 78, w, 36, 18);
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#8b949e';
    ctx.fillText(m, x + 14, 97);
    x += w + 10;
  }
  // plot
  const px = 48;
  const py = 150;
  const pw = W - 420;
  const ph = H - py - 110;
  ctx.strokeStyle = '#21262d';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(px, py + (ph / 4) * i);
    ctx.lineTo(px + pw, py + (ph / 4) * i);
    ctx.stroke();
  }
  const fallAt = 0.62;
  ctx.fillStyle = 'rgba(248,81,73,0.12)';
  ctx.fillRect(px + pw * (fallAt - 0.03), py, pw * 0.08, ph);
  let seed = 11;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647 - 0.5;
  };
  ctx.strokeStyle = '#58a6ff';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  const n = 220;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const d = (u - fallAt) / 0.012;
    const spike = Math.exp(-d * d) * 0.9 - Math.exp(-(((u - fallAt - 0.03) / 0.015) ** 2)) * 0.35;
    const rest = u > fallAt + 0.06 ? 0.4 : 1;
    const v = 0.08 * Math.sin(u * 46) * rest + rnd() * 0.12 * rest + spike;
    const y = py + ph * 0.62 - v * ph * 0.55;
    if (i === 0) ctx.moveTo(px + pw * u, y);
    else ctx.lineTo(px + pw * u, y);
  }
  ctx.stroke();
  // the alert at the spike
  const ax = px + pw * fallAt;
  const ay = py + 36;
  ctx.fillStyle = '#f85149';
  ctx.beginPath();
  ctx.moveTo(ax, ay - 22);
  ctx.lineTo(ax + 24, ay + 18);
  ctx.lineTo(ax - 24, ay + 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(ax - 2.5, ay - 8, 5, 15);
  ctx.fillRect(ax - 2.5, ay + 10, 5, 5);
  // the skeleton the models track, tipping over
  const sx = W - 330;
  const sy = 150;
  fillRR(ctx, sx, sy, 282, ph, 14, '#161b22');
  const pts: [number, number][] = [
    [0, -0.45], [0, -0.32], [-0.14, -0.3], [-0.26, -0.4], [-0.34, -0.52], [0.14, -0.3], [0.24, -0.38], [0.3, -0.5],
    [0, 0.02], [-0.08, 0.04], [-0.1, 0.25], [-0.1, 0.46], [0.08, 0.04], [0.12, 0.24], [0.16, 0.45],
  ];
  const bones = [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [5, 6], [6, 7], [1, 8], [8, 9], [9, 10], [10, 11], [8, 12], [12, 13], [13, 14]];
  const size = 250;
  ctx.save();
  ctx.translate(sx + 141, sy + ph / 2);
  ctx.rotate(-0.95);
  ctx.strokeStyle = '#3fb950';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  for (const [a, b] of bones) {
    ctx.beginPath();
    ctx.moveTo(pts[a][0] * size, pts[a][1] * size);
    ctx.lineTo(pts[b][0] * size, pts[b][1] * size);
    ctx.stroke();
  }
  ctx.fillStyle = '#e6edf3';
  for (const [u, v] of pts) {
    ctx.beginPath();
    ctx.arc(u * size, v * size, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  sampleMark(f);
}

/** After hours: the personal projects open as editor tabs, DevTray in front. */
function sideProjects(f: Frame, blink: boolean) {
  const active = PERSONAL.find((p) => p.title === 'DevTray') ?? PERSONAL[0];
  const names = [active, ...PERSONAL.filter((p) => p !== active)].map((p) => p.title);
  chrome(f, '~/projects', '#0d1117');
  tabs(f, names);
  const ident = active.title.replace(/[^A-Za-z0-9]+(.)?/g, (_, c: string | undefined) => (c ? c.toUpperCase() : '')).replace(/^./, (c) => c.toLowerCase());
  const lines: Tok[][] = [[['export const ', K], [ident, N], [' = {', D]]];
  if (active.live) lines.push([['  live', P], [': ', D], [q(active.live), S], [',', D]]);
  if (active.github) lines.push([['  github', P], [': ', D], [q(active.github), S], [',', D]]);
  lines.push([['  tech', P], [': [', D]]);
  // wrap the stack into lines that fit the screen
  f.ctx.font = `400 22px ${CODE}`;
  let row: string[] = [];
  const rows: string[][] = [];
  for (const tech of active.tech) {
    const next = [...row, tech];
    if (row.length && f.ctx.measureText(`    ${list(next)},`).width > f.W - 160) {
      rows.push(row);
      row = [tech];
    } else row = next;
  }
  if (row.length) rows.push(row);
  for (const r of rows) lines.push([['    ', D], [list(r), S], [',', D]]);
  lines.push([['  ],', D]]);
  lines.push([['};', D]]);
  codeLines(f, lines, 128, 44, blink);
  statusBar(f, 'main  ✓ 0 problems   TypeScript   UTF-8');
}

/* ------------------------------------------------------------- canvas */

export class ScreenCanvas {
  readonly canvas: HTMLCanvasElement;
  readonly texture: THREE.CanvasTexture;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly k: number;
  private readonly W: number;
  private readonly H: number;
  private key = '';
  private walls: Partial<Record<'wall' | 'lock', HTMLCanvasElement>> = {};

  constructor(w = 1280, h = 720) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx = this.canvas.getContext('2d')!;
    this.k = w / LOGICAL_W;
    this.W = LOGICAL_W;
    this.H = h / this.k;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 8;
  }

  /** Draws `id`; a no-op unless the screen, the clock, the caret, the locale or the fonts changed. */
  draw(id: ScreenId, opts: { clock: string; blink: boolean; locale: Locale }): void {
    const { clock, blink, locale } = opts;
    const timed = id === 'wall' || id === 'lock';
    const caret = id === 'code' || id === 'projects';
    // Until the fonts are in, the screen stays dark rather than drawing in a fallback face
    const key = fontsIn ? `${id}|${timed ? clock : ''}|${caret ? blink : ''}|${locale}` : 'waiting';
    if (key === this.key) return;
    this.key = key;
    const ctx = this.ctx;
    const f: Frame = { ctx, W: this.W, H: this.H, locale };
    ctx.save();
    ctx.setTransform(this.k, 0, 0, this.k, 0, 0);
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const face: ScreenId = fontsIn ? id : 'off';
    switch (face) {
      case 'wall':
      case 'lock':
        this.walls[face] ??= wallpaper(this.canvas.width, this.canvas.height, face === 'lock');
        ctx.drawImage(this.walls[face]!, 0, 0, this.W, this.H);
        clockFace(f, clock, face === 'lock');
        break;
      case 'code':
        code(f, blink);
        break;
      case 'arch':
        arch(f);
        break;
      case 'trace':
        trace(f);
        break;
      case 'store':
        store(f);
        break;
      case 'storybook':
        storybook(f);
        break;
      case 'athena':
        athena(f);
        break;
      case 'chart':
        chart(f);
        break;
      case 'projects':
        sideProjects(f, blink);
        break;
      default:
        off(f);
    }
    ctx.restore();
    this.texture.needsUpdate = true;
  }
}
