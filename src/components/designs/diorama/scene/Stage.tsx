/**
 * The fixed stage: one canvas for the whole home page. A driver reads the
 * Diorama chapters on the page ([data-diorama-chapter]), turns the scroll into
 * a day sample (day.ts), glides the camera between stations, writes the hour
 * on the page's clock, tints the page ground with the sky and places the day's
 * navigation links: on the wide shots (08:00, 22:00) they line up as the day's
 * agenda under the room; as the camera closes in they travel to their objects.
 * Loaded lazily by DioramaHero, only while Diorama is the active world.
 */
import { useEffect, useMemo, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Locale } from '@i18n/utils';
import { STATIONS, clockText, locate, sampleDay, type DaySample, type Located, type Station, type StationId, type V3 } from '../day';
import Room from './Room';
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
/** The page ground is the hour's sky, dimmed. */
const GROUND = 0.075;
const REST: Located = { i: 0, u: 0, move: 0 };
const smooth = (x: number) => x * x * (3 - 2 * x);
/** Room between two labels that would touch, in pixels. */
const LABEL_GAP = 4;
/** Room between two labels in the agenda, in pixels. */
const AGENDA_GAP = 6;

/** The room's silhouette from the camera's side: the floor slab's corners and the walls' top edges. */
const OUTLINE: V3[] = [
  [-2.06, -0.16, -1.72],
  [2.18, -0.16, -1.72],
  [2.18, -0.16, 1.6],
  [-2.06, -0.16, 1.6],
  [-2.06, 0, 1.6],
  [2.18, 0, 1.6],
  [-2.06, 2.6, -1.72],
  [2.12, 2.6, -1.72],
  [2.12, 2.6, 1.6],
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
    }),
    [],
  );

  useEffect(() => {
    scene.background = work.ground;
    const html = document.documentElement;
    const stage = gl.domElement.closest<HTMLElement>('.dio-stage');
    const band = window.matchMedia(BAND);
    const column = window.matchMedia(COLUMN);

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
      layout.current = {
        measured: true,
        anchors: anchors.length ? anchors : [0],
        stations: stations.length ? stations : [STATIONS[0]],
        band: band.matches,
        column: column.matches,
        copyRight: copy ? copy.getBoundingClientRect().right : 0,
      };
    };
    measure();
    const main = document.querySelector('main');
    const resize = new ResizeObserver(measure);
    if (main) resize.observe(main);
    window.addEventListener('resize', measure);
    band.addEventListener('change', measure);
    column.addEventListener('change', measure);

    return () => {
      resize.disconnect();
      window.removeEventListener('resize', measure);
      band.removeEventListener('change', measure);
      column.removeEventListener('change', measure);
      // Without the live room the 08:00 still stands in, so the page returns to that hour
      delete html.dataset.dioActive;
      html.style.removeProperty('--dio-ground');
      if (clock.current) clock.current.textContent = '08:00';
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
    const { anchors, stations, band, column, copyRight } = layout.current;
    const html = document.documentElement;
    const w = size.width;
    const h = size.height;

    // Label sizes first, before this frame writes anything that dirties layout. Hour order, for the agenda.
    const byId = new Map<StationId, HTMLElement>();
    eachLabel((id, el) => byId.set(id, el));
    const boxes: { el: HTMLElement; at: THREE.Vector3; w: number; h: number }[] = [];
    for (const [id, at] of work.labels) {
      const el = byId.get(id);
      if (el && el.offsetWidth > 0) boxes.push({ el, at, w: el.offsetWidth, h: el.offsetHeight });
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
      for (const v of work.outline) {
        work.p.copy(v).project(probe);
        const px = ((work.p.x + 1) / 2) * w;
        const py = ((1 - work.p.y) / 2) * h;
        x0 = Math.min(x0, px);
        x1 = Math.max(x1, px);
        y0 = Math.min(y0, py);
        y1 = Math.max(y1, py);
      }
      const box = stage.room;
      const scale = Math.min((box.x1 - box.x0) / (x1 - x0), (box.y1 - box.y0) / (y1 - y0));
      const pull = 1 / Math.max(0.2, scale);
      // Pulling back scales the silhouette about the frame's centre
      const cx = w / 2 + ((x0 + x1) / 2 - w / 2) / pull;
      const cy = h / 2 + ((y0 + y1) / 2 - h / 2) / pull;
      k = 1 + (pull - 1) * s.fit;
      dx = ((box.x0 + box.x1) / 2 - cx) * s.fit;
      dy = ((box.y0 + box.y1) / 2 - cy) * s.fit;
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
    // Close in, only the active hour keeps its full pill: the others are hour-only pins (the names stay in the links)
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

    // Each link over its object; on the wide shots they leave the room for their agenda slots, travelling
    // with the camera. Labels that collide on the way spread apart, so each one reads in every frame.
    const g = stage.slots ? smooth(Math.min(1, Math.max(0, c.fit))) : 0;
    const pins = boxes.map((b, i) => {
      work.p.copy(b.at).project(camera);
      let x = ((work.p.x + 1) / 2) * w;
      let y = ((1 - work.p.y) / 2) * h;
      const out = (work.p.z > 1 || x < 0 || x > w || y < 0 || y > h) && g < 0.5;
      const slot = stage.slots?.[i];
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
      const x = Math.min(Math.max(pin.x, pin.w / 2 + 8), w - pin.w / 2 - 8);
      const y = Math.min(Math.max(pin.y, top + pin.h / 2), h - pin.h / 2 - 8);
      pin.el.style.transform = `translate(${(x - pin.w / 2).toFixed(1)}px, ${(y - pin.h / 2).toFixed(1)}px)`;
      pin.el.toggleAttribute('data-out', pin.out);
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
      gl={{ antialias: !lite }}
      camera={{ fov: 18, near: 0.1, far: 80 }}
      frameloop={frameloop}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Driver sample={sample} still={still} clock={clock} onReady={onReady} />
      <Room sample={sample} locale={locale} lite={lite} still={still} />
    </Canvas>
  );
}
