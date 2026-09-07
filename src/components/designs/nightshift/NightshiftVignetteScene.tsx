import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'motion/react';
import * as THREE from 'three';
import { BEAM, BLUE_SPOT, CARDBOARD, CONCRETE, FirstFrames, PACKET_CORE, SODIUM, STEEL, TARMAC } from './scene';

/* ------------------------------------------------------------------ */
/* Manifest vignettes: one small lit object per job, built from the    */
/* facts of that job, under the world's three light families.          */
/* ------------------------------------------------------------------ */

export type VignetteKind = 'services' | 'racking' | 'truck' | 'components' | 'devices' | 'chart';

const UP = new THREE.Vector3(0, 1, 0);

function Turntable({ children, still }: { children: React.ReactNode; still: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (still || !g.current) return;
    g.current.rotation.y += Math.min(delta, 0.05) * 0.28;
  });
  return (
    <group ref={g} rotation-y={0.65}>
      {children}
    </group>
  );
}

function Plate() {
  return (
    <mesh position={[0, -0.06, 0]}>
      <boxGeometry args={[2.7, 0.12, 2.7]} />
      <meshStandardMaterial color={CONCRETE} roughness={0.95} metalness={0.02} />
    </mesh>
  );
}

/* Seva / Appointally: a cluster of services on one plate, messages travelling between them */
const SERVICE_NODES: [number, number, number][] = [
  [0, 0, 0.95],
  [0.85, 0.2, 0.5],
  [0.45, 0.82, 0.62],
  [-0.5, 0.72, 0.42],
  [-0.9, -0.1, 0.7],
  [-0.42, -0.82, 0.55],
  [0.5, -0.75, 0.4],
];
const SERVICE_EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 2], [3, 4], [5, 6],
];

function Services({ still }: { still: boolean }) {
  const beacons = useRef<THREE.InstancedMesh>(null);
  const pulses = useRef<THREE.InstancedMesh>(null);
  const messages = useMemo(
    () => Array.from({ length: 3 }, (_, i) => ({ edge: (i * 3) % SERVICE_EDGES.length, u: Math.random(), speed: 0.55 + Math.random() * 0.4 })),
    []
  );
  const edges = useMemo(
    () =>
      SERVICE_EDGES.map(([a, b]) => {
        const pa = new THREE.Vector3(SERVICE_NODES[a][0], 0.03, SERVICE_NODES[a][1]);
        const pb = new THREE.Vector3(SERVICE_NODES[b][0], 0.03, SERVICE_NODES[b][1]);
        const mid = pa.clone().add(pb).multiplyScalar(0.5);
        const dir = pb.clone().sub(pa);
        const len = dir.length();
        const rot = new THREE.Matrix4().lookAt(mid.clone().add(dir), mid, UP);
        return { pa, pb, mid, len, quat: new THREE.Quaternion().setFromRotationMatrix(rot) };
      }),
    []
  );
  const m = useMemo(() => new THREE.Matrix4(), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  const s = useMemo(() => new THREE.Vector3(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);

  useFrame(({ clock }, delta) => {
    const be = beacons.current;
    const pu = pulses.current;
    if (!be || !pu) return;
    const time = still ? 0 : clock.elapsedTime;
    const dt = still ? 0 : Math.min(delta, 0.05);
    SERVICE_NODES.forEach(([x, z, h], i) => {
      const k = 0.85 + Math.sin(time * 2.4 + i * 1.3) * 0.25;
      p.set(x, h + 0.04, z);
      s.set(k, 1, k);
      m.compose(p, q, s);
      be.setMatrixAt(i, m);
    });
    messages.forEach((msg, i) => {
      msg.u += msg.speed * dt;
      if (msg.u > 1) {
        msg.u = 0;
        msg.edge = Math.floor(Math.random() * SERVICE_EDGES.length);
      }
      const e = edges[msg.edge];
      p.lerpVectors(e.pa, e.pb, msg.u);
      p.y = 0.08;
      s.set(1, 1, 1);
      m.compose(p, q, s);
      pu.setMatrixAt(i, m);
    });
    be.instanceMatrix.needsUpdate = true;
    pu.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <Plate />
      {SERVICE_NODES.map(([x, z, h], i) => (
        <mesh key={i} position={[x, h / 2, z]}>
          <boxGeometry args={[0.36, h, 0.36]} />
          <meshStandardMaterial color={BEAM} roughness={0.75} metalness={0.2} />
        </mesh>
      ))}
      {edges.map((e, i) => (
        <mesh key={i} position={e.mid} quaternion={e.quat}>
          <boxGeometry args={[0.04, 0.012, e.len]} />
          <meshBasicMaterial color={PACKET_CORE} toneMapped={false} transparent opacity={0.28} />
        </mesh>
      ))}
      <instancedMesh ref={beacons} args={[undefined, undefined, SERVICE_NODES.length]} frustumCulled={false}>
        <boxGeometry args={[0.14, 0.05, 0.14]} />
        <meshBasicMaterial color={PACKET_CORE} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={pulses} args={[undefined, undefined, messages.length]} frustumCulled={false}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshBasicMaterial color={BLUE_SPOT} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/* AmbevTech WMS: the warehouse survives here, where it is true, as three rows of racking and one picked packet */
const RACK_ROWS = [-0.9, 0, 0.9];
const RACK_BAYS = [-0.72, -0.24, 0.24, 0.72];
const RACK_LEVELS = 3;
const RACK_LEVEL_H = 0.34;

function Racking({ still }: { still: boolean }) {
  const uprights = useRef<THREE.InstancedMesh>(null);
  const beams = useRef<THREE.InstancedMesh>(null);
  const loads = useRef<THREE.InstancedMesh>(null);
  const packet = useRef<THREE.Group>(null);
  const loadPlan = useMemo(
    () => RACK_ROWS.flatMap(() => RACK_BAYS.flatMap(() => Array.from({ length: RACK_LEVELS }, () => Math.random() < 0.7))),
    []
  );
  const loadCount = loadPlan.filter(Boolean).length;

  useEffect(() => {
    const u = uprights.current;
    const b = beams.current;
    const l = loads.current;
    if (!u || !b || !l) return;
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    let ui = 0;
    let bi = 0;
    let li = 0;
    let plan = 0;
    RACK_ROWS.forEach((x) => {
      RACK_BAYS.forEach((z) => {
        for (const side of [-1, 1]) {
          m.makeTranslation(x + side * 0.2, 0.55, z);
          u.setMatrixAt(ui++, m);
        }
        for (let lv = 0; lv < RACK_LEVELS; lv++) {
          const y = 0.06 + lv * RACK_LEVEL_H;
          m.makeTranslation(x, y, z);
          b.setMatrixAt(bi++, m);
          if (loadPlan[plan++]) {
            m.makeTranslation(x, y + 0.15, z);
            l.setMatrixAt(li, m);
            c.set(CARDBOARD).offsetHSL(0, (Math.random() - 0.5) * 0.06, (Math.random() - 0.5) * 0.12);
            l.setColorAt(li, c);
            li++;
          }
        }
      });
    });
    for (const mesh of [u, b, l]) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }, [loadPlan]);

  useFrame(({ clock }) => {
    const g = packet.current;
    if (!g) return;
    const time = still ? 0.4 : clock.elapsedTime * 0.35;
    const z = ((time % 1) * 2.4) - 1.2;
    g.position.set(0.45, 0.2 + Math.sin(time * 9) * 0.02, z);
  });

  return (
    <group>
      <Plate />
      <instancedMesh ref={uprights} args={[undefined, undefined, RACK_ROWS.length * RACK_BAYS.length * 2]} frustumCulled={false}>
        <boxGeometry args={[0.035, 1.1, 0.035]} />
        <meshStandardMaterial color={STEEL} roughness={0.7} metalness={0.45} />
      </instancedMesh>
      <instancedMesh ref={beams} args={[undefined, undefined, RACK_ROWS.length * RACK_BAYS.length * RACK_LEVELS]} frustumCulled={false}>
        <boxGeometry args={[0.42, 0.03, 0.44]} />
        <meshStandardMaterial color={BEAM} roughness={0.75} metalness={0.4} />
      </instancedMesh>
      <instancedMesh ref={loads} args={[undefined, undefined, loadCount]} frustumCulled={false}>
        <boxGeometry args={[0.32, 0.24, 0.36]} />
        <meshStandardMaterial color={CARDBOARD} roughness={0.95} metalness={0.02} />
      </instancedMesh>
      <group ref={packet}>
        <mesh>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshBasicMaterial color={PACKET_CORE} toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshBasicMaterial color={BLUE_SPOT} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* AmbevTech BEES: a box truck and two crates, orders going out across the continent */
function Truck({ still }: { still: boolean }) {
  const body = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!body.current) return;
    body.current.position.y = still ? 0 : Math.sin(clock.elapsedTime * 2.2) * 0.012;
  });
  const wheels: [number, number][] = [
    [-0.78, -0.4], [-0.78, 0.4], [0.3, -0.4], [0.3, 0.4], [0.62, -0.4], [0.62, 0.4],
  ];
  return (
    <group>
      <Plate />
      <group ref={body} position={[0.05, 0, -0.1]}>
        {/* chassis, cab, cargo box */}
        <mesh position={[-0.1, 0.3, 0]}>
          <boxGeometry args={[2.0, 0.12, 0.66]} />
          <meshStandardMaterial color={STEEL} roughness={0.8} metalness={0.4} />
        </mesh>
        <mesh position={[-0.86, 0.62, 0]}>
          <boxGeometry args={[0.56, 0.6, 0.8]} />
          <meshStandardMaterial color={TARMAC} roughness={0.7} metalness={0.2} />
        </mesh>
        <mesh position={[-1.15, 0.72, 0]}>
          <boxGeometry args={[0.03, 0.3, 0.62]} />
          <meshBasicMaterial color={BLUE_SPOT} transparent opacity={0.45} toneMapped={false} />
        </mesh>
        <mesh position={[0.24, 0.8, 0]}>
          <boxGeometry args={[1.5, 0.9, 0.84]} />
          <meshStandardMaterial color={BEAM} roughness={0.75} metalness={0.15} />
        </mesh>
        {/* headlights */}
        {[-0.26, 0.26].map((z) => (
          <mesh key={z} position={[-1.15, 0.42, z]}>
            <boxGeometry args={[0.03, 0.07, 0.12]} />
            <meshBasicMaterial color={PACKET_CORE} toneMapped={false} />
          </mesh>
        ))}
        {wheels.map(([x, z], i) => (
          <mesh key={i} position={[x, 0.17, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.17, 0.17, 0.12, 14]} />
            <meshStandardMaterial color="#1c1f23" roughness={0.9} />
          </mesh>
        ))}
      </group>
      <mesh position={[0.95, 0.16, 0.85]}>
        <boxGeometry args={[0.32, 0.32, 0.32]} />
        <meshStandardMaterial color={CARDBOARD} roughness={0.95} />
      </mesh>
      <mesh position={[0.62, 0.15, 1.0]} rotation-y={0.4}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={CARDBOARD} roughness={0.95} />
      </mesh>
    </group>
  );
}

/* AmbevTech UIKit: a grid of component tiles breathing in a wave, the active ones lit */
const TILE_COLS = 5;
const TILE_ROWS = 4;
const TILE = 0.36;
const TILE_GAP = 0.1;
const ACTIVE_TILES = [1, 7, 12, 18];

function Components({ still }: { still: boolean }) {
  const tiles = useRef<THREE.InstancedMesh>(null);
  const caps = useRef<THREE.InstancedMesh>(null);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  const s = useMemo(() => new THREE.Vector3(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const span = (n: number) => ((n - 1) * (TILE + TILE_GAP)) / 2;

  useFrame(({ clock }) => {
    const ti = tiles.current;
    const ca = caps.current;
    if (!ti || !ca) return;
    const time = still ? 0 : clock.elapsedTime;
    let ci = 0;
    for (let i = 0; i < TILE_COLS; i++) {
      for (let j = 0; j < TILE_ROWS; j++) {
        const idx = i * TILE_ROWS + j;
        const h = 0.14 + 0.09 * (1 + Math.sin(time * 1.7 + i * 0.6 + j * 0.9));
        const x = i * (TILE + TILE_GAP) - span(TILE_COLS);
        const z = j * (TILE + TILE_GAP) - span(TILE_ROWS);
        p.set(x, h / 2, z);
        s.set(1, h, 1);
        m.compose(p, q, s);
        ti.setMatrixAt(idx, m);
        if (ACTIVE_TILES.includes(idx)) {
          p.set(x, h + 0.012, z);
          s.set(1, 1, 1);
          m.compose(p, q, s);
          ca.setMatrixAt(ci++, m);
        }
      }
    }
    ti.instanceMatrix.needsUpdate = true;
    ca.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <Plate />
      <instancedMesh ref={tiles} args={[undefined, undefined, TILE_COLS * TILE_ROWS]} frustumCulled={false}>
        <boxGeometry args={[TILE, 1, TILE]} />
        <meshStandardMaterial color={BEAM} roughness={0.7} metalness={0.2} />
      </instancedMesh>
      <instancedMesh ref={caps} args={[undefined, undefined, ACTIVE_TILES.length]} frustumCulled={false}>
        <boxGeometry args={[TILE - 0.06, 0.02, TILE - 0.06]} />
        <meshBasicMaterial color={PACKET_CORE} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/* NATI - UNIFOR: web and mobile, a laptop and a phone with their screens on */
function Devices({ still }: { still: boolean }) {
  const screens = useRef<THREE.MeshBasicMaterial[]>([]);
  useFrame(({ clock }) => {
    const k = still ? 0.5 : 0.45 + Math.sin(clock.elapsedTime * 1.4) * 0.08;
    screens.current.forEach((mat) => {
      if (mat) mat.opacity = k;
    });
  });
  return (
    <group>
      <Plate />
      <group position={[-0.25, 0, 0.1]} rotation-y={0.15}>
        <mesh position={[0, 0.03, 0.1]}>
          <boxGeometry args={[1.3, 0.06, 0.86]} />
          <meshStandardMaterial color={STEEL} roughness={0.6} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.062, 0.14]}>
          <boxGeometry args={[1.1, 0.01, 0.48]} />
          <meshStandardMaterial color={TARMAC} roughness={0.9} />
        </mesh>
        <group position={[0, 0.06, -0.32]} rotation-x={-1.15}>
          <mesh position={[0, 0.42, 0]}>
            <boxGeometry args={[1.3, 0.84, 0.04]} />
            <meshStandardMaterial color={STEEL} roughness={0.6} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.42, 0.024]}>
            <planeGeometry args={[1.18, 0.7]} />
            <meshBasicMaterial
              ref={(el) => { if (el) screens.current[0] = el; }}
              color={BLUE_SPOT}
              transparent
              opacity={0.5}
              toneMapped={false}
            />
          </mesh>
        </group>
      </group>
      <group position={[0.85, 0, 0.55]} rotation={[-0.32, -0.55, 0]}>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.4, 0.82, 0.05]} />
          <meshStandardMaterial color={STEEL} roughness={0.55} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.42, 0.028]}>
          <planeGeometry args={[0.34, 0.72]} />
          <meshBasicMaterial
            ref={(el) => { if (el) screens.current[1] = el; }}
            color={BLUE_SPOT}
            transparent
            opacity={0.5}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

/* FUNCAP: research dashboards, seven bars that keep re-measuring */
const BAR_COUNT = 7;

function Chart({ still }: { still: boolean }) {
  const bars = useRef<THREE.InstancedMesh>(null);
  const tops = useRef<THREE.InstancedMesh>(null);
  const state = useMemo(
    () => ({
      h: Array.from({ length: BAR_COUNT }, (_, i) => 0.35 + ((i * 37) % 10) / 10),
      target: Array.from({ length: BAR_COUNT }, () => 0.3 + Math.random()),
      next: 2.6,
    }),
    []
  );
  const m = useMemo(() => new THREE.Matrix4(), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  const s = useMemo(() => new THREE.Vector3(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);

  useFrame(({ clock }, delta) => {
    const ba = bars.current;
    const to = tops.current;
    if (!ba || !to) return;
    if (!still && clock.elapsedTime > state.next) {
      state.next = clock.elapsedTime + 2.6 + Math.random();
      state.target = state.target.map(() => 0.3 + Math.random());
    }
    for (let i = 0; i < BAR_COUNT; i++) {
      if (!still) state.h[i] += (state.target[i] - state.h[i]) * Math.min(1, delta * 2.2);
      const h = state.h[i];
      const x = -1.05 + i * 0.35;
      p.set(x, h / 2, 0);
      s.set(1, h, 1);
      m.compose(p, q, s);
      ba.setMatrixAt(i, m);
      p.set(x, h + 0.05, 0);
      s.set(1, 1, 1);
      m.compose(p, q, s);
      to.setMatrixAt(i, m);
    }
    ba.instanceMatrix.needsUpdate = true;
    to.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <Plate />
      <instancedMesh ref={bars} args={[undefined, undefined, BAR_COUNT]} frustumCulled={false}>
        <boxGeometry args={[0.24, 1, 0.5]} />
        <meshStandardMaterial color={BEAM} roughness={0.7} metalness={0.2} />
      </instancedMesh>
      <instancedMesh ref={tops} args={[undefined, undefined, BAR_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshBasicMaterial color={PACKET_CORE} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

const MODELS: Record<VignetteKind, (props: { still: boolean }) => React.JSX.Element> = {
  services: Services,
  racking: Racking,
  truck: Truck,
  components: Components,
  devices: Devices,
  chart: Chart,
};

export default function NightshiftVignetteScene({ kind }: { kind: VignetteKind }) {
  const reduced = useReducedMotion();
  const still = !!reduced;
  const [drawn, setDrawn] = useState(false);
  const Model = MODELS[kind];
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ fov: 30, near: 0.1, far: 30, position: [3.2, 2.6, 3.6] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      onCreated={({ camera }) => camera.lookAt(0, 0.45, 0)}
      style={{ background: 'transparent', opacity: drawn ? 1 : 0, transition: 'opacity 0.5s ease-out' }}
    >
      <ambientLight intensity={0.34} />
      <pointLight color={SODIUM} position={[2.4, 3.6, 2.2]} intensity={78} distance={14} decay={2} />
      <pointLight color={BLUE_SPOT} position={[-2.6, 2.2, -2.2]} intensity={46} distance={12} decay={2} />
      <Turntable still={still}>
        <Model still={still} />
      </Turntable>
      <FirstFrames onReady={() => setDrawn(true)} />
    </Canvas>
  );
}
