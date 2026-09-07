import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, type MotionValue } from 'motion/react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';
import SocialLinks from '@components/ui/SocialLinks';
import ErrorBoundary from '@components/ui/ErrorBoundary';
import {
  ASPHALT,
  BEAM,
  BLUE_SPOT,
  FirstFrames,
  PACKET_CORE,
  SAFETY_YELLOW,
  SODIUM,
  STEEL,
  TARMAC,
  hasWebGL,
  useActiveDesign,
} from './scene';

/* ------------------------------------------------------------------ */
/* Scene constants: a highway interchange at 3 a.m.                     */
/* One elevated overpass crosses the frame on a diagonal, two ramps    */
/* loop down to the ground road, and the traffic is light.             */
/* ------------------------------------------------------------------ */

const UP = new THREE.Vector3(0, 1, 0);
const DECK_Y = 4.4;
const DECK_T = 0.55; // deck thickness

const CAMERA_STATES = [
  { pos: new THREE.Vector3(-14, 5.6, 20), look: new THREE.Vector3(8, 1.6, -5) }, // OVERPASS: on the deck, looking along it
  { pos: new THREE.Vector3(25, 19, 19), look: new THREE.Vector3(6, 0.5, -4) }, // RAMPS: above, the loops and their trails
  { pos: new THREE.Vector3(3, 1.1, 15), look: new THREE.Vector3(13.5, 4, -9) }, // INTERCHANGE: at ground level, under the deck
];
// A phone's portrait frame is narrow, so its states sit closer to the road:
// Overpass drives the deck itself, with the road ahead filling the lower half
// under the text; Ramps looks straight down on the loops.
const CAMERA_STATES_PHONE = [
  { pos: new THREE.Vector3(-12, 6.6, 11.6), look: new THREE.Vector3(2, 3.2, 1.5) },
  { pos: new THREE.Vector3(24, 26, 22), look: new THREE.Vector3(7, 0, -3) },
  { pos: new THREE.Vector3(3, 1.1, 15), look: new THREE.Vector3(13.5, 4, -9) },
];
// Where the camera starts on arrival: high and behind the first state, so
// the curtain's tunnel exit hands off to a glide down onto the overpass.
const ARRIVAL_POS = new THREE.Vector3(-18, 14, 30);

const STATE_LABELS: Record<'en' | 'pt', string[]> = {
  en: ['Overpass', 'Ramps', 'Interchange'],
  pt: ['Viaduto', 'Alças', 'Trevo'],
};

interface Road {
  curve: THREE.CatmullRomCurve3;
  width: number;
  elevated: boolean;
  /** Ramps carry one direction of traffic; through roads carry both. */
  oneWay: boolean;
}

const ROADS: Record<'overpass' | 'ground' | 'rampA' | 'rampB', Road> = {
  overpass: {
    curve: new THREE.CatmullRomCurve3([
      new THREE.Vector3(-30, DECK_Y, 26),
      new THREE.Vector3(-14, DECK_Y, 13),
      new THREE.Vector3(0, DECK_Y, 3),
      new THREE.Vector3(14, DECK_Y, -8),
      new THREE.Vector3(30, DECK_Y, -22),
      new THREE.Vector3(44, DECK_Y, -36),
    ]),
    width: 3.4,
    elevated: true,
    oneWay: false,
  },
  ground: {
    curve: new THREE.CatmullRomCurve3([
      new THREE.Vector3(-12, 0, -30),
      new THREE.Vector3(-1, 0, -13),
      new THREE.Vector3(7, 0, -1),
      new THREE.Vector3(14, 0, 10),
      new THREE.Vector3(22, 0, 24),
      new THREE.Vector3(30, 0, 40),
    ]),
    width: 3.8,
    elevated: false,
    oneWay: false,
  },
  // Leaves the overpass past the crossing, loops clockwise and down, joins the ground road heading out.
  rampA: {
    curve: new THREE.CatmullRomCurve3([
      new THREE.Vector3(15, DECK_Y - 0.02, -9.2),
      new THREE.Vector3(22, 3.9, -13.5),
      new THREE.Vector3(28, 3.0, -9),
      new THREE.Vector3(27.5, 2.0, -1),
      new THREE.Vector3(22, 1.0, 5),
      new THREE.Vector3(17, 0.35, 8.5),
      new THREE.Vector3(14.6, 0.02, 11.2),
    ]),
    width: 2.4,
    elevated: true,
    oneWay: true,
  },
  // Leaves the ground road before the crossing, loops counter-clockwise and up, joins the overpass.
  rampB: {
    curve: new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.5, 0.02, -12),
      new THREE.Vector3(-4, 0.35, -17),
      new THREE.Vector3(-11, 1.2, -16),
      new THREE.Vector3(-14, 2.4, -8),
      new THREE.Vector3(-10, 3.5, -1),
      new THREE.Vector3(-4, 4.2, 5),
      new THREE.Vector3(0.5, DECK_Y - 0.02, 2.4),
    ]),
    width: 2.4,
    elevated: true,
    oneWay: true,
  },
};

const smoothstep = (a: number, b: number, x: number) => {
  const v = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return v * v * (3 - 2 * v);
};

/* ------------------------------------------------------------------ */
/* Sweep: a rectangular section carried along a curve with a level     */
/* roll (up stays up), so decks and rails never twist on the loops.    */
/* ------------------------------------------------------------------ */

function sweepGeometry(
  curve: THREE.Curve<THREE.Vector3>,
  width: number,
  thickness: number,
  segments: number,
  sideOffset = 0,
  yOffset = 0
): THREE.BufferGeometry {
  const p = new THREE.Vector3();
  const tan = new THREE.Vector3();
  const side = new THREE.Vector3();
  const rails: number[][] = [[], [], [], []]; // top-left, top-right, bottom-right, bottom-left
  const hw = width / 2;
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    curve.getPointAt(u, p);
    curve.getTangentAt(u, tan);
    side.crossVectors(tan, UP).normalize();
    const cx = p.x + side.x * sideOffset;
    const cz = p.z + side.z * sideOffset;
    const yTop = p.y + yOffset;
    const yBot = yTop - thickness;
    rails[0].push(cx - side.x * hw, yTop, cz - side.z * hw);
    rails[1].push(cx + side.x * hw, yTop, cz + side.z * hw);
    rails[2].push(cx + side.x * hw, yBot, cz + side.z * hw);
    rails[3].push(cx - side.x * hw, yBot, cz - side.z * hw);
  }
  const positions: number[] = [];
  const indices: number[] = [];
  const faces: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
  ];
  let base = 0;
  for (const [a, b] of faces) {
    for (let i = 0; i <= segments; i++) {
      positions.push(
        rails[a][i * 3], rails[a][i * 3 + 1], rails[a][i * 3 + 2],
        rails[b][i * 3], rails[b][i * 3 + 1], rails[b][i * 3 + 2]
      );
    }
    for (let i = 0; i < segments; i++) {
      const i0 = base + i * 2;
      indices.push(i0, i0 + 1, i0 + 2, i0 + 1, i0 + 3, i0 + 2);
    }
    base += (segments + 1) * 2;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

/** Orient an instance so its +Z runs along the curve's tangent, roll level. */
function orientAlong(m: THREE.Matrix4, p: THREE.Vector3, tan: THREE.Vector3, scale: THREE.Vector3) {
  const rot = orientAlong.rot;
  orientAlong.eye.copy(p).add(tan);
  rot.lookAt(orientAlong.eye, p, UP);
  orientAlong.q.setFromRotationMatrix(rot);
  m.compose(p, orientAlong.q, scale);
}
orientAlong.rot = new THREE.Matrix4();
orientAlong.eye = new THREE.Vector3();
orientAlong.q = new THREE.Quaternion();

/* ------------------------------------------------------------------ */
/* Roads: deck, parapets, centre-line dashes, piers under the decks     */
/* ------------------------------------------------------------------ */

function Deck({ road, segments }: { road: Road; segments: number }) {
  const geo = useMemo(() => {
    const thickness = road.elevated ? DECK_T : 0.06;
    return sweepGeometry(road.curve, road.width, thickness, segments, 0, road.elevated ? 0 : 0.03);
  }, [road, segments]);
  const rails = useMemo(() => {
    if (!road.elevated) return null;
    const off = road.width / 2 - 0.09;
    return [
      sweepGeometry(road.curve, 0.14, 0.42, segments, -off, 0.42),
      sweepGeometry(road.curve, 0.14, 0.42, segments, off, 0.42),
    ];
  }, [road, segments]);
  useEffect(() => () => {
    geo.dispose();
    rails?.forEach((r) => r.dispose());
  }, [geo, rails]);
  return (
    <group>
      <mesh geometry={geo}>
        <meshStandardMaterial color={TARMAC} roughness={0.92} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>
      {rails?.map((r, i) => (
        <mesh key={i} geometry={r}>
          <meshStandardMaterial color={STEEL} roughness={0.7} metalness={0.4} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function LaneDashes({ road, spacing = 1.6 }: { road: Road; spacing?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = useMemo(() => Math.floor(road.curve.getLength() / spacing), [road, spacing]);
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const p = new THREE.Vector3();
    const tan = new THREE.Vector3();
    const s = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < count; i++) {
      const u = (i + 0.5) / count;
      road.curve.getPointAt(u, p);
      road.curve.getTangentAt(u, tan);
      p.y += road.elevated ? 0.012 : 0.045;
      orientAlong(m, p, tan, s);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [road, count]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[0.07, 0.01, 0.75]} />
      <meshBasicMaterial color={SAFETY_YELLOW} toneMapped={false} transparent opacity={0.8} />
    </instancedMesh>
  );
}

interface Pier { pos: THREE.Vector3; tan: THREE.Vector3; height: number; width: number }

function Piers({ roads, spacing }: { roads: Road[]; spacing: number }) {
  const shafts = useRef<THREE.InstancedMesh>(null);
  const caps = useRef<THREE.InstancedMesh>(null);
  const piers = useMemo<Pier[]>(() => {
    const list: Pier[] = [];
    for (const road of roads) {
      if (!road.elevated) continue;
      const n = Math.max(1, Math.floor(road.curve.getLength() / spacing));
      for (let i = 0; i <= n; i++) {
        const u = (i + 0.5) / (n + 1);
        const p = road.curve.getPointAt(u);
        const h = p.y - DECK_T;
        if (h < 0.55) continue;
        list.push({ pos: p, tan: road.curve.getTangentAt(u), height: h, width: road.width });
      }
    }
    return list;
  }, [roads, spacing]);

  useEffect(() => {
    const sh = shafts.current;
    const cp = caps.current;
    if (!sh || !cp) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const pos = new THREE.Vector3();
    piers.forEach((pier, i) => {
      pos.set(pier.pos.x, pier.height / 2, pier.pos.z);
      s.set(1, pier.height, 1);
      m.compose(pos, q, s);
      sh.setMatrixAt(i, m);
      pos.set(pier.pos.x, pier.height - 0.18, pier.pos.z);
      s.set(pier.width + 0.3, 1, 1);
      orientAlong(m, pos, pier.tan, s);
      cp.setMatrixAt(i, m);
    });
    sh.instanceMatrix.needsUpdate = true;
    cp.instanceMatrix.needsUpdate = true;
  }, [piers]);

  return (
    <group>
      <instancedMesh ref={shafts} args={[undefined, undefined, piers.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.34, 0.42, 1, 12]} />
        <meshStandardMaterial color={STEEL} roughness={0.85} metalness={0.1} />
      </instancedMesh>
      <instancedMesh ref={caps} args={[undefined, undefined, piers.length]} frustumCulled={false}>
        <boxGeometry args={[1, 0.36, 0.7]} />
        <meshStandardMaterial color={BEAM} roughness={0.8} metalness={0.15} />
      </instancedMesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Light: sodium lamp posts along the overpass (five of them are real  */
/* point lights), one blue work light where the night crew is, and the */
/* traffic's own glow. Ambient stays at floor level.                    */
/* ------------------------------------------------------------------ */

const LAMP_H = 3.4;

function LampPosts({ road, count, lit }: { road: Road; count: number; lit: number[] }) {
  const poles = useRef<THREE.InstancedMesh>(null);
  const arms = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  const posts = useMemo(() => {
    const list: { base: THREE.Vector3; head: THREE.Vector3; tan: THREE.Vector3; side: THREE.Vector3 }[] = [];
    const side = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const u = (i + 0.5) / count;
      const p = road.curve.getPointAt(u);
      const tan = road.curve.getTangentAt(u);
      side.crossVectors(tan, UP).normalize();
      const off = road.width / 2 + 0.05;
      const base = new THREE.Vector3(p.x + side.x * off, p.y, p.z + side.z * off);
      const head = new THREE.Vector3(base.x - side.x * 1.1, p.y + LAMP_H, base.z - side.z * 1.1);
      list.push({ base, head, tan, side: side.clone() });
    }
    return list;
  }, [road, count]);

  useEffect(() => {
    const po = poles.current;
    const ar = arms.current;
    const he = heads.current;
    if (!po || !ar || !he) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1, 1, 1);
    const pos = new THREE.Vector3();
    const dir = new THREE.Vector3();
    posts.forEach((post, i) => {
      pos.set(post.base.x, post.base.y + LAMP_H / 2, post.base.z);
      m.compose(pos, q, s);
      po.setMatrixAt(i, m);
      pos.set(post.base.x - post.side.x * 0.55, post.base.y + LAMP_H - 0.02, post.base.z - post.side.z * 0.55);
      dir.copy(post.side).negate();
      orientAlong(m, pos, dir, s);
      ar.setMatrixAt(i, m);
      orientAlong(m, post.head, post.tan, s);
      he.setMatrixAt(i, m);
    });
    po.instanceMatrix.needsUpdate = true;
    ar.instanceMatrix.needsUpdate = true;
    he.instanceMatrix.needsUpdate = true;
  }, [posts]);

  return (
    <group>
      <instancedMesh ref={poles} args={[undefined, undefined, posts.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.05, 0.07, LAMP_H, 8]} />
        <meshStandardMaterial color={STEEL} roughness={0.7} metalness={0.5} />
      </instancedMesh>
      <instancedMesh ref={arms} args={[undefined, undefined, posts.length]} frustumCulled={false}>
        <boxGeometry args={[0.06, 0.06, 1.1]} />
        <meshStandardMaterial color={STEEL} roughness={0.7} metalness={0.5} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, posts.length]} frustumCulled={false}>
        <boxGeometry args={[0.26, 0.12, 0.56]} />
        <meshBasicMaterial color={SODIUM} toneMapped={false} fog={false} />
      </instancedMesh>
      {lit.map((i) =>
        posts[i] ? (
          <pointLight
            key={i}
            position={[posts[i].head.x, posts[i].head.y - 0.1, posts[i].head.z]}
            color={SODIUM}
            intensity={380}
            distance={30}
            decay={2}
          />
        ) : null
      )}
    </group>
  );
}

function WorkLight({ still }: { still: boolean }) {
  const spot = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const base = useMemo(() => new THREE.Vector3(10.5, 0, 3.2), []);
  useFrame(({ clock }) => {
    const s = spot.current;
    if (!s) return;
    const tm = still ? 0 : clock.elapsedTime * 0.35;
    // The crew pans the light slowly across the crossing.
    target.position.set(base.x - 4 + Math.sin(tm) * 3.2, 0.2, base.z - 6 + Math.cos(tm * 0.6) * 2.4);
    target.updateMatrixWorld();
  });
  const cones = useMemo(
    () => [
      [8.6, 0, 3.6],
      [9.4, 0, 5.1],
      [10.3, 0, 6.6],
      [7.5, 0, 1.9],
      [11.9, 0, 4.4],
    ],
    []
  );
  return (
    <group>
      {/* Light tower: mast, cross-bar, head */}
      <mesh position={[base.x, 1.7, base.z]}>
        <cylinderGeometry args={[0.05, 0.08, 3.4, 8]} />
        <meshStandardMaterial color={STEEL} roughness={0.7} metalness={0.5} />
      </mesh>
      <mesh position={[base.x, 0.16, base.z]}>
        <boxGeometry args={[1.1, 0.06, 1.1]} />
        <meshStandardMaterial color={STEEL} roughness={0.8} metalness={0.4} />
      </mesh>
      <mesh position={[base.x, 3.45, base.z]} rotation={[0.55, -0.7, 0]}>
        <boxGeometry args={[0.7, 0.4, 0.22]} />
        <meshBasicMaterial color={BLUE_SPOT} toneMapped={false} fog={false} />
      </mesh>
      <spotLight
        ref={spot}
        position={[base.x, 3.4, base.z]}
        color={BLUE_SPOT}
        intensity={700}
        angle={0.55}
        penumbra={0.9}
        distance={30}
        decay={2}
        target={target}
      />
      <primitive object={target} />
      {cones.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y + 0.24, z]}>
          <coneGeometry args={[0.17, 0.48, 10]} />
          <meshStandardMaterial color={SAFETY_YELLOW} roughness={0.6} emissive={SAFETY_YELLOW} emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Traffic: long-exposure trails. Each vehicle is a bright short streak */
/* inside a dimmer long one, with a blue halo at the head.              */
/* ------------------------------------------------------------------ */

interface Vehicle { road: Road; t: number; dir: 1 | -1; speed: number; hidden: number }

const TRAIL_L = 5.2;
const HALO = 1.35;
const CORE = 0.42;

/* Two crossed quads, unit length along +z: a streak that reads from any angle. */
function crossQuads(): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array([
    -0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 0, 0.5, -0.5, 0, 0.5,
    0, -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5,
  ]);
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]);
  return g;
}

const TRAIL_VERT = /* glsl */ `
  varying vec3 vPos;
  void main() {
    vPos = position;
    #ifdef USE_INSTANCING
      vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    #else
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
    #endif
    gl_Position = projectionMatrix * mv;
  }`;
/* Brightest at the head (+z), fading down the tail, soft across the width. */
const TRAIL_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vPos;
  void main() {
    float along = clamp(vPos.z + 0.5, 0.0, 1.0);
    float across = 1.0 - smoothstep(0.0, 0.5, max(abs(vPos.x), abs(vPos.y)));
    float a = pow(along, 1.4) * across * across;
    gl_FragColor = vec4(uColor * a, a * uOpacity);
  }`;
/* A camera-facing quad the size of its instance, with a radial falloff and no silhouette. */
const GLOW_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    #ifdef USE_INSTANCING
      mat4 im = instanceMatrix;
    #else
      mat4 im = mat4(1.0);
    #endif
    vec4 center = modelViewMatrix * im * vec4(0.0, 0.0, 0.0, 1.0);
    float s = length(im[0].xyz);
    gl_Position = projectionMatrix * (center + vec4(position.xy * s, 0.0, 0.0));
  }`;
const GLOW_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uPower;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = pow(clamp(1.0 - d, 0.0, 1.0), uPower);
    gl_FragColor = vec4(uColor * a, a * uOpacity);
  }`;

function lightMaterial(vertexShader: string, fragmentShader: string, color: string, opacity: number, power = 2) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity }, uPower: { value: power } },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

function Traffic({ counts, still }: { counts: Record<keyof typeof ROADS, number>; still: boolean }) {
  const trail = useRef<THREE.InstancedMesh>(null);
  const halo = useRef<THREE.InstancedMesh>(null);
  const core = useRef<THREE.InstancedMesh>(null);
  const vehicles = useMemo<Vehicle[]>(() => {
    const list: Vehicle[] = [];
    (Object.keys(counts) as (keyof typeof ROADS)[]).forEach((key) => {
      const road = ROADS[key];
      for (let i = 0; i < counts[key]; i++) {
        list.push({
          road,
          t: Math.random(),
          dir: road.oneWay ? 1 : Math.random() < 0.5 ? 1 : -1,
          speed: 4.5 + Math.random() * 3.5,
          hidden: 0,
        });
      }
    });
    return list;
  }, [counts]);
  const total = vehicles.length;
  const geo = useMemo(() => ({ trail: crossQuads(), quad: new THREE.PlaneGeometry(1, 1) }), []);
  const mat = useMemo(
    () => ({
      trail: lightMaterial(TRAIL_VERT, TRAIL_FRAG, PACKET_CORE, 1),
      halo: lightMaterial(GLOW_VERT, GLOW_FRAG, BLUE_SPOT, 0.95, 2.2),
      core: lightMaterial(GLOW_VERT, GLOW_FRAG, PACKET_CORE, 1, 1.6),
    }),
    []
  );
  useEffect(
    () => () => {
      geo.trail.dispose();
      geo.quad.dispose();
      mat.trail.dispose();
      mat.halo.dispose();
      mat.core.dispose();
    },
    [geo, mat]
  );
  const m = useMemo(() => new THREE.Matrix4(), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  const tan = useMemo(() => new THREE.Vector3(), []);
  const heading = useMemo(() => new THREE.Vector3(), []);
  const side = useMemo(() => new THREE.Vector3(), []);
  const c = useMemo(() => new THREE.Vector3(), []);
  const s = useMemo(() => new THREE.Vector3(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);

  useFrame((_, delta) => {
    const tr = trail.current;
    const ha = halo.current;
    const co = core.current;
    if (!tr || !ha || !co) return;
    const dt = still ? 0 : Math.min(delta, 0.05);
    vehicles.forEach((v, i) => {
      const len = v.road.curve.getLength();
      if (v.hidden > 0) {
        v.hidden -= dt;
        if (v.hidden <= 0) v.t = v.dir === 1 ? 0 : 1;
      } else {
        v.t += (v.dir * v.speed * dt) / len;
        if (v.t > 1 || v.t < 0) {
          if (v.road.oneWay) {
            v.hidden = 0.8 + Math.random() * 2.2;
          } else {
            v.t = v.t > 1 ? v.t - 1 : v.t + 1;
          }
        }
      }
      const visible = v.hidden <= 0;
      const u = Math.min(1, Math.max(0, v.t));
      v.road.curve.getPointAt(u, p);
      v.road.curve.getTangentAt(u, tan);
      heading.copy(tan).multiplyScalar(v.dir);
      side.crossVectors(tan, UP).normalize();
      const lane = v.road.oneWay ? 0 : v.dir * (v.road.width * 0.22);
      p.addScaledVector(side, lane);
      p.y += 0.18;
      const k = visible ? 1 : 0.0001;

      c.copy(p).addScaledVector(heading, -(TRAIL_L / 2 - 0.12));
      s.set(k * 0.34, k * 0.26, k * TRAIL_L);
      orientAlong(m, c, heading, s);
      tr.setMatrixAt(i, m);

      s.set(k * HALO, k * HALO, k * HALO);
      m.compose(p, q, s);
      ha.setMatrixAt(i, m);

      s.set(k * CORE, k * CORE, k * CORE);
      m.compose(p, q, s);
      co.setMatrixAt(i, m);
    });
    tr.instanceMatrix.needsUpdate = true;
    ha.instanceMatrix.needsUpdate = true;
    co.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={trail} args={[geo.trail, mat.trail, total]} frustumCulled={false} />
      <instancedMesh ref={halo} args={[geo.quad, mat.halo, total]} frustumCulled={false} />
      <instancedMesh ref={core} args={[geo.quad, mat.core, total]} frustumCulled={false} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Gantry: the overhead sign from the curtain, standing over the deck.  */
/* Its plate carries the name, drawn once the display face has loaded.  */
/* ------------------------------------------------------------------ */

function useSignTexture(name: string) {
  const [tex, setTex] = useState<THREE.CanvasTexture | null>(null);
  useEffect(() => {
    let alive = true;
    let made: THREE.CanvasTexture | null = null;
    const draw = () => {
      if (!alive) return;
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 384;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      // The plate is lit from its two sodium heads: warm at the top, asphalt at the foot
      const wash = ctx.createLinearGradient(0, 0, 0, c.height);
      wash.addColorStop(0, '#4a3b2a');
      wash.addColorStop(0.55, '#2a2a2b');
      wash.addColorStop(1, '#1e2125');
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, c.width, c.height);
      for (const x of [c.width * 0.3, c.width * 0.72]) {
        const glow = ctx.createRadialGradient(x, 0, 0, x, 0, c.height * 0.9);
        glow.addColorStop(0, 'rgba(255, 154, 46, 0.45)');
        glow.addColorStop(1, 'rgba(255, 154, 46, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, c.width, c.height);
      }
      ctx.strokeStyle = '#4b4a45';
      ctx.lineWidth = 10;
      ctx.strokeRect(26, 26, c.width - 52, c.height - 52);
      const text = name.toUpperCase();
      let size = 180;
      const font = (px: number) => `700 ${px}px "Barlow Condensed", "Arial Narrow", sans-serif`;
      ctx.font = font(size);
      while (ctx.measureText(text).width > 880 && size > 80) {
        size -= 8;
        ctx.font = font(size);
      }
      ctx.fillStyle = '#f2ece0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, c.width / 2, c.height / 2 + size * 0.06);
      made = new THREE.CanvasTexture(c);
      made.colorSpace = THREE.SRGBColorSpace;
      made.anisotropy = 4;
      setTex(made);
    };
    const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(draw, draw);
    return () => {
      alive = false;
      made?.dispose();
    };
  }, [name]);
  return tex;
}

function Gantry({ road, u, name }: { road: Road; u: number; name: string }) {
  const { pos, quat } = useMemo(() => {
    const point = road.curve.getPointAt(u);
    const back = road.curve.getTangentAt(u).negate(); // the face reads to traffic coming up the deck
    const m = new THREE.Matrix4();
    orientAlong(m, point, back, new THREE.Vector3(1, 1, 1));
    return { pos: point, quat: new THREE.Quaternion().setFromRotationMatrix(m) };
  }, [road, u]);
  const sign = useSignTexture(name);
  const hw = road.width / 2 + 0.4;
  return (
    <group position={pos} quaternion={quat}>
      {[-hw, hw].map((x) => (
        <mesh key={x} position={[x, 2.1, 0]}>
          <boxGeometry args={[0.16, 4.2, 0.16]} />
          <meshStandardMaterial color={STEEL} roughness={0.7} metalness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 4.2, 0]}>
        <boxGeometry args={[hw * 2 + 0.16, 0.24, 0.3]} />
        <meshStandardMaterial color={STEEL} roughness={0.7} metalness={0.5} />
      </mesh>
      <mesh position={[0.3, 3.45, 0]}>
        <boxGeometry args={[2.5, 1.0, 0.08]} />
        <meshStandardMaterial color="#1e2125" roughness={0.6} metalness={0.2} />
      </mesh>
      {sign && (
        <mesh position={[0.3, 3.45, 0.045]}>
          <planeGeometry args={[2.4, 0.9]} />
          <meshBasicMaterial map={sign} toneMapped={false} />
        </mesh>
      )}
      {[-0.7, 1.3].map((x) => (
        <mesh key={x} position={[x, 4.02, 0.24]}>
          <boxGeometry args={[0.26, 0.1, 0.14]} />
          <meshBasicMaterial color={SODIUM} toneMapped={false} fog={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Camera rig: one control (scroll) through three named states.        */
/* Desktop scrubs continuously; phones step between the states.        */
/* ------------------------------------------------------------------ */

function CameraRig({ progress, still }: { progress: MotionValue<number>; still: boolean }) {
  const { camera, size } = useThree();
  const stepped = size.width < 768;
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const targetLook = useMemo(() => new THREE.Vector3(), []);
  const currentLook = useMemo(() => CAMERA_STATES[0].look.clone(), []);

  useEffect(() => {
    const first = stepped ? CAMERA_STATES_PHONE[0] : CAMERA_STATES[0];
    camera.position.copy(still ? first.pos : ARRIVAL_POS);
    currentLook.copy(first.look);
    camera.lookAt(first.look);
  }, [camera, still, stepped, currentLook]);

  useFrame(() => {
    const p = still ? 0 : progress.get();
    if (stepped) {
      const idx = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
      targetPos.copy(CAMERA_STATES_PHONE[idx].pos);
      targetLook.copy(CAMERA_STATES_PHONE[idx].look);
    } else if (p < 0.5) {
      const k = smoothstep(0, 0.5, p);
      targetPos.lerpVectors(CAMERA_STATES[0].pos, CAMERA_STATES[1].pos, k);
      targetLook.lerpVectors(CAMERA_STATES[0].look, CAMERA_STATES[1].look, k);
    } else {
      const k = smoothstep(0.5, 1, p);
      targetPos.lerpVectors(CAMERA_STATES[1].pos, CAMERA_STATES[2].pos, k);
      targetLook.lerpVectors(CAMERA_STATES[1].look, CAMERA_STATES[2].look, k);
    }
    camera.position.lerp(targetPos, 0.08);
    currentLook.lerp(targetLook, 0.08);
    camera.lookAt(currentLook);
  });
  return null;
}

function InterchangeScene({ progress, still, name }: { progress: MotionValue<number>; still: boolean; name: string }) {
  const { size } = useThree();
  const mobile = size.width < 768;
  const segments = mobile ? 90 : 180;
  const elevated = useMemo(() => [ROADS.overpass, ROADS.rampA, ROADS.rampB], []);
  const counts = useMemo(
    () =>
      mobile
        ? { overpass: 6, ground: 4, rampA: 1, rampB: 1 }
        : { overpass: 16, ground: 9, rampA: 3, rampB: 3 },
    [mobile]
  );
  return (
    <>
      {!mobile && <fog attach="fog" args={[ASPHALT, 20, 76]} />}
      <ambientLight intensity={0.14} />
      {/* Ground: the page's own asphalt, so the scene has no edge */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]}>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color={ASPHALT} roughness={0.98} metalness={0.02} />
      </mesh>
      {(Object.values(ROADS) as Road[]).map((road, i) => (
        <group key={i}>
          <Deck road={road} segments={segments} />
          <LaneDashes road={road} />
        </group>
      ))}
      <Piers roads={elevated} spacing={mobile ? 7 : 5.5} />
      <LampPosts road={ROADS.overpass} count={mobile ? 8 : 12} lit={mobile ? [2, 4, 6] : [1, 3, 5, 7, 9, 11]} />
      <LampPosts road={ROADS.ground} count={mobile ? 5 : 8} lit={mobile ? [2] : [2, 5]} />
      <Gantry road={ROADS.overpass} u={0.4} name={name} />
      <WorkLight still={still} />
      <Traffic counts={counts} still={still} />
      <CameraRig progress={progress} still={still} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Without WebGL: the road at night as CSS, a dark ground with one     */
/* diagonal lane of safety-yellow dashes.                              */
/* ------------------------------------------------------------------ */

function RoadFallback() {
  return (
    <div
      className="absolute inset-0"
      aria-hidden="true"
      style={{
        background:
          'linear-gradient(180deg, #17191c 0%, #1b1e22 45%, #23262a 100%), repeating-linear-gradient(118deg, transparent 0 48px, rgba(245,196,0,0.35) 48px 50px)',
        backgroundBlendMode: 'normal, screen',
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function NightshiftHeroInner() {
  const locale = useLocale();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [drawn, setDrawn] = useState(false);
  const [stateIdx, setStateIdx] = useState(0);
  const reduced = useReducedMotion();
  const active = useActiveDesign('nightshift');
  const still = !!reduced;

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  useEffect(() => {
    setMounted(true);
    setWebgl(hasWebGL());
  }, []);

  // The curtain's tunnel exit waits for this: the scene has drawn (or there is
  // no scene to wait for). Cleared whenever the world goes inactive.
  const sceneReady = active && (drawn || (mounted && !webgl));
  useEffect(() => {
    if (!sceneReady) return;
    document.documentElement.dataset.scene = 'drawn';
    return () => {
      delete document.documentElement.dataset.scene;
    };
  }, [sceneReady]);
  useEffect(() => {
    if (!active) setDrawn(false);
  }, [active]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = v < 0.33 ? 0 : v < 0.66 ? 1 : 2;
    setStateIdx((prev) => (prev === idx ? prev : idx));
  });

  const labels = STATE_LABELS[locale];
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
  });

  return (
    <div ref={sectionRef} className="relative h-[150vh] md:h-[200vh]">
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-hidden">
        {/* Scene: mounted only while this world is active, so hidden worlds never burn a render loop */}
        {mounted && active && webgl ? (
          <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: drawn ? 1 : 0 }}>
            <Canvas
              dpr={[1, 1.5]}
              camera={{ fov: 52, near: 0.1, far: 140, position: ARRIVAL_POS.toArray() }}
              gl={{ antialias: true, powerPreference: 'high-performance' }}
              style={{ background: 'transparent' }}
            >
              <InterchangeScene progress={scrollYProgress} still={still} name={t('hero.name', locale)} />
              <FirstFrames onReady={() => setDrawn(true)} />
            </Canvas>
          </div>
        ) : mounted ? (
          <RoadFallback />
        ) : null}

        {/* Keeps the text legible over the road without killing the scene: a top-down
            wash on phones (the road runs under the text), left-to-right from 768px */}
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-bg from-40% via-bg/75 via-60% to-transparent to-90% md:bg-linear-to-r md:from-0% md:via-bg/70 md:via-50% md:to-100%"
          aria-hidden="true"
        />

        {/* Text column */}
        <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl items-start px-6 pt-14 md:items-center md:px-12 md:pt-0">
          <div className="w-full md:w-[40%]">
            <motion.h1
              {...rise(0.1)}
              className="font-heading text-[clamp(2.5rem,6vw,6rem)] font-bold uppercase leading-[0.9] tracking-[-0.01em] text-text"
            >
              {t('hero.name', locale)}
            </motion.h1>

            <motion.p
              {...rise(0.25)}
              className="mt-5 font-body text-xl font-medium uppercase tracking-[0.08em] text-text-secondary"
            >
              {t('hero.title', locale)}
            </motion.p>

            <motion.p {...rise(0.4)} className="mt-4 max-w-md font-body text-base leading-relaxed text-text-secondary">
              {t('hero.tagline', locale)}
            </motion.p>

            <motion.div {...rise(0.55)} className="mt-8 flex flex-wrap gap-3">
              <a
                href="#projects"
                className="rounded-btn border border-border px-6 py-3 font-heading text-sm font-bold uppercase tracking-[0.06em] text-text transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {t('hero.cta.work', locale)}
              </a>
              {/* Dock plate: a chamfered steel plate with a stamped seam; its shutter rolls up when pushed */}
              <a
                href="/resume/Alexandre_Akira_en_CV.pdf"
                download
                className="group relative inline-flex items-center gap-3 bg-accent py-3 pl-4 pr-6 font-heading text-sm font-bold uppercase tracking-[0.06em] text-bg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                style={{ clipPath: 'polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px)' }}
              >
                <span aria-hidden="true" className="pointer-events-none absolute inset-[3px] border border-bg/35" />
                <span aria-hidden="true" className="relative block h-4 w-4 shrink-0 overflow-hidden border-2 border-current">
                  <span className="absolute inset-x-[2px] top-[2px] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-2 group-focus-visible:-translate-y-2">
                    <span className="block h-0.5 w-full bg-current" />
                    <span className="mt-0.5 block h-0.5 w-full bg-current" />
                    <span className="mt-0.5 block h-0.5 w-full bg-current" />
                  </span>
                </span>
                <span className="relative">{t('hero.cta.cv', locale)}</span>
              </a>
            </motion.div>

            <SocialLinks delay={0.8} className="mt-8" />
          </div>
        </div>

        {/* Live camera state: honest mono, this is a readout */}
        <motion.div
          {...rise(0.9)}
          className="absolute bottom-6 left-6 z-10 flex items-center gap-3 border-l border-border pl-3 font-mono text-xs uppercase tracking-[0.1em] text-text-secondary md:left-12"
          aria-live="polite"
        >
          <span className="block h-2 w-2 bg-accent" aria-hidden="true" />
          <span>{labels[stateIdx]}</span>
        </motion.div>
      </div>
    </div>
  );
}

export default function NightshiftHero() {
  return (
    <ErrorBoundary>
      <NightshiftHeroInner />
    </ErrorBoundary>
  );
}
