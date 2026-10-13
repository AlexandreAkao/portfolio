/**
 * Clay: the hero's set, live in Three.js. A painted sweep on the tabletop; Akira
 * has just got up from his clay desk (the laptop showing code rolled in clay, the
 * rubber duck, the mug) to wave; </> stands in front in clay coils.
 * It is shot on twos: the canvas renders only 12 frames a second (frameloop
 * "demand", invalidated on a 12 fps clock), each frame re-handles the clay, and
 * it stops rendering while the hero is off screen or the tab is hidden.
 */
import { useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import ClayAkira from './ClayAkira';
import { backdropMap, clayBump } from './clayTextures';

const SWEEP = '#13a89e';
type Pointer = React.MutableRefObject<{ x: number; y: number }>;
export type Framing = 'side' | 'centre';

/** Floor, a quarter-round cove, then the wall: one continuous sheet of painted paper. */
function sweepGeometry() {
  const profile: [number, number][] = [];
  for (let z = 8; z > -1.2; z -= 0.4) profile.push([0, z]);
  const r = 2.6;
  for (let i = 0; i <= 16; i++) {
    const a = (i / 16) * (Math.PI / 2);
    profile.push([r - Math.cos(a) * r, -1.2 - Math.sin(a) * r]);
  }
  for (let y = r + 0.5; y <= 14; y += 1) profile.push([y, -1.2 - r]);
  const width = 30;
  const segX = 2;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  profile.forEach(([y, z], j) => {
    for (let i = 0; i <= segX; i++) {
      pos.push(-width / 2 + (i / segX) * width, y, z);
      uv.push((i / segX) * 3, (j / profile.length) * 3);
    }
  });
  for (let j = 0; j < profile.length - 1; j++) {
    for (let i = 0; i < segX; i++) {
      const a = j * (segX + 1) + i;
      const b = a + segX + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** A clay coil along a hand-rolled path, with rounded ends. */
function Coil({ points, closed = false, radius, mat }: { points: THREE.Vector3[]; closed?: boolean; radius: number; mat: THREE.Material }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points, closed, 'catmullrom', 0.5);
    return new THREE.TubeGeometry(curve, 80, radius, 18, closed);
  }, [points, closed, radius]);
  return (
    <>
      <mesh geometry={geo} material={mat} castShadow receiveShadow />
      {!closed && (
        <>
          <mesh material={mat} position={points[0]} castShadow>
            <sphereGeometry args={[radius, 18, 12]} />
          </mesh>
          <mesh material={mat} position={points[points.length - 1]} castShadow>
            <sphereGeometry args={[radius, 18, 12]} />
          </mesh>
        </>
      )}
    </>
  );
}

/** The wooden modelling tool and a spare lump of clay, left on set. */
function SetDressing({ clay }: { clay: THREE.Texture }) {
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c99a5e', roughness: 0.7 }), []);
  const lump = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f26b8a', roughness: 0.6, bumpMap: clay, bumpScale: 3.4 }), [clay]);
  return (
    <>
      <group position={[-0.5, 0.035, 0.95]} rotation={[0, 0.9, Math.PI / 2]}>
        <mesh material={wood} castShadow receiveShadow>
          <capsuleGeometry args={[0.03, 0.62, 6, 12]} />
        </mesh>
      </group>
      <mesh material={lump} position={[0.05, 0.1, 1.25]} scale={[0.2, 0.11, 0.17]} castShadow receiveShadow>
        <sphereGeometry args={[1, 24, 16]} />
      </mesh>
    </>
  );
}

const CODE = ['#f26b8a', '#ffb000', '#7fe0d6', '#b9a3ff', '#f7f2ea'];
type Seg = [number, number];
/** Each line: indent, then [length, colour index] segments. Syntax highlighting, rolled. */
const LINES: [number, Seg[]][] = [
  [0, [[0.12, 3], [0.18, 4], [0.06, 1]]],
  [1, [[0.1, 0], [0.22, 2]]],
  [1, [[0.08, 0], [0.14, 4], [0.1, 1]]],
  [2, [[0.24, 2]]],
  [1, [[0.06, 3]]],
  [0, [[0.05, 4]]],
  [0, [[0.14, 0], [0.1, 2]]],
];

function useClay(clay: THREE.Texture, color: string) {
  return useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.6, bumpMap: clay, bumpScale: 3.4 }), [clay, color]);
}

/** The laptop he just got up from: clay code on a dark clay screen. */
function Laptop({ clay }: { clay: THREE.Texture }) {
  const shell = useClay(clay, '#c9ccd6');
  const panel = useClay(clay, '#2a2433');
  const inks = useMemo(() => CODE.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, bumpMap: clay, bumpScale: 2 })), [clay]);
  const segs = useMemo(() => {
    const out: { x: number; y: number; len: number; c: number }[] = [];
    LINES.forEach(([indent, parts], li) => {
      let x = -0.3 + indent * 0.06;
      parts.forEach(([len, c]) => {
        out.push({ x: x + len / 2, y: 0.43 - li * 0.055, len, c });
        x += len + 0.025;
      });
    });
    return out;
  }, []);
  return (
    <group>
      <RoundedBox args={[0.8, 0.05, 0.54]} radius={0.02} material={shell} position={[0, 0.025, 0]} castShadow receiveShadow />
      <group position={[0, 0.05, -0.26]} rotation={[-0.3, 0, 0]}>
        <RoundedBox args={[0.8, 0.54, 0.04]} radius={0.02} material={shell} position={[0, 0.27, 0]} castShadow receiveShadow />
        <RoundedBox args={[0.72, 0.46, 0.012]} radius={0.005} material={panel} position={[0, 0.27, 0.022]} />
        {segs.map((g, i) => (
          <mesh key={i} material={inks[g.c]} position={[g.x, g.y, 0.034]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.014, Math.max(0.001, g.len - 0.028), 4, 8]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Rubber duck, for debugging out loud. */
function Duck({ clay }: { clay: THREE.Texture }) {
  const yellow = useClay(clay, '#ffd23a');
  const beak = useClay(clay, '#f28a1a');
  const ink = useMemo(() => new THREE.MeshStandardMaterial({ color: '#141012', roughness: 0.3 }), []);
  return (
    <group>
      <mesh material={yellow} position={[0, 0.09, 0]} scale={[0.12, 0.09, 0.13]} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
      </mesh>
      <mesh material={yellow} position={[0, 0.2, 0.05]} castShadow>
        <sphereGeometry args={[0.07, 20, 14]} />
      </mesh>
      <mesh material={yellow} position={[0, 0.14, -0.12]} scale={[0.04, 0.05, 0.04]} castShadow>
        <sphereGeometry args={[1, 12, 8]} />
      </mesh>
      <mesh material={beak} position={[0, 0.19, 0.12]} scale={[0.045, 0.018, 0.045]} castShadow>
        <sphereGeometry args={[1, 16, 10]} />
      </mesh>
      {[-1, 1].map((x) => (
        <mesh key={x} material={ink} position={[x * 0.03, 0.225, 0.105]}>
          <sphereGeometry args={[0.011, 8, 6]} />
        </mesh>
      ))}
    </group>
  );
}

function Mug({ clay }: { clay: THREE.Texture }) {
  const pink = useClay(clay, '#f26b8a');
  const coffee = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3b2016', roughness: 0.2 }), []);
  return (
    <group>
      <mesh material={pink} position={[0, 0.09, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.085, 0.08, 0.18, 24]} />
      </mesh>
      <mesh material={coffee} position={[0, 0.172, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.07, 24]} />
      </mesh>
      <mesh material={pink} position={[0.095, 0.09, 0]} castShadow>
        <torusGeometry args={[0.045, 0.016, 8, 16]} />
      </mesh>
    </group>
  );
}

/** A chunky clay desk with the laptop cable running off the back to the floor. */
function Desk({ clay }: { clay: THREE.Texture }) {
  const top = useClay(clay, '#ffb000');
  const cable = useClay(clay, '#2a2433');
  const cableGeo = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.3, 0.97, -0.55),
      new THREE.Vector3(0.75, 0.9, -0.62),
      new THREE.Vector3(0.95, 0.3, -0.5),
      new THREE.Vector3(1.05, 0.03, -0.1),
      new THREE.Vector3(1.6, 0.03, 0.35),
    ]);
    return new THREE.TubeGeometry(c, 60, 0.018, 8, false);
  }, []);
  return (
    <group>
      <RoundedBox args={[1.9, 0.12, 0.95]} radius={0.05} material={top} position={[0, 0.9, 0]} castShadow receiveShadow />
      {[
        [-0.82, -0.36],
        [0.82, -0.36],
        [-0.82, 0.36],
        [0.82, 0.36],
      ].map(([x, z], i) => (
        <mesh key={i} material={top} position={[x, 0.42, z]} castShadow receiveShadow>
          <capsuleGeometry args={[0.055, 0.78, 6, 12]} />
        </mesh>
      ))}
      <mesh geometry={cableGeo} material={cable} castShadow receiveShadow />
    </group>
  );
}

/** </> rolled in clay, standing in front of the desk. */
function CodeGlyph({ clay }: { clay: THREE.Texture }) {
  const pink = useClay(clay, '#f26b8a');
  const orange = useClay(clay, '#ffb000');
  const purple = useClay(clay, '#6a4bc4');
  const lt = useMemo(() => [new THREE.Vector3(0.2, 0.56, 0), new THREE.Vector3(-0.08, 0.33, 0.02), new THREE.Vector3(0.2, 0.08, 0)], []);
  const sl = useMemo(() => [new THREE.Vector3(0.32, 0.07, 0), new THREE.Vector3(0.43, 0.33, 0.01), new THREE.Vector3(0.55, 0.6, 0)], []);
  const gt = useMemo(() => [new THREE.Vector3(0.68, 0.56, 0), new THREE.Vector3(0.96, 0.33, 0.02), new THREE.Vector3(0.68, 0.08, 0)], []);
  return (
    <group>
      <Coil points={lt} radius={0.075} mat={pink} />
      <Coil points={sl} radius={0.075} mat={orange} />
      <Coil points={gt} radius={0.075} mat={purple} />
    </group>
  );
}

/**
 * Frames the set. "side": Akira and the desk to the right of the copy (wide
 * screens, the canvas behind the whole hero). "centre": the canvas is its own
 * block under the copy; the camera fits Akira, the desk and the coil inside the
 * frame's width with a margin, whatever the block's shape.
 */
function Rig({ pointer, still, framing }: { pointer: Pointer; still: boolean; framing: Framing }) {
  const { camera, size } = useThree();
  const aspect = size.width / size.height;
  useFrame(() => {
    const centre = framing === 'centre';
    const target = centre ? new THREE.Vector3(1.5, 1.2, 0) : new THREE.Vector3(-0.05, 1.2, 0);
    // 4.3 units of set across the frame: fov 30 gives tan(15deg) = 0.268
    const dist = centre ? Math.max(7, 2.15 / (0.268 * aspect)) : 9.1;
    const px = still ? 0 : pointer.current.x * 0.25;
    const py = still ? 0 : pointer.current.y * 0.12;
    camera.position.set(target.x + px, target.y + 0.35 + py, dist);
    camera.lookAt(target);
  });
  return null;
}

/** The 12 fps clock: one render per frame of film, paused when nobody can see it. */
function Clock({ running }: { running: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!running) {
      invalidate();
      return;
    }
    const id = window.setInterval(() => {
      if (document.hidden) return;
      invalidate();
    }, 1000 / 12);
    return () => window.clearInterval(id);
  }, [running, invalidate]);
  return null;
}

function Set({ pointer, clay, still, lite, framing }: { pointer: Pointer; clay: THREE.CanvasTexture; still: boolean; lite: boolean; framing: Framing }) {
  const sweep = useMemo(() => sweepGeometry(), []);
  const paper = useMemo(() => new THREE.MeshStandardMaterial({ map: backdropMap(SWEEP), roughness: 0.92 }), []);
  // Each new frame the hands have been on the clay: the surface detail shifts
  useFrame(() => {
    if (!still) clay.offset.set(Math.random() * 0.02, Math.random() * 0.02);
  });
  return (
    <>
      <Rig pointer={pointer} still={still} framing={framing} />
      <color attach="background" args={[SWEEP]} />
      <mesh geometry={sweep} material={paper} receiveShadow />
      <hemisphereLight args={['#ffffff', '#0d6e67', 0.9]} />
      <directionalLight
        position={[-3.5, 6.5, 5]}
        intensity={2.4}
        color="#fff3e2"
        castShadow
        shadow-mapSize={lite ? [1024, 1024] : [2048, 2048]}
        shadow-radius={7}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-3}
      />
      <directionalLight position={[5, 2, 4]} intensity={0.5} color="#dff6ff" />
      <directionalLight position={[2, 4, -5]} intensity={1.4} color="#ffffff" />
      <Environment resolution={64} environmentIntensity={0.35} frames={1}>
        <Lightformer form="rect" intensity={2} position={[-3, 4, 4]} scale={[4, 3, 1]} />
        <Lightformer form="rect" intensity={1} position={[4, 2, 3]} scale={[3, 3, 1]} />
      </Environment>
      <group position={[0.45, 0, 0.35]} rotation={[0, -0.12, 0]}>
        <ClayAkira pose="wave" clayMap={clay} pointer={still ? undefined : pointer} still={still} />
      </group>
      <group position={[2.35, 0, -0.45]}>
        <Desk clay={clay} />
        <group position={[0.15, 0.96, -0.05]} rotation={[0, -0.4, 0]}>
          <Laptop clay={clay} />
        </group>
        <group position={[-0.62, 0.96, 0.22]} rotation={[0, 0.5, 0]}>
          <Duck clay={clay} />
        </group>
        <group position={[0.72, 0.96, 0.25]}>
          <Mug clay={clay} />
        </group>
      </group>
      <group position={[1.55, 0, 0.95]} rotation={[0, -0.15, 0]}>
        <CodeGlyph clay={clay} />
      </group>
      {/* The modelling tool and spare clay lie left of Akira, under the copy: only the wide shot has room */}
      {framing === 'side' && (
        <group position={[-0.15, 0, 0]}>
          <SetDressing clay={clay} />
        </group>
      )}
    </>
  );
}

interface Props {
  pointer: Pointer;
  /** Reduced motion: one frame, held. */
  still: boolean;
  /** Phones: a lighter render (pixel ratio and shadow map). */
  lite: boolean;
  framing: Framing;
  /** False while the hero is off screen: the camera stops. */
  running: boolean;
}

export default function ClaySet({ pointer, still, lite, framing, running }: Props) {
  const clay = useMemo(() => clayBump(), []);
  useEffect(() => () => clay.dispose(), [clay]);
  return (
    <Canvas
      frameloop="demand"
      shadows="percentage"
      dpr={lite ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true, toneMapping: THREE.NeutralToneMapping, powerPreference: 'low-power' }}
      camera={{ fov: 30, position: [-0.05, 1.55, 9.1], near: 0.1, far: 80 }}
    >
      <Clock running={running && !still} />
      <Set pointer={pointer} clay={clay} still={still} lite={lite} framing={framing} />
    </Canvas>
  );
}
