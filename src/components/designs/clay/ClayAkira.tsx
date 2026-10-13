/**
 * Akira in plasticine: the Cartoon caricature in three dimensions. Round wire
 * glasses (real wire, as clay puppets wear them), the dark fringe swept to his
 * right, the tee pressed with </>. Built from primitives on one shared clay
 * bump map. Every render is a new frame of the stop-motion: the pose advances
 * by 1/12 s and each part is re-handled by a hair, so the clay boils.
 * `frame` renders one fixed frame instead (the stills elsewhere in the world).
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { seeded } from './clayTextures';

export type ClayPose = 'wave' | 'point' | 'idle';

interface Props {
  pose: ClayPose;
  clayMap: THREE.Texture | null;
  /** Where the visitor's pointer is, -1..1 on each axis: he looks at it. */
  pointer?: React.MutableRefObject<{ x: number; y: number }>;
  /** A fixed frame number, for stills; omit to animate. */
  frame?: number;
  /** Hold the pose: no boil, no wave (reduced motion). */
  still?: boolean;
}

const SKIN = '#efc19a';
const HAIR = '#1d1817';
const SHIRT = '#0b3d2e';
const PRINT = '#f7f2ea';
const JEANS = '#3b5b9c';
const SHOE = '#f2efe8';
const WIRE = '#b48a52';
const MOUTH = '#8a3b33';
const BLUSH = '#f39a8c';

function clay(color: string, map: THREE.Texture | null, extra: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0, bumpMap: map, bumpScale: 3.4, ...extra });
}

/** A thin coil pressed onto the curved front of the tee. */
function chestCoil(points: [number, number][]) {
  const pts = points.map(([x, y]) => new THREE.Vector3(x, y, 0.189 * Math.sqrt(Math.max(0, 1 - (x / 0.255) ** 2)) + 0.006));
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1), 24, 0.014, 8, false);
}

const SPHERE = new THREE.SphereGeometry(1, 28, 18);
const SPHERE_FINE = new THREE.SphereGeometry(1, 40, 28);

export default function ClayAkira({ pose, clayMap, pointer, frame, still = false }: Props) {
  const m = useMemo(
    () => ({
      skin: clay(SKIN, clayMap),
      hair: clay(HAIR, clayMap, { roughness: 0.5 }),
      shirt: clay(SHIRT, clayMap),
      print: clay(PRINT, clayMap),
      jeans: clay(JEANS, clayMap),
      shoe: clay(SHOE, clayMap),
      blush: clay(BLUSH, clayMap, { transparent: true, opacity: 0.55 }),
      ink: new THREE.MeshStandardMaterial({ color: '#141012', roughness: 0.3 }),
      mouth: new THREE.MeshStandardMaterial({ color: MOUTH, roughness: 0.6 }),
      wire: new THREE.MeshStandardMaterial({ color: WIRE, metalness: 0.85, roughness: 0.28 }),
    }),
    [clayMap],
  );
  const glyph = useMemo(
    () => [
      chestCoil([[-0.07, 1.1], [-0.13, 1.045], [-0.07, 0.99]]),
      chestCoil([[-0.025, 0.975], [0.025, 1.115]]),
      chestCoil([[0.07, 1.1], [0.13, 1.045], [0.07, 0.99]]),
    ],
    [],
  );

  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const foreR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const foreL = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const count = useRef(0);

  // Each render is one frame of film
  useFrame(() => {
    const n = frame ?? (still ? 0 : count.current++);
    const t = n / 12;
    const rnd = seeded(n * 7 + 3);
    const j = still ? () => 0 : () => (rnd() - 0.5) * 0.012;
    const px = pointer?.current.x ?? 0;
    const py = pointer?.current.y ?? 0;

    if (root.current) {
      root.current.position.y = still ? 0 : Math.sin(t * 2.2) * 0.012;
      root.current.rotation.z = j();
    }
    if (head.current) {
      head.current.rotation.y = px * 0.45 + (pose === 'point' ? 0.25 : 0) + j();
      head.current.rotation.x = -py * 0.18 + (still ? 0 : Math.sin(t * 1.3) * 0.02) + j();
      head.current.rotation.z = (still ? 0.03 : Math.sin(t * 0.9) * 0.05) + j();
    }
    if (armR.current && foreR.current) {
      if (pose === 'wave') {
        armR.current.rotation.z = -2.6 + (still ? 0 : Math.sin(t * 1.1) * 0.06) + j();
        foreR.current.rotation.z = (still ? 0.2 : Math.sin(t * 9) * 0.38) + 0.15;
      } else {
        armR.current.rotation.z = -0.12 - (still ? 0 : Math.sin(t * 2.2) * 0.02) + j();
        foreR.current.rotation.z = 0.08;
      }
    }
    if (armL.current && foreL.current) {
      if (pose === 'point') {
        armL.current.rotation.z = 1.42 + j();
        armL.current.rotation.y = -0.25;
        foreL.current.rotation.z = 0.08 + j();
      } else {
        armL.current.rotation.z = 0.12 + (still ? 0 : Math.sin(t * 2.2) * 0.02) + j();
        armL.current.rotation.y = 0;
        foreL.current.rotation.z = -0.08;
      }
    }
    // A blink every 3.4 s, held for two frames
    if (eyes.current) eyes.current.scale.y = !still && t % 3.4 > 3.22 ? 0.12 : 1;
  });

  const cast = { castShadow: true, receiveShadow: true } as const;
  const S = (scale: [number, number, number], position: [number, number, number], material: THREE.Material, rotation?: [number, number, number], fine?: boolean) => (
    <mesh {...cast} geometry={fine ? SPHERE_FINE : SPHERE} material={material} position={position} scale={scale} rotation={rotation} />
  );

  return (
    <group ref={root}>
      {/* Shoes, legs and the seat of the jeans */}
      {S([0.085, 0.07, 0.16], [-0.12, 0.07, 0.05], m.shoe)}
      {S([0.085, 0.07, 0.16], [0.12, 0.07, 0.05], m.shoe)}
      {[-0.115, 0.115].map((x) => (
        <mesh key={x} {...cast} material={m.jeans} position={[x, 0.42, 0]}>
          <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
        </mesh>
      ))}
      {S([0.25, 0.13, 0.16], [0, 0.74, 0], m.jeans)}

      {/* The tee, with </> pressed onto the chest */}
      <mesh {...cast} material={m.shirt} position={[0, 1.02, 0]} scale={[1, 1, 0.74]}>
        <capsuleGeometry args={[0.255, 0.34, 10, 24]} />
      </mesh>
      {glyph.map((g, i) => (
        <mesh key={i} geometry={g} material={m.print} castShadow />
      ))}
      <mesh {...cast} material={m.skin} position={[0, 1.36, 0]}>
        <cylinderGeometry args={[0.075, 0.085, 0.16, 16]} />
      </mesh>

      {/* His right arm (screen left): the waving one */}
      <group ref={armR} position={[-0.29, 1.22, 0]}>
        <mesh {...cast} material={m.shirt} position={[0, -0.1, 0]}>
          <capsuleGeometry args={[0.1, 0.12, 8, 16]} />
        </mesh>
        <group ref={foreR} position={[0, -0.2, 0]}>
          <mesh {...cast} material={m.skin} position={[0, -0.17, 0]}>
            <capsuleGeometry args={[0.07, 0.26, 8, 16]} />
          </mesh>
          {S([0.078, 0.092, 0.062], [0, -0.38, 0], m.skin)}
        </group>
      </group>
      {/* His left arm (screen right): the pointing one */}
      <group ref={armL} position={[0.29, 1.22, 0]}>
        <mesh {...cast} material={m.shirt} position={[0, -0.1, 0]}>
          <capsuleGeometry args={[0.1, 0.12, 8, 16]} />
        </mesh>
        <group ref={foreL} position={[0, -0.2, 0]}>
          <mesh {...cast} material={m.skin} position={[0, -0.17, 0]}>
            <capsuleGeometry args={[0.07, 0.26, 8, 16]} />
          </mesh>
          {S([0.078, 0.085, 0.062], [0, -0.38, 0.005], m.skin)}
          {pose === 'point' && (
            <mesh {...cast} material={m.skin} position={[0, -0.48, 0.01]}>
              <capsuleGeometry args={[0.025, 0.09, 6, 10]} />
            </mesh>
          )}
        </group>
      </group>

      {/* The caricature's big head, on a pivot at the neck */}
      <group ref={head} position={[0, 1.42, 0]}>
        <group position={[0, 0.34, 0]}>
          {S([0.315, 0.36, 0.32], [0, 0, 0.02], m.skin, undefined, true)}
          {S([0.04, 0.075, 0.06], [-0.31, 0.01, -0.02], m.skin)}
          {S([0.04, 0.075, 0.06], [0.31, 0.01, -0.02], m.skin)}
          {/* Hair: the cap over the crown and back, then the fringe swept to his right */}
          {S([0.335, 0.33, 0.35], [0, 0.1, -0.06], m.hair, undefined, true)}
          {S([0.3, 0.12, 0.22], [0.04, 0.27, 0.12], m.hair, [0.5, 0, -0.2])}
          {S([0.16, 0.07, 0.1], [-0.12, 0.2, 0.22], m.hair, [0.2, 0.2, 0.42])}
          {S([0.17, 0.065, 0.1], [0.06, 0.23, 0.23], m.hair, [0.25, 0, 0.3])}
          {S([0.11, 0.05, 0.08], [-0.23, 0.11, 0.14], m.hair, [0, 0.5, 0.9])}
          {S([0.06, 0.14, 0.12], [0.27, 0.06, 0.06], m.hair, [0, -0.3, -0.2])}
          {S([0.06, 0.14, 0.12], [-0.27, 0.06, 0.06], m.hair, [0, 0.3, 0.2])}
          {/* Brows, eyes (they blink), nose, smile, cheeks */}
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
          <mesh geometry={SPHERE} material={m.blush} position={[-0.19, -0.07, 0.25]} rotation={[0, -0.5, 0]} scale={[0.05, 0.03, 0.01]} />
          <mesh geometry={SPHERE} material={m.blush} position={[0.19, -0.07, 0.25]} rotation={[0, 0.5, 0]} scale={[0.05, 0.03, 0.01]} />
          {/* Round wire glasses */}
          <group position={[0, 0.03, 0.335]}>
            <mesh material={m.wire} position={[-0.118, 0, 0]} castShadow>
              <torusGeometry args={[0.092, 0.0075, 10, 48]} />
            </mesh>
            <mesh material={m.wire} position={[0.118, 0, 0]} castShadow>
              <torusGeometry args={[0.092, 0.0075, 10, 48]} />
            </mesh>
            <mesh material={m.wire} position={[0, 0.012, 0.004]}>
              <torusGeometry args={[0.028, 0.006, 8, 16, Math.PI]} />
            </mesh>
            {[-1, 1].map((side) => (
              <group key={side} position={[side * 0.26, 0.01, -0.178]} rotation={[0, side * -0.274, 0]}>
                <mesh material={m.wire} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.006, 0.006, 0.37, 6]} />
                </mesh>
              </group>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}
