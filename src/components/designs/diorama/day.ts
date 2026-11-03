/**
 * The day model: scroll position in, camera station, hour, light and pose out.
 * Pure (no three, no DOM) so islands and node tests can import it cheaply.
 */

export type StationId = 'arrival' | 'coffee' | 'seva' | 'wms' | 'bees' | 'uikit' | 'nati' | 'funcap' | 'study' | 'skills' | 'projects' | 'night';
export type Pose = 'typing' | 'coffee' | 'lookUp' | 'think' | 'reading' | 'wave';
export type ScreenId = 'wall' | 'lock' | 'off' | 'code' | 'arch' | 'trace' | 'store' | 'storybook' | 'athena' | 'chart' | 'projects';
export type V3 = [number, number, number];
/** The object an hour's label is pinned to. Hours on one object share one pin: the hour on it now. */
export type PinObject = 'figure' | 'upper' | 'monitor' | 'tablet' | 'keyboard' | 'books' | 'stand';

export interface Station {
  id: StationId;
  hour: number;
  target: V3;
  dist: number;
  yaw: number;
  shift: number;
  wide: boolean;
  pose: Pose;
  turn: 0 | 1;
  screens: { main: ScreenId; upper: ScreenId; tablet: ScreenId };
  label?: V3;
  on?: PinObject;
}

/**
 * `sun` and `moon` share the window's directional light (the sun sets before the moon rises);
 * `practical` is the room's own evening light (the LED strip under the riser, the bias light
 * behind the monitor, the floor lamp, the string of lights, the town's windows); `hemiSky`
 * tints the sky's bounce.
 */
export interface Light {
  sun: number; sunColor: string; sunDir: V3; sky: string; lamp: number; hemi: number; hemiSky: string; fill: number; moon: number; practical: number;
}
export interface Located { i: number; u: number; move: number }
export interface DaySample {
  pos: V3; target: V3; fov: number; hour: number; light: Light;
  poseFrom: Pose; poseTo: Pose; poseMix: number; turn: number; screens: Station['screens']; active: StationId; fit: number;
}

const FOV = 18;
const SHIFT = 0.62;

const st = (
  id: StationId, hour: number, target: V3, dist: number, yaw: number, shift: number, wide: boolean, pose: Pose, turn: 0 | 1,
  main: ScreenId, upper: ScreenId, tablet: ScreenId, label?: V3, on?: PinObject,
): Station => ({ id, hour, target, dist, yaw, shift, wide, pose, turn, screens: { main, upper, tablet }, label, on });

/** Above the main monitor: the pin its four hours share (13:00, 17:00, 17:45, 21:00). */
const MONITOR: V3 = [-0.2, 1.5, -1.44];

export const STATIONS: Station[] = [
  st('arrival', 8, [-0.7, 0.9, -1.3], 18, 0, 0, true, 'typing', 0, 'wall', 'off', 'off'),
  st('coffee', 9, [-0.2, 1.0, -0.9], 9, 0.1, SHIFT, false, 'coffee', 0, 'code', 'wall', 'off', [-0.2, 1.62, -0.5], 'figure'),
  st('seva', 10.5, [-0.2, 1.5, -1.4], 6.8, 0.14, SHIFT, false, 'lookUp', 0, 'code', 'arch', 'off', [-0.2, 2.02, -1.55], 'upper'),
  st('wms', 13, [0, 1.05, -1.15], 6.4, -0.04, SHIFT, false, 'think', 0, 'trace', 'arch', 'off', MONITOR, 'monitor'),
  st('bees', 14.5, [0.45, 0.95, -1.1], 5.6, -0.1, SHIFT, false, 'typing', 0, 'code', 'arch', 'store', [0.5, 1.05, -1.08], 'tablet'),
  st('uikit', 16, [-0.2, 0.9, -1.05], 6.0, -0.16, SHIFT, false, 'typing', 0, 'storybook', 'arch', 'off', [-0.2, 0.95, -1.0], 'keyboard'),
  st('nati', 17, [-0.2, 1.2, -1.4], 6.4, 0.05, SHIFT, false, 'typing', 0, 'athena', 'code', 'off', MONITOR, 'monitor'),
  st('funcap', 17.75, [-0.2, 1.2, -1.4], 6.4, 0.12, SHIFT, false, 'think', 0, 'chart', 'code', 'off', MONITOR, 'monitor'),
  st('study', 19, [-0.9, 0.95, -1.2], 6.6, 0.22, SHIFT, false, 'reading', 0, 'wall', 'off', 'off', [-1.2, 1.02, -1.46], 'books'),
  st('skills', 20, [0.86, 1.1, -1.4], 5.6, 0.18, SHIFT, false, 'typing', 0, 'code', 'off', 'off', [0.86, 1.12, -1.4], 'stand'),
  st('projects', 21, [-0.2, 1.2, -1.3], 7.0, 0.08, SHIFT, false, 'typing', 0, 'projects', 'code', 'off', MONITOR, 'monitor'),
  st('night', 22, [-0.7, 0.9, -1.3], 18, 0, 0, true, 'wave', 1, 'lock', 'lock', 'off'),
];

/** The hour each role is told at, by the company's name in the experience data. */
export const COMPANY_STATION: Record<string, StationId> = {
  'Seva / Appointally': 'seva',
  'AmbevTech - WMS': 'wms',
  'AmbevTech - BEES': 'bees',
  'AmbevTech - UIKit': 'uikit',
  'NATI - UNIFOR': 'nati',
  FUNCAP: 'funcap',
};

export function stationForCompany(company: string): StationId {
  const id = COMPANY_STATION[company];
  if (!id) throw new Error(`Diorama: no station for "${company}"`);
  return id;
}

/** An isometric camera: fixed elevation, yaw offset, distance. `shift` slides the frame along screen-right. */
export function isoPose(target: V3, dist: number, yaw = 0, shift = 0): { pos: V3; target: V3 } {
  const az = Math.PI * 0.75 + yaw;
  const el = 0.6;
  const t: V3 = [target[0] - Math.cos(az) * shift, target[1], target[2] + Math.sin(az) * shift];
  return {
    target: t,
    pos: [
      t[0] + Math.sin(az) * Math.cos(el) * dist * -1,
      t[1] + Math.sin(el) * dist,
      t[2] - Math.cos(az) * Math.cos(el) * dist,
    ],
  };
}

/* ------------------------------------------------------------ helpers */

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const mixV = (a: V3, b: V3, t: number): V3 => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

function mixHex(a: string, b: string, t: number): string {
  const ca = parseInt(a.slice(1), 16);
  const cb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => Math.round(mix((ca >> shift) & 255, (cb >> shift) & 255, t));
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
}

/* ------------------------------------------------------------ light */

// Daytime is lit like a bright room (spec: surfaces read outside the sun patch). Sun, sky
// (hemi) and fill rise together, so the patch keeps its ratio to the shade and stays the drama.
// Evening is lit like a lived-in room, never a black box (user, 2026-11-02: "quando fica a noite
// ele fica muito escuro"): a blue moon through the window, a cool sky bounce, and the room's own
// warm practicals; the desk lamp stays the brightest pool.
const SUN: [number, Light][] = [
  // 08:00: the sun high enough for the whole window, crossbars and all, to land on the open carpet in front of the rug
  [8, { sun: 5.6, sunColor: '#ffd7a6', sunDir: [1, 0.75, -0.45], sky: '#bdd3ea', lamp: 0, hemi: 2.6, hemiSky: '#c9d4e0', fill: 0.95, moon: 0, practical: 0 }],
  [10.5, { sun: 6.0, sunColor: '#fff0da', sunDir: [1, 0.62, 0.05], sky: '#cde2f4', lamp: 0, hemi: 3.1, hemiSky: '#c9d4e0', fill: 1.1, moon: 0, practical: 0 }],
  [13, { sun: 6.6, sunColor: '#ffffff', sunDir: [0.55, 1, 0.3], sky: '#dbe9f6', lamp: 0, hemi: 3.1, hemiSky: '#cfd8e2', fill: 1.1, moon: 0, practical: 0 }],
  [16, { sun: 5.6, sunColor: '#ffad62', sunDir: [1, 0.3, 0.62], sky: '#f2c99c', lamp: 0.6, hemi: 1.9, hemiSky: '#e0d2c4', fill: 0.75, moon: 0, practical: 0.12 }],
  [19, { sun: 0.35, sunColor: '#ff6f45', sunDir: [1, 0.06, 0.62], sky: '#4a4580', lamp: 5.5, hemi: 1.15, hemiSky: '#a49cc8', fill: 0.42, moon: 0.25, practical: 0.85 }],
  // 22:00: the moon's window lands on the open carpet right of the rug, clear of the chair and of him
  [22, { sun: 0, sunColor: '#ff6f45', sunDir: [1, 1.0, -0.35], sky: '#1b2a55', lamp: 7, hemi: 1.0, hemiSky: '#7d90c8', fill: 0.34, moon: 1.9, practical: 1 }],
];

/** The sun and lamps for an hour of the day, through the window on the right wall. */
export function sunAt(hour: number): Light {
  const h = Math.min(SUN[SUN.length - 1][0], Math.max(SUN[0][0], hour));
  let k = 0;
  while (k < SUN.length - 2 && h > SUN[k + 1][0]) k++;
  const [h0, a] = SUN[k];
  const [h1, b] = SUN[k + 1];
  return mixLight(a, b, (h - h0) / (h1 - h0));
}

/** Two lights blended, every term at once (`t` 0 is `a`, 1 is `b`). */
export function mixLight(a: Light, b: Light, t: number): Light {
  return {
    sun: mix(a.sun, b.sun, t),
    sunColor: mixHex(a.sunColor, b.sunColor, t),
    sunDir: mixV(a.sunDir, b.sunDir, t),
    sky: mixHex(a.sky, b.sky, t),
    lamp: mix(a.lamp, b.lamp, t),
    hemi: mix(a.hemi, b.hemi, t),
    hemiSky: mixHex(a.hemiSky, b.hemiSky, t),
    fill: mix(a.fill, b.fill, t),
    moon: mix(a.moon, b.moon, t),
    practical: mix(a.practical, b.practical, t),
  };
}

/* ------------------------------------------------------------ scroll */

/**
 * Which chapter the scroll is in, how far through it (`u`), and how far the
 * camera has travelled toward the next one (`move`, only in the last `travel` px).
 */
export function locate(scrollY: number, anchors: number[], travel: number): Located {
  if (anchors.length < 2 || scrollY < anchors[0]) return { i: 0, u: 0, move: 0 };
  let i = 0;
  while (i < anchors.length - 2 && anchors[i + 1] <= scrollY) i++;
  const span = anchors[i + 1] - anchors[i];
  const u = span > 0 ? clamp((scrollY - anchors[i]) / span) : 1;
  // A chapter shorter than the travel moves through its whole length, never before it starts
  const run = Math.min(travel, Math.max(0, span));
  const move = run > 0 ? smooth(clamp((scrollY - (anchors[i + 1] - run)) / run)) : scrollY >= anchors[i + 1] ? 1 : 0;
  return { i, u, move };
}

export function sampleDay(loc: Located, stations: Station[] = STATIONS): DaySample {
  const i = Math.min(Math.max(loc.i, 0), stations.length - 2);
  const a = stations[i];
  const b = stations[i + 1];
  const { u, move } = loc;
  const ca = isoPose(a.target, a.dist, a.yaw, a.shift);
  const cb = isoPose(b.target, b.dist, b.yaw, b.shift);
  const next = move >= 0.5;
  return {
    pos: mixV(ca.pos, cb.pos, move),
    target: mixV(ca.target, cb.target, move),
    fov: FOV,
    hour: mix(a.hour, b.hour, u),
    light: sunAt(mix(a.hour, b.hour, smooth(u))),
    poseFrom: a.pose,
    poseTo: b.pose,
    poseMix: move,
    turn: mix(a.turn, b.turn, move),
    screens: next ? b.screens : a.screens,
    active: next ? b.id : a.id,
    fit: mix(a.wide ? 1 : 0, b.wide ? 1 : 0, move),
  };
}

/** "HH:MM" to the nearest minute, on a 24-hour dial (24:00 reads 00:00). */
export function clockText(hour: number): string {
  const total = ((Math.round(hour * 60) % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
