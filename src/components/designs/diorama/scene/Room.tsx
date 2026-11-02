/**
 * The room from the user's reference photo, as a diorama cut open at the
 * front and left: graphite walls, a butcher-block desk along the back wall,
 * two monitors (one on a riser, one on the wall), wooden speakers, headphones
 * on a stand, plants, a pegboard, a pink monstera print, keyboards on a
 * tiered stand, an architect lamp, a window on the right wall, a racing chair
 * with Akira in it. The rest of the room's furniture and small things live in
 * Furnishings. Light, screens, pose and the chair's turn follow the day sample;
 * StaticMerge folds everything that never moves into a few draws.
 */
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { Locale } from '@i18n/utils';
import { clockText, type DaySample, type V3 } from '../day';
import Akira, { poseWeight } from './Akira';
import Furnishings, { Parts, Rod, type Part } from './Furnishings';
import { ScreenCanvas } from './screens';
import StaticMerge from './StaticMerge';
import Sunbeam from './Sunbeam';
import { aoTexture, carpetTexture, leafCanvas, matTexture, pegboardTexture, plasterTexture, printTexture, rugTexture, woodTexture } from './textures';

RectAreaLightUniformsLib.init();

const CHAIR: V3 = [-0.2, 0, -0.5];
const TURN_TO_CAMERA = 2.45;
/**
 * The layer of the shadow fins: the walls carried on upward, seen only by the sun's shadow camera,
 * so the cut-away room is lit from outside the way a real one is, through its window only, and not
 * over the tops of its cut walls.
 */
const FIN_LAYER = 2;

/** The moon's light through the window, after the sun has set. */
const MOON = new THREE.Color('#8ea6ff');
/** One rounded keycap, shared by every keyboard's instances. */
const KEYCAP = new RoundedBoxGeometry(1, 1, 1, 2, 0.18);

type Mat = THREE.Material;

/** The bottom row in key units: three modifiers, the space bar, four more. */
const BOTTOM_ROW = [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25];

function Keys({ x, y, z, w, d, rows, cols, color, base, accent = '#e3893a' }: { x: number; y: number; z: number; w: number; d: number; rows: number; cols: number; color: string; base: string; accent?: string }) {
  const keys = useMemo(() => {
    const out: { x: number; z: number; w: number; d: number; accent: boolean }[] = [];
    const kw = (w * 0.92) / cols;
    const kd = (d * 0.86) / rows;
    const z0 = -d * 0.43;
    const x0 = -w * 0.46;
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols; c++) {
        out.push({ x: x0 + kw * (c + 0.5), z: z0 + kd * (r + 0.5), w: kw * 0.84, d: kd * 0.82, accent: (r === 0 && c === 0) || (r === 2 && c === cols - 1) });
      }
    }
    const unit = (kw * cols) / BOTTOM_ROW.reduce((a, b) => a + b, 0);
    let cx = x0;
    for (const u of BOTTOM_ROW) {
      out.push({ x: cx + (u * unit) / 2, z: z0 + kd * (rows - 0.5), w: u * unit - kw * 0.16, d: kd * 0.82, accent: false });
      cx += u * unit;
    }
    return out;
  }, [w, d, rows, cols]);
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    keys.forEach((k, i) => {
      o.position.set(k.x, 0, k.z);
      o.scale.set(k.w, 0.013, k.d);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      mesh.setColorAt(i, c.set(k.accent ? accent : color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [keys, color, accent]);
  return (
    <group position={[x, y, z]}>
      <RoundedBox args={[w, 0.018, d]} radius={0.006} castShadow receiveShadow>
        <meshStandardMaterial color={base} roughness={0.5} />
      </RoundedBox>
      <instancedMesh ref={ref} args={[KEYCAP, undefined, keys.length]} position={[0, 0.015, 0]} castShadow>
        <meshStandardMaterial roughness={0.55} />
      </instancedMesh>
    </group>
  );
}

/**
 * The racing chair's backrest from the reference: narrow at the lumbar, wide at the
 * shoulders, a headrest on top with the belt slot cut through it. In the chair's
 * x/y, extruded toward its back.
 */
function backrestGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-0.2, 0);
  s.lineTo(0.2, 0);
  s.bezierCurveTo(0.23, 0.18, 0.2, 0.3, 0.26, 0.5);
  s.bezierCurveTo(0.27, 0.56, 0.24, 0.6, 0.16, 0.62);
  s.bezierCurveTo(0.15, 0.7, 0.16, 0.8, 0.12, 0.84);
  s.quadraticCurveTo(0, 0.88, -0.12, 0.84);
  s.bezierCurveTo(-0.16, 0.8, -0.15, 0.7, -0.16, 0.62);
  s.bezierCurveTo(-0.24, 0.6, -0.27, 0.56, -0.26, 0.5);
  s.bezierCurveTo(-0.2, 0.3, -0.23, 0.18, -0.2, 0);
  const slot = new THREE.Path();
  slot.absellipse(0, 0.73, 0.045, 0.022, 0, Math.PI * 2, false, 0);
  s.holes.push(slot);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.018, bevelSegments: 4, curveSegments: 20 });
  g.translate(0, 0, -0.025);
  return g;
}

/** How far the walls' edges are rounded. */
const SHELL_BEVEL = 0.018;

/**
 * The right wall as one slab with the window cut through it, extruded with rounded edges. Drawn in
 * the wall's own plane (u along -z, v up), extruded along +x once the mesh turns a quarter about y.
 * The bevel grows the outline outward and the opening inward, so both are drawn a bevel short.
 */
function rightWallGeometry() {
  const b = SHELL_BEVEL;
  const s = new THREE.Shape();
  s.moveTo(-1.6 + b, b);
  s.lineTo(1.72 - b, b);
  s.lineTo(1.72 - b, 2.6 - b);
  s.lineTo(-1.6 + b, 2.6 - b);
  s.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-0.55 - b, 0.95 - b);
  hole.lineTo(-0.55 - b, 2.25 + b);
  hole.lineTo(0.95 + b, 2.25 + b);
  hole.lineTo(0.95 + b, 0.95 - b);
  hole.closePath();
  s.holes.push(hole);
  return new THREE.ExtrudeGeometry(s, { depth: 0.12 - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 1 });
}

/** The architect lamp's shade: a short neck over a straight cone, turned on a lathe, open at the bottom. */
function shadeGeometry(inset = 0) {
  const pts = [
    [0.012, 0.072],
    [0.021, 0.068],
    [0.024, 0.05],
    [0.026, 0.032],
    [0.062, -0.048],
    [0.064, -0.052],
  ].map(([r, y]) => new THREE.Vector2(Math.max(0.001, r - inset), y));
  return new THREE.LatheGeometry(pts, 32);
}

const SPIKE = new THREE.ConeGeometry(0.012, 1, 6);
const STEM = new THREE.CylinderGeometry(0.008, 0.011, 1, 6);

/**
 * A monstera leaf as its own outline, in the unit square the leaf texture fills (base at the bottom
 * centre, as leafCanvas draws it): only the leaf is geometry, so no square of empty texture casts
 * shadow or occlusion. The slits and holes stay cut by the texture's alpha.
 */
const LEAF_OUTLINE = (() => {
  const k = 0.92;
  const at = (x: number, y: number) => new THREE.Vector2(k * x, -0.47 - k * y);
  const s = new THREE.Shape();
  const p0 = at(0, 0);
  s.moveTo(p0.x, p0.y);
  const c = (a: [number, number], b: [number, number], e: [number, number]) => {
    const [p, q, r] = [at(...a), at(...b), at(...e)];
    s.bezierCurveTo(p.x, p.y, q.x, q.y, r.x, r.y);
  };
  c([-0.78, -0.02], [-0.74, -0.86], [0, -1]);
  c([0.74, -0.86], [0.78, -0.02], [0, 0]);
  const g = new THREE.ShapeGeometry(s, 16);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) + 0.5, pos.getY(i) + 0.5);
  return g;
})();
/** A white base the instance colours tint. */
const GREEN = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.7 });
const STEM_GREEN = new THREE.MeshStandardMaterial({ color: '#3d6b3a', roughness: 0.7 });

function Succulent({ position, scale = 1, pot = '#efeae2' }: { position: V3; scale?: number; pot?: string }) {
  const leaves = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i): Part => {
        const a = (i / 9) * Math.PI * 2;
        const tilt = 0.5 + (i % 3) * 0.2;
        const h = (0.05 + (i % 2) * 0.02) * 1.6;
        return { p: [Math.sin(a) * 0.012, 0.085, Math.cos(a) * 0.012], r: [Math.cos(a) * tilt, 0, -Math.sin(a) * tilt], s: [1, h, 1], c: i % 2 ? '#5d8a4f' : '#456f3e' };
      }),
    [],
  );
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.045, 0.036, 0.08, 20]} />
        <meshStandardMaterial color={pot} roughness={0.6} />
      </mesh>
      <Parts geometry={SPIKE} material={GREEN} parts={leaves} />
    </group>
  );
}

/** The clock the monstera's leaves sway on (seconds; held at 0 under reduced motion). */
const SWAY = { value: 0 };

/** The monstera's leaves: [turn around the pot, stem height, lean, leaf size]. */
const MONSTERA_STEMS: [number, number, number, number][] = [
  [0.0, 1.05, 0.0, 0.42],
  [1.3, 0.85, 0.5, 0.38],
  [2.5, 0.95, 0.35, 0.4],
  [3.6, 0.7, 0.6, 0.34],
  [4.7, 0.9, 0.45, 0.36],
  [5.6, 1.15, 0.2, 0.4],
  [0.7, 0.6, 0.8, 0.3],
  [2.0, 1.25, 0.25, 0.36],
  [3.1, 0.55, 0.75, 0.28],
  [4.2, 1.2, 0.3, 0.38],
  [5.1, 0.62, 0.7, 0.3],
  [0.35, 1.3, 0.12, 0.34],
];

function Monstera({ position }: { position: V3 }) {
  const leaf = useMemo(() => {
    const t = new THREE.CanvasTexture(leafCanvas('#2f6a3a', '#5a9a62'));
    t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.MeshStandardMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.6 });
    // Each leaf sways a little from its base, on its own phase (its instance)
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uSway = SWAY;
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nuniform float uSway;').replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float lift = position.y + 0.47;
        float ph = float(gl_InstanceID) * 1.7;
        transformed.z += sin(uSway * 1.1 + ph) * 0.05 * lift * lift;
        transformed.x += sin(uSway * 0.8 + ph * 1.3) * 0.02 * lift;`,
      );
    };
    m.customProgramCacheKey = () => 'diorama-leaf-sway';
    return m;
  }, []);
  const parts = useMemo(() => {
    const out = { stems: [] as Part[], leaves: [] as Part[] };
    for (const [a, h, lean, size] of MONSTERA_STEMS) {
      const dx = Math.sin(a) * lean * 0.5;
      const dz = Math.cos(a) * lean * 0.5;
      out.stems.push({ p: [dx / 2, 0.38 + h / 2, dz / 2], r: [dz * 0.9, 0, -dx * 0.9], s: [1, h, 1] });
      out.leaves.push({ p: [dx, 0.38 + h, dz], r: [-0.9 + lean * 0.6, a, 0], s: [size, size, 1] });
    }
    return out;
  }, []);
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 0.19, 0]}>
        <cylinderGeometry args={[0.17, 0.14, 0.38, 28]} />
        <meshStandardMaterial color="#d9d3c9" roughness={0.75} />
      </mesh>
      {/* the pot's rim, the soil, the moss pole it climbs */}
      <mesh castShadow position={[0, 0.375, 0]}>
        <torusGeometry args={[0.165, 0.012, 8, 32]} />
        <meshStandardMaterial color="#d9d3c9" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.36, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.158, 28]} />
        <meshStandardMaterial color="#3a2a1e" roughness={1} />
      </mesh>
      <mesh castShadow position={[0.02, 0.85, -0.02]}>
        <cylinderGeometry args={[0.022, 0.026, 1.0, 10]} />
        <meshStandardMaterial color="#6b5a3e" roughness={1} />
      </mesh>
      <Parts geometry={STEM} material={STEM_GREEN} parts={parts.stems} />
      <Parts geometry={LEAF_OUTLINE} material={leaf} parts={parts.leaves} />
    </group>
  );
}

export default function Room({ sample, locale, lite, still = false }: { sample: MutableRefObject<DaySample>; locale: Locale; lite: boolean; still?: boolean }) {
  const mats = useMemo(() => {
    const wood = woodTexture();
    wood.repeat.set(2.4, 1);
    const woodSmall = woodTexture('veneer');
    woodSmall.repeat.set(0.8, 0.5);
    const carpet = carpetTexture();
    carpet.repeat.set(2.12, 1.66);
    // Painted plaster; the window wall a step lighter, as a wall facing into the room's light reads
    const wall = plasterTexture('#62656a');
    wall.repeat.set(1.4, 0.9);
    const wallSide = plasterTexture('#6a6d72');
    wallSide.repeat.set(1.4 / 4.24, 0.9 / 2.6);
    return {
      wood: new THREE.MeshStandardMaterial({ map: wood, roughness: 0.48 }),
      woodSmall: new THREE.MeshStandardMaterial({ map: woodSmall, roughness: 0.5 }),
      carpet: new THREE.MeshStandardMaterial({ map: carpet, roughness: 1 }),
      rug: new THREE.MeshStandardMaterial({ map: rugTexture(), roughness: 1 }),
      wall: new THREE.MeshStandardMaterial({ map: wall, roughness: 0.95 }),
      // The right wall is extruded, so its uv runs in metres: the same noise at the back wall's scale
      wallSide: new THREE.MeshStandardMaterial({ map: wallSide, roughness: 0.95 }),
      // The box's shell (its outside and the cut edges) is graphite, so the lit room reads as a solid miniature on the page
      outer: new THREE.MeshStandardMaterial({ color: '#1a1a1b', roughness: 1 }),
      cut: new THREE.MeshStandardMaterial({ color: '#2b2c30', roughness: 0.9 }),
      plinth: new THREE.MeshStandardMaterial({ color: '#1d1f24', roughness: 0.7 }),
      // The cut-away's section, as a model maker leaves it: a pale core wherever the walls and floor are cut
      section: new THREE.MeshStandardMaterial({ color: '#e6e0d5', roughness: 0.92 }),
      black: new THREE.MeshStandardMaterial({ color: '#141416', roughness: 0.42, metalness: 0.2 }),
      // Monitor housings: a lighter graphite than the hair, so a screen's back seen past his head never reads as part of it
      housing: new THREE.MeshStandardMaterial({ color: '#3b3d45', roughness: 0.5, metalness: 0.25 }),
      leather: new THREE.MeshStandardMaterial({ color: '#16171a', roughness: 0.38 }),
      metal: new THREE.MeshStandardMaterial({ color: '#202124', roughness: 0.35, metalness: 0.8 }),
      cream: new THREE.MeshStandardMaterial({ color: '#ece6dc', roughness: 0.55 }),
      driver: new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.6 }),
      cone: new THREE.MeshStandardMaterial({ color: '#2a2a2a', roughness: 0.8 }),
      mat: new THREE.MeshStandardMaterial({ map: matTexture(), roughness: 0.95 }),
      pegboard: new THREE.MeshStandardMaterial({ map: pegboardTexture(), roughness: 0.55 }),
      cushion: new THREE.MeshStandardMaterial({ color: '#d9d2c6', roughness: 0.9 }),
      stitch: new THREE.MeshStandardMaterial({ color: '#3b3d45', roughness: 0.5 }),
      chrome: new THREE.MeshStandardMaterial({ color: '#c8c9cc', roughness: 0.25, metalness: 0.9 }),
      duck: new THREE.MeshStandardMaterial({ color: '#f5c518', roughness: 0.4 }),
      beak: new THREE.MeshStandardMaterial({ color: '#f07d18', roughness: 0.4 }),
      print: new THREE.MeshStandardMaterial({ map: printTexture(), roughness: 0.8 }),
    };
  }, []);

  const screens = useMemo(() => {
    const main = new ScreenCanvas();
    const upper = new ScreenCanvas();
    const tablet = new ScreenCanvas(1024, 704);
    const face = (s: ScreenCanvas) => new THREE.MeshBasicMaterial({ map: s.texture, toneMapped: false });
    return { main, upper, tablet, mainMat: face(main), upperMat: face(upper), tabletMat: face(tablet) };
  }, []);
  const backrest = useMemo(() => backrestGeometry(), []);
  const shells = useMemo(
    () => ({
      slab: new RoundedBoxGeometry(4.24, 0.16, 3.32, 2, 0.02),
      rug: new RoundedBoxGeometry(1.9, 0.012, 1.45, 2, 0.005),
      back: new RoundedBoxGeometry(4.24, 2.6, 0.12, 2, SHELL_BEVEL),
      right: rightWallGeometry(),
    }),
    [],
  );
  const groundShadow = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#000', alphaMap: aoTexture('rect'), transparent: true, opacity: 0.55, depthWrite: false }),
    [],
  );
  const shade = useMemo(() => ({ outer: shadeGeometry(), inner: shadeGeometry(0.003) }), []);
  // The shade's shells render both faces (a lathe's winding faces inward): the black outside hides the
  // lining from the room, and the lining, dark by day, glows once the lamp is on
  const shadeOuter = useMemo(() => new THREE.MeshStandardMaterial({ color: '#141416', roughness: 0.42, metalness: 0.2, side: THREE.DoubleSide }), []);
  const shadeInner = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ color: '#2a2b2f', emissive: new THREE.Color('#ffd7a0'), emissiveIntensity: 0, roughness: 0.8, side: THREE.DoubleSide });
    m.userData.live = true;
    return m;
  }, []);
  const bulbMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#fff1d6', toneMapped: false }), []);

  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const ambient = useRef<THREE.AmbientLight>(null);
  const lamp = useRef<THREE.SpotLight>(null);
  const lampFill = useRef<THREE.PointLight>(null);
  const glowMain = useRef<THREE.RectAreaLight>(null);
  const glowUpper = useRef<THREE.RectAreaLight>(null);
  const chair = useRef<THREE.Group>(null);
  const fins = useRef<THREE.Group>(null);
  const deskMug = useRef<THREE.Group>(null);
  const sunTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 0.6, -0.4);
    return o;
  }, []);
  const lampTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0.62, 0.79, -1.15);
    return o;
  }, []);
  const sunDir = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    // The fins cast the sun's and moon's shadow only (their layer is one the cameras never draw)
    if (sun.current) sun.current.shadow.camera.layers.enable(FIN_LAYER);
    fins.current?.children.forEach((f) => f.layers.set(FIN_LAYER));
    if (sun.current) sun.current.target = sunTarget;
    if (lamp.current) lamp.current.target = lampTarget;
    glowMain.current?.lookAt(-0.2, 1.2, 2);
    glowUpper.current?.lookAt(-0.2, 1.5, 2);
  }, [sunTarget, lampTarget]);

  useFrame((state) => {
    const s = sample.current;
    const L = s.light;
    if (sun.current) {
      // One light through the window: the sun by day, the moon after it sets
      sun.current.intensity = L.sun + L.moon;
      sun.current.color.set(L.sunColor).lerp(MOON, L.moon / Math.max(0.001, L.sun + L.moon));
      sunDir.set(L.sunDir[0], L.sunDir[1], L.sunDir[2]).normalize();
      sun.current.position.copy(sunTarget.position).addScaledVector(sunDir, 9);
    }
    if (hemi.current) {
      hemi.current.intensity = L.hemi;
      hemi.current.color.set(L.hemiSky);
    }
    if (ambient.current) ambient.current.intensity = L.fill;
    if (lamp.current) lamp.current.intensity = L.lamp * 2.2;
    if (lampFill.current) lampFill.current.intensity = L.lamp * 0.12;
    bulbMat.color.setRGB(1, 0.94, 0.84).multiplyScalar(0.25 + Math.min(1, L.lamp / 4) * 1.6);
    shadeInner.emissiveIntensity = Math.min(1, L.lamp / 4) * 0.55;
    if (glowMain.current) glowMain.current.intensity = s.screens.main === 'off' ? 0 : 7;
    if (glowUpper.current) glowUpper.current.intensity = s.screens.upper === 'off' ? 0 : 5;
    const opts = { clock: clockText(s.hour), blink: still || Math.floor(state.clock.elapsedTime * 2) % 2 === 0, locale };
    screens.main.draw(s.screens.main, opts);
    screens.upper.draw(s.screens.upper, opts);
    screens.tablet.draw(s.screens.tablet, opts);
    if (chair.current) chair.current.rotation.y = Math.PI + s.turn * TURN_TO_CAMERA;
    SWAY.value = still ? 0 : state.clock.elapsedTime;
    // the mug leaves the desk while it is in his hand
    if (deskMug.current) deskMug.current.visible = poseWeight(s, 'coffee') <= 0.5;
  });

  const cast = { castShadow: true, receiveShadow: true } as const;
  // Box face order: +x, -x, +y, -y, +z, -z
  const backWallMats: Mat[] = [mats.cut, mats.cut, mats.cut, mats.cut, mats.wall, mats.outer];
  const sunMap = lite ? 1024 : 2048;

  return (
    <StaticMerge version={lite}>
      {/* Lights */}
      <ambientLight ref={ambient} color="#ffffff" />
      <hemisphereLight ref={hemi} args={['#c9d4e0', '#2a221c', 1]} />
      <directionalLight
        ref={sun}
        castShadow
        shadow-mapSize={[sunMap, sunMap]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.045}
        shadow-radius={3}
        shadow-camera-left={-3.4}
        shadow-camera-right={3.4}
        shadow-camera-top={3.4}
        shadow-camera-bottom={-3.4}
        shadow-camera-near={1}
        shadow-camera-far={20}
      />
      <primitive object={sunTarget} />
      <primitive object={lampTarget} />
      <spotLight
        ref={lamp}
        position={[0.86, 1.22, -1.22]}
        angle={0.75}
        penumbra={0.85}
        decay={2}
        distance={5}
        color="#ffcf94"
        castShadow={!lite}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
        shadow-radius={4}
      />
      <pointLight ref={lampFill} position={[0.86, 1.15, -1.1]} decay={2} distance={6} color="#ffb977" />
      <rectAreaLight ref={glowMain} position={[-0.2, 1.2, -1.38]} width={0.62} height={0.35} color="#bcd7c4" />
      <rectAreaLight ref={glowUpper} position={[-0.2, 1.72, -1.52]} width={0.6} height={0.34} color="#c9d6e8" />
      <Environment resolution={64} environmentIntensity={0.35}>
        <Lightformer form="rect" intensity={2} position={[4, 2, 0]} scale={[3, 2, 1]} color="#dfe8f0" />
        <Lightformer form="rect" intensity={0.6} position={[-4, 3, 3]} scale={[4, 3, 1]} color="#ffd8b0" />
      </Environment>

      {/* Shadow fins over the back and right walls (shadow only, see FIN_LAYER) */}
      <group ref={fins} userData={{ live: true }}>
        <mesh castShadow position={[2.06, 5.6, -0.06]}>
          <boxGeometry args={[0.12, 6, 3.32]} />
        </mesh>
        <mesh castShadow position={[0.06, 5.6, -1.66]}>
          <boxGeometry args={[4.24, 6, 0.12]} />
        </mesh>
      </group>

      {/* The model's base: a butcher-block band under the floor, on a deep graphite plinth a step wider than the room */}
      <RoundedBox args={[4.34, 0.04, 3.42]} radius={0.012} position={[0.06, -0.18, -0.06]} material={mats.wood} {...cast} />
      <RoundedBox args={[4.44, 0.2, 3.52]} radius={0.025} position={[0.06, -0.3, -0.06]} material={mats.plinth} receiveShadow />

      {/* The section: pale caps on the walls' cut tops and ends, a pale band where the floor is cut */}
      <RoundedBox args={[4.248, 0.03, 0.128]} radius={0.008} position={[0.06, 2.615, -1.66]} material={mats.section} {...cast} />
      <RoundedBox args={[0.128, 0.03, 3.204]} radius={0.008} position={[2.06, 2.615, 0.0]} material={mats.section} {...cast} />
      <RoundedBox args={[0.012, 2.6, 0.128]} radius={0.004} position={[-2.066, 1.3, -1.66]} material={mats.section} {...cast} />
      <RoundedBox args={[0.128, 2.6, 0.012]} radius={0.004} position={[2.06, 1.3, 1.606]} material={mats.section} {...cast} />
      <mesh position={[0.06, -0.035, 1.6035]} material={mats.section}>
        <boxGeometry args={[4.24, 0.03, 0.006]} />
      </mesh>
      <mesh position={[-2.0635, -0.035, -0.06]} material={mats.section}>
        <boxGeometry args={[0.006, 0.03, 3.32]} />
      </mesh>

      {/* The soft shadow the model casts on the page, so it sits on the ground instead of floating (the phone band would clip it) */}
      {!lite && (
        <mesh position={[0.02, -0.402, -0.02]} rotation={[-Math.PI / 2, 0, 0]} material={groundShadow}>
          <planeGeometry args={[6.6, 5.3]} />
        </mesh>
      )}

      {/* Floor slab, carpet, rug: every edge softened */}
      <mesh {...cast} position={[0.06, -0.08, -0.06]} geometry={shells.slab} material={[mats.cut, mats.cut, mats.carpet, mats.cut, mats.cut, mats.cut]} />
      <mesh receiveShadow position={[-0.2, 0.006, -0.35]} geometry={shells.rug} material={mats.rug} />

      {/* Back wall */}
      <mesh {...cast} position={[0.06, 1.3, -1.66]} geometry={shells.back} material={backWallMats} />
      {/* Right wall: one piece with the window cut through it (z -0.95..0.55, y 0.95..2.25), its edges softened */}
      <mesh {...cast} position={[2.0 + SHELL_BEVEL, 0, 0]} rotation={[0, Math.PI / 2, 0]} geometry={shells.right} material={[mats.wallSide, mats.cut]} />
      {/* Window frame and mullions (the sill, blind, curtains and the town outside are in Furnishings) */}
      <group position={[2.03, 1.6, -0.2]}>
        {[
          [0, 0.64, 0, 0.04, 0.04, 1.5],
          [0, -0.64, 0, 0.04, 0.06, 1.5],
          [0, 0, -0.73, 0.04, 1.3, 0.04],
          [0, 0, 0.73, 0.04, 1.3, 0.04],
          [0, 0, 0, 0.03, 1.3, 0.03],
          [0, 0.18, 0, 0.03, 0.03, 1.5],
        ].map(([x, y, z, w, h, d], i) => (
          <mesh key={i} position={[x, y, z]} material={mats.black} castShadow>
            <boxGeometry args={[w, h, d]} />
          </mesh>
        ))}
      </group>

      {/* Desk */}
      <RoundedBox args={[2.6, 0.05, 0.72]} radius={0.012} position={[-0.1, 0.765, -1.24]} material={mats.wood} {...cast} />
      {[-1.3, 1.1].map((x) => (
        <group key={x} position={[x, 0, -1.24]}>
          <mesh {...cast} position={[0, 0.37, 0.3]} material={mats.black}>
            <boxGeometry args={[0.05, 0.74, 0.05]} />
          </mesh>
          <mesh {...cast} position={[0, 0.37, -0.3]} material={mats.black}>
            <boxGeometry args={[0.05, 0.74, 0.05]} />
          </mesh>
          <mesh {...cast} position={[0, 0.03, 0]} material={mats.black}>
            <boxGeometry args={[0.06, 0.04, 0.68]} />
          </mesh>
          <mesh {...cast} position={[0, 0.7, 0]} material={mats.black}>
            <boxGeometry args={[0.04, 0.04, 0.6]} />
          </mesh>
        </group>
      ))}
      {/* the frame's back rail under the top */}
      <mesh {...cast} position={[-0.1, 0.71, -1.52]} material={mats.black}>
        <boxGeometry args={[2.36, 0.05, 0.03]} />
      </mesh>
      {/* Riser */}
      <RoundedBox args={[1.5, 0.03, 0.26]} radius={0.006} position={[-0.2, 0.905, -1.45]} material={mats.woodSmall} {...cast} />
      {[-0.92, 0.52].map((x) => (
        <mesh key={x} {...cast} position={[x, 0.845, -1.45]} material={mats.woodSmall}>
          <boxGeometry args={[0.03, 0.1, 0.24]} />
        </mesh>
      ))}

      {/* Main monitor on the riser */}
      <RoundedBox args={[0.66, 0.39, 0.03]} radius={0.008} position={[-0.2, 1.2, -1.44]} material={mats.housing} castShadow />
      <mesh position={[-0.2, 1.2, -1.4245]} material={screens.mainMat}>
        <planeGeometry args={[0.625, 0.352]} />
      </mesh>
      {/* its back, the stand's neck leaning back to the base, the power light in the chin */}
      <RoundedBox args={[0.42, 0.24, 0.04]} radius={0.012} position={[-0.2, 1.19, -1.465]} material={mats.housing} castShadow />
      <RoundedBox args={[0.05, 0.21, 0.022]} radius={0.008} position={[-0.2, 1.035, -1.495]} rotation={[0.08, 0, 0]} material={mats.black} {...cast} />
      <RoundedBox args={[0.25, 0.012, 0.16]} radius={0.005} position={[-0.2, 0.927, -1.47]} material={mats.black} {...cast} />
      <mesh position={[0.08, 1.014, -1.4248]} material={bulbMat}>
        <circleGeometry args={[0.0025, 8]} />
      </mesh>
      {/* Upper monitor on the wall, tipped toward him */}
      <RoundedBox args={[0.09, 0.16, 0.012]} radius={0.004} position={[-0.2, 1.73, -1.594]} material={mats.black} castShadow />
      <group position={[-0.2, 1.72, -1.555]} rotation={[0.1, 0, 0]}>
        <RoundedBox args={[0.64, 0.38, 0.03]} radius={0.008} material={mats.housing} castShadow />
        <RoundedBox args={[0.4, 0.22, 0.02]} radius={0.01} position={[0, 0, -0.02]} material={mats.housing} castShadow />
        <mesh position={[0, 0, 0.0155]} material={screens.upperMat}>
          <planeGeometry args={[0.605, 0.342]} />
        </mesh>
      </group>

      {/* Speakers */}
      {[-0.84, 0.44].map((x) => (
        <group key={x} position={[x, 1.04, -1.46]}>
          <RoundedBox args={[0.15, 0.24, 0.18]} radius={0.01} material={mats.woodSmall} {...cast} />
          <mesh position={[0, -0.04, 0.091]} rotation={[Math.PI / 2, 0, 0]} material={mats.driver}>
            <cylinderGeometry args={[0.05, 0.05, 0.004, 28]} />
          </mesh>
          <mesh position={[0, -0.04, 0.094]} rotation={[Math.PI / 2, 0, 0]} material={mats.cone}>
            <cylinderGeometry args={[0.036, 0.036, 0.004, 28]} />
          </mesh>
          <mesh position={[0, 0.07, 0.091]} rotation={[Math.PI / 2, 0, 0]} material={mats.driver}>
            <cylinderGeometry args={[0.02, 0.02, 0.004, 20]} />
          </mesh>
          <mesh position={[0, 0.07, 0.094]} rotation={[Math.PI / 2, 0, 0]} material={mats.chrome}>
            <cylinderGeometry args={[0.008, 0.008, 0.004, 12]} />
          </mesh>
          <mesh position={[0, -0.105, 0.0915]} rotation={[Math.PI / 2, 0, 0]} material={mats.driver}>
            <cylinderGeometry args={[0.008, 0.008, 0.004, 12]} />
          </mesh>
        </group>
      ))}
      <Succulent position={[-0.84, 1.16, -1.46]} />
      <Succulent position={[0.44, 1.16, -1.46]} scale={0.9} pot="#2b2b2b" />

      {/* Headphones on their stand */}
      <group position={[-1.16, 0.79, -1.18]}>
        <mesh {...cast} position={[0, 0.008, 0]} material={mats.woodSmall}>
          <cylinderGeometry args={[0.06, 0.065, 0.016, 24]} />
        </mesh>
        <mesh {...cast} position={[0, 0.14, 0]} material={mats.woodSmall}>
          <cylinderGeometry args={[0.01, 0.01, 0.26, 10]} />
        </mesh>
        <mesh {...cast} position={[0, 0.2, 0]} material={mats.cream}>
          <torusGeometry args={[0.085, 0.013, 10, 32, Math.PI]} />
        </mesh>
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh {...cast} position={[s * 0.092, 0.17, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.cream}>
              <cylinderGeometry args={[0.048, 0.048, 0.032, 24]} />
            </mesh>
            <mesh {...cast} position={[s * 0.07, 0.17, 0]} rotation={[0, Math.PI / 2, 0]} material={mats.cushion}>
              <torusGeometry args={[0.034, 0.014, 10, 24]} />
            </mesh>
            <mesh position={[s * 0.088, 0.21, 0]} material={mats.stitch}>
              <boxGeometry args={[0.012, 0.03, 0.012]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Desk mat, keyboard, mouse, mug, duck, tablet */}
      <RoundedBox args={[0.98, 0.004, 0.42]} radius={0.002} position={[-0.22, 0.792, -1.04]} material={mats.mat} receiveShadow />
      {/* The keyboard sits centred in front of him, under the main monitor, so both hands land on it */}
      <Keys x={-0.2} y={0.803} z={-1.01} w={0.36} d={0.12} rows={5} cols={15} color="#f1ede6" base="#c9c5bd" />
      <RoundedBox args={[0.36, 0.016, 0.055]} radius={0.007} position={[-0.2, 0.802, -0.918]} material={mats.woodSmall} {...cast} />
      <group position={[0.06, 0.794, -1.0]}>
        <mesh {...cast} position={[0, 0.012, 0]} scale={[0.03, 0.017, 0.05]} material={mats.black}>
          <sphereGeometry args={[1, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh position={[0, 0.027, -0.022]} rotation={[0, 0, Math.PI / 2]} material={mats.stitch}>
          <cylinderGeometry args={[0.005, 0.005, 0.005, 12]} />
        </mesh>
      </group>
      <group ref={deskMug} position={[-0.95, 0.79, -1.0]} userData={{ live: true }}>
        <mesh {...cast} position={[0, 0.05, 0]} material={mats.cream}>
          <cylinderGeometry args={[0.04, 0.036, 0.1, 24]} />
        </mesh>
        <mesh {...cast} position={[0.045, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.cream}>
          <torusGeometry args={[0.025, 0.007, 8, 16, Math.PI]} />
        </mesh>
      </group>
      <group position={[0.24, 0.79, -1.24]} rotation={[0, -0.5, 0]}>
        <mesh castShadow position={[0, 0.035, 0]} scale={[0.05, 0.035, 0.04]} material={mats.duck}>
          <sphereGeometry args={[1, 20, 14]} />
        </mesh>
        <mesh castShadow position={[0, 0.085, 0.022]} scale={0.028} material={mats.duck}>
          <sphereGeometry args={[1, 20, 14]} />
        </mesh>
        <mesh position={[0, 0.08, 0.052]} scale={[0.016, 0.006, 0.014]} material={mats.beak}>
          <sphereGeometry args={[1, 12, 8]} />
        </mesh>
      </group>
      <group position={[0.5, 0.79, -1.08]} rotation={[0, -0.35, 0]}>
        <mesh castShadow position={[0, 0.012, -0.04]} material={mats.woodSmall}>
          <boxGeometry args={[0.08, 0.024, 0.06]} />
        </mesh>
        <group position={[0, 0.1, -0.05]} rotation={[-0.35, 0, 0]}>
          <RoundedBox args={[0.24, 0.17, 0.008]} radius={0.004} material={mats.housing} castShadow />
          <mesh position={[0, 0, 0.0045]} material={screens.tabletMat}>
            <planeGeometry args={[0.225, 0.155]} />
          </mesh>
        </group>
      </group>

      {/* Keyboards on a tiered stand */}
      <group position={[0.86, 0.79, -1.4]}>
        {[0, 1, 2].map((i) => (
          <group key={i}>
            <mesh castShadow receiveShadow position={[0, 0.02 + i * 0.07, 0.06 - i * 0.08]} material={mats.woodSmall}>
              <boxGeometry args={[0.34, 0.012, 0.13]} />
            </mesh>
            <Keys
              x={0}
              y={0.036 + i * 0.07}
              z={0.06 - i * 0.08}
              w={0.3}
              d={0.1}
              rows={5}
              cols={14}
              color={['#e9e2d4', '#d9d4ca', '#f0e9dc'][i]}
              base={['#e3893a', '#8d9197', '#d8c9a8'][i]}
            />
          </group>
        ))}
        {[-0.16, 0.16].map((x) => (
          <mesh key={x} castShadow position={[x, 0.09, -0.02]} material={mats.woodSmall}>
            <boxGeometry args={[0.015, 0.18, 0.2]} />
          </mesh>
        ))}
      </group>

      {/* Pegboard with shelves, the print */}
      <group position={[0.96, 1.74, -1.59]}>
        <mesh castShadow receiveShadow material={[mats.woodSmall, mats.woodSmall, mats.woodSmall, mats.woodSmall, mats.pegboard, mats.woodSmall]}>
          <boxGeometry args={[0.62, 0.62, 0.02]} />
        </mesh>
        {/* hooks below the lower shelf: a coiled cable, a pair of scissors */}
        <Rod a={[-0.2, -0.22, 0.01]} b={[-0.2, -0.22, 0.05]} r={0.003} material={mats.chrome} />
        <mesh castShadow position={[-0.2, -0.255, 0.045]} material={mats.duck}>
          <torusGeometry args={[0.035, 0.007, 8, 24]} />
        </mesh>
        <mesh castShadow position={[-0.2, -0.255, 0.052]} rotation={[0, 0, 0.4]} material={mats.duck}>
          <torusGeometry args={[0.032, 0.007, 8, 24]} />
        </mesh>
        <Rod a={[0.04, -0.24, 0.01]} b={[0.04, -0.24, 0.04]} r={0.003} material={mats.chrome} />
        {[-0.013, 0.013].map((x) => (
          <mesh key={x} castShadow position={[0.04 + x, -0.262, 0.035]} material={mats.black}>
            <torusGeometry args={[0.012, 0.004, 6, 16]} />
          </mesh>
        ))}
        <Rod a={[0.04, -0.27, 0.035]} b={[0.04, -0.33, 0.035]} r={0.004} material={mats.chrome} />
        {[-0.14, 0.12].map((y) => (
          <mesh key={y} castShadow receiveShadow position={[0, y, 0.055]} material={mats.woodSmall}>
            <boxGeometry args={[0.5, 0.014, 0.1]} />
          </mesh>
        ))}
        <mesh castShadow position={[-0.12, -0.09, 0.06]} material={mats.black}>
          <boxGeometry args={[0.12, 0.08, 0.07]} />
        </mesh>
        <mesh castShadow position={[-0.12, -0.09, 0.1]} rotation={[Math.PI / 2, 0, 0]} material={mats.black}>
          <cylinderGeometry args={[0.03, 0.03, 0.05, 20]} />
        </mesh>
        <mesh castShadow position={[0.1, -0.1, 0.06]} material={mats.cream}>
          <boxGeometry args={[0.1, 0.07, 0.06]} />
        </mesh>
        <Succulent position={[0.12, 0.127, 0.055]} scale={0.8} />
        <mesh castShadow position={[-0.1, 0.17, 0.06]} material={mats.black}>
          <boxGeometry args={[0.1, 0.09, 0.07]} />
        </mesh>
      </group>
      <group position={[0.4, 1.8, -1.59]}>
        <RoundedBox args={[0.32, 0.42, 0.025]} radius={0.004} material={mats.cream} castShadow />
        <mesh position={[0, 0, 0.0135]} material={mats.print}>
          <planeGeometry args={[0.27, 0.36]} />
        </mesh>
      </group>

      {/* The architect lamp at the right end */}
      <group position={[1.12, 0.79, -1.42]}>
        <mesh castShadow position={[0, 0.012, 0]} material={mats.black}>
          <cylinderGeometry args={[0.07, 0.075, 0.024, 24]} />
        </mesh>
        <mesh castShadow position={[0, 0.034, 0]} material={mats.black}>
          <cylinderGeometry args={[0.02, 0.024, 0.024, 16]} />
        </mesh>
        {/* two arms of paired rods, knuckles at the joints, a spring along the lower arm */}
        {[-0.011, 0.011].map((o) => (
          <Rod key={`l${o}`} a={[0, 0.045, o]} b={[0.03, 0.43, o - 0.03]} r={0.0045} material={mats.black} />
        ))}
        <Rod a={[0.016, 0.1, 0.02]} b={[0.034, 0.34, -0.01]} r={0.0035} material={mats.chrome} />
        {[-0.011, 0.011].map((o) => (
          <Rod key={`u${o}`} a={[0.03, 0.43 + o, -0.03]} b={[-0.22, 0.47 + o, 0.17]} r={0.0045} material={mats.black} />
        ))}
        {(
          [
            [0, 0.045, 0],
            [0.03, 0.43, -0.03],
            [-0.22, 0.47, 0.17],
          ] as V3[]
        ).map((p, i) => (
          <mesh key={i} castShadow position={p} rotation={[Math.PI / 2, 0, 0.3]} material={mats.black}>
            <cylinderGeometry args={[0.013, 0.013, 0.034, 14]} />
          </mesh>
        ))}
        <group position={[-0.26, 0.45, 0.2]} rotation={[0.5, 0, 0.65]}>
          <mesh castShadow geometry={shade.outer} material={shadeOuter} />
          <mesh geometry={shade.inner} material={shadeInner} />
          <mesh position={[0, -0.03, 0]} material={bulbMat}>
            <sphereGeometry args={[0.028, 16, 10]} />
          </mesh>
        </group>
      </group>

      {/* A stack of books at the left end */}
      <group position={[-1.2, 0.79, -1.46]}>
        {(
          [
            ['#2f4a6b', 0.22, 0.15, 0.1],
            ['#a8442f', 0.2, 0.14, -0.15],
            ['#d6c7a1', 0.21, 0.15, 0.3],
            ['#3c5a3a', 0.18, 0.13, 0.05],
          ] as const
        ).map(([c, w, d, r], i) => (
          <mesh key={i} castShadow receiveShadow position={[0, 0.017 + i * 0.034, 0]} rotation={[0, r, 0]}>
            <boxGeometry args={[w, 0.032, d]} />
            <meshStandardMaterial color={c} roughness={0.8} />
          </mesh>
        ))}
      </group>

      <Monstera position={[1.62, 0, -1.22]} />
      <Furnishings sample={sample} mats={mats} lite={lite} still={still} />
      <Sunbeam sample={sample} still={still} />

      {/* The chair and Akira, turning together */}
      <group ref={chair} position={CHAIR} userData={{ live: true }}>
        {/* The chair turns as one piece: its own parts merge among themselves */}
        <StaticMerge version={lite}>
          {/* the bucket seat: a cushion between raised side bolsters */}
          <RoundedBox args={[0.46, 0.08, 0.48]} radius={0.03} position={[0, 0.44, 0]} material={mats.leather} {...cast} />
          {[-1, 1].map((s) => (
            <RoundedBox key={s} args={[0.08, 0.075, 0.47]} radius={0.032} position={[s * 0.215, 0.475, 0]} material={mats.leather} {...cast} />
          ))}
          {/* the racing backrest, its inset panel and belt slot, the neck pillow */}
          <group position={[0, 0.47, -0.27]} rotation={[-0.12, 0, 0]}>
            <mesh geometry={backrest} material={mats.leather} {...cast} />
            <mesh geometry={backrest} material={mats.stitch} position={[0, 0.06, -0.034]} scale={[0.6, 0.86, 0.3]} />
            <RoundedBox args={[0.22, 0.09, 0.05]} radius={0.025} position={[0, 0.64, 0.06]} material={mats.black} castShadow />
          </group>
          {/* armrests on their posts */}
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.28, 0, 0.02]}>
              <mesh castShadow position={[-s * 0.03, 0.425, -0.04]} material={mats.black}>
                <boxGeometry args={[0.07, 0.025, 0.14]} />
              </mesh>
              <mesh castShadow position={[0, 0.56, -0.04]} material={mats.black}>
                <boxGeometry args={[0.032, 0.22, 0.05]} />
              </mesh>
              <RoundedBox args={[0.075, 0.03, 0.27]} radius={0.012} position={[0, 0.68, 0]} material={mats.black} castShadow />
            </group>
          ))}
          {/* tilt mechanism and its lever, the gas lift in its shroud */}
          <mesh castShadow position={[0, 0.375, 0]} material={mats.black}>
            <boxGeometry args={[0.22, 0.05, 0.2]} />
          </mesh>
          <Rod a={[0.11, 0.37, 0.05]} b={[0.2, 0.36, 0.07]} r={0.006} material={mats.black} />
          <mesh castShadow position={[0, 0.27, 0]} material={mats.chrome}>
            <cylinderGeometry args={[0.024, 0.024, 0.22, 14]} />
          </mesh>
          <mesh castShadow position={[0, 0.17, 0]} material={mats.black}>
            <cylinderGeometry args={[0.036, 0.046, 0.16, 16]} />
          </mesh>
          {/* five legs sloping out to their casters */}
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2;
            return (
              <group key={i} rotation={[0, a, 0]}>
                <mesh castShadow position={[0, 0.088, 0.15]} rotation={[0.1, 0, 0]} material={mats.black}>
                  <boxGeometry args={[0.045, 0.032, 0.3]} />
                </mesh>
                <mesh castShadow position={[0, 0.06, 0.29]} material={mats.black}>
                  <cylinderGeometry args={[0.012, 0.012, 0.03, 10]} />
                </mesh>
                <mesh castShadow position={[0, 0.028, 0.3]} rotation={[0, 0, Math.PI / 2]} material={mats.black}>
                  <cylinderGeometry args={[0.028, 0.028, 0.03, 16]} />
                </mesh>
              </group>
            );
          })}
        </StaticMerge>
        <Akira sample={sample} still={still} />
      </group>
    </StaticMerge>
  );
}
