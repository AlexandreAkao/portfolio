/**
 * Akira seated, as a painted miniature: dark fringe swept to his right, round
 * gold wire glasses, the #0B3D2E tee. Faces +z in local space (the chair turns
 * him). Six poses as joint tables, blended from one station's pose to the
 * next by the day sample.
 */
import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { DaySample, Pose } from '../day';

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

/** Joint angles in radians. Arms are [upper x, upper z] and [fore x, fore z]; his right arm sits at -x. */
interface Joints {
  torso: [lean: number, twist: number];
  head: [x: number, y: number, z: number];
  armR: [number, number];
  foreR: [number, number];
  armL: [number, number];
  foreL: [number, number];
}

const HANDS_ON_KEYS = { armR: [-0.62, 0.12], foreR: [-1.2, 0], armL: [-0.62, -0.12], foreL: [-1.2, 0] } satisfies Partial<Joints>;

const POSES: Record<Pose, Joints> = {
  typing: { torso: [0.16, 0], head: [0.08, 0, 0], ...HANDS_ON_KEYS },
  // Upright, reading the screen, the mug at his chin. It sits in his left hand,
  // the one on the camera's side at every station, so the mug reads.
  coffee: { torso: [0.02, 0], head: [0.04, 0, 0], ...HANDS_ON_KEYS, armL: [-0.95, -0.15], foreL: [-1.95, 0] },
  // Hands stay on the keys, head tipped back to the wall monitor
  lookUp: { torso: [0, 0], head: [-0.46, 0, 0], ...HANDS_ON_KEYS },
  // Leaning back, left hand to the chin
  think: { torso: [-0.14, 0.12], head: [0.05, -0.08, 0.14], ...HANDS_ON_KEYS, armL: [-1.05, -0.42], foreL: [-2.15, 0] },
  // Forearms forward and up, holding an open book over the lap, head down to it
  reading: { torso: [0.15, 0], head: [0.34, 0, 0], armR: [-0.32, 0.3], foreR: [-1.65, 0.08], armL: [-0.32, -0.3], foreL: [-1.65, 0.08] },
  // Turned to the visitor, right hand up
  wave: { torso: [-0.04, 0], head: [-0.05, 0, 0], armR: [-0.1, -2.55], foreR: [-0.25, 0.25], armL: [-0.35, 0.18], foreL: [-0.9, 0] },
};

/** Undoes the coffee pose's lean, arm and forearm pitch so the mug stands upright in his hand. */
const MUG_UPRIGHT = -(POSES.coffee.torso[0] + POSES.coffee.armL[0] + POSES.coffee.foreL[0]);

/** How much of `pose` the sample holds, 0..1. */
export function poseWeight(s: DaySample, pose: Pose): number {
  return (s.poseFrom === pose ? 1 - s.poseMix : 0) + (s.poseTo === pose ? s.poseMix : 0);
}

export default function Akira({ sample, still }: { sample: MutableRefObject<DaySample>; still: boolean }) {
  const m = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.62 }),
      // Matte, like painted hair on a miniature: its sheen never outshines the room
      hair: new THREE.MeshStandardMaterial({ color: HAIR, roughness: 0.88, envMapIntensity: 0.5 }),
      shirt: new THREE.MeshStandardMaterial({ color: SHIRT, roughness: 0.8 }),
      jeans: new THREE.MeshStandardMaterial({ color: JEANS, roughness: 0.85 }),
      shoe: new THREE.MeshStandardMaterial({ color: SHOE, roughness: 0.7 }),
      sole: new THREE.MeshStandardMaterial({ color: '#fbfaf7', roughness: 0.6 }),
      hem: new THREE.MeshStandardMaterial({ color: '#08301f', roughness: 0.85 }),
      strap: new THREE.MeshStandardMaterial({ color: '#1b1c1f', roughness: 0.5 }),
      ink: new THREE.MeshStandardMaterial({ color: '#141012', roughness: 0.3 }),
      mouth: new THREE.MeshStandardMaterial({ color: '#8a3b33', roughness: 0.6 }),
      wire: new THREE.MeshStandardMaterial({ color: WIRE, metalness: 0.85, roughness: 0.3 }),
      mug: new THREE.MeshStandardMaterial({ color: '#ece6dc', roughness: 0.55 }),
      coffee: new THREE.MeshStandardMaterial({ color: '#3a2216', roughness: 0.3 }),
      cover: new THREE.MeshStandardMaterial({ color: '#a8442f', roughness: 0.8 }),
      pages: new THREE.MeshStandardMaterial({ color: '#f1ece3', roughness: 0.9 }),
    }),
    [],
  );

  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const foreR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const foreL = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const mug = useRef<THREE.Group>(null);
  const book = useRef<THREE.Group>(null);

  useFrame((state) => {
    const s = sample.current;
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

  return (
    <group>
      {/* Seat, thighs forward, shins down, sneakers */}
      {S([0.17, 0.085, 0.15], [0, 0.565, -0.02], m.jeans)}
      {[-0.095, 0.095].map((x) => (
        <group key={x}>
          <mesh {...cast} material={m.jeans} position={[x, 0.575, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.068, 0.34, 8, 16]} />
          </mesh>
          <mesh {...cast} material={m.jeans} position={[x, 0.33, 0.42]}>
            <capsuleGeometry args={[0.056, 0.4, 8, 16]} />
          </mesh>
          {/* sneakers: a white sole under the upper, the laces' dark tongue */}
          {S([0.06, 0.016, 0.118], [x, 0.016, 0.472], m.sole)}
          {S([0.054, 0.04, 0.105], [x, 0.048, 0.468], m.shoe)}
          {S([0.026, 0.012, 0.04], [x, 0.082, 0.5], m.strap, [0.35, 0, 0])}
        </group>
      ))}

      {/* An open book held over the lap, pages up toward his face, for reading */}
      <group ref={book} position={[0.02, 0.84, 0.34]} rotation={[0.8, 0, 0]} visible={false}>
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
        <mesh {...cast} material={m.shirt} position={[0, 0.25, 0]} scale={[1, 1, 0.74]}>
          <capsuleGeometry args={[0.16, 0.26, 10, 24]} />
        </mesh>
        <mesh {...cast} material={m.skin} position={[0, 0.48, 0]}>
          <cylinderGeometry args={[0.042, 0.048, 0.1, 16]} />
        </mesh>
        {/* the tee's ribbed crew neck */}
        <mesh material={m.hem} position={[0, 0.512, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.85, 1]}>
          <torusGeometry args={[0.054, 0.011, 8, 24]} />
        </mesh>

        {/* arms */}
        {(
          [
            [-1, armR, foreR],
            [1, armL, foreL],
          ] as const
        ).map(([side, arm, fore]) => (
          <group key={side} ref={arm} position={[side * 0.19, 0.4, 0]}>
            <mesh {...cast} material={m.shirt} position={[0, -0.07, 0]}>
              <capsuleGeometry args={[0.058, 0.06, 8, 16]} />
            </mesh>
            <mesh material={m.hem} position={[0, -0.125, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.05, 0.008, 8, 20]} />
            </mesh>
            <mesh {...cast} material={m.skin} position={[0, -0.16, 0]}>
              <capsuleGeometry args={[0.044, 0.1, 8, 16]} />
            </mesh>
            <group ref={fore} position={[0, -0.25, 0]}>
              <mesh {...cast} material={m.skin} position={[0, -0.12, 0]}>
                <capsuleGeometry args={[0.04, 0.17, 8, 16]} />
              </mesh>
              {S([0.042, 0.05, 0.034], [0, -0.27, 0], m.skin)}
              {/* a watch on his left wrist */}
              {side === 1 && (
                <group position={[0, -0.215, 0]}>
                  <mesh material={m.strap} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.041, 0.008, 8, 20]} />
                  </mesh>
                  <mesh material={m.wire} position={[0.044, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.016, 0.016, 0.008, 16]} />
                  </mesh>
                </group>
              )}
              {side === 1 && (
                <group ref={mug} position={[0.02, -0.27, -0.05]} rotation={[MUG_UPRIGHT, 0, 0]} visible={false}>
                  <mesh castShadow material={m.mug}>
                    <cylinderGeometry args={[0.036, 0.032, 0.09, 24]} />
                  </mesh>
                  <mesh material={m.coffee} position={[0, 0.0462, 0]}>
                    <cylinderGeometry args={[0.03, 0.03, 0.002, 20]} />
                  </mesh>
                </group>
              )}
            </group>
          </group>
        ))}

        {/* Head: the Cartoon caricature's proportions, at miniature scale */}
        <group ref={head} position={[0, 0.52, 0.01]}>
          <group scale={0.42} position={[0, 0.02, 0]}>
            <group position={[0, 0.34, 0]}>
              {S([0.315, 0.36, 0.32], [0, 0, 0.02], m.skin, undefined, true)}
              {S([0.04, 0.075, 0.06], [-0.31, 0.01, -0.02], m.skin)}
              {S([0.04, 0.075, 0.06], [0.31, 0.01, -0.02], m.skin)}
              {S([0.335, 0.33, 0.35], [0, 0.1, -0.06], m.hair, undefined, true)}
              {/* Volume over the parting on his left, then the fringe sweeping to his right */}
              {S([0.28, 0.12, 0.22], [0.05, 0.28, 0.1], m.hair, [0.5, 0, 0.16])}
              {FRINGE.map((lock, i) => (
                <mesh key={i} {...cast} geometry={SPHERE} material={m.hair} position={lock.position} quaternion={lock.quaternion} scale={lock.scale} />
              ))}
              {S([0.06, 0.14, 0.12], [0.27, 0.06, 0.06], m.hair, [0, -0.3, -0.2])}
              {S([0.06, 0.14, 0.12], [-0.27, 0.06, 0.06], m.hair, [0, 0.3, 0.2])}
              <mesh geometry={SPHERE} material={m.hair} position={[-0.115, 0.115, 0.3]} rotation={[0, 0, -0.08]} scale={[0.062, 0.016, 0.02]} />
              <mesh geometry={SPHERE} material={m.hair} position={[0.115, 0.115, 0.3]} rotation={[0, 0, 0.08]} scale={[0.062, 0.016, 0.02]} />
              <group ref={eyes} position={[0, 0.035, 0]}>
                <mesh geometry={SPHERE} material={m.ink} position={[-0.115, 0, 0.3]} scale={[0.028, 0.036, 0.02]} />
                <mesh geometry={SPHERE} material={m.ink} position={[0.115, 0, 0.3]} scale={[0.028, 0.036, 0.02]} />
              </group>
              {S([0.042, 0.055, 0.05], [0, -0.05, 0.335], m.skin)}
              <mesh material={m.mouth} position={[0, -0.13, 0.3]} rotation={[0.25, 0, Math.PI]}>
                <torusGeometry args={[0.07, 0.011, 8, 24, Math.PI]} />
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
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
