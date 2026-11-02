/**
 * The room's lived-in detail, around the desk setup in Room.tsx: a bookcase in
 * the back-left corner, a drawer pedestal and the PC under the desk, the
 * window dressed (sill, blind, curtains, the town outside), a credenza, two
 * prints and a floor lamp in the front-right corner, a pouf, a side table and a
 * fig in the front-left one, a string of lights with polaroids, a wall clock
 * keeping the page's hour and a floating shelf on the back wall, baseboards,
 * outlets, a bin, the small things on the desk (cameras on the riser, a phone on
 * its stand, a notebook, sticky notes, cables), and soft contact shadow where
 * things meet the floor and walls. The evening's practical light
 * (`light.practical`) wakes the strip and bias light, the floor lamp, the bulbs,
 * the PC's fans and the town's windows; the moon lives in Room's window light.
 */
import { useMemo, useRef, type MutableRefObject, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { DaySample, V3 } from '../day';
import { aoTexture, glassTexture, moonTexture, photoTexture, posterTexture, seeded, skyTexture, townTextures } from './textures';

type Mats = Record<'wood' | 'woodSmall' | 'black' | 'cream' | 'metal' | 'housing', THREE.Material>;

const cast = { castShadow: true, receiveShadow: true } as const;

/** The string's bulbs breathe at night, each on its own phase (its instance): time and night are shared uniforms. */
const TWINKLE = { uTime: { value: 0 }, uNight: { value: 0 } };
function twinkling(m: THREE.MeshBasicMaterial): THREE.MeshBasicMaterial {
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, TWINKLE);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nvarying float vTwinkle;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nfloat id = float(gl_InstanceID);\nvTwinkle = 0.72 + 0.28 * sin(uTime * (1.3 + mod(id, 3.0) * 0.4) + id * 2.39);');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uNight;\nvarying float vTwinkle;')
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= mix(1.0, vTwinkle, uNight);');
  };
  m.customProgramCacheKey = () => 'diorama-twinkle';
  return m;
}

/** Marks a material the frame loop animates, so StaticMerge keeps it apart. */
function live<T extends THREE.Material>(m: T): T {
  m.userData.live = true;
  return m;
}
const UP = new THREE.Vector3(0, 1, 0);

/** A cylinder from `a` to `b`. */
export function Rod({ a, b, r, material, shadow = true }: { a: V3; b: V3; r: number; material: THREE.Material; shadow?: boolean }) {
  const { position, quaternion, length } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const dir = vb.clone().sub(va);
    return {
      position: va.clone().add(vb).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()),
      length: dir.length(),
    };
  }, [a, b]);
  return (
    <mesh position={position} quaternion={quaternion} material={material} castShadow={shadow}>
      <cylinderGeometry args={[r, r, length, 8]} />
    </mesh>
  );
}

const SPINES = ['#2f4a6b', '#a8442f', '#d6c7a1', '#3c5a3a', '#e8e1d3', '#232327', '#c98a3a', '#6b4a7a', '#8a9aa8', '#b33a3a', '#ece6dc', '#47607a'];

interface Book {
  p: V3;
  s: V3;
  r?: number;
  c: string;
}

/** A shelf's run of books standing (and one lying stack), from x0 to x1 at height y, depth centred on z. */
function shelfRun(rnd: () => number, x0: number, x1: number, y: number, z: number, maxH: number, stack = false): Book[] {
  const books: Book[] = [];
  let x = x0;
  while (x < x1) {
    if (stack && x > x0 + (x1 - x0) * 0.6) {
      // a short stack lying flat
      let sy = y;
      for (let i = 0; i < 3; i++) {
        const h = 0.022 + rnd() * 0.012;
        const w = 0.13 + rnd() * 0.04;
        books.push({
          p: [x + w / 2 + 0.01, sy + h / 2, z],
          s: [w, h, 0.17 + rnd() * 0.03],
          r: (rnd() - 0.5) * 0.3,
          c: SPINES[Math.floor(rnd() * SPINES.length)],
        });
        sy += h;
      }
      break;
    }
    const w = 0.022 + rnd() * 0.03;
    if (x + w > x1) break;
    const h = maxH * (0.68 + rnd() * 0.32);
    const lean = x > x1 - 0.12 && rnd() > 0.5 ? -0.22 : 0;
    books.push({
      p: [x + w / 2, y + h / 2, z],
      s: [w, h, 0.16 + rnd() * 0.05],
      r: lean,
      c: SPINES[Math.floor(rnd() * SPINES.length)],
    });
    x += w + 0.002;
  }
  return books;
}

export interface Part {
  p: V3;
  r?: V3;
  s?: V3;
  c?: string;
}

/** Many copies of one shape in a single draw, placed once; each takes its own colour when one is given. */
export function Parts({ geometry, material, parts, shadow = true }: { geometry: THREE.BufferGeometry; material: THREE.Material; parts: Part[]; shadow?: boolean }) {
  const setup = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    const coloured = parts.some((q) => q.c);
    parts.forEach((q, i) => {
      o.position.set(...q.p);
      o.rotation.set(...(q.r ?? [0, 0, 0]));
      o.scale.set(...(q.s ?? [1, 1, 1]));
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      if (coloured) mesh.setColorAt(i, c.set(q.c ?? '#ffffff'));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };
  return <instancedMesh ref={setup} args={[geometry, material, parts.length]} castShadow={shadow} receiveShadow />;
}

/** Shared shapes for the instanced parts. */
const BOX = new THREE.BoxGeometry(1, 1, 1);
const LEAF = new THREE.SphereGeometry(1, 10, 6);
const PLANE = new THREE.PlaneGeometry(1, 1);
/** A white base the instance colours tint. */
const FOLIAGE = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  roughness: 0.55,
});
const BOOK = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  roughness: 0.75,
});

/** A book's block with softened edges (scaled per book, so the rounding scales with it). */
const BOOK_BLOCK = new RoundedBoxGeometry(1, 1, 1, 2, 0.05);

/** All the room's loose books in one draw, each with its own spine colour. */
function Books({ books }: { books: Book[] }) {
  const parts = useMemo(() => books.map((b) => ({ p: b.p, r: [0, 0, b.r ?? 0] as V3, s: b.s, c: b.c })), [books]);
  return <Parts geometry={BOOK_BLOCK} material={BOOK} parts={parts} />;
}

function Pot({ position, r = 0.06, h = 0.09, color = '#e9e3d9', children }: { position: V3; r?: number; h?: number; color?: string; children?: ReactNode }) {
  return (
    <group position={position}>
      <mesh {...cast} position={[0, h / 2, 0]}>
        <cylinderGeometry args={[r, r * 0.8, h, 20]} />
        <meshStandardMaterial color={color} roughness={0.65} />
      </mesh>
      <mesh position={[0, h - 0.004, 0]}>
        <cylinderGeometry args={[r * 0.92, r * 0.92, 0.004, 20]} />
        <meshStandardMaterial color="#3a2a1e" roughness={1} />
      </mesh>
      <group position={[0, h, 0]}>{children}</group>
    </group>
  );
}

/** A pothos: a crown of small leaves and vines trailing over the edge. */
function Pothos({ vines }: { vines: V3[][] }) {
  const leaves = useMemo(() => {
    const rnd = seeded(41);
    const out: Part[] = [];
    const s: V3 = [0.026, 0.006, 0.034];
    for (let i = 0; i < 12; i++) {
      const a = rnd() * Math.PI * 2;
      out.push({
        p: [Math.cos(a) * 0.04, 0.02 + rnd() * 0.04, Math.sin(a) * 0.04],
        r: [rnd() - 0.5, a, 0.6],
        s,
        c: i % 2 ? '#4f8a43' : '#3b6e35',
      });
    }
    for (const vine of vines) {
      const curve = new THREE.CatmullRomCurve3(vine.map((v) => new THREE.Vector3(...v)));
      for (let k = 1; k <= 7; k++) {
        const p = curve.getPoint(k / 7.5);
        out.push({
          p: [p.x, p.y, p.z],
          r: [rnd() * 0.8, rnd() * Math.PI * 2, 0.9],
          s,
          c: k % 2 ? '#3b6e35' : '#4f8a43',
        });
      }
    }
    return out;
  }, [vines]);
  return (
    <group>
      {vines.map((vine, i) => (
        <mesh key={i} castShadow>
          <tubeGeometry args={[new THREE.CatmullRomCurve3(vine.map((v) => new THREE.Vector3(...v))), 16, 0.003, 4, false]} />
          <meshStandardMaterial color="#3d6b3a" roughness={0.7} />
        </mesh>
      ))}
      <Parts geometry={LEAF} material={FOLIAGE} parts={leaves} />
    </group>
  );
}

const BLADE = new THREE.ConeGeometry(0.018, 1, 6);

/** A snake plant: upright blades, banded. */
function SnakePlant() {
  const blades = useMemo(() => {
    const rnd = seeded(77);
    return Array.from({ length: 9 }, (_, i): Part => {
      const a = (i / 9) * Math.PI * 2 + rnd() * 0.4;
      const h = 0.22 + rnd() * 0.16;
      const tilt = 0.08 + rnd() * 0.16;
      return {
        p: [Math.cos(a) * 0.02, h / 2, Math.sin(a) * 0.02],
        r: [Math.sin(a) * tilt, a, -Math.cos(a) * tilt],
        s: [1, h, 0.25],
        c: i % 2 ? '#3f6b3c' : '#5d7f3e',
      };
    });
  }, []);
  return <Parts geometry={BLADE} material={FOLIAGE} parts={blades} />;
}

/** A curtain hanging in folds: a plane rippled along its width. */
/** A curtain hanging in folds that breathe a little with the room's air (still under reduced motion). */
function Curtain({ width, height, folds, phase, still }: { width: number; height: number; folds: number; phase: number; still: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (mesh.current && !still) mesh.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 0.7 + phase) * 0.12;
  });
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, height, folds * 8, 6);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // folds deepen toward the hem
      const depth = 0.014 + 0.01 * (0.5 - y / height);
      pos.setZ(i, Math.sin((x / width) * Math.PI * 2 * folds) * depth);
    }
    g.computeVertexNormals();
    return g;
  }, [width, height, folds]);
  return (
    <mesh ref={mesh} geometry={geometry} castShadow receiveShadow userData={{ live: true }}>
      <meshStandardMaterial color="#e6ddcd" roughness={0.95} side={THREE.DoubleSide} />
    </mesh>
  );
}

/**
 * Baked-looking contact shadow: soft dark footprints under the furniture and along the
 * walls' feet, where a lit room gathers its occlusion. Unlit, so the sun patch still
 * reads over them; kept faint enough not to stain it.
 */
function Occlusion() {
  const m = useMemo(() => {
    const mat = (map: THREE.Texture, opacity: number) =>
      new THREE.MeshBasicMaterial({
        color: '#000',
        alphaMap: map,
        transparent: true,
        opacity,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      });
    const edge = aoTexture('edge');
    return {
      rect: mat(aoTexture('rect'), 0.5),
      disc: mat(aoTexture('disc'), 0.42),
      edge: mat(edge, 0.32),
      wall: mat(edge, 0.4),
    };
  }, []);
  const floor: [V3, [number, number], THREE.Material, number?][] = [
    [[-0.1, 0.003, -1.22], [3.0, 0.95], m.rect],
    [[-1.72, 0.003, -1.44], [0.75, 0.55], m.rect],
    [[-1.0, 0.003, -1.3], [0.6, 0.66], m.rect],
    [[0.8, 0.003, -1.25], [0.42, 0.62], m.rect],
    [[1.84, 0.003, 0.98], [0.5, 0.8], m.rect],
    [[-0.2, 0.0135, -0.5], [0.85, 0.85], m.disc],
    [[1.62, 0.003, -1.22], [0.6, 0.6], m.disc],
    [[1.72, 0.003, 1.38], [0.5, 0.5], m.disc],
    [[1.32, 0.003, -0.8], [0.34, 0.34], m.disc],
  ];
  return (
    <group>
      {floor.map(([p, [w, d], material], i) => (
        <mesh key={i} position={p} rotation={[-Math.PI / 2, 0, 0]} material={material} renderOrder={1}>
          <planeGeometry args={[w, d]} />
        </mesh>
      ))}
      {/* along the walls' feet, on the floor and up the walls */}
      <mesh position={[-0.03, 0.002, -1.6 + 0.17]} rotation={[-Math.PI / 2, 0, 0]} material={m.edge} renderOrder={1}>
        <planeGeometry args={[4.06, 0.34]} />
      </mesh>
      <mesh position={[2.0 - 0.17, 0.002, -0.02]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} material={m.edge} renderOrder={1}>
        <planeGeometry args={[3.2, 0.34]} />
      </mesh>
      <mesh position={[-0.03, 0.2, -1.5985]} rotation={[0, 0, Math.PI]} material={m.wall} renderOrder={1}>
        <planeGeometry args={[4.06, 0.4]} />
      </mesh>
      <mesh position={[1.9985, 0.2, -0.02]} rotation={[0, -Math.PI / 2, Math.PI]} material={m.wall} renderOrder={1}>
        <planeGeometry args={[3.2, 0.4]} />
      </mesh>
      {/* the back corner, where the two walls meet */}
      <mesh position={[1.88, 1.3, -1.5985]} rotation={[0, 0, -Math.PI / 2]} material={m.edge} renderOrder={1}>
        <planeGeometry args={[2.6, 0.24]} />
      </mesh>
      <mesh position={[1.9985, 1.3, -1.48]} rotation={[0, -Math.PI / 2, Math.PI / 2]} material={m.edge} renderOrder={1}>
        <planeGeometry args={[2.6, 0.24]} />
      </mesh>
    </group>
  );
}

/** Where a catenary from `a` to `b` sagging by `sag` is at `t` (0..1), on the back wall. */
function hang(a: V3, b: V3, sag: number, t: number): V3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2]];
}

const SOCKET = new THREE.CylinderGeometry(0.004, 0.004, 0.012, 6);
const BULB = new THREE.SphereGeometry(0.011, 10, 8);

/** The string's ends on the back wall, and how far it sags between them. */
const A: V3 = [-1.5, 2.3, -1.586];
const B: V3 = [0.2, 2.34, -1.586];
const SAG = 0.16;

/** A string of warm bulbs across the back wall, a few polaroids clipped to it. */
function StringLights({ bulbs }: { bulbs: THREE.Material }) {
  const wire = useMemo(() => new THREE.CatmullRomCurve3(Array.from({ length: 24 }, (_, i) => new THREE.Vector3(...hang(A, B, SAG, i / 23)))), []);
  const photos = useMemo(
    () =>
      [0, 1, 2, 3].map(
        (k) =>
          new THREE.MeshStandardMaterial({
            map: photoTexture(k),
            roughness: 0.6,
          }),
      ),
    [],
  );
  const frame = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f6f2ea', roughness: 0.8 }), []);
  const clip = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c8a46a', roughness: 0.6 }), []);
  const wireMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2b2621', roughness: 0.8 }), []);
  const N = 15;
  const { sockets, lamps } = useMemo(() => {
    const at = Array.from({ length: N }, (_, i) => hang(A, B, SAG, (i + 0.5) / N));
    return {
      sockets: at.map((p): Part => ({ p: [p[0], p[1] - 0.016, p[2] + 0.006] })),
      lamps: at.map((p): Part => ({ p: [p[0], p[1] - 0.03, p[2] + 0.006] })),
    };
  }, []);
  return (
    <group>
      <mesh material={wireMat}>
        <tubeGeometry args={[wire, 60, 0.0022, 4, false]} />
      </mesh>
      <Parts geometry={SOCKET} material={wireMat} shadow={false} parts={sockets} />
      <Parts geometry={BULB} material={bulbs} shadow={false} parts={lamps} />
      {[0.16, 0.37, 0.62, 0.84].map((t, k) => {
        const p = hang(A, B, SAG, t);
        return (
          <group key={k} position={[p[0], p[1] - 0.05, p[2] + 0.004]} rotation={[0, 0, (k % 2 ? -1 : 1) * 0.08]}>
            <mesh material={clip} position={[0, 0.044, 0.003]}>
              <boxGeometry args={[0.008, 0.02, 0.006]} />
            </mesh>
            <mesh material={frame}>
              <boxGeometry args={[0.064, 0.078, 0.002]} />
            </mesh>
            <mesh material={photos[k]} position={[0, 0.006, 0.0012]}>
              <planeGeometry args={[0.054, 0.054]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** The wall clock above the bookcase: its hands keep the page's hour. */
function WallClock({ sample }: { sample: MutableRefObject<DaySample> }) {
  const hour = useRef<THREE.Group>(null);
  const minute = useRef<THREE.Group>(null);
  const m = useMemo(
    () => ({
      face: new THREE.MeshStandardMaterial({
        color: '#f1ece3',
        roughness: 0.7,
      }),
      rim: new THREE.MeshStandardMaterial({ color: '#b07a45', roughness: 0.5 }),
      ink: new THREE.MeshStandardMaterial({ color: '#17181b', roughness: 0.5 }),
      second: new THREE.MeshStandardMaterial({
        color: '#e3893a',
        roughness: 0.5,
      }),
    }),
    [],
  );
  useFrame(() => {
    const h = sample.current.hour;
    if (hour.current) hour.current.rotation.z = -((h % 12) / 12) * Math.PI * 2;
    if (minute.current) minute.current.rotation.z = -(h % 1) * Math.PI * 2;
  });
  return (
    <group position={[-1.72, 2.2, -1.588]}>
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]} material={m.face}>
        <cylinderGeometry args={[0.115, 0.115, 0.018, 40]} />
      </mesh>
      <mesh castShadow position={[0, 0, 0.004]} material={m.rim}>
        <torusGeometry args={[0.115, 0.01, 10, 48]} />
      </mesh>
      <Parts
        geometry={BOX}
        material={m.ink}
        shadow={false}
        parts={Array.from({ length: 12 }, (_, i): Part => {
          const a = (i / 12) * Math.PI * 2;
          const long = i % 3 === 0;
          return {
            p: [Math.sin(a) * 0.088, Math.cos(a) * 0.088, 0.0095],
            r: [0, 0, -a],
            s: [long ? 0.006 : 0.003, long ? 0.02 : 0.012, 0.001],
          };
        })}
      />
      <group ref={hour} position={[0, 0, 0.011]} userData={{ live: true }}>
        <mesh position={[0, 0.026, 0]} material={m.ink}>
          <boxGeometry args={[0.007, 0.06, 0.002]} />
        </mesh>
      </group>
      <group ref={minute} position={[0, 0, 0.013]} userData={{ live: true }}>
        <mesh position={[0, 0.04, 0]} material={m.ink}>
          <boxGeometry args={[0.004, 0.088, 0.002]} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.015]} rotation={[Math.PI / 2, 0, 0]} material={m.second}>
        <cylinderGeometry args={[0.006, 0.006, 0.003, 12]} />
      </mesh>
    </group>
  );
}

const STICKER = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  roughness: 0.35,
});

/** A puzzle cube, scrambled: black body, a sticker grid on its three faces toward the room. */
function PuzzleCube() {
  const stickers = useMemo(() => {
    const rnd = seeded(13);
    const colours = ['#f2f2ee', '#f3c623', '#e05a2b', '#c93a3a', '#2f62c9', '#2f9a5a'];
    const out: Part[] = [];
    const s = 0.0155;
    const k: V3 = [0.013, 0.013, 1];
    for (let a = -1; a <= 1; a++) {
      for (let b = -1; b <= 1; b++) {
        out.push({
          p: [a * s, b * s, 0.0236],
          r: [0, 0, 0],
          s: k,
          c: colours[Math.floor(rnd() * 6)],
        });
        out.push({
          p: [a * s, 0.0236, b * s],
          r: [-Math.PI / 2, 0, 0],
          s: k,
          c: colours[Math.floor(rnd() * 6)],
        });
        out.push({
          p: [-0.0236, a * s, b * s],
          r: [0, -Math.PI / 2, 0],
          s: k,
          c: colours[Math.floor(rnd() * 6)],
        });
      }
    }
    return out;
  }, []);
  return (
    <group>
      <RoundedBox args={[0.046, 0.046, 0.046]} radius={0.005} castShadow>
        <meshStandardMaterial color="#141416" roughness={0.4} />
      </RoundedBox>
      <Parts geometry={PLANE} material={STICKER} parts={stickers} shadow={false} />
    </group>
  );
}

/** A fiddle-leaf fig's crown: broad leaves around the top of its trunk. */
function FigCrown() {
  const leaves = useMemo(() => {
    const rnd = seeded(29);
    return Array.from({ length: 22 }, () => {
      const y = 0.45 + rnd() * 0.5;
      const a = rnd() * Math.PI * 2;
      const r = 0.05 + rnd() * 0.12 * (1 - Math.abs(y - 0.72) * 1.4);
      const k = 0.8 + rnd() * 0.5;
      return {
        p: [Math.cos(a) * r + 0.02, y, Math.sin(a) * r] as V3,
        r: [0.5 + rnd() * 0.6, a, 0.3] as V3,
        s: [0.05 * k, 0.008, 0.075 * k] as V3,
      };
    });
  }, []);
  const parts = useMemo(() => leaves.map((l, i) => ({ ...l, c: i % 2 ? '#2f6630' : '#3f7a3c' })), [leaves]);
  return <Parts geometry={LEAF} material={FOLIAGE} parts={parts} />;
}

/** A knitted pouf: a squat drum with a rolled rim and cable-knit ribs. */
function Pouf({ position }: { position: V3 }) {
  const ribs = 18;
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 0.13, 0]} material={POUF}>
        <cylinderGeometry args={[0.2, 0.19, 0.24, 36]} />
      </mesh>
      <mesh castShadow position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]} material={POUF}>
        <torusGeometry args={[0.18, 0.03, 10, 36]} />
      </mesh>
      <mesh position={[0, 0.27, 0]} rotation={[-Math.PI / 2, 0, 0]} material={POUF}>
        <circleGeometry args={[0.18, 36]} />
      </mesh>
      <Parts
        geometry={BOX}
        material={POUF_RIB}
        shadow={false}
        parts={Array.from({ length: ribs }, (_, i): Part => {
          const a = (i / ribs) * Math.PI * 2;
          return {
            p: [Math.cos(a) * 0.197, 0.13, Math.sin(a) * 0.197],
            r: [0, -a, 0],
            s: [0.012, 0.22, 0.026],
          };
        })}
      />
    </group>
  );
}
const POUF = new THREE.MeshStandardMaterial({
  color: '#8a9a78',
  roughness: 0.95,
});
const POUF_RIB = new THREE.MeshStandardMaterial({
  color: '#7d8d6c',
  roughness: 0.95,
});

/** A floating shelf left of the wall monitor: the puzzle cube, a framed photo, a cactus, two books. */
function FloatingShelf({ mats, frame, photo }: { mats: Mats; frame: THREE.Material; photo: THREE.Material }) {
  return (
    <group position={[-1.04, 1.64, -1.535]}>
      <RoundedBox args={[0.46, 0.024, 0.13]} radius={0.004} material={mats.woodSmall} castShadow receiveShadow />
      {[-0.17, 0.17].map((x) => (
        <mesh key={x} castShadow position={[x, -0.035, -0.05]} material={mats.black}>
          <boxGeometry args={[0.012, 0.06, 0.03]} />
        </mesh>
      ))}
      <group position={[-0.15, 0.035, 0.01]} rotation={[0, 0.5, 0]}>
        <PuzzleCube />
      </group>
      <group position={[-0.03, 0.065, -0.03]} rotation={[-0.12, 0.15, 0]}>
        <RoundedBox args={[0.085, 0.105, 0.012]} radius={0.003} material={frame} castShadow />
        <mesh position={[0, 0, 0.0065]} material={photo}>
          <planeGeometry args={[0.065, 0.08]} />
        </mesh>
      </group>
      <Pot position={[0.08, 0.012, 0.01]} r={0.03} h={0.05} color="#d9774f">
        <mesh castShadow position={[0, 0.04, 0]}>
          <capsuleGeometry args={[0.016, 0.05, 6, 10]} />
          <meshStandardMaterial color="#5d8a4f" roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0.02, 0.03, 0]} rotation={[0, 0, -0.7]}>
          <capsuleGeometry args={[0.009, 0.022, 6, 8]} />
          <meshStandardMaterial color="#5d8a4f" roughness={0.7} />
        </mesh>
      </Pot>
      {[0, 1].map((i) => (
        <mesh key={i} castShadow position={[0.17, 0.023 + i * 0.022, 0]} rotation={[0, 0.15 - i * 0.3, 0]}>
          <boxGeometry args={[0.1, 0.021, 0.08]} />
          <meshStandardMaterial color={['#47607a', '#e8e1d3'][i]} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export default function Furnishings({ sample, mats, lite, still }: { sample: MutableRefObject<DaySample>; mats: Mats; lite: boolean; still: boolean }) {
  const m = useMemo(
    () => ({
      trim: new THREE.MeshStandardMaterial({
        color: '#2e3034',
        roughness: 0.6,
      }),
      plate: new THREE.MeshStandardMaterial({
        color: '#e9e5de',
        roughness: 0.5,
      }),
      cabinet: new THREE.MeshStandardMaterial({
        color: '#e7e2d9',
        roughness: 0.55,
      }),
      tower: new THREE.MeshStandardMaterial({
        color: '#17181b',
        roughness: 0.45,
        metalness: 0.3,
      }),
      glass: new THREE.MeshStandardMaterial({
        color: '#0b0c0f',
        roughness: 0.06,
        metalness: 0.4,
        transparent: true,
        opacity: 0.4,
      }),
      board: new THREE.MeshStandardMaterial({
        color: '#1f2b26',
        roughness: 0.6,
      }),
      ram: live(
        new THREE.MeshStandardMaterial({
          color: '#2a2b2f',
          emissive: new THREE.Color('#ffd9a8'),
          emissiveIntensity: 0.05,
          roughness: 0.4,
        }),
      ),
      fan: live(
        new THREE.MeshStandardMaterial({
          color: '#2a2b2f',
          emissive: new THREE.Color('#ffd9a8'),
          emissiveIntensity: 0.15,
          roughness: 0.5,
        }),
      ),
      shade: live(
        new THREE.MeshStandardMaterial({
          color: '#efe6d6',
          emissive: new THREE.Color('#ffc988'),
          emissiveIntensity: 0,
          roughness: 0.9,
          side: THREE.DoubleSide,
        }),
      ),
      bulb: new THREE.MeshBasicMaterial({
        color: '#fff1d6',
        toneMapped: false,
      }),
      cork: new THREE.MeshStandardMaterial({
        color: '#b98c5a',
        roughness: 0.95,
      }),
      notebook: new THREE.MeshStandardMaterial({
        color: '#25262a',
        roughness: 0.7,
      }),
      paper: new THREE.MeshStandardMaterial({
        color: '#f3efe6',
        roughness: 0.9,
      }),
      noteYellow: new THREE.MeshStandardMaterial({
        color: '#f6d76b',
        roughness: 0.85,
      }),
      notePink: new THREE.MeshStandardMaterial({
        color: '#f3a7b5',
        roughness: 0.85,
      }),
      cable: new THREE.MeshStandardMaterial({
        color: '#e3893a',
        roughness: 0.6,
      }),
      cableDark: new THREE.MeshStandardMaterial({
        color: '#141416',
        roughness: 0.6,
      }),
      lens: new THREE.MeshStandardMaterial({
        color: '#0d0e10',
        roughness: 0.15,
        metalness: 0.6,
      }),
      fabric: new THREE.MeshStandardMaterial({
        color: '#d9d3c6',
        roughness: 1,
      }),
      basket: new THREE.MeshStandardMaterial({
        color: '#c2a57c',
        roughness: 0.9,
      }),
      blind: new THREE.MeshStandardMaterial({
        color: '#ece6da',
        roughness: 0.9,
      }),
      posterA: new THREE.MeshStandardMaterial({
        map: posterTexture('diagram'),
        roughness: 0.8,
      }),
      posterB: new THREE.MeshStandardMaterial({
        map: posterTexture('shapes'),
        roughness: 0.8,
      }),
      led: new THREE.MeshBasicMaterial({ color: '#ffb066', toneMapped: false }),
      fairy: twinkling(
        new THREE.MeshBasicMaterial({
          color: '#ffd59a',
          toneMapped: false,
        }),
      ),
      frame: new THREE.MeshStandardMaterial({
        color: '#2b2621',
        roughness: 0.6,
      }),
      photo: new THREE.MeshStandardMaterial({
        map: photoTexture(2),
        roughness: 0.6,
      }),
    }),
    [],
  );

  // The window's outside: sky, the town, and its lights at night
  const view = useMemo(() => {
    const town = townTextures();
    return {
      flicker: town.flicker,
      sky: new THREE.MeshBasicMaterial({
        map: skyTexture(),
        toneMapped: false,
      }),
      skyline: new THREE.MeshBasicMaterial({
        map: town.skyline,
        transparent: true,
        toneMapped: false,
        depthWrite: false,
      }),
      lights: new THREE.MeshBasicMaterial({
        map: town.lights,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0,
        toneMapped: false,
        depthWrite: false,
      }),
      moon: new THREE.MeshBasicMaterial({ map: moonTexture(), transparent: true, opacity: 0, toneMapped: false, depthWrite: false }),
      // The glass catches the room's light: soft streaks, faint by day, a touch brighter at night when the glass turns mirror
      glass: new THREE.MeshBasicMaterial({ map: glassTexture(), transparent: true, blending: THREE.AdditiveBlending, opacity: 0.1, toneMapped: false, depthWrite: false }),
    };
  }, []);

  const books = useMemo(() => {
    const rnd = seeded(3);
    // Bookcase shelves (x -1.95..-1.49, back wall), the credenza's open cube, and the stack on top of it
    return [
      ...shelfRun(rnd, -1.94, -1.7, 0.0725, -1.47, 0.32),
      ...shelfRun(rnd, -1.94, -1.5, 0.4325, -1.47, 0.29, true),
      ...shelfRun(rnd, -1.94, -1.62, 0.7925, -1.47, 0.28),
      ...shelfRun(rnd, -1.94, -1.5, 1.1525, -1.47, 0.29, true),
      ...shelfRun(rnd, -1.78, -1.5, 1.5125, -1.47, 0.22),
    ];
  }, []);
  // The credenza's books stand along z (their spines face the room)
  const credenzaBooks = useMemo(() => {
    const rnd = seeded(9);
    return shelfRun(rnd, 0.735, 0.965, 0.06, 0, 0.26).map((b) => ({
      ...b,
      p: [1.86, b.p[1], b.p[0]] as V3,
      s: [b.s[2] * 0.9, b.s[1], b.s[0]] as V3,
      r: 0,
    }));
  }, []);

  const lamp = useRef<THREE.PointLight>(null);
  const strip = useRef<THREE.RectAreaLight>(null);
  const bias = useRef<THREE.RectAreaLight>(null);

  // When someone in town next turns a light on or off (seconds on the frame clock)
  const nextFlicker = useRef(4);

  useFrame((state) => {
    const L = sample.current.light;
    const on = L.practical;
    const time = state.clock.elapsedTime;
    TWINKLE.uTime.value = still ? 0 : time;
    TWINKLE.uNight.value = still ? 0 : on;
    if (!still && on > 0.3 && time > nextFlicker.current) {
      view.flicker(Math.random());
      nextFlicker.current = time + 2.5 + Math.random() * 4;
    }
    if (lamp.current) lamp.current.intensity = on * 2.4;
    m.shade.emissiveIntensity = on * 1.1;
    m.bulb.color.setRGB(1, 0.94, 0.84).multiplyScalar(0.3 + on * 1.4);
    m.fan.emissiveIntensity = 0.15 + on * 1.3;
    m.ram.emissiveIntensity = 0.05 + on * 0.5;
    m.led.color.set('#ffb066').multiplyScalar(0.25 + on * 1.6);
    // unlit by day the bulbs are pale glass; at night they glow past white
    m.fairy.color.set('#ffd59a').multiplyScalar(0.55 + on * 1.5);
    if (strip.current) strip.current.intensity = on * 7;
    if (bias.current) bias.current.intensity = on * 9;
    view.sky.color.set(L.sky);
    // The town is the sky's silhouette by day, a deep blue mass by night
    view.skyline.color.set(L.sky).multiplyScalar(0.55);
    view.lights.opacity = Math.min(1, Math.max(0, (on - 0.1) / 0.75));
    view.moon.opacity = Math.min(1, Math.max(0, (L.moon - 0.4) / 1.0));
    view.glass.opacity = 0.08 + 0.06 * on;
  });

  // Where the strip (down onto the desk) and the bias light (back onto the wall) point
  const aims = useMemo(
    () => ({
      strip: new THREE.Vector3(-0.2, 0, -1.36),
      bias: new THREE.Vector3(-0.2, 1.22, -3),
    }),
    [],
  );

  return (
    <group>
      {/* ---------------- Evening light: the LED strip under the riser and the bias light behind the main monitor */}
      <rectAreaLight
        ref={(l) => {
          (strip as MutableRefObject<THREE.RectAreaLight | null>).current = l;
          l?.lookAt(aims.strip);
        }}
        position={[-0.2, 0.884, -1.36]}
        width={1.36}
        height={0.05}
        color="#ffb066"
        intensity={0}
      />
      <mesh position={[-0.2, 0.887, -1.335]} material={m.led}>
        <boxGeometry args={[1.38, 0.005, 0.008]} />
      </mesh>
      {!lite && (
        <rectAreaLight
          ref={(l) => {
            (bias as MutableRefObject<THREE.RectAreaLight | null>).current = l;
            l?.lookAt(aims.bias);
          }}
          position={[-0.2, 1.22, -1.5]}
          width={0.5}
          height={0.26}
          color="#ffb066"
          intensity={0}
        />
      )}

      {/* ---------------- Baseboards, outlets, a light switch */}
      <mesh {...cast} position={[-0.03, 0.04, -1.594]} material={m.trim}>
        <boxGeometry args={[4.06, 0.08, 0.014]} />
      </mesh>
      <mesh {...cast} position={[1.994, 0.04, -0.02]} material={m.trim}>
        <boxGeometry args={[0.014, 0.08, 3.2]} />
      </mesh>
      {(
        [
          [[1.45, 0.24, -1.597], 0],
          [[-0.6, 0.24, -1.597], 0],
          [[1.997, 0.24, 1.3], -Math.PI / 2],
        ] as [V3, number][]
      ).map(([p, ry], i) => (
        <group key={i} position={p} rotation={[0, ry, 0]}>
          <RoundedBox args={[0.07, 0.07, 0.008]} radius={0.003} material={m.plate} />
          {[-0.012, 0.012].map((x) => (
            <mesh key={x} position={[x, 0, 0.0045]} material={mats.black}>
              <cylinderGeometry args={[0.004, 0.004, 0.002, 8]} />
            </mesh>
          ))}
        </group>
      ))}
      <group position={[1.997, 1.1, 1.42]} rotation={[0, -Math.PI / 2, 0]}>
        <RoundedBox args={[0.07, 0.11, 0.008]} radius={0.003} material={m.plate} />
        <RoundedBox args={[0.026, 0.05, 0.01]} radius={0.003} position={[0, 0, 0.006]} material={m.plate} />
      </group>

      {/* ---------------- The bookcase in the back-left corner: a black frame, wood shelves */}
      <group>
        {[-1.96, -1.48].flatMap((x) =>
          [-1.59, -1.33].map((z) => (
            <mesh key={`${x}${z}`} {...cast} position={[x, 0.9, z]} material={mats.black}>
              <boxGeometry args={[0.022, 1.8, 0.022]} />
            </mesh>
          )),
        )}
        {[0.06, 0.42, 0.78, 1.14, 1.5, 1.79].map((y) => (
          <mesh key={y} {...cast} position={[-1.72, y, -1.46]} material={mats.woodSmall}>
            <boxGeometry args={[0.5, 0.025, 0.28]} />
          </mesh>
        ))}
        {/* a fabric bin on the third shelf, beside its books */}
        {[-1.55].map((x) => (
          <RoundedBox key={x} args={[0.12, 0.16, 0.2]} radius={0.01} position={[x, 0.8725, -1.46]} material={m.fabric} {...cast} />
        ))}
        {/* a little robot on the fourth shelf, and a small succulent */}
        <group position={[-1.88, 1.5125, -1.44]}>
          <RoundedBox args={[0.07, 0.07, 0.05]} radius={0.01} position={[0, 0.035, 0]} material={m.cable} castShadow />
          <RoundedBox args={[0.06, 0.055, 0.05]} radius={0.01} position={[0, 0.1, 0]} material={m.plate} castShadow />
          {[-0.014, 0.014].map((x) => (
            <mesh key={x} position={[x, 0.104, 0.026]} material={mats.black}>
              <sphereGeometry args={[0.007, 8, 6]} />
            </mesh>
          ))}
          <Rod a={[0, 0.127, 0]} b={[0, 0.152, 0]} r={0.003} material={mats.black} />
        </group>
        <Pot position={[-1.6, 1.8025, -1.47]} r={0.055} h={0.08} color="#2b2b2b">
          <Pothos
            vines={[
              [
                [0.04, 0.01, 0.03],
                [0.09, -0.02, 0.1],
                [0.1, -0.2, 0.15],
                [0.08, -0.42, 0.16],
              ],
              [
                [-0.02, 0.01, 0.04],
                [-0.04, -0.03, 0.14],
                [-0.03, -0.18, 0.16],
              ],
              [
                [0.05, 0.0, -0.02],
                [0.13, -0.05, 0.02],
                [0.15, -0.3, 0.06],
                [0.16, -0.6, 0.08],
              ],
            ]}
          />
        </Pot>
      </group>
      <Books books={[...books, ...credenzaBooks]} />

      {/* ---------------- Under the desk: a drawer pedestal on casters, the PC */}
      <group position={[-1.0, 0, -1.3]}>
        <RoundedBox args={[0.36, 0.54, 0.44]} radius={0.012} position={[0, 0.31, 0]} material={m.cabinet} {...cast} />
        {/* three drawers: the seams between them, a pull on each */}
        {[0.45, 0.31].map((y) => (
          <mesh key={y} position={[0, y, 0.221]} material={m.trim}>
            <boxGeometry args={[0.34, 0.004, 0.002]} />
          </mesh>
        ))}
        {[0.53, 0.4, 0.22].map((y) => (
          <mesh key={y} {...cast} position={[0, y, 0.228]} material={mats.black}>
            <boxGeometry args={[0.12, 0.012, 0.012]} />
          </mesh>
        ))}
        {[-0.14, 0.14].flatMap((x) =>
          [-0.17, 0.17].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.02, z]} rotation={[0, 0, Math.PI / 2]} material={mats.black}>
              <cylinderGeometry args={[0.02, 0.02, 0.02, 12]} />
            </mesh>
          )),
        )}
      </group>
      <group position={[0.8, 0, -1.25]}>
        {/* the case, open on its left side behind tempered glass, toward the room */}
        {(
          [
            [0.101, 0.246, 0, 0.008, 0.46, 0.44],
            [0, 0.472, 0, 0.21, 0.008, 0.44],
            [0, 0.02, 0, 0.21, 0.008, 0.44],
            [0, 0.246, -0.216, 0.21, 0.46, 0.008],
            [0, 0.246, 0.214, 0.21, 0.46, 0.012],
          ] as const
        ).map(([x, y, z, w, h, d], i) => (
          <mesh key={i} {...cast} position={[x, y, z]} material={m.tower}>
            <boxGeometry args={[w, h, d]} />
          </mesh>
        ))}
        <mesh position={[-0.1, 0.246, 0]} rotation={[0, -Math.PI / 2, 0]} material={m.glass}>
          <planeGeometry args={[0.43, 0.45]} />
        </mesh>
        {/* inside: the board, the cooler, two sticks of memory, the graphics card */}
        <mesh position={[0.095, 0.29, -0.03]} material={m.board}>
          <boxGeometry args={[0.004, 0.3, 0.3]} />
        </mesh>
        <mesh position={[0.06, 0.35, -0.06]} rotation={[0, 0, Math.PI / 2]} material={mats.housing}>
          <cylinderGeometry args={[0.045, 0.045, 0.06, 20]} />
        </mesh>
        <mesh position={[0.029, 0.35, -0.06]} rotation={[0, 0, Math.PI / 2]} material={m.fan}>
          <torusGeometry args={[0.036, 0.004, 6, 24]} />
        </mesh>
        {[0.02, 0.04].map((z) => (
          <mesh key={z} position={[0.08, 0.35, z]} material={m.ram}>
            <boxGeometry args={[0.03, 0.12, 0.006]} />
          </mesh>
        ))}
        <mesh {...cast} position={[0.04, 0.19, -0.02]} material={mats.housing}>
          <boxGeometry args={[0.11, 0.05, 0.3]} />
        </mesh>
        {[-0.1, 0.06].map((z) => (
          <mesh key={z} position={[0.04, 0.164, z]} rotation={[Math.PI / 2, 0, 0]} material={m.fan}>
            <torusGeometry args={[0.03, 0.004, 6, 20]} />
          </mesh>
        ))}
        {/* three intake fans behind the front, glowing softly at night */}
        {[0.37, 0.25, 0.13].map((y) => (
          <mesh key={y} position={[0, y, 0.205]} material={m.fan}>
            <torusGeometry args={[0.045, 0.006, 8, 28]} />
          </mesh>
        ))}
        <mesh position={[0.06, 0.477, 0.18]} material={m.led}>
          <cylinderGeometry args={[0.005, 0.005, 0.004, 8]} />
        </mesh>
        {[-0.08, 0.08].flatMap((x) =>
          [-0.18, 0.18].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.008, z]} material={mats.black}>
              <cylinderGeometry args={[0.018, 0.018, 0.016, 10]} />
            </mesh>
          )),
        )}
      </group>

      {/* ---------------- A bin by the desk, a crumpled note in it */}
      <group position={[1.32, 0, -0.8]}>
        <mesh {...cast} position={[0, 0.13, 0]} material={m.trim}>
          <cylinderGeometry args={[0.1, 0.085, 0.26, 24, 1, true]} />
        </mesh>
        <mesh position={[0, 0.006, 0]} material={m.trim}>
          <cylinderGeometry args={[0.085, 0.085, 0.012, 24]} />
        </mesh>
        <mesh castShadow position={[0.02, 0.21, 0.01]} material={m.paper}>
          <icosahedronGeometry args={[0.035, 0]} />
        </mesh>
        <mesh castShadow position={[-0.03, 0.2, -0.02]} material={m.noteYellow}>
          <icosahedronGeometry args={[0.025, 0]} />
        </mesh>
      </group>

      {/* ---------------- The window dressed: sill, a blind rolled near the top, curtains, the town outside */}
      <RoundedBox args={[0.16, 0.03, 1.62]} radius={0.006} position={[1.95, 0.955, -0.2]} material={mats.woodSmall} {...cast} />
      <Pot position={[1.93, 0.97, 0.38]} r={0.035} h={0.06} color="#c96f4a">
        <SnakePlant />
      </Pot>
      <group position={[1.97, 2.2, -0.2]}>
        <mesh {...cast} rotation={[Math.PI / 2, 0, 0]} material={m.blind}>
          <cylinderGeometry args={[0.03, 0.03, 1.5, 16]} />
        </mesh>
        <mesh {...cast} position={[0.004, -0.11, 0]} rotation={[0, -Math.PI / 2, 0]} material={m.blind}>
          <planeGeometry args={[1.48, 0.2]} />
        </mesh>
        <mesh {...cast} position={[0.004, -0.21, 0]} material={mats.woodSmall}>
          <boxGeometry args={[0.012, 0.016, 1.48]} />
        </mesh>
        <Rod a={[0.004, -0.21, 0]} b={[0.004, -0.36, 0]} r={0.002} material={m.trim} shadow={false} />
      </group>
      <Rod a={[1.92, 2.38, -1.35]} b={[1.92, 2.38, 0.95]} r={0.008} material={mats.black} />
      <group position={[1.9, 1.675, -1.1]} rotation={[0, -Math.PI / 2, 0]}>
        <Curtain width={0.26} height={1.4} folds={4} phase={0} still={still} />
      </group>
      <group position={[1.9, 1.675, 0.68]} rotation={[0, -Math.PI / 2, 0]}>
        <Curtain width={0.22} height={1.4} folds={3} phase={1.9} still={still} />
      </group>
      <group position={[2.13, 1.6, -0.2]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh material={view.sky}>
          <planeGeometry args={[1.6, 1.4]} />
        </mesh>
        <mesh position={[0, -0.05, 0.003]} material={view.lights} renderOrder={2}>
          <planeGeometry args={[1.6, 1.3]} />
        </mesh>
        <mesh position={[0, -0.05, 0.002]} material={view.skyline} renderOrder={1}>
          <planeGeometry args={[1.6, 1.3]} />
        </mesh>
        {/* the moon over the town's roofs in the right-hand pane, low enough to clear the blind from the camera's height */}
        <mesh position={[0.42, 0.12, 0.001]} material={view.moon} renderOrder={1}>
          <planeGeometry args={[0.36, 0.36]} />
        </mesh>
      </group>
      {/* the glass in the window, just inside the mullions */}
      <mesh position={[2.075, 1.6, -0.2]} rotation={[0, -Math.PI / 2, 0]} material={view.glass} renderOrder={5}>
        <planeGeometry args={[1.46, 1.24]} />
      </mesh>

      {/* ---------------- The front-right corner: a credenza, two prints over it, a floor lamp */}
      <group position={[1.84, 0, 0.98]}>
        <RoundedBox args={[0.3, 0.025, 0.56]} radius={0.006} position={[0, 0.56, 0]} material={mats.woodSmall} {...cast} />
        {/* a black carcass: its left cube open for the books, its right one closed behind a cane door */}
        {(
          [
            [0, 0.05, 0, 0.28, 0.02, 0.54],
            [0.13, 0.29, 0, 0.02, 0.5, 0.54],
            [0, 0.29, -0.26, 0.28, 0.5, 0.02],
            [0, 0.29, 0.26, 0.28, 0.5, 0.02],
            [0, 0.29, 0.0, 0.28, 0.5, 0.02],
          ] as const
        ).map(([x, y, z, w, h, d], i) => (
          <mesh key={i} {...cast} position={[x, y, z]} material={mats.black}>
            <boxGeometry args={[w, h, d]} />
          </mesh>
        ))}
        <mesh {...cast} position={[-0.142, 0.29, 0.135]} material={m.basket}>
          <boxGeometry args={[0.004, 0.46, 0.25]} />
        </mesh>
        <mesh position={[-0.146, 0.29, 0.03]} material={mats.metal}>
          <boxGeometry args={[0.006, 0.08, 0.008]} />
        </mesh>
        {[-0.2, 0.2].map((z) => (
          <Rod key={z} a={[0, 0.04, z]} b={[0, 0, z]} r={0.012} material={mats.metal} />
        ))}
        {/* on top: a stack of books, a small plant, a deck of cards */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} castShadow position={[0, 0.586 + i * 0.026, 0.12]} rotation={[0, 0.2 - i * 0.18, 0]}>
            <boxGeometry args={[0.16, 0.024, 0.22]} />
            <meshStandardMaterial color={['#e8e1d3', '#2f4a6b', '#c98a3a'][i]} roughness={0.8} />
          </mesh>
        ))}
        <Pot position={[0, 0.573, -0.17]} r={0.05} h={0.08} color="#ece6dc">
          <SnakePlant />
        </Pot>
        <RoundedBox args={[0.06, 0.02, 0.09]} radius={0.003} position={[0.02, 0.584, -0.02]} rotation={[0, 0.4, 0]} material={m.cable} castShadow />
      </group>
      {(
        [
          [0.95, 1.5, 0.28, 0.37, m.posterA],
          [1.25, 1.95, 0.24, 0.32, m.posterB],
        ] as const
      ).map(([z, y, w, h, mat]) => (
        <group key={z} position={[1.987, y, z]} rotation={[0, -Math.PI / 2, 0]}>
          <RoundedBox args={[w + 0.03, h + 0.03, 0.02]} radius={0.003} material={mats.black} castShadow />
          <mesh position={[0, 0, 0.0105]} material={mat}>
            <planeGeometry args={[w, h]} />
          </mesh>
        </group>
      ))}
      <group position={[1.72, 0, 1.38]}>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2 + 0.4;
          return <Rod key={i} a={[Math.cos(a) * 0.17, 0, Math.sin(a) * 0.17]} b={[0, 1.18, 0]} r={0.011} material={mats.woodSmall} />;
        })}
        <Rod a={[0, 1.16, 0]} b={[0, 1.42, 0]} r={0.008} material={mats.black} />
        <mesh castShadow position={[0, 1.48, 0]} material={m.shade}>
          <cylinderGeometry args={[0.15, 0.17, 0.24, 32, 1, true]} />
        </mesh>
        <mesh position={[0, 1.43, 0]} material={m.bulb}>
          <sphereGeometry args={[0.035, 14, 10]} />
        </mesh>
        <pointLight ref={lamp} position={[0, 1.4, 0]} color="#ffbf80" decay={2} distance={5.5} intensity={0} />
      </group>

      {/* ---------------- The front-left corner: a pouf, a side table with a book and a mug, a fig in a basket */}
      <Pouf position={[-0.98, 0, 1.18]} />
      <group position={[-1.82, 0, 0.42]}>
        <mesh {...cast} position={[0, 0.4, 0]} material={mats.woodSmall}>
          <cylinderGeometry args={[0.17, 0.17, 0.025, 32]} />
        </mesh>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2 + 0.3;
          return <Rod key={i} a={[Math.cos(a) * 0.1, 0.39, Math.sin(a) * 0.1]} b={[Math.cos(a) * 0.14, 0, Math.sin(a) * 0.14]} r={0.009} material={mats.black} />;
        })}
        <mesh castShadow position={[0.02, 0.425, 0.03]} rotation={[0, 0.5, 0]}>
          <boxGeometry args={[0.13, 0.022, 0.18]} />
          <meshStandardMaterial color="#a8442f" roughness={0.8} />
        </mesh>
        <group position={[-0.08, 0.413, -0.06]}>
          <mesh castShadow position={[0, 0.04, 0]} material={mats.cream}>
            <cylinderGeometry args={[0.032, 0.029, 0.08, 20]} />
          </mesh>
          <mesh position={[0.036, 0.04, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.cream}>
            <torusGeometry args={[0.02, 0.006, 8, 14, Math.PI]} />
          </mesh>
        </group>
      </group>
      <group position={[-1.86, 0, 1.36]}>
        <mesh {...cast} position={[0, 0.12, 0]} material={m.basket}>
          <cylinderGeometry args={[0.15, 0.12, 0.24, 24]} />
        </mesh>
        <Rod a={[0, 0.2, 0]} b={[0.02, 0.75, 0.01]} r={0.012} material={mats.woodSmall} />
        <FigCrown />
      </group>

      {/* ---------------- The back wall: a string of lights with polaroids, the clock, a floating shelf */}
      <StringLights bulbs={m.fairy} />
      <WallClock sample={sample} />
      <FloatingShelf mats={mats} frame={m.frame} photo={m.photo} />
      <Occlusion />

      {/* ---------------- On the desk */}
      {/* cameras on the riser, either side of the main monitor (from the reference) */}
      {(
        [
          [-0.6, 0.25],
          [0.2, -0.3],
        ] as const
      ).map(([x, ry]) => (
        <group key={x} position={[x, 0.92, -1.42]} rotation={[0, ry, 0]}>
          <RoundedBox args={[0.11, 0.066, 0.045]} radius={0.008} position={[0, 0.033, 0]} material={mats.black} castShadow />
          <RoundedBox args={[0.035, 0.014, 0.03]} radius={0.004} position={[-0.025, 0.07, 0]} material={mats.metal} castShadow />
          <mesh castShadow position={[0.012, 0.034, 0.04]} rotation={[Math.PI / 2, 0, 0]} material={mats.metal}>
            <cylinderGeometry args={[0.026, 0.028, 0.045, 20]} />
          </mesh>
          <mesh position={[0.012, 0.034, 0.063]} rotation={[Math.PI / 2, 0, 0]} material={m.lens}>
            <cylinderGeometry args={[0.019, 0.019, 0.002, 20]} />
          </mesh>
        </group>
      ))}
      {/* the phone on its wooden stand, by the tablet */}
      <group position={[0.92, 0.79, -1.02]} rotation={[0, -0.55, 0]}>
        <RoundedBox args={[0.07, 0.03, 0.05]} radius={0.006} position={[0, 0.015, 0]} material={mats.woodSmall} castShadow />
        <group position={[0, 0.085, -0.008]} rotation={[-0.3, 0, 0]}>
          <RoundedBox args={[0.068, 0.14, 0.008]} radius={0.004} material={mats.black} castShadow />
          <mesh position={[0, 0, 0.0045]} material={m.lens}>
            <planeGeometry args={[0.06, 0.13]} />
          </mesh>
        </group>
      </group>
      {/* a notebook and pen left of the keyboard, a cork coaster under the mug */}
      <group position={[-0.66, 0.802, -0.98]} rotation={[0, 0.18, 0]}>
        <RoundedBox args={[0.13, 0.014, 0.19]} radius={0.004} material={m.notebook} castShadow receiveShadow />
        <mesh position={[0.05, 0.0075, 0]} material={m.cable}>
          <boxGeometry args={[0.006, 0.002, 0.19]} />
        </mesh>
        <Rod a={[-0.03, 0.012, -0.07]} b={[0.0, 0.012, 0.075]} r={0.0045} material={mats.metal} />
      </group>
      <mesh receiveShadow position={[-0.95, 0.792, -1.0]} material={m.cork}>
        <cylinderGeometry args={[0.055, 0.055, 0.005, 24]} />
      </mesh>
      {/* sticky notes on the main monitor's edge */}
      <mesh position={[0.1, 1.335, -1.423]} rotation={[0, 0, 0.06]} material={m.noteYellow}>
        <planeGeometry args={[0.05, 0.05]} />
      </mesh>
      <mesh position={[0.103, 1.278, -1.4228]} rotation={[0, 0, -0.08]} material={m.notePink}>
        <planeGeometry args={[0.045, 0.045]} />
      </mesh>
      {/* the keyboard's coiled cable, up into the riser */}
      {!lite && (
        <mesh castShadow>
          <tubeGeometry
            args={[
              new THREE.CatmullRomCurve3([
                new THREE.Vector3(-0.2, 0.806, -1.07),
                new THREE.Vector3(-0.22, 0.8, -1.14),
                new THREE.Vector3(-0.33, 0.8, -1.2),
                new THREE.Vector3(-0.45, 0.83, -1.3),
                new THREE.Vector3(-0.42, 0.9, -1.335),
              ]),
              40,
              0.0045,
              6,
              false,
            ]}
          />
          <primitive object={m.cable} attach="material" />
        </mesh>
      )}
      {/* the lamp's cable to the back edge of the desk */}
      {!lite && (
        <mesh castShadow>
          <tubeGeometry
            args={[
              new THREE.CatmullRomCurve3([
                new THREE.Vector3(1.16, 0.795, -1.44),
                new THREE.Vector3(1.2, 0.794, -1.52),
                new THREE.Vector3(1.19, 0.79, -1.6),
                new THREE.Vector3(1.18, 0.6, -1.61),
                new THREE.Vector3(1.2, 0.02, -1.58),
              ]),
              30,
              0.004,
              6,
              false,
            ]}
          />
          <primitive object={m.cableDark} attach="material" />
        </mesh>
      )}
    </group>
  );
}
