/**
 * The fixed stage: one canvas for the whole home page. A driver reads the
 * Diorama chapters on the page ([data-diorama-chapter]), turns the scroll into
 * a day sample (day.ts), glides the camera between stations, writes the hour
 * on the page's clock, tints the page ground with the sky and pins the day's
 * navigation links over their objects. Loaded lazily by DioramaHero, only while
 * Diorama is the active world.
 */
import { useEffect, useMemo, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Locale } from '@i18n/utils';
import { STATIONS, clockText, locate, sampleDay, type DaySample, type Located, type Station, type V3 } from '../day';
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
/** Room between two labels that would touch, in pixels. */
const LABEL_GAP = 4;

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

/** Where the whole room should sit on a wide shot, in canvas pixels. */
function wideBox(w: number, h: number, band: boolean, column: boolean, copyRight: number): Box {
  if (band) return { x0: 10, y0: 10, x1: w - 10, y1: h - 10 };
  if (column)
    return {
      x0: Math.max(w * 0.4, copyRight + 40),
      y0: HEADER + 24,
      x1: w - 32,
      y1: h - 24,
    };
  // Tablets: the room above, the copy below it
  return { x0: 24, y0: HEADER + 16, x1: w - 24, y1: h * 0.56 };
}

interface Layout {
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
    init: false,
  });
  const written = useRef({ clock: '', active: '', ground: '', frames: 0 });
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

    // A chapter is reached when its top meets the stage's bottom edge (the header on desktop, the band on phones)
    const measure = () => {
      const bandBottom = band.matches && stage ? stage.getBoundingClientRect().bottom : HEADER;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const stations: Station[] = [];
      const anchors: number[] = [];
      for (const el of document.querySelectorAll<HTMLElement>('[data-diorama-chapter]')) {
        if (el.getClientRects().length === 0) continue;
        const station = STATIONS.find((s) => s.id === el.dataset.dioramaChapter);
        if (!station) continue;
        // A chapter too near the end to reach the band is reached when the page bottoms out
        const at = Math.min(el.getBoundingClientRect().top + window.scrollY - bandBottom, maxScroll);
        stations.push(station);
        anchors.push(Math.max(at, anchors[anchors.length - 1] ?? -Infinity));
      }
      const copy = document.querySelector<HTMLElement>('.dio-hero__copy');
      layout.current = {
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
      eachLabel((_, el) => {
        el.removeAttribute('aria-current');
        el.removeAttribute('data-out');
        el.style.removeProperty('transform');
      });
    };
  }, [gl, scene, work, clock]);

  useFrame((_, dt) => {
    const { anchors, stations, band, column, copyRight } = layout.current;
    const html = document.documentElement;
    const w = size.width;
    const h = size.height;

    // Label sizes first, before this frame writes anything that dirties layout
    const boxes: {
      el: HTMLElement;
      at: THREE.Vector3;
      w: number;
      h: number;
    }[] = [];
    eachLabel((id, el) => {
      const at = work.labels.find(([sid]) => sid === id)?.[1];
      if (at && el.offsetWidth > 0) boxes.push({ el, at, w: el.offsetWidth, h: el.offsetHeight });
    });

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
      const box = wideBox(w, h, band, column, copyRight);
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
    if (s.active !== wr.active) {
      html.dataset.dioActive = s.active;
      eachLabel((id, el) => {
        if (id === s.active) el.setAttribute('aria-current', 'true');
        else el.removeAttribute('aria-current');
      });
      wr.active = s.active;
    }

    // Pin each link over its object. Labels that collide spread apart around their objects, so each one reads
    const pins = boxes.map((b) => {
      work.p.copy(b.at).project(camera);
      const x = ((work.p.x + 1) / 2) * w;
      const y = ((1 - work.p.y) / 2) * h;
      return { ...b, x, y, out: work.p.z > 1 || x < 0 || x > w || y < 0 || y > h };
    });
    const shown = pins.filter((pin) => !pin.out);
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
    for (const pin of pins) {
      // Clamped inside the stage, so a link reached by keyboard while off its object still shows
      const x = Math.min(Math.max(pin.x, pin.w / 2 + 8), w - pin.w / 2 - 8);
      const y = Math.min(Math.max(pin.y, pin.h / 2 + 8), h - pin.h / 2 - 8);
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
