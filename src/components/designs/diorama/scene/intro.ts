/**
 * The arrival: the first minute of the day, played once on a first visit
 * (SiteIntro arms it, the stage plays it, useArrival.ts runs its clock).
 * At 07:59, before the sun, the model is built on its base: a cut climbs from
 * the floor past the walls' tops, and only what is below it is drawn, the
 * room's own lights already on against the blue window. Whole, the hour
 * turns: the monitor unlocks, he settles to type, and the 08:00 sun comes in
 * low through the window and climbs to its place. Then the day's page is laid
 * beside the room. Pure: no three, no DOM.
 */
import { mixLight, mixV, sunAt, type DaySample, type Light, type Pose, type ScreenId } from '../day';

export interface IntroFrame {
  hour?: number;
  light?: Light;
  screens?: Partial<Record<'main' | 'upper' | 'tablet', ScreenId>>;
  pose?: { from: Pose; to: Pose; mix: number };
  /** Only what is below this height is drawn (the model being built), in room units; null when whole. */
  clip?: number | null;
}

/** When the hour turns, when the day's page comes in, and when the script hands the room back to the day (seconds). */
export const ARRIVAL = { turn: 1.45, page: 2.45, end: 2.95 };

/** The build: the cut climbs from just above the plinth (the butcher-block band shows) past the walls' tops. */
const BUILD = { from: 0.15, to: 1.35, base: -0.155, top: 2.72 };
const BEFORE = 7 + 59 / 60;
const MORNING = sunAt(8);
/** 07:59: no sun yet, blue light at the window, the room's strip and string lights on. */
const DAWN: Light = {
  sun: 0, sunColor: '#ff8a4c', sunDir: [1, 0.16, -0.95], sky: '#27335f', lamp: 0,
  hemi: 1.0, hemiSky: '#7d90c8', fill: 0.34, moon: 1.3, practical: 0.6,
};

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** The arrival at `t` seconds since the curtain went, or null once it is over. */
export function arrival(t: number): IntroFrame | null {
  if (t >= ARRIVAL.end) return null;
  const { turn } = ARRIVAL;
  const build = clamp((t - BUILD.from) / (BUILD.to - BUILD.from));
  const light = mixLight(DAWN, MORNING, smooth(clamp((t - turn) / 1.15)));
  // The sun's height runs ahead of its strength: its patch comes in long and low, then settles where 08:00 has it
  light.sunDir = mixV(DAWN.sunDir, MORNING.sunDir, easeOut(clamp((t - turn) / 1.3)));
  light.moon = DAWN.moon * (1 - smooth(clamp((t - turn) / 0.7)));
  return {
    hour: t < turn ? BEFORE : 8,
    light,
    screens: { main: t < turn ? 'lock' : 'wall', upper: 'off', tablet: 'off' },
    pose: { from: 'think', to: 'typing', mix: smooth(clamp((t - turn - 0.1) / 0.55)) },
    clip: build < 1 ? BUILD.base + (BUILD.top - BUILD.base) * easeInOut(build) : null,
  };
}

/** Lays a frame's hour, light, screens and pose over the day's sample. */
export function applyIntro(s: DaySample, f: IntroFrame): void {
  if (f.hour !== undefined) s.hour = f.hour;
  if (f.light) s.light = f.light;
  if (f.screens) s.screens = { ...s.screens, ...f.screens };
  if (f.pose) {
    s.poseFrom = f.pose.from;
    s.poseTo = f.pose.to;
    s.poseMix = f.pose.mix;
  }
}
