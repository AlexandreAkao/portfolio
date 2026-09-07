import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, type MotionValue } from 'motion/react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';
import SocialLinks from '@components/ui/SocialLinks';
import ErrorBoundary from '@components/ui/ErrorBoundary';

/* ------------------------------------------------------------------ */
/* Scene constants: the floor of a distribution centre at 3 a.m.       */
/* ------------------------------------------------------------------ */

const ASPHALT = '#17191c';
const CONCRETE = '#23262a';
const STEEL = '#3b4450';
const SAFETY_YELLOW = '#f5c400';
const SODIUM = '#ff9a2e';
const BLUE_SPOT = '#3f8cff';
const PACKET_CORE = '#dbe9ff';

const STATION_T = [0.08, 0.3, 0.52, 0.74, 0.94]; // receive, put-away, pick, pack, ship

const CAMERA_STATES = [
  { pos: new THREE.Vector3(-13, 4.2, 19), look: new THREE.Vector3(3, 0.4, -6) }, // DOCK
  { pos: new THREE.Vector3(1.5, 8.5, 6), look: new THREE.Vector3(4, 0.3, -12) }, // AISLES
  { pos: new THREE.Vector3(17, 3.2, -16), look: new THREE.Vector3(-1, 0.5, 0) }, // DISPATCH
];
const LEVELS = 5;
const LEVEL_H = 1.05;
const BAY_W = 1.25;
const BAY_D = 1.0;
const CARDBOARD = '#5b4b3a';
const BEAM = '#4a5563';

const STATE_LABELS: Record<'en' | 'pt', string[]> = {
  en: ['Dock', 'Aisles', 'Dispatch'],
  pt: ['Doca', 'Corredores', 'Expedição'],
};

const conveyorCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(2, 0.42, 8.5),
  new THREE.Vector3(6, 0.42, 3),
  new THREE.Vector3(10, 0.42, -3),
  new THREE.Vector3(15, 0.42, -10.5),
  new THREE.Vector3(21, 0.42, -19),
]);

const smoothstep = (a: number, b: number, x: number) => {
  const v = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return v * v * (3 - 2 * v);
};

/* ------------------------------------------------------------------ */
/* Racking: instanced steel bays receding into fog, cleared along the  */
/* conveyor's diagonal so the corridor is real, not painted on.        */
/* ------------------------------------------------------------------ */

interface Bay { x: number; z: number; tone: number; loads: boolean[] }

function buildBays(rows: number, bays: number): Bay[] {
  const path = conveyorCurve.getPoints(160);
  const list: Bay[] = [];
  const rowSpacing = 4.2;
  const rowStartX = -((rows - 1) * rowSpacing) / 2;
  for (let r = 0; r < rows; r++) {
    const x = rowStartX + r * rowSpacing;
    for (let b = 0; b < bays; b++) {
      const z = 8 - b * BAY_D;
      let near = Infinity;
      for (const p of path) {
        const dx = p.x - x;
        const dz = p.z - z;
        const d = dx * dx + dz * dz;
        if (d < near) near = d;
      }
      if (near < 2.4 * 2.4) continue; // keep the corridor clear
      list.push({
        x,
        z,
        tone: (Math.random() - 0.5) * 0.08,
        loads: Array.from({ length: LEVELS }, () => Math.random() < 0.72),
      });
    }
  }
  return list;
}

function Racking({ mobile }: { mobile: boolean }) {
  const uprights = useRef<THREE.InstancedMesh>(null);
  const beams = useRef<THREE.InstancedMesh>(null);
  const loads = useRef<THREE.InstancedMesh>(null);
  const bays = useMemo(() => (mobile ? buildBays(4, 14) : buildBays(6, 22)), [mobile]);
  const counts = useMemo(
    () => ({
      up: bays.length * 2,
      beam: bays.length * LEVELS,
      load: bays.reduce((n, b) => n + b.loads.filter(Boolean).length, 0),
    }),
    [bays]
  );

  useEffect(() => {
    const u = uprights.current;
    const be = beams.current;
    const lo = loads.current;
    if (!u || !be || !lo) return;
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    const postH = LEVELS * LEVEL_H + 0.3;
    let ui = 0;
    let bi = 0;
    let li = 0;
    bays.forEach((bay) => {
      for (const side of [-1, 1]) {
        m.makeTranslation(bay.x + (side * BAY_W) / 2, postH / 2, bay.z);
        u.setMatrixAt(ui, m);
        c.set(STEEL).offsetHSL(0, 0, bay.tone);
        u.setColorAt(ui, c);
        ui += 1;
      }
      for (let l = 0; l < LEVELS; l++) {
        const shelfY = 0.16 + l * LEVEL_H;
        m.makeTranslation(bay.x, shelfY, bay.z);
        be.setMatrixAt(bi, m);
        c.set(BEAM).offsetHSL(0, 0, bay.tone);
        be.setColorAt(bi, c);
        bi += 1;
        if (bay.loads[l]) {
          m.makeTranslation(bay.x, shelfY + 0.04 + 0.36, bay.z);
          lo.setMatrixAt(li, m);
          c.set(CARDBOARD).offsetHSL(0, (Math.random() - 0.5) * 0.06, (Math.random() - 0.5) * 0.12);
          lo.setColorAt(li, c);
          li += 1;
        }
      }
    });
    for (const mesh of [u, be, lo]) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }, [bays]);

  return (
    <group>
      <instancedMesh ref={uprights} args={[undefined, undefined, counts.up]} frustumCulled={false}>
        <boxGeometry args={[0.09, LEVELS * LEVEL_H + 0.3, 0.09]} />
        <meshStandardMaterial color={STEEL} roughness={0.7} metalness={0.45} />
      </instancedMesh>
      <instancedMesh ref={beams} args={[undefined, undefined, counts.beam]} frustumCulled={false}>
        <boxGeometry args={[BAY_W, 0.08, BAY_D]} />
        <meshStandardMaterial color={BEAM} roughness={0.75} metalness={0.4} />
      </instancedMesh>
      <instancedMesh ref={loads} args={[undefined, undefined, counts.load]} frustumCulled={false}>
        <boxGeometry args={[BAY_W * 0.78, 0.72, BAY_D * 0.85]} />
        <meshStandardMaterial color={CARDBOARD} roughness={0.95} metalness={0.02} />
      </instancedMesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Floor, aisle markings, conveyor and its five stations               */
/* ------------------------------------------------------------------ */

function Floor({ mobile }: { mobile: boolean }) {
  const rows = mobile ? 4 : 6;
  const rowSpacing = 4.2;
  const rowStartX = -((rows - 1) * rowSpacing) / 2;
  const markings = useMemo(() => {
    const xs: number[] = [];
    for (let r = 0; r < rows - 1; r++) xs.push(rowStartX + r * rowSpacing + rowSpacing / 2);
    return xs;
  }, [rows, rowStartX]);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -4]}>
        <planeGeometry args={[110, 110]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.96} metalness={0.02} />
      </mesh>
      {markings.map((x) => (
        <mesh key={x} position={[x, 0.012, -4]}>
          <boxGeometry args={[0.07, 0.01, 46]} />
          <meshBasicMaterial color={SAFETY_YELLOW} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Conveyor() {
  const tube = useMemo(() => new THREE.TubeGeometry(conveyorCurve, 160, 0.14, 10, false), []);
  const stations = useMemo(() => STATION_T.map((tt) => conveyorCurve.getPointAt(tt)), []);
  return (
    <group>
      <mesh geometry={tube}>
        <meshStandardMaterial color="#2c333c" roughness={0.6} metalness={0.5} />
      </mesh>
      {stations.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <mesh position={[0.55, 0.7, 0]}>
            <boxGeometry args={[0.1, 1.4, 0.1]} />
            <meshStandardMaterial color={STEEL} roughness={0.7} metalness={0.4} />
          </mesh>
          <mesh position={[0.55, 1.5, 0]}>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshBasicMaterial color={PACKET_CORE} toneMapped={false} fog={false} />
          </mesh>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.015, 0]}>
            <ringGeometry args={[0.7, 0.78, 32]} />
            <meshBasicMaterial color={SAFETY_YELLOW} toneMapped={false} transparent opacity={0.55} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Packets: orders routing receive → put-away → pick → pack → ship,    */
/* each with its own speed and a real stop at every station.           */
/* ------------------------------------------------------------------ */

interface Packet { t: number; speed: number; pause: number; nextStation: number; hidden: number }

function Packets({ count, still }: { count: number; still: boolean }) {
  const core = useRef<THREE.InstancedMesh>(null);
  const halo = useRef<THREE.InstancedMesh>(null);
  const packets = useMemo<Packet[]>(() => {
    const list: Packet[] = [];
    for (let i = 0; i < count; i++) {
      const t0 = Math.random();
      list.push({
        t: t0,
        speed: 0.035 + Math.random() * 0.03,
        pause: 0,
        nextStation: STATION_T.findIndex((s) => s > t0),
        hidden: 0,
      });
    }
    return list;
  }, [count]);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const scale = useMemo(() => new THREE.Vector3(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);

  useFrame((state, delta) => {
    const c = core.current;
    const h = halo.current;
    if (!c || !h) return;
    const dt = still ? 0 : Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;
    packets.forEach((p, i) => {
      if (p.hidden > 0) {
        p.hidden -= dt;
        if (p.hidden <= 0) {
          p.t = 0;
          p.nextStation = 0;
          p.pause = 0;
        }
      } else if (p.pause > 0) {
        p.pause -= dt;
      } else {
        p.t += p.speed * dt;
        const s = STATION_T[p.nextStation];
        if (s !== undefined && p.t >= s) {
          p.t = s;
          p.pause = 0.45 + Math.random() * 0.5;
          p.nextStation += 1;
        }
        if (p.t >= 1) {
          p.t = 1;
          p.hidden = 0.6 + Math.random() * 0.8;
        }
      }
      const visible = p.hidden <= 0 || p.t === 0;
      conveyorCurve.getPointAt(Math.min(1, Math.max(0, p.t)), pos);
      pos.y += 0.32 + Math.sin(time * 3 + i) * 0.03;
      const sCore = visible ? 1 : 0.0001;
      scale.set(sCore, sCore, sCore);
      m.compose(pos, quat, scale);
      c.setMatrixAt(i, m);
      const pulse = visible ? 1 + Math.sin(time * 4 + i * 1.7) * 0.18 : 0.0001;
      scale.set(pulse, pulse, pulse);
      m.compose(pos, quat, scale);
      h.setMatrixAt(i, m);
    });
    c.instanceMatrix.needsUpdate = true;
    h.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={core} args={[undefined, undefined, count]} frustumCulled={false}>
        <sphereGeometry args={[0.085, 10, 10]} />
        <meshBasicMaterial color={PACKET_CORE} toneMapped={false} fog={false} />
      </instancedMesh>
      <instancedMesh ref={halo} args={[undefined, undefined, count]} frustumCulled={false}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshBasicMaterial
          color={BLUE_SPOT}
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          fog={false}
        />
      </instancedMesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Three light sources only: sodium lamps, one forklift blue spot,     */
/* and the packets' own glow. Ambient stays at floor level.            */
/* ------------------------------------------------------------------ */

function Lights({ still }: { still: boolean }) {
  const spot = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const s = spot.current;
    if (!s) return;
    const tm = still ? 0 : clock.elapsedTime * 0.22;
    s.position.set(-9 + Math.sin(tm) * 9, 6.5, -3 + Math.cos(tm * 0.7) * 7);
    target.position.set(s.position.x + 1.5, 0, s.position.z - 2.5);
    target.updateMatrixWorld();
  });
  return (
    <group>
      <ambientLight intensity={0.14} />
      {[[-9, 2], [-1, -6], [7, -14], [-5, -20], [11, 2]].map(([x, z], i) => (
        <group key={i} position={[x, 6.4, z]}>
          <pointLight color={SODIUM} intensity={260} distance={34} decay={2} />
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.7, 0.14, 0.7]} />
            <meshBasicMaterial color={SODIUM} toneMapped={false} fog={false} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.06, 0.5, 0.06]} />
            <meshStandardMaterial color={STEEL} roughness={0.8} />
          </mesh>
        </group>
      ))}
      <spotLight
        ref={spot}
        color={BLUE_SPOT}
        intensity={1100}
        angle={0.42}
        penumbra={0.75}
        distance={32}
        decay={2}
        target={target}
      />
      <primitive object={target} />
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
    camera.position.copy(CAMERA_STATES[0].pos);
    camera.lookAt(CAMERA_STATES[0].look);
  }, [camera]);

  useFrame(() => {
    const p = still ? 0 : progress.get();
    if (stepped) {
      const idx = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
      targetPos.copy(CAMERA_STATES[idx].pos);
      targetLook.copy(CAMERA_STATES[idx].look);
      // A phone's narrow field crops the sides; look a little further right so
      // the conveyor and its lit packets stay in the dock frame.
      if (idx === 0) targetLook.x += 5;
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

function WarehouseScene({ progress, still }: { progress: MotionValue<number>; still: boolean }) {
  const { size } = useThree();
  const mobile = size.width < 768;
  return (
    <>
      {!mobile && <fog attach="fog" args={[ASPHALT, 12, 48]} />}
      <Lights still={still} />
      <Floor mobile={mobile} />
      <Racking mobile={mobile} />
      <Conveyor />
      <Packets count={mobile ? 10 : 24} still={still} />
      <CameraRig progress={progress} still={still} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Mount only while this world is active, so hidden worlds never       */
/* burn a render loop behind display:none.                              */
/* ------------------------------------------------------------------ */

function useActiveDesign(id: string) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const read = () => setActive(document.documentElement.dataset.design === id);
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-design'] });
    return () => obs.disconnect();
  }, [id]);
  return active;
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function FloorFallback() {
  return (
    <div
      className="absolute inset-0"
      aria-hidden="true"
      style={{
        background:
          'linear-gradient(180deg, #17191c 0%, #1b1e22 45%, #23262a 100%), repeating-linear-gradient(90deg, transparent 0 96px, rgba(245,196,0,0.35) 96px 98px)',
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
  const [stateIdx, setStateIdx] = useState(0);
  const reduced = useReducedMotion();
  const active = useActiveDesign('nightshift');
  const still = !!reduced;

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  useEffect(() => {
    setMounted(true);
    setWebgl(hasWebGL());
  }, []);

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
        {/* Scene */}
        {mounted && active && webgl ? (
          <div className="absolute inset-0">
            <Canvas
              dpr={[1, 1.5]}
              camera={{ fov: 52, near: 0.1, far: 120, position: [-11, 3.2, 17] }}
              gl={{ antialias: true, powerPreference: 'high-performance' }}
              style={{ background: 'transparent' }}
            >
              <WarehouseScene progress={scrollYProgress} still={still} />
            </Canvas>
          </div>
        ) : mounted ? (
          <FloorFallback />
        ) : null}

        {/* Keeps the left column legible over the floor without killing the scene */}
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-r from-bg via-bg/55 to-transparent md:via-40%"
          aria-hidden="true"
        />

        {/* Text column */}
        <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl items-center px-6 md:px-12">
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

        {/* Live shift state: honest mono, this is a readout */}
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
