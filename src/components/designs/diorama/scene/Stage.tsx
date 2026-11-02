/**
 * The fixed stage: one canvas for the whole home page. A driver reads the
 * Diorama chapters on the page ([data-diorama-chapter]), turns the scroll into
 * a day sample (day.ts), glides the camera between stations, writes the hour
 * on the page's clock, tints the page ground with the sky and places the day's
 * navigation links: on the wide shots (08:00, 22:00) they line up as the day's
 * agenda under the room; as the camera closes in they travel to their objects,
 * and only the hour on screen and the next one stay in sight (one pin per object).
 * Nothing the stage places covers text or the clock: a label that would touch a
 * card, the hero copy or the clock hides, and the agenda slides clear of them.
 * The clock never moves aside: the cards are cut at its line instead (diorama.css,
 * or here where the browser has no scroll-driven animations).
 * Loaded lazily by DioramaHero, only while Diorama is the active world.
 */
import { useEffect, useMemo, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Locale } from '@i18n/utils';
import { STATIONS, clockText, locate, sampleDay, type DaySample, type Located, type Station, type StationId, type V3 } from '../day';
import Room from './Room';
import AmbientOcclusion from './AmbientOcclusion';
import { eachLabel } from './labels';

interface Props {
  lite: boolean;
  still: boolean;
  onReady: () => void;
  clock: RefObject<HTMLElement | null>;
  locale: Locale;
}

const HEADER = 64;
/** Phones: the stage is a band under the header (diorama.css) and the room centres in it. */
const BAND = '(max-width: 767px)';
/** From here the hero copy stands in a left column and the room fits the space to its right. */
const COLUMN = '(min-width: 1024px)';
/** The camera travels to the next station over the last 60% of a viewport of scroll. */
const TRAVEL = 0.6;
const DAMP = 4.5;
/** The page ground is the hour's sky, dimmed: a value step below the room's walls, above its graphite shell. */
const GROUND = 0.055;
/** After dusk the dimmed sky would sink to black: the ground holds at a night blue, so the box still reads against it. */
const NIGHT_GROUND = new THREE.Color('#171c2d');
const REST: Located = { i: 0, u: 0, move: 0 };
const smooth = (x: number) => x * x * (3 - 2 * x);
/** Room between two labels that would touch, in pixels. */
const LABEL_GAP = 4;
/** Room between two labels in the agenda, in pixels. */
const AGENDA_GAP = 6;
/** Room kept between a label (or the agenda) and a card or the hero copy, in pixels. */
const GUARD = 6;
/** Room kept between a label and the clock: the clock reads alone in its corner. */
const CLOCK_GUARD = 16;
/** Closer than this (1 = the wide shot), the day's labels leave the agenda: only the hour on screen and the next one show. */
const CLOSE_FIT = 0.5;
/** Cards scroll under the clock's line by a scroll-driven clip (diorama.css); without one, the stage cuts them each frame. */
const CSS_CUT = typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()');

/** The room's silhouette from the camera's side: the plinth's corners, the floor's front edge, the walls' top edges. */
const OUTLINE: V3[] = [
  [-2.16, -0.4, -1.82],
  [2.28, -0.4, -1.82],
  [2.28, -0.4, 1.7],
  [-2.16, -0.4, 1.7],
  [-2.06, 0, 1.6],
  [2.18, 0, 1.6],
  [-2.07, 2.63, -1.72],
  [2.13, 2.63, -1.72],
  [2.13, 2.63, 1.61],
];

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface Slot {
  x: number;
  y: number;
}

/** A card or the hero copy, in page coordinates; `cut` when it scrolls under the clock's line. */
interface Text extends Box {
  el: HTMLElement;
  cut: boolean;
}

/** Room kept between the room's silhouette and the clock's plate on the wide shots, in pixels. */
const PLATE_GAP = 14;

/** The convex hull of a few points (monotone chain), counter-clockwise. */
function hull(points: Slot[]): Slot[] {
  const p = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o: Slot, a: Slot, b: Slot) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: Slot[] = [];
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
    lower.push(q);
  }
  const upper: Slot[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p[i]) <= 0) upper.pop();
    upper.push(p[i]);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

/** A convex polygon and a box overlap (separating axes: the box's two, then each edge's normal). */
function polygonMeets(poly: Slot[], box: Box): boolean {
  const xs = poly.map((q) => q.x);
  const ys = poly.map((q) => q.y);
  if (Math.max(...xs) < box.x0 || Math.min(...xs) > box.x1 || Math.max(...ys) < box.y0 || Math.min(...ys) > box.y1) return false;
  const corners = [
    { x: box.x0, y: box.y0 },
    { x: box.x1, y: box.y0 },
    { x: box.x1, y: box.y1 },
    { x: box.x0, y: box.y1 },
  ];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const nx = b.y - a.y;
    const ny = a.x - b.x;
    const project = (q: Slot) => q.x * nx + q.y * ny;
    const pp = poly.map(project);
    const bp = corners.map(project);
    if (Math.max(...pp) < Math.min(...bp) || Math.max(...bp) < Math.min(...pp)) return false;
  }
  return true;
}

/** Two boxes overlap, or come within `pad` pixels of each other. */
const meets = (a: Box, b: Box, pad = 0) => a.x0 < b.x1 + pad && b.x0 < a.x1 + pad && a.y0 < b.y1 + pad && b.y0 < a.y1 + pad;

/**
 * How far the agenda's block must slide up or down to clear every obstacle (the
 * cards and the hero copy on screen) while staying inside [lo, hi]: 0 when it is
 * already clear, the nearest slide that clears them all otherwise, or null when
 * none does (each label then hides on its own).
 */
function clearance(block: Box, obstacles: Box[], lo: number, hi: number): number | null {
  if (!obstacles.some((o) => meets(block, o, GUARD))) return 0;
  const fits = (d: number) =>
    block.y0 + d >= lo &&
    block.y1 + d <= hi &&
    !obstacles.some((o) => meets({ x0: block.x0, x1: block.x1, y0: block.y0 + d, y1: block.y1 + d }, o, GUARD));
  let best: number | null = null;
  for (const o of obstacles) {
    // Just above or just below each obstacle
    for (const d of [o.y0 - GUARD - 1 - block.y1, o.y1 + GUARD + 1 - block.y0]) {
      if ((best === null || Math.abs(d) < Math.abs(best)) && fits(d)) best = d;
    }
  }
  return best;
}

/**
 * The day as an agenda: the labels in hour order, packed into rows that rest on
 * `bottom`, right-aligned (centred on tablets). Slots are top-left corners.
 */
function agenda(sizes: { w: number; h: number }[], x0: number, x1: number, bottom: number, align: 'end' | 'center') {
  const rows: number[][] = [];
  let row: number[] = [];
  let width = 0;
  sizes.forEach((size, i) => {
    const add = (row.length ? AGENDA_GAP : 0) + size.w;
    if (row.length && width + add > x1 - x0) {
      rows.push(row);
      row = [];
      width = 0;
    }
    width += (row.length ? AGENDA_GAP : 0) + size.w;
    row.push(i);
  });
  if (row.length) rows.push(row);
  const rowH = sizes.reduce((m, size) => Math.max(m, size.h), 0);
  const top = bottom - rows.length * rowH - Math.max(0, rows.length - 1) * AGENDA_GAP;
  const slots: Slot[] = sizes.map(() => ({ x: x0, y: top }));
  rows.forEach((r, k) => {
    const rw = r.reduce((sum, i) => sum + sizes[i].w, 0) + (r.length - 1) * AGENDA_GAP;
    let x = align === 'end' ? x1 - rw : x0 + (x1 - x0 - rw) / 2;
    const y = top + k * (rowH + AGENDA_GAP);
    for (const i of r) {
      slots[i] = { x, y };
      x += sizes[i].w + AGENDA_GAP;
    }
  });
  return { slots, top };
}

/**
 * Where the whole room sits on a wide shot, and where the agenda lines up, in
 * canvas pixels. Desktop: right of the copy column, the agenda along the bottom.
 * Tablets: the room above the copy, the agenda under the room. Phones: the room
 * fills the band and the labels stay on their objects (no agenda).
 */
function stageLayout(w: number, h: number, band: boolean, column: boolean, copyRight: number, sizes: { w: number; h: number }[]) {
  if (band) return { room: { x0: 10, y0: 10, x1: w - 10, y1: h - 10 } as Box, slots: null };
  const x0 = column ? Math.max(w * 0.4, copyRight + 40) : 24;
  const x1 = column ? w - 32 : w - 24;
  const bottom = column ? h - 24 : h * 0.56;
  const { slots, top } = agenda(sizes, x0, x1, bottom, column ? 'end' : 'center');
  return { room: { x0, y0: HEADER + (column ? 24 : 16), x1, y1: top - 16 } as Box, slots };
}

interface Layout {
  /** False until the chapters have been read: no frame samples the day before that. */
  measured: boolean;
  anchors: number[];
  stations: Station[];
  band: boolean;
  column: boolean;
  copyRight: number;
  /** The text the stage must not cover: every card and the hero copy, in page coordinates (y + scrollY). */
  obstacles: Text[];
  /** The clock's box on screen (it is fixed). */
  clock: Box | null;
  /** The clock's plate in the canvas's own pixels (the phone band starts under the header). */
  plate: Box | null;
  /** Where the cards are cut, under the clock (0 on phones: the band sits above them). */
  line: number;
}

function Driver({
  sample,
  still,
  clock,
  onReady,
}: {
  sample: MutableRefObject<DaySample>;
  still: boolean;
  clock: RefObject<HTMLElement | null>;
  onReady: () => void;
}) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);

  const layout = useRef<Layout>({
    measured: false,
    anchors: [0],
    stations: [STATIONS[0]],
    band: false,
    column: true,
    copyRight: 0,
    obstacles: [],
    clock: null,
    plate: null,
    line: 0,
  });
  const cur = useRef({
    pos: new THREE.Vector3(),
    target: new THREE.Vector3(),
    fov: 18,
    dx: 0,
    dy: 0,
    fit: 1,
    init: false,
  });
  const written = useRef({ clock: '', active: '', ground: '', compact: false, frames: 0 });
  const ready = useRef(onReady);
  ready.current = onReady;
  const work = useMemo(
    () => ({
      ground: new THREE.Color(),
      pos: new THREE.Vector3(),
      target: new THREE.Vector3(),
      p: new THREE.Vector3(),
      probe: new THREE.PerspectiveCamera(),
      outline: OUTLINE.map((v) => new THREE.Vector3(...v)),
      labels: STATIONS.filter((s) => s.label).map((s) => [s.id, new THREE.Vector3(...(s.label as V3))] as const),
      cuts: new Map<HTMLElement, number>(),
    }),
    [],
  );

  useEffect(() => {
    scene.background = work.ground;
    const html = document.documentElement;
    const stage = gl.domElement.closest<HTMLElement>('.dio-stage');
    const band = window.matchMedia(BAND);
    const column = window.matchMedia(COLUMN);
    // Re-read whenever the page's layout changes. A card opening its details grows around its centre inside
    // a screen-tall chapter without changing the page's height, so each card (and the copy) is watched too.
    const resize = new ResizeObserver(() => measure());
    const watched = new Set<Element>();

    // A chapter is reached when its top meets the stage's top edge: the header on desktop, the band's
    // bottom on phones, or where scroll-padding-top lands a scrolled-to chapter if that is lower, so a
    // deep link or a day-nav link arrives on the chapter's own hour (20:00, not 19:59)
    const measure = () => {
      const edge = Math.max(
        band.matches && stage ? stage.getBoundingClientRect().bottom : HEADER,
        parseFloat(getComputedStyle(html).scrollPaddingTop) || 0,
      );
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const stations: Station[] = [];
      const anchors: number[] = [];
      for (const el of document.querySelectorAll<HTMLElement>('[data-diorama-chapter]')) {
        if (el.getClientRects().length === 0) continue;
        const station = STATIONS.find((s) => s.id === el.dataset.dioramaChapter);
        if (!station) continue;
        // A chapter too near the end to reach the band is reached when the page bottoms out
        const at = Math.min(el.getBoundingClientRect().top + window.scrollY - edge, maxScroll);
        stations.push(station);
        // The first chapter (the hero) stands at its station at scrollY 0, wherever the band puts its top
        anchors.push(anchors.length ? Math.max(at, anchors[anchors.length - 1]) : 0);
      }
      const copy = document.querySelector<HTMLElement>('.dio-hero__copy');
      // Cards and copy scroll with the page: cached in page coordinates, each frame only subtracts scrollY.
      // Off phones every card is cut at the clock's line, and the copy too where it shares the clock's side (tablets).
      const obstacles: Text[] = [];
      const texts = new Set<Element>();
      for (const el of document.querySelectorAll<HTMLElement>('.dio-card, .dio-hero__copy, .dio-footer')) {
        if (el.getClientRects().length === 0) continue;
        const r = el.getBoundingClientRect();
        const cut = !band.matches && (el.classList.contains('dio-card') || (el === copy && !column.matches));
        obstacles.push({ el, cut, x0: r.left, x1: r.right, y0: r.top + window.scrollY, y1: r.bottom + window.scrollY });
        texts.add(el);
      }
      // Keep watching exactly the boxes in use: cards that mount later (an island hydrating) join, gone ones leave.
      // Only new ones are observed, since observing a watched box again would report it again.
      for (const el of texts) if (!watched.has(el)) resize.observe(el);
      for (const el of watched) if (!texts.has(el)) resize.unobserve(el);
      watched.clear();
      texts.forEach((el) => watched.add(el));
      const c = clock.current?.getBoundingClientRect();
      layout.current = {
        measured: true,
        anchors: anchors.length ? anchors : [0],
        stations: stations.length ? stations : [STATIONS[0]],
        band: band.matches,
        column: column.matches,
        copyRight: copy ? copy.getBoundingClientRect().right : 0,
        obstacles,
        clock: c && c.width > 0 ? { x0: c.left, x1: c.right, y0: c.top, y1: c.bottom } : null,
        // The plate reaches 0.2em past the digits' sides and 0.12em past their top and bottom (diorama.css)
        plate:
          c && c.width > 0
            ? (() => {
                const top = stage ? stage.getBoundingClientRect().top : 0;
                return { x0: c.left - c.height * 0.2, x1: c.right + c.height * 0.2, y0: c.top - top - c.height * 0.12, y1: c.bottom - top + c.height * 0.12 };
              })()
            : null,
        line: band.matches ? 0 : parseFloat(getComputedStyle(html).getPropertyValue('--dio-line')) || 0,
      };
    };
    measure();
    const main = document.querySelector('main');
    if (main) resize.observe(main);
    if (clock.current) resize.observe(clock.current);
    // Content mounted or swapped in the page (not the stage's own writes: the clock, the day's links)
    const mounts = new MutationObserver((list) => {
      const outside = list.some((m) => {
        const el = m.target instanceof Element ? m.target : m.target.parentElement;
        return !el?.closest('.dio-clock, .dio-day, .dio-stage');
      });
      if (outside) measure();
    });
    if (main) mounts.observe(main, { childList: true, subtree: true });
    let alive = true;
    document.fonts?.ready.then(() => alive && measure());
    window.addEventListener('resize', measure);
    band.addEventListener('change', measure);
    column.addEventListener('change', measure);

    return () => {
      alive = false;
      resize.disconnect();
      mounts.disconnect();
      window.removeEventListener('resize', measure);
      band.removeEventListener('change', measure);
      column.removeEventListener('change', measure);
      // Without the live room the 08:00 still stands in, so the page returns to that hour
      delete html.dataset.dioActive;
      html.style.removeProperty('--dio-ground');
      if (clock.current) clock.current.textContent = '08:00';
      work.cuts.forEach((_, el) => el.style.removeProperty('clip-path'));
      work.cuts.clear();
      document.querySelector('.dio-day')?.removeAttribute('data-compact');
      eachLabel((_, el) => {
        el.removeAttribute('aria-current');
        el.removeAttribute('data-out');
        el.style.removeProperty('transform');
      });
    };
  }, [gl, scene, work, clock]);

  useFrame((_, dt) => {
    // The first sampled frame snaps the camera: it must already know where the chapters are, or a
    // deep link (/#skills) would start at 08:00 and glide through the day
    if (!layout.current.measured) return;
    const { anchors, stations, band, column, copyRight, line } = layout.current;
    const html = document.documentElement;
    const w = size.width;
    const h = size.height;

    // The text on screen this frame (desktop and tablets; on phones the band sits above the cards).
    // What scrolls under the clock's line shows only below it.
    const obstacles: Box[] = [];
    if (!band) {
      for (const o of layout.current.obstacles) {
        const top = o.y0 - window.scrollY;
        const y0 = o.cut ? Math.max(top, line) : top;
        const y1 = o.y1 - window.scrollY;
        if (y1 > y0 && y1 > 0 && y0 < h) obstacles.push({ x0: o.x0, x1: o.x1, y0, y1 });
        // No scroll-driven clip in this browser: cut the card here
        if (!CSS_CUT && o.cut) {
          const cut = Math.round(Math.min(o.y1 - o.y0, Math.max(0, line - top)));
          if (cut !== (work.cuts.get(o.el) ?? 0)) {
            o.el.style.clipPath = cut > 0 ? `inset(${cut}px 0 0 0)` : '';
            work.cuts.set(o.el, cut);
          }
        }
      }
    }
    // The clock's corner is kept clear of labels, with more room than a card (phones show one label, in the band)
    const face = band ? null : layout.current.clock;
    const corner: Box | null = face && { x0: face.x0 - CLOCK_GUARD, x1: face.x1 + CLOCK_GUARD, y0: face.y0 - CLOCK_GUARD, y1: face.y1 + CLOCK_GUARD };

    // Label sizes first, before this frame writes anything that dirties layout. Hour order, for the agenda.
    const byId = new Map<StationId, HTMLElement>();
    eachLabel((id, el) => byId.set(id, el));
    const boxes: { id: StationId; el: HTMLElement; at: THREE.Vector3; w: number; h: number }[] = [];
    for (const [id, at] of work.labels) {
      const el = byId.get(id);
      if (el && el.offsetWidth > 0) boxes.push({ id, el, at, w: el.offsetWidth, h: el.offsetHeight });
    }
    const stage = stageLayout(w, h, band, column, copyRight, boxes);

    // The day at this scroll position (one chapter alone holds its station)
    const loc = anchors.length < 2 ? REST : locate(window.scrollY, anchors, TRAVEL * window.innerHeight);
    const s = sampleDay(loc, stations.length < 2 ? [stations[0], stations[0]] : stations);
    sample.current = s;

    // Wide shots fit the whole room into its box beside the copy (or the phone band): pull back, then slide the frame
    work.target.set(...s.target);
    work.pos.set(...s.pos);
    let k = 1;
    let dx = 0;
    let dy = 0;
    if (s.fit > 0.001) {
      const probe = work.probe;
      probe.fov = s.fov;
      probe.aspect = w / h;
      probe.position.copy(work.pos);
      probe.lookAt(work.target);
      probe.updateMatrixWorld();
      probe.updateProjectionMatrix();
      let x0 = Infinity,
        y0 = Infinity,
        x1 = -Infinity,
        y1 = -Infinity;
      const points: Slot[] = [];
      for (const v of work.outline) {
        work.p.copy(v).project(probe);
        const px = ((work.p.x + 1) / 2) * w;
        const py = ((1 - work.p.y) / 2) * h;
        points.push({ x: px, y: py });
        x0 = Math.min(x0, px);
        x1 = Math.max(x1, px);
        y0 = Math.min(y0, py);
        y1 = Math.max(y1, py);
      }
      // Fit the silhouette into a box: pulling back scales it about the frame's centre, then the frame
      // slides. `align` places it across the box's spare width: 1 centred, 0 against the box's left edge.
      const fitInto = (box: Box, align = 1) => {
        const scale = Math.min((box.x1 - box.x0) / (x1 - x0), (box.y1 - box.y0) / (y1 - y0));
        const pull = 1 / Math.max(0.2, scale);
        const cx = w / 2 + ((x0 + x1) / 2 - w / 2) / pull;
        const cy = h / 2 + ((y0 + y1) / 2 - h / 2) / pull;
        const roomW = (x1 - x0) / pull;
        const spare = Math.max(0, box.x1 - box.x0 - roomW);
        return { pull, dx: box.x0 + roomW / 2 + (spare / 2) * align - cx, dy: (box.y0 + box.y1) / 2 - cy };
      };
      // The room keeps clear of the clock's plate. First it slides left into any spare width, then its box
      // gives up height from the top, until the silhouette (not its bounding box: the room is a hexagon,
      // its top corners empty) misses the plate.
      let box = stage.room;
      let align = 1;
      const plate = layout.current.plate;
      if (plate) {
        const guard: Box = { x0: plate.x0 - PLATE_GAP, x1: plate.x1 + PLATE_GAP, y0: plate.y0 - PLATE_GAP, y1: plate.y1 + PLATE_GAP };
        const outline = hull(points);
        const ALIGNS = [1, 0.8, 0.6, 0.4, 0.2, 0];
        /** The most centred placement that misses the plate at this top, or null. */
        const clearAt = (top: number) =>
          ALIGNS.find((a) => {
            const f = fitInto({ ...box, y0: top }, a);
            const placed = outline.map((q) => ({ x: w / 2 + (q.x - w / 2) / f.pull + f.dx, y: h / 2 + (q.y - h / 2) / f.pull + f.dy }));
            return !polygonMeets(placed, guard);
          }) ?? null;
        let found = clearAt(box.y0);
        if (found === null) {
          // Never shrink the room by more than a third for the clock's sake
          let lo = box.y0;
          let hi = box.y0 + (box.y1 - box.y0) / 3;
          if (clearAt(hi) !== null) {
            for (let i = 0; i < 12; i++) {
              const mid = (lo + hi) / 2;
              if (clearAt(mid) === null) lo = mid;
              else hi = mid;
            }
          }
          box = { ...box, y0: hi };
          found = clearAt(hi) ?? 0;
        }
        align = found;
      }
      const f = fitInto(box, align);
      k = 1 + (f.pull - 1) * s.fit;
      dx = f.dx * s.fit;
      dy = f.dy * s.fit;
    }
    work.pos.sub(work.target).multiplyScalar(k).add(work.target);

    // Glide (reduced motion cuts)
    const c = cur.current;
    const a = still || !c.init ? 1 : 1 - Math.exp(-Math.min(dt, 0.1) * DAMP);
    c.init = true;
    c.pos.lerp(work.pos, a);
    c.target.lerp(work.target, a);
    c.fov += (s.fov - c.fov) * a;
    c.dx += (dx - c.dx) * a;
    c.dy += (dy - c.dy) * a;
    c.fit += (s.fit - c.fit) * a;
    camera.position.copy(c.pos);
    camera.lookAt(c.target);
    camera.fov = c.fov;
    camera.setViewOffset(w, h, -c.dx, -c.dy, w, h);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    // The page around the stage: ground, clock, the active chapter
    work.ground.set(s.light.sky).multiplyScalar(GROUND);
    work.ground.setRGB(Math.max(work.ground.r, NIGHT_GROUND.r), Math.max(work.ground.g, NIGHT_GROUND.g), Math.max(work.ground.b, NIGHT_GROUND.b));
    const ground = `#${work.ground.getHexString()}`;
    const wr = written.current;
    if (ground !== wr.ground) {
      html.style.setProperty('--dio-ground', ground);
      wr.ground = ground;
    }
    const time = clockText(s.hour);
    if (time !== wr.clock && clock.current) {
      clock.current.textContent = time;
      wr.clock = time;
    }
    // Close in, only the active hour keeps its full pill: the next one is an hour-only pin (the names stay in the links)
    const compact = !band && c.fit < 0.05;
    if (compact !== wr.compact) {
      document.querySelector('.dio-day')?.toggleAttribute('data-compact', compact);
      wr.compact = compact;
    }
    if (s.active !== wr.active) {
      html.dataset.dioActive = s.active;
      eachLabel((id, el) => {
        if (id === s.active) el.setAttribute('aria-current', 'true');
        else el.removeAttribute('aria-current');
      });
      wr.active = s.active;
    }

    // Close in, only the hour on screen and the next one stay in sight, one pin per object: the next hour
    // on the object the camera is on shows when its turn comes. The agenda shows the whole day.
    let keep: Set<StationId> | null = null;
    if (!band && c.fit < CLOSE_FIT) {
      keep = new Set();
      const k = stations.findIndex((st) => st.id === s.active);
      const here = stations[k];
      const next = stations[k + 1];
      if (here?.label) keep.add(here.id);
      if (next?.label && (!here?.label || next.on !== here.on)) keep.add(next.id);
    }

    // Each link over its object; on the wide shots they leave the room for their agenda slots, travelling
    // with the camera. Labels that collide on the way spread apart, so each one reads in every frame.
    const g = stage.slots ? smooth(Math.min(1, Math.max(0, c.fit))) : 0;
    // The agenda slides, as one block, clear of the cards, the copy and the clock (a card rising from below pushes it up)
    const blockers = corner ? [...obstacles, corner] : obstacles;
    let slots = stage.slots;
    if (slots && g > 0 && blockers.length) {
      const block: Box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
      slots.forEach((slot, i) => {
        block.x0 = Math.min(block.x0, slot.x);
        block.y0 = Math.min(block.y0, slot.y);
        block.x1 = Math.max(block.x1, slot.x + boxes[i].w);
        block.y1 = Math.max(block.y1, slot.y + boxes[i].h);
      });
      const shift = clearance(block, blockers, HEADER + 8, h - 8);
      if (shift) slots = slots.map((slot) => ({ x: slot.x, y: slot.y + shift }));
    }
    const pins = boxes.map((b, i) => {
      work.p.copy(b.at).project(camera);
      let x = ((work.p.x + 1) / 2) * w;
      let y = ((1 - work.p.y) / 2) * h;
      const out = ((work.p.z > 1 || x < 0 || x > w || y < 0 || y > h) && g < 0.5) || (keep !== null && !keep.has(b.id));
      const slot = slots?.[i];
      if (slot && g > 0) {
        x += (slot.x + b.w / 2 - x) * g;
        y += (slot.y + b.h / 2 - y) * g;
      }
      return { ...b, x, y, out };
    });
    // On phones only the hour on screen shows, so there is nothing to spread
    const shown = band ? [] : pins.filter((pin) => !pin.out);
    for (let pass = 0, moved = true; moved && pass < 16; pass++) {
      moved = false;
      for (let i = 0; i < shown.length; i++) {
        for (let j = i + 1; j < shown.length; j++) {
          const p = shown[i];
          const q = shown[j];
          if (Math.abs(p.x - q.x) >= (p.w + q.w) / 2 + LABEL_GAP) continue;
          const need = (p.h + q.h) / 2 + LABEL_GAP;
          const d = q.y - p.y;
          if (Math.abs(d) >= need) continue;
          const push = (need - Math.abs(d)) / 2;
          const dir = d >= 0 ? 1 : -1;
          p.y -= push * dir;
          q.y += push * dir;
          moved = true;
        }
      }
    }
    // A link reached by keyboard while off its object still shows: clamped inside the stage, below the header
    const top = band ? 8 : HEADER + 8;
    for (const pin of pins) {
      let x = Math.min(Math.max(pin.x, pin.w / 2 + 8), w - pin.w / 2 - 8);
      const y = Math.min(Math.max(pin.y, top + pin.h / 2), h - pin.h / 2 - 8);
      let out = pin.out;
      // A label over a card, the copy or the clock hides (it stays in the list). One the visitor is on stays:
      // hovered, it keeps the pill it opened; focused, it steps beside the card so it can be seen.
      const at: Box = { x0: x - pin.w / 2, x1: x + pin.w / 2, y0: y - pin.h / 2, y1: y + pin.h / 2 };
      const hit = obstacles.find((o) => meets(at, o, GUARD)) ?? (corner && meets(at, corner) ? corner : undefined);
      if (hit) {
        if (pin.el === document.activeElement) {
          const left = hit.x0 - GUARD - pin.w / 2;
          const right = hit.x1 + GUARD + pin.w / 2;
          x = left - pin.w / 2 >= 8 ? left : right + pin.w / 2 <= w - 8 ? right : x;
        } else if (out || !pin.el.matches(':hover')) {
          out = true;
        }
      }
      pin.el.style.transform = `translate(${(x - pin.w / 2).toFixed(1)}px, ${(y - pin.h / 2).toFixed(1)}px)`;
      pin.el.toggleAttribute('data-out', out);
    }

    if (++wr.frames === 2) ready.current();
  });

  return null;
}

export default function Stage({ lite, still, onReady, clock, locale }: Props) {
  const sample = useRef<DaySample>(sampleDay(REST));
  const [frameloop, setFrameloop] = useState<'always' | 'never'>('always');

  // A hidden tab stops drawing
  useEffect(() => {
    const onVisibility = () => setFrameloop(document.hidden ? 'never' : 'always');
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return (
    <Canvas
      shadows={{ type: THREE.PCFShadowMap }}
      dpr={lite ? [1, 1.5] : [1, 1.75]}
      // Antialiased everywhere: on phones the stair-stepped edges of the walls and the plinth read as unfinished, and MSAA is cheap on their tiled GPUs
      gl={{ antialias: true }}
      camera={{ fov: 18, near: 0.1, far: 80 }}
      frameloop={frameloop}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Driver sample={sample} still={still} clock={clock} onReady={onReady} />
      <Room sample={sample} locale={locale} lite={lite} still={still} />
      {/* Phones keep the plain render: the occlusion pass draws the room a second time */}
      {!lite && <AmbientOcclusion />}
    </Canvas>
  );
}
