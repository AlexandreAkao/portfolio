/**
 * Akira seated, as a painted miniature: dark fringe swept to his right, round
 * gold wire glasses, the #0B3D2E tee with a small </> on the chest. Faces +z in
 * local space (the chair turns him). Modelled in turned and tapered shapes: a
 * tee with sloped shoulders and a banded hem, sleeves, arms narrowing to elbow
 * and wrist, hands with a thumb, knees, cuffed jeans, sneakers on a sole, hair
 * in locks down to the nape, a glint in each eye. Six poses as joint tables,
 * blended from one station's pose to the next by the day sample; each rigid
 * part folds its pieces into a few draws (StaticMerge).
 */
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { DaySample, Pose } from '../day';
import StaticMerge from './StaticMerge';
import { BEAM_LAYER } from './Sunbeam';

const SKIN = '#ebbd98';
const HAIR = '#1b1716';
const SHIRT = '#0b3d2e';
const JEANS = '#2c3a55';
const SHOE = '#efebe3';
const WIRE = '#c79b58';

const SPHERE = new THREE.SphereGeometry(1, 28, 18);
const SPHERE_FINE = new THREE.SphereGeometry(1, 40, 28);

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * The fringe, swept to his right (-x): from the parting over his left brow, locks
 * run across the forehead and drop to his right temple, each laid tangent to the
 * head (in the head's local frame, where the face is the skin ellipsoid and the
 * hair cap sits over it). Each lock: [t0, t1] along the sweep, its width, its
 * thickness and how far above the sweep it rides.
 */
const FRINGE = (() => {
  const skin = (x: number, y: number) => 0.02 + 0.32 * Math.sqrt(Math.max(0, 1 - (x / 0.315) ** 2 - (y / 0.36) ** 2));
  const cap = (x: number, y: number) => -0.06 + 0.35 * Math.sqrt(Math.max(0, 1 - (x / 0.335) ** 2 - ((y - 0.1) / 0.33) ** 2));
  const head = (x: number, y: number) => Math.max(skin(x, y), cap(x, y));
  // The sweep: across and down, falling faster toward the temple
  const at = (t: number, lift: number) => {
    const x = 0.16 - 0.4 * t;
    const y = 0.31 - 0.05 * t - 0.11 * t * t + lift;
    return new THREE.Vector3(x, y, head(x, y));
  };
  const locks: [number, number, number, number, number][] = [
    [-0.05, 0.42, 0.08, 0.05, 0.03],
    [0.0, 0.5, 0.075, 0.05, 0.0],
    [0.28, 0.74, 0.07, 0.048, 0.005],
    [0.52, 0.94, 0.06, 0.044, 0.0],
    [0.74, 1.06, 0.045, 0.036, -0.004],
  ];
  const e = 0.002;
  return locks.map(([t0, t1, width, thick, lift]) => {
    const a = at(t0, lift);
    const b = at(t1, lift);
    const c = at((t0 + t1) / 2, lift);
    const tangent = b.clone().sub(a);
    const length = tangent.length();
    tangent.normalize();
    // The head's normal at the lock's middle, kept square to the lock
    const normal = new THREE.Vector3((head(c.x - e, c.y) - head(c.x + e, c.y)) / (2 * e), (head(c.x, c.y - e) - head(c.x, c.y + e)) / (2 * e), 1)
      .normalize()
      .projectOnPlane(tangent)
      .normalize();
    const side = new THREE.Vector3().crossVectors(tangent, normal);
    const quaternion = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(tangent, normal, side));
    return {
      position: c.addScaledVector(normal, thick * 0.35).toArray() as [number, number, number],
      quaternion,
      scale: [length / 2, thick, width] as [number, number, number],
    };
  });
})();

/**
 * Joint angles in radians. Arms are [upper x, upper z] and [fore x, fore z]; his right arm sits at -x.
 * Hands are [roll, curl]: the roll turns the hand about the forearm (±π/2 is palm down on the keys),
 * the curl bends the four fingers toward the palm (0 is an open hand).
 */
interface Joints {
  torso: [lean: number, twist: number];
  head: [x: number, y: number, z: number];
  armR: [number, number];
  foreR: [number, number];
  armL: [number, number];
  foreL: [number, number];
  handR: [roll: number, curl: number];
  handL: [roll: number, curl: number];
  /** Legs: the hip's pitch (+ lowers the knee) and yaw (+ turns the knee toward +x), the knee's bend (− swings the foot forward). */
  legR: [pitch: number, yaw: number, knee: number];
  legL: [pitch: number, yaw: number, knee: number];
}

const HANDS_ON_KEYS = {
  armR: [-0.62, 0.12],
  foreR: [-1.2, 0],
  armL: [-0.62, -0.12],
  foreL: [-1.2, 0],
  handR: [Math.PI / 2, 0.55],
  handL: [-Math.PI / 2, 0.55],
  legR: [0, 0, 0],
  legL: [0, 0, 0],
} satisfies Partial<Joints>;

const POSES: Record<Pose, Joints> = {
  typing: { torso: [0.16, 0], head: [0.08, 0, 0], ...HANDS_ON_KEYS },
  // Upright, reading the screen, the mug at his chin. It sits in his left hand,
  // the one on the camera's side at every station, so the mug reads.
  coffee: { torso: [0.02, 0], head: [0.04, 0, 0], ...HANDS_ON_KEYS, armL: [-0.95, -0.15], foreL: [-1.95, 0], handL: [-Math.PI / 2, 1.15] },
  // Hands stay on the keys, head tipped back to the wall monitor
  lookUp: { torso: [0, 0], head: [-0.46, 0, 0], ...HANDS_ON_KEYS },
  // Leaning back, left hand loosely closed at the chin
  think: { torso: [-0.14, 0.12], head: [0.05, -0.08, 0.14], ...HANDS_ON_KEYS, armL: [-1.05, -0.42], foreL: [-2.15, 0], handL: [-Math.PI / 2, 1.2] },
  // Forearms forward and up, holding an open book over the lap, head down to it
  reading: { torso: [0.15, 0], head: [0.34, 0, 0], armR: [-0.32, 0.3], foreR: [-1.65, 0.08], armL: [-0.32, -0.3], foreL: [-1.65, 0.08], handR: [Math.PI / 2, 0.9], handL: [-Math.PI / 2, 0.9], legR: [0, 0, 0], legL: [0, 0, 0] },
  // Turned to the visitor at the end of the day, settled back in the chair: the right upper arm out to
  // the side, the forearm up, the open palm toward the visitor, waving from the elbow; the left hand on
  // his thigh; the knees apart, the right foot stretched forward, the left tucked back a little
  wave: {
    torso: [-0.11, 0],
    head: [-0.05, 0.1, 0],
    armR: [-0.28, -1.72],
    foreR: [-0.12, -1.38],
    armL: [-0.35, 0.18],
    foreL: [-0.9, 0],
    handR: [-Math.PI / 2, 0.08],
    handL: [-Math.PI / 2, 0.7],
    legR: [0.06, -0.2, -0.42],
    legL: [-0.02, 0.24, 0.12],
  },
};

/** Undoes the coffee pose's lean, arm and forearm pitch so the mug stands upright in his hand. */
const MUG_UPRIGHT = -(POSES.coffee.torso[0] + POSES.coffee.armL[0] + POSES.coffee.foreL[0]);

/** How much of `pose` the sample holds, 0..1. */
export function poseWeight(s: DaySample, pose: Pose): number {
  return (s.poseFrom === pose ? 1 - s.poseMix : 0) + (s.poseTo === pose ? s.poseMix : 0);
}

/**
 * Straight hair over the back of the head, the side the diorama's camera sees most: rows of long,
 * flat locks laid on the hair cap (in the head's units), each falling from the crown toward the nape
 * along the cap's surface, so the grooves between them read instead of one dark cap.
 */
const BACK_LOCKS = (() => {
  const centre = new THREE.Vector3(0, 0.1, -0.06);
  const radii = new THREE.Vector3(0.335, 0.33, 0.35);
  const rows = [
    { e: 0.62, n: 4, span: 0.85, len: 0.12, w: 0.115 },
    { e: 0.2, n: 6, span: 1.25, len: 0.14, w: 0.11 },
    { e: -0.3, n: 6, span: 1.1, len: 0.12, w: 0.1 },
  ];
  const down = new THREE.Vector3();
  const out: { position: [number, number, number]; quaternion: THREE.Quaternion; scale: [number, number, number]; light: boolean }[] = [];
  rows.forEach(({ e, n, span, len, w }, r) => {
    for (let k = 0; k < n; k++) {
      const a = -span + (2 * span * k) / (n - 1) + (r % 2 ? 0.08 : 0);
      const dir = new THREE.Vector3(Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e));
      const p = centre.clone().add(dir.clone().multiply(radii).multiplyScalar(0.985));
      const normal = new THREE.Vector3(dir.x / radii.x, dir.y / radii.y, dir.z / radii.z).normalize();
      down.set(0, -1, 0).addScaledVector(normal, normal.y).normalize();
      const side = new THREE.Vector3().crossVectors(down, normal);
      const quaternion = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(side, down, normal));
      out.push({ position: p.addScaledVector(normal, 0.012).toArray() as [number, number, number], quaternion, scale: [w, len, 0.022], light: (k + r) % 3 === 0 });
    }
  });
  return out;
})();

/** The tee as a turned shape (hips to neck): a banded hem, a waist, the chest, shoulders that slope to the neck. Scaled flatter front to back by the mesh. */
const TEE = (() => {
  const profile: [number, number][] = [
    [0.118, -0.045],
    [0.152, -0.045],
    [0.155, -0.03],
    [0.151, -0.016],
    [0.146, 0.03],
    [0.144, 0.1],
    [0.15, 0.2],
    [0.161, 0.29],
    [0.167, 0.36],
    [0.163, 0.41],
    [0.145, 0.45],
    [0.11, 0.485],
    [0.07, 0.505],
    [0.046, 0.512],
  ];
  return new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    36,
  );
})();

/** A limb segment that narrows from one end to the other, along -y from its joint. */
const limb = (top: number, bottom: number, length: number) => {
  const g = new THREE.CylinderGeometry(top, bottom, length, 20, 1);
  g.translate(0, -length / 2, 0);
  return g;
};
const SLEEVE = limb(0.058, 0.054, 0.125);
const UPPER_ARM = limb(0.041, 0.037, 0.13);
const FOREARM = limb(0.037, 0.029, 0.215);
/** The thigh runs forward from the hip to the knee, the shin down from the knee to the ankle. */
const THIGH = (() => {
  const g = new THREE.CylinderGeometry(0.061, 0.071, 0.4, 24, 1);
  g.rotateX(Math.PI / 2);
  return g;
})();
const SHIN = limb(0.058, 0.047, 0.46);
const CAPSULE = new THREE.CapsuleGeometry(1, 1, 6, 12);
/** The four fingers across the hand, index (nearest the thumb, +z) to little: [z, length, spread]. */
const FINGERS: [number, number, number][] = [
  [0.027, 0.046, 0.1],
  [0.009, 0.052, 0.03],
  [-0.009, 0.049, -0.04],
  [-0.027, 0.039, -0.12],
];

/** "</>" on the tee's chest, in Paper. */
function printTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#f1ece3';
  ctx.font = '700 84px ui-monospace, Menlo, Consolas, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('</>', 128, 68);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/**
 * After dusk his dark tee, jeans and hair would melt into the black chair. A soft rim of cool
 * light along his silhouette (a fresnel term added to the emissive, strongest where a surface
 * turns away from the eye) keeps him readable, the way the moon and the screens would catch his
 * edges. No extra light: it costs a few shader instructions, so phones get it too.
 */
const RIM = { uRim: { value: 0 }, uRimColor: { value: new THREE.Color('#a9bfff') } };
function rimmed<T extends THREE.MeshStandardMaterial>(m: T, k = 1): T {
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, RIM);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uRim;\nuniform vec3 uRimColor;')
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        float rimEdge = 1.0 - saturate(dot(normal, normalize(vViewPosition)));
        totalEmissiveRadiance += uRimColor * uRim * ${k.toFixed(2)} * pow(rimEdge, 3.6);`,
      );
  };
  m.customProgramCacheKey = () => `diorama-rim-${k}`;
  return m;
}

/** A soft wisp of steam: a tall blurred blob, brighter at its heart. */
function wispTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 96;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 50, 4, 32, 48, 30);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.6)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 96);
  return new THREE.CanvasTexture(c);
}

/**
 * Steam off his coffee at 09:00: three wisps rising from the mug in turn, swelling and fading.
 * Light, not matter: on the beam layer, which the occlusion pass leaves out. Held under reduced motion.
 */
function Steam({ still }: { still: boolean }) {
  const wisps = useRef<(THREE.Sprite | null)[]>([]);
  const materials = useMemo(() => {
    const map = wispTexture();
    return [0, 1, 2].map(() => new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, opacity: 0, color: '#f4efe8' }));
  }, []);
  useEffect(() => wisps.current.forEach((w) => w?.layers.set(BEAM_LAYER)), []);
  useFrame((state) => {
    const clock = still ? 0.4 : state.clock.elapsedTime * 0.35;
    wisps.current.forEach((w, i) => {
      if (!w) return;
      const t = (clock + i / 3) % 1;
      w.position.set(Math.sin(t * 5 + i * 2) * 0.012, 0.07 + t * 0.15, 0);
      const size = 0.05 + t * 0.07;
      w.scale.set(size, size * 1.5, 1);
      materials[i].opacity = Math.sin(t * Math.PI) * 0.8;
    });
  });
  return (
    <group>
      {materials.map((m, i) => (
        <sprite
          key={i}
          ref={(el) => {
            wisps.current[i] = el;
          }}
          material={m}
        />
      ))}
    </group>
  );
}

export default function Akira({ sample, still }: { sample: MutableRefObject<DaySample>; still: boolean }) {
  const m = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.58 }),
      skinShade: new THREE.MeshStandardMaterial({ color: '#d9a07c', roughness: 0.6 }),
      blush: new THREE.MeshStandardMaterial({ color: '#ef9f86', roughness: 0.7 }),
      // Matte, like painted hair on a miniature: no gloss that outshines the room, only a soft sheen along each lock's edge
      hair: rimmed(new THREE.MeshPhysicalMaterial({ color: HAIR, roughness: 0.85, envMapIntensity: 0.5, sheen: 0.6, sheenRoughness: 0.5, sheenColor: new THREE.Color('#4f5058') }), 0.5),
      hairLight: rimmed(new THREE.MeshPhysicalMaterial({ color: '#1f1c1c', roughness: 0.84, envMapIntensity: 0.5, sheen: 0.6, sheenRoughness: 0.5, sheenColor: new THREE.Color('#5a5b64') }), 0.5),
      // Cloth: a soft sheen along the silhouette, the way cotton and denim catch light
      shirt: rimmed(new THREE.MeshPhysicalMaterial({ color: SHIRT, roughness: 0.82, sheen: 0.6, sheenRoughness: 0.55, sheenColor: new THREE.Color('#5f9e83') })),
      hem: rimmed(new THREE.MeshPhysicalMaterial({ color: '#08301f', roughness: 0.85, sheen: 0.4, sheenColor: new THREE.Color('#4f8a72') })),
      jeans: rimmed(new THREE.MeshPhysicalMaterial({ color: JEANS, roughness: 0.86, sheen: 0.55, sheenRoughness: 0.6, sheenColor: new THREE.Color('#7f95c0') })),
      cuff: rimmed(new THREE.MeshPhysicalMaterial({ color: '#25324b', roughness: 0.86, sheen: 0.4, sheenColor: new THREE.Color('#7f95c0') })),
      shoe: new THREE.MeshStandardMaterial({ color: SHOE, roughness: 0.7 }),
      sole: new THREE.MeshStandardMaterial({ color: '#fbfaf7', roughness: 0.6 }),
      strap: new THREE.MeshStandardMaterial({ color: '#1b1c1f', roughness: 0.5 }),
      ink: new THREE.MeshStandardMaterial({ color: '#141012', roughness: 0.3 }),
      glint: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
      mouth: new THREE.MeshStandardMaterial({ color: '#8a3b33', roughness: 0.6 }),
      wire: new THREE.MeshStandardMaterial({ color: WIRE, metalness: 0.85, roughness: 0.3 }),
      mug: new THREE.MeshStandardMaterial({ color: '#ece6dc', roughness: 0.55 }),
      coffee: new THREE.MeshStandardMaterial({ color: '#3a2216', roughness: 0.3 }),
      cover: new THREE.MeshStandardMaterial({ color: '#a8442f', roughness: 0.8 }),
      pages: new THREE.MeshStandardMaterial({ color: '#f1ece3', roughness: 0.9 }),
      print: new THREE.MeshStandardMaterial({ map: printTexture(), alphaTest: 0.3, roughness: 0.8 }),
    }),
    [],
  );

  const torso = useRef<THREE.Group>(null);
  const hipR = useRef<THREE.Group>(null);
  const hipL = useRef<THREE.Group>(null);
  const kneeR = useRef<THREE.Group>(null);
  const kneeL = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const foreR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const foreL = useRef<THREE.Group>(null);
  const handR = useRef<THREE.Group>(null);
  const handL = useRef<THREE.Group>(null);
  const fingersR = useRef<THREE.Group>(null);
  const fingersL = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const mug = useRef<THREE.Group>(null);
  const book = useRef<THREE.Group>(null);

  useFrame((state) => {
    const s = sample.current;
    // The rim rises with the room's evening light and is full by night
    RIM.uRim.value = 0.26 * Math.min(1, Math.max(0, (s.light.practical - 0.25) / 0.6));
    const a = POSES[s.poseFrom];
    const b = POSES[s.poseTo];
    const k = s.poseMix;
    const t = state.clock.elapsedTime;
    const live = still ? 0 : 1;
    const typing = poseWeight(s, 'typing') * live;
    const wave = poseWeight(s, 'wave') * live;
    // bursts of typing with pauses
    const burst = Math.sin(t * 0.9) > -0.3 ? 1 : 0.15;
    const tapR = Math.sin(t * 15.0) * 0.05 * burst * typing;
    const tapL = Math.sin(t * 13.3 + 1.7) * 0.05 * burst * typing;

    if (torso.current) {
      torso.current.rotation.x = mix(a.torso[0], b.torso[0], k) + Math.sin(t * 1.5) * 0.008 * live;
      torso.current.rotation.y = mix(a.torso[1], b.torso[1], k);
    }
    if (head.current) {
      head.current.rotation.x = mix(a.head[0], b.head[0], k);
      head.current.rotation.y = mix(a.head[1], b.head[1], k);
      head.current.rotation.z = mix(a.head[2], b.head[2], k) + Math.sin(t * 2) * 0.05 * wave;
    }
    if (armR.current && foreR.current) {
      armR.current.rotation.x = mix(a.armR[0], b.armR[0], k);
      armR.current.rotation.z = mix(a.armR[1], b.armR[1], k);
      foreR.current.rotation.x = mix(a.foreR[0], b.foreR[0], k) + tapR;
      foreR.current.rotation.z = mix(a.foreR[1], b.foreR[1], k) + Math.sin(t * 8) * 0.4 * wave;
    }
    if (armL.current && foreL.current) {
      armL.current.rotation.x = mix(a.armL[0], b.armL[0], k);
      armL.current.rotation.z = mix(a.armL[1], b.armL[1], k);
      foreL.current.rotation.x = mix(a.foreL[0], b.foreL[0], k) + tapL;
      foreL.current.rotation.z = mix(a.foreL[1], b.foreL[1], k);
    }
    // Hands roll about the forearm and curl their fingers toward the palm (the palm faces -side·x before the roll)
    // Legs swing from the hip and bend at the knee
    for (const [hip, knee, from, to] of [
      [hipR.current, kneeR.current, a.legR, b.legR],
      [hipL.current, kneeL.current, a.legL, b.legL],
    ] as const) {
      if (hip) hip.rotation.set(mix(from[0], to[0], k), mix(from[1], to[1], k), 0, 'YXZ');
      if (knee) knee.rotation.x = mix(from[2], to[2], k);
    }
    for (const [side, hand, fingers, from, to] of [
      [-1, handR.current, fingersR.current, a.handR, b.handR],
      [1, handL.current, fingersL.current, a.handL, b.handL],
    ] as const) {
      if (hand) hand.rotation.y = mix(from[0], to[0], k);
      if (fingers) fingers.rotation.z = -side * mix(from[1], to[1], k);
    }
    if (eyes.current) eyes.current.scale.y = live && t % 3.6 > 3.48 ? 0.12 : 1;
    if (mug.current) mug.current.visible = poseWeight(s, 'coffee') > 0.5;
    if (book.current) book.current.visible = poseWeight(s, 'reading') > 0.5;
  });

  const cast = { castShadow: true, receiveShadow: true } as const;
  const S = (
    scale: [number, number, number],
    position: [number, number, number],
    material: THREE.Material,
    rotation?: [number, number, number],
    fine?: boolean,
  ) => <mesh {...cast} geometry={fine ? SPHERE_FINE : SPHERE} material={material} position={position} scale={scale} rotation={rotation} />;
  // Each rigid part (the legs, the torso, each arm, each forearm, the head) folds its own pieces into a few draws
  return (
    <group>
      {/* Seat and hips in denim */}
      <StaticMerge>{S([0.178, 0.09, 0.158], [0, 0.565, -0.02], m.jeans)}</StaticMerge>
      {/* Each leg on a hip joint: the thigh forward to the knee; on the knee joint the shin down to the cuff and the sneaker */}
      {(
        [
          [-0.095, hipR, kneeR],
          [0.095, hipL, kneeL],
        ] as const
      ).map(([x, hip, knee]) => (
        <group key={x} ref={hip} position={[x, 0.575, 0]} userData={{ live: true }}>
          <StaticMerge>
            <mesh {...cast} geometry={THIGH} material={m.jeans} position={[0, 0, 0.2]} />
            {S([0.064, 0.064, 0.066], [0, -0.003, 0.405], m.jeans)}
          </StaticMerge>
          <group ref={knee} position={[0, 0, 0.42]} userData={{ live: true }}>
            <StaticMerge>
              <mesh {...cast} geometry={SHIN} material={m.jeans} position={[0, 0, 0.01]} />
              <mesh {...cast} material={m.cuff} position={[0, -0.453, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.048, 0.009, 8, 24]} />
              </mesh>
              {/* sneakers: a white sole with a raised toe, the upper, the toe cap, the laces' dark tongue */}
              <RoundedBox args={[0.072, 0.024, 0.14]} radius={0.011} position={[0, -0.563, 0.05]} material={m.sole} {...cast} />
              {S([0.053, 0.046, 0.1], [0, -0.525, 0.038], m.shoe)}
              {S([0.045, 0.03, 0.05], [0, -0.539, 0.1], m.shoe)}
              {S([0.026, 0.012, 0.042], [0, -0.487, 0.068], m.strap, [0.38, 0, 0])}
              {S([0.03, 0.025, 0.02], [0, -0.49, -0.02], m.sole)}
            </StaticMerge>
          </group>
        </group>
      ))}

      {/* An open book held over the lap, pages up toward his face, for reading */}
      <group ref={book} position={[0.02, 0.84, 0.34]} rotation={[0.8, 0, 0]} visible={false} userData={{ live: true }}>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.06, 0, 0]} rotation={[0, side * 0.2, 0]}>
            <mesh castShadow material={m.cover} position={[0, 0, 0.004]}>
              <boxGeometry args={[0.122, 0.17, 0.006]} />
            </mesh>
            <mesh castShadow receiveShadow material={m.pages} position={[0, 0, -0.003]}>
              <boxGeometry args={[0.112, 0.16, 0.01]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Torso on a pivot at the hips */}
      <group ref={torso} position={[0, 0.6, -0.04]}>
        <StaticMerge>
          <mesh {...cast} geometry={TEE} material={m.shirt} scale={[1, 1, 0.74]} />
          <mesh {...cast} material={m.skin} position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.042, 0.048, 0.1, 16]} />
          </mesh>
          {/* the tee's ribbed crew neck, the </> on its chest */}
          <mesh material={m.hem} position={[0, 0.505, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.8, 1]}>
            <torusGeometry args={[0.052, 0.011, 8, 24]} />
          </mesh>
          <mesh material={m.print} position={[0, 0.315, 0.1225]} rotation={[-0.08, 0, 0]}>
            <planeGeometry args={[0.1, 0.05]} />
          </mesh>
        </StaticMerge>

        {/* arms: a sleeve over the shoulder, the upper arm to the elbow; the forearm, wrist and a hand with its thumb */}
        {(
          [
            [-1, armR, foreR],
            [1, armL, foreL],
          ] as const
        ).map(([side, arm, fore]) => (
          <group key={side} ref={arm} position={[side * 0.19, 0.4, 0]}>
            <StaticMerge>
              {S([0.06, 0.06, 0.058], [-side * 0.01, -0.006, 0], m.shirt)}
              <mesh {...cast} geometry={SLEEVE} material={m.shirt} position={[0, -0.005, 0]} />
              <mesh material={m.hem} position={[0, -0.128, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.053, 0.008, 8, 22]} />
              </mesh>
              <mesh {...cast} geometry={UPPER_ARM} material={m.skin} position={[0, -0.12, 0]} />
              {S([0.039, 0.039, 0.039], [0, -0.25, 0], m.skin)}
            </StaticMerge>
            <group ref={fore} position={[0, -0.25, 0]}>
              <StaticMerge>
                <mesh {...cast} geometry={FOREARM} material={m.skin} />
                {S([0.03, 0.028, 0.03], [0, -0.215, 0], m.skin)}

                {side === 1 && (
                  <group position={[0, -0.205, 0]}>
                    <mesh material={m.strap} rotation={[Math.PI / 2, 0, 0]}>
                      <torusGeometry args={[0.032, 0.007, 8, 20]} />
                    </mesh>
                    <mesh material={m.wire} position={[0.035, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                      <cylinderGeometry args={[0.014, 0.014, 0.007, 16]} />
                    </mesh>
                  </group>
                )}
              </StaticMerge>
              {/* The hand rolls and curls with the pose (its own joints): the palm, four fingers on a knuckle pivot, the thumb toward his middle */}
              <group ref={side === -1 ? handR : handL} position={[0, -0.215, 0]} rotation={[0, -side * (Math.PI / 2), 0]} userData={{ live: true }}>
                <StaticMerge>
                  {S([0.021, 0.04, 0.039], [0, -0.04, 0], m.skin)}
                  <mesh {...cast} geometry={CAPSULE} material={m.skin} position={[-side * 0.009, -0.038, 0.037]} rotation={[-0.6, 0, -side * 0.38]} scale={[0.0098, 0.012, 0.0098]} />
                </StaticMerge>
                <group ref={side === -1 ? fingersR : fingersL} position={[-side * 0.003, -0.074, 0]} rotation={[0, 0, -side * 0.55]} userData={{ live: true }}>
                  <StaticMerge>
                    {FINGERS.map(([z, length, spread], i) => (
                      <group key={i} position={[0, 0, z]} rotation={[spread, 0, 0]}>
                        <mesh {...cast} geometry={CAPSULE} material={m.skin} position={[0, -length / 2 + 0.004, 0]} scale={[0.0085, length / 3, 0.0085]} />
                      </group>
                    ))}
                  </StaticMerge>
                </group>
              </group>
              {side === 1 && (
                <group ref={mug} position={[0.02, -0.27, -0.05]} rotation={[MUG_UPRIGHT, 0, 0]} visible={false} userData={{ live: true }}>
                  <mesh castShadow material={m.mug}>
                    <cylinderGeometry args={[0.036, 0.032, 0.09, 24]} />
                  </mesh>
                  <mesh material={m.coffee} position={[0, 0.0462, 0]}>
                    <cylinderGeometry args={[0.03, 0.03, 0.002, 20]} />
                  </mesh>
                  <Steam still={still} />
                </group>
              )}
            </group>
          </group>
        ))}

        {/* Head: the Cartoon caricature's proportions, at miniature scale */}
        <group ref={head} position={[0, 0.52, 0.01]}>
          <group scale={0.42} position={[0, 0.02, 0]}>
            <group position={[0, 0.34, 0]}>
              <StaticMerge>
                {S([0.315, 0.36, 0.32], [0, 0, 0.02], m.skin, undefined, true)}
                {/* ears, their inner fold */}
                {[-1, 1].map((x) => (
                  <group key={x}>
                    {S([0.045, 0.078, 0.062], [x * 0.31, 0.01, -0.02], m.skin)}
                    {S([0.018, 0.048, 0.036], [x * 0.338, 0.01, -0.012], m.skinShade)}
                  </group>
                ))}
                {S([0.335, 0.33, 0.35], [0, 0.1, -0.06], m.hair, undefined, true)}
                {/* Volume over the parting on his left, then the fringe sweeping to his right */}
                {S([0.28, 0.12, 0.22], [0.05, 0.28, 0.1], m.hair, [0.5, 0, 0.16])}
                {FRINGE.map((lock, i) => (
                  <mesh key={i} {...cast} geometry={SPHERE} material={i % 2 ? m.hairLight : m.hair} position={lock.position} quaternion={lock.quaternion} scale={lock.scale} />
                ))}
                {S([0.06, 0.14, 0.12], [0.27, 0.06, 0.06], m.hair, [0, -0.3, -0.2])}
                {S([0.06, 0.14, 0.12], [-0.27, 0.06, 0.06], m.hair, [0, 0.3, 0.2])}
                {/* the crown and the nape in locks, so the back of his head is hair and not a cap */}
                {BACK_LOCKS.map((lock, i) => (
                  <mesh key={i} {...cast} geometry={SPHERE} material={lock.light ? m.hairLight : m.hair} position={lock.position} quaternion={lock.quaternion} scale={lock.scale} />
                ))}
                <mesh geometry={SPHERE} material={m.hair} position={[-0.115, 0.115, 0.3]} rotation={[0, 0, -0.08]} scale={[0.062, 0.016, 0.02]} />
                <mesh geometry={SPHERE} material={m.hair} position={[0.115, 0.115, 0.3]} rotation={[0, 0, 0.08]} scale={[0.062, 0.016, 0.02]} />
                {/* the nose, a little colour in the cheeks, the smile */}
                {S([0.042, 0.055, 0.05], [0, -0.05, 0.335], m.skin)}
                {[-1, 1].map((x) => (
                  <mesh key={x} geometry={SPHERE} material={m.blush} position={[x * 0.19, -0.075, 0.262]} rotation={[0, x * 0.62, 0]} scale={[0.052, 0.028, 0.012]} />
                ))}
                <mesh material={m.mouth} position={[0, -0.13, 0.3]} rotation={[0.25, 0, Math.PI]}>
                  <torusGeometry args={[0.07, 0.011, 8, 24]} />
                </mesh>
                <group position={[0, 0.03, 0.335]}>
                  {[-0.118, 0.118].map((x) => (
                    <mesh key={x} material={m.wire} position={[x, 0, 0]} castShadow>
                      <torusGeometry args={[0.092, 0.009, 10, 48]} />
                    </mesh>
                  ))}
                  <mesh material={m.wire} position={[0, 0.012, 0.004]}>
                    <torusGeometry args={[0.028, 0.007, 8, 16, Math.PI]} />
                  </mesh>
                  {[-1, 1].map((side) => (
                    <group key={side} position={[side * 0.26, 0.01, -0.178]} rotation={[0, side * -0.274, 0]}>
                      <mesh material={m.wire} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.007, 0.007, 0.37, 6]} />
                      </mesh>
                    </group>
                  ))}
                </group>
              </StaticMerge>
              {/* the eyes blink, so they stay their own group: each with a glint */}
              <group ref={eyes} position={[0, 0.035, 0]} userData={{ live: true }}>
                {[-0.115, 0.115].map((x) => (
                  <group key={x}>
                    <mesh geometry={SPHERE} material={m.ink} position={[x, 0, 0.3]} scale={[0.028, 0.036, 0.02]} />
                    <mesh geometry={SPHERE} material={m.glint} position={[x + 0.009, 0.013, 0.318]} scale={0.008} />
                  </group>
                ))}
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
