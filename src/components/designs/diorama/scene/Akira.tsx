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
      hair: new THREE.MeshStandardMaterial({ color: HAIR, roughness: 0.36 }),
      shirt: new THREE.MeshStandardMaterial({ color: SHIRT, roughness: 0.8 }),
      jeans: new THREE.MeshStandardMaterial({ color: JEANS, roughness: 0.85 }),
      shoe: new THREE.MeshStandardMaterial({ color: SHOE, roughness: 0.7 }),
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
          {S([0.056, 0.045, 0.11], [x, 0.045, 0.47], m.shoe)}
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
            <mesh {...cast} material={m.skin} position={[0, -0.16, 0]}>
              <capsuleGeometry args={[0.044, 0.1, 8, 16]} />
            </mesh>
            <group ref={fore} position={[0, -0.25, 0]}>
              <mesh {...cast} material={m.skin} position={[0, -0.12, 0]}>
                <capsuleGeometry args={[0.04, 0.17, 8, 16]} />
              </mesh>
              {S([0.042, 0.05, 0.034], [0, -0.27, 0], m.skin)}
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
              {S([0.3, 0.12, 0.22], [0.04, 0.27, 0.12], m.hair, [0.5, 0, -0.2])}
              {S([0.16, 0.07, 0.1], [-0.12, 0.2, 0.22], m.hair, [0.2, 0.2, 0.42])}
              {S([0.17, 0.065, 0.1], [0.06, 0.23, 0.23], m.hair, [0.25, 0, 0.3])}
              {S([0.11, 0.05, 0.08], [-0.23, 0.11, 0.14], m.hair, [0, 0.5, 0.9])}
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
