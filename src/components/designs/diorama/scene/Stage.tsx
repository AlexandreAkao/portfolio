/**
 * The fixed stage: one canvas for the whole home page. A driver reads the
 * Diorama chapters on the page ([data-diorama-chapter]), turns the scroll into
 * a day sample (day.ts), glides the camera between stations, writes the hour
 * on the page's clock and tints the page ground with the sky.
 * Wide screens: the stage is a fixed panel on the left, beside the day's page;
 * close shots centre their object in it, the wide shots (08:00, 22:00) fit the
 * whole room clear of the clock, and the day's links stay in the page as its
 * index. Phones and tablets: the stage is a band under the header, and the day's
 * links are labels pinned over their objects (only the hour on screen shows).
 * On a first visit the arrival plays before the day takes over (intro.ts,
 * useArrival.ts): the model is built at 07:59, then the hour turns.
 * Loaded lazily by DioramaHero, only while Diorama is the active world.
 */
import { useEffect, useMemo, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Locale } from '@i18n/utils';
import { STATIONS, clockText, locate, sampleDay, type DaySample, type Located, type Station, type V3 } from '../day';
import Room from './Room';
import AmbientOcclusion from './AmbientOcclusion';
import { eachLabel } from './labels';
import { applyIntro } from './intro';
import { useArrival } from './useArrival';

/** The arrival's build: only what is below the cut is drawn, and a line of lamp light runs round the model at the cut. */
const CUT = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
const CUT_PLANES = [CUT];
const NO_PLANES: THREE.Plane[] = [];
function cutLine(): THREE.Group {
  const g = new THREE.Group();
  const m = new THREE.MeshBasicMaterial({ color: '#f2a65a', toneMapped: false });
  // Round the plinth's footprint, a hair outside it
  const [x0, x1, z0, z1, w] = [-2.18, 2.3, -1.84, 1.72, 0.014];
  const bar = (sx: number, sz: number, x: number, z: number) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.004, sz), m);
    b.position.set(x, 0, z);
    g.add(b);
  };
  bar(x1 - x0, w, (x0 + x1) / 2, z0);
  bar(x1 - x0, w, (x0 + x1) / 2, z1);
  bar(w, z1 - z0, x0, (z0 + z1) / 2);
  bar(w, z1 - z0, x1, (z0 + z1) / 2);
  g.visible = false;
  return g;
}

interface Props {
  lite: boolean;
  still: boolean;
  onReady: () => void;
  clock: RefObject<HTMLElement | null>;
  locale: Locale;
}

const HEADER = 64;
/** Phones and tablets: the stage is a band under the header (diorama.css) and the room centres in it. */
const BAND = '(max-width: 1023px)';
/** The camera travels to the next station over the last 60% of a viewport of scroll. */
const TRAVEL = 0.6;
const DAMP = 4.5;
/** The page ground is the hour's sky, dimmed: a value step below the room's walls, above its graphite shell. */
const GROUND = 0.055;
/** After dusk the dimmed sky would sink to black: the ground holds at a night blue, so the box still reads against it. */
const NIGHT_GROUND = new THREE.Color('#171c2d');
const REST: Located = { i: 0, u: 0, move: 0 };
/** Room kept around the whole room on the wide shots: the panel's, the band's. */
const PANEL_MARGIN = 28;
const BAND_MARGIN = 10;

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

interface Layout {
  /** False until the chapters have been read: no frame samples the day before that. */
  measured: boolean;
  anchors: number[];
  stations: Station[];
  /** Phones and tablets: the room is a band, and the day's links are pinned over their objects. */
  band: boolean;
  /** The clock's plate in the canvas's own pixels. */
  plate: Box | null;
  /** How much of the canvas the fixed header covers from the top, in its pixels (the stage starts under it). */
  top: number;
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
    plate: null,
    top: 0,
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
  const written = useRef({ clock: '', active: '', ground: '', pinned: false, frames: 0 });
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
      cut: cutLine(),
    }),
    [],
  );
  const arrivalFrame = useArrival(still);

  useEffect(() => {
    scene.add(work.cut);
    return () => {
      scene.remove(work.cut);
      work.cut.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (o.material as THREE.Material).dispose();
        }
      });
      gl.clippingPlanes = NO_PLANES;
    };
  }, [scene, gl, work]);

  useEffect(() => {
    scene.background = work.ground;
    const html = document.documentElement;
    const stage = gl.domElement.closest<HTMLElement>('.dio-stage');
    const band = window.matchMedia(BAND);
    // Re-read whenever the page's layout changes (a role opening its details grows the page)
    const resize = new ResizeObserver(() => measure());

    // A chapter is reached when its top meets the top of the page: the header on wide screens, the band's
    // bottom on phones, or where scroll-padding-top lands a scrolled-to chapter if that is lower, so a
    // deep link or a link of the day's index arrives on the chapter's own hour (20:00, not 19:59)
    const measure = () => {
      const edge = Math.max(
        band.matches && stage ? stage.getBoundingClientRect().bottom : HEADER,
        parseFloat(getComputedStyle(html).scrollPaddingTop) || 0,
      );
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      let stations: Station[] = [];
      const anchors: number[] = [];
      for (const el of document.querySelectorAll<HTMLElement>('[data-diorama-chapter]')) {
        if (el.getClientRects().length === 0) continue;
        const station = STATIONS.find((s) => s.id === el.dataset.dioramaChapter);
        if (!station) continue;
        // A chapter too near the end to reach the top is reached when the page bottoms out
        const at = Math.min(el.getBoundingClientRect().top + window.scrollY - edge, maxScroll);
        stations.push(station);
        // The first chapter (the hero) stands at its station at scrollY 0, wherever the band puts its top
        anchors.push(anchors.length ? Math.max(at, anchors[anchors.length - 1]) : 0);
      }
      // The panel has the room to itself: a close shot centres its object (on phones the frame slides, as tuned)
      if (!band.matches) stations = stations.map((st) => (st.shift ? { ...st, shift: 0 } : st));
      const c = clock.current?.getBoundingClientRect();
      const s = stage?.getBoundingClientRect();
      const header = document.querySelector('header')?.getBoundingClientRect();
      layout.current = {
        measured: true,
        anchors: anchors.length ? anchors : [0],
        stations: stations.length ? stations : [STATIONS[0]],
        band: band.matches,
        // The plate reaches 0.2em past the digits' sides and 0.12em past their top and bottom (diorama.css)
        plate:
          c && c.width > 0
            ? {
                x0: c.left - (s?.left ?? 0) - c.height * 0.2,
                x1: c.right - (s?.left ?? 0) + c.height * 0.2,
                y0: c.top - (s?.top ?? 0) - c.height * 0.12,
                y1: c.bottom - (s?.top ?? 0) + c.height * 0.12,
              }
            : null,
        top: header && s ? Math.max(0, header.bottom - s.top) : 0,
      };
    };
    measure();
    const main = document.querySelector('main');
    if (main) resize.observe(main);
    if (clock.current) resize.observe(clock.current);
    if (stage) resize.observe(stage);
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

    return () => {
      alive = false;
      resize.disconnect();
      mounts.disconnect();
      window.removeEventListener('resize', measure);
      band.removeEventListener('change', measure);
      // Without the live room the 08:00 still stands in, so the page returns to that hour
      delete html.dataset.dioActive;
      html.style.removeProperty('--dio-ground');
      if (clock.current) clock.current.textContent = '08:00';
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
    const { anchors, stations, band, top } = layout.current;
    const html = document.documentElement;
    const w = size.width;
    const h = size.height;

    // The day at this scroll position (one chapter alone holds its station)
    const loc = anchors.length < 2 ? REST : locate(window.scrollY, anchors, TRAVEL * window.innerHeight);
    const s = sampleDay(loc, stations.length < 2 ? [stations[0], stations[0]] : stations);
    // The arrival holds the hour, the light, the screens and the pose while it plays, and builds the model
    const intro = arrivalFrame();
    if (intro) applyIntro(s, intro);
    sample.current = s;
    const cutAt = intro?.clip ?? null;
    gl.clippingPlanes = cutAt === null ? NO_PLANES : CUT_PLANES;
    CUT.constant = cutAt ?? 0;
    work.cut.visible = cutAt !== null;
    work.cut.position.y = (cutAt ?? 0) - 0.003;

    // Close shots centre their object in what the header leaves of the canvas. Wide shots fit the whole
    // room into the panel (or the phone band): pull back, then slide the frame.
    work.target.set(...s.target);
    work.pos.set(...s.pos);
    let k = 1;
    let dx = 0;
    let dy = (top / 2) * (1 - s.fit);
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
      const m = band ? BAND_MARGIN : PANEL_MARGIN;
      // The room keeps clear of the clock's plate. First it slides left into any spare width, then its box
      // gives up height from the top, until the silhouette (not its bounding box: the room is a hexagon,
      // its top corners empty) misses the plate.
      let box: Box = { x0: m, y0: top + m, x1: w - m, y1: h - m };
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
      dy += f.dy * s.fit;
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
    // The hour being read: the page lights its chapter and the day's index marks its link
    if (s.active !== wr.active) {
      html.dataset.dioActive = s.active;
      eachLabel((id, el) => {
        if (id === s.active) el.setAttribute('aria-current', 'true');
        else el.removeAttribute('aria-current');
      });
      wr.active = s.active;
    }

    // Wide screens: the day's links are the page's index, where the page put them
    if (!band) {
      if (wr.pinned) {
        eachLabel((_, el) => {
          el.removeAttribute('data-out');
          el.style.removeProperty('transform');
        });
        wr.pinned = false;
      }
    } else {
      // Phones and tablets: each link over its object (only the hour on screen shows, diorama.css). A link off
      // its object is out of sight; reached by keyboard it still shows, clamped inside the band.
      wr.pinned = true;
      const byId = new Map<string, HTMLElement>();
      eachLabel((id, el) => byId.set(id, el));
      for (const [id, at] of work.labels) {
        const el = byId.get(id);
        if (!el || el.offsetWidth === 0) continue;
        const bw = el.offsetWidth;
        const bh = el.offsetHeight;
        work.p.copy(at).project(camera);
        const px = ((work.p.x + 1) / 2) * w;
        const py = ((1 - work.p.y) / 2) * h;
        const out = work.p.z > 1 || px < 0 || px > w || py < 0 || py > h;
        const x = Math.min(Math.max(px, bw / 2 + 8), w - bw / 2 - 8);
        const y = Math.min(Math.max(py, top + 8 + bh / 2), h - bh / 2 - 8);
        el.style.transform = `translate(${(x - bw / 2).toFixed(1)}px, ${(y - bh / 2).toFixed(1)}px)`;
        el.toggleAttribute('data-out', out);
      }
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
