/**
 * The room from the user's reference photo, as a diorama cut open at the
 * front and left: graphite walls, a butcher-block desk along the back wall,
 * two monitors (one on a riser, one on the wall), wooden speakers, headphones
 * on a stand, plants, a pegboard, a pink monstera print, keyboards on a
 * tiered stand, a desk lamp, a window on the right wall, a black chair with
 * Akira in it. Light, screens, pose and the chair's turn follow the day sample.
 */
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import type { Locale } from '@i18n/utils';
import { clockText, type DaySample, type V3 } from '../day';
import Akira, { poseWeight } from './Akira';
import { ScreenCanvas } from './screens';
import { leafCanvas, noiseTexture, printTexture, woodTexture } from './textures';

RectAreaLightUniformsLib.init();

const CHAIR: V3 = [-0.2, 0, -0.5];
const TURN_TO_CAMERA = 2.45;

type Mat = THREE.Material;

function Keys({ x, y, z, w, d, rows, cols, color, base }: { x: number; y: number; z: number; w: number; d: number; rows: number; cols: number; color: string; base: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    let i = 0;
    const kw = (w * 0.92) / cols;
    const kd = (d * 0.86) / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        o.position.set(-w * 0.46 + kw * (c + 0.5), 0, -d * 0.43 + kd * (r + 0.5));
        o.scale.set(kw * 0.84, 1, kd * 0.82);
        o.updateMatrix();
        mesh.setMatrixAt(i++, o.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [w, d, rows, cols]);
  return (
    <group position={[x, y, z]}>
      <RoundedBox args={[w, 0.018, d]} radius={0.006} castShadow receiveShadow>
        <meshStandardMaterial color={base} roughness={0.5} />
      </RoundedBox>
      <instancedMesh ref={ref} args={[undefined, undefined, rows * cols]} position={[0, 0.014, 0]} castShadow>
        <boxGeometry args={[1, 0.012, 1]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </instancedMesh>
    </group>
  );
}

function Succulent({ position, scale = 1, pot = '#efeae2' }: { position: V3; scale?: number; pot?: string }) {
  const leaves = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        const tilt = 0.5 + (i % 3) * 0.2;
        return { a, tilt, h: 0.05 + (i % 2) * 0.02 };
      }),
    [],
  );
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.045, 0.036, 0.08, 20]} />
        <meshStandardMaterial color={pot} roughness={0.6} />
      </mesh>
      {leaves.map(({ a, tilt, h }, i) => (
        <mesh key={i} castShadow position={[Math.sin(a) * 0.012, 0.085, Math.cos(a) * 0.012]} rotation={[Math.cos(a) * tilt, 0, -Math.sin(a) * tilt]}>
          <coneGeometry args={[0.012, h * 1.6, 6]} />
          <meshStandardMaterial color={i % 2 ? '#5d8a4f' : '#456f3e'} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Monstera({ position }: { position: V3 }) {
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(leafCanvas('#2f6a3a', '#5a9a62'));
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const stems: [number, number, number, number][] = [
    [0.0, 1.05, 0.0, 0.42],
    [1.3, 0.85, 0.5, 0.38],
    [2.5, 0.95, 0.35, 0.4],
    [3.6, 0.7, 0.6, 0.34],
    [4.7, 0.9, 0.45, 0.36],
    [5.6, 1.15, 0.2, 0.4],
    [0.7, 0.6, 0.8, 0.3],
  ];
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 0.19, 0]}>
        <cylinderGeometry args={[0.17, 0.14, 0.38, 28]} />
        <meshStandardMaterial color="#d9d3c9" roughness={0.75} />
      </mesh>
      {stems.map(([a, h, lean, s], i) => {
        const dx = Math.sin(a) * lean * 0.5;
        const dz = Math.cos(a) * lean * 0.5;
        return (
          <group key={i}>
            <mesh castShadow position={[dx / 2, 0.38 + h / 2, dz / 2]} rotation={[dz * 0.9, 0, -dx * 0.9]}>
              <cylinderGeometry args={[0.008, 0.011, h, 6]} />
              <meshStandardMaterial color="#3d6b3a" roughness={0.7} />
            </mesh>
            <mesh castShadow position={[dx, 0.38 + h, dz]} rotation={[-0.9 + lean * 0.6, a, 0]}>
              <planeGeometry args={[s, s]} />
              <meshStandardMaterial map={tex} alphaTest={0.5} side={THREE.DoubleSide} roughness={0.6} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default function Room({ sample, locale, lite, still = false }: { sample: MutableRefObject<DaySample>; locale: Locale; lite: boolean; still?: boolean }) {
  const mats = useMemo(() => {
    const wood = woodTexture();
    wood.repeat.set(2.4, 1);
    const woodSmall = woodTexture();
    woodSmall.repeat.set(0.8, 0.5);
    const carpet = noiseTexture('#5a5d62', 26);
    carpet.repeat.set(6, 5);
    const rug = noiseTexture('#64666a', 30);
    rug.repeat.set(4, 3);
    const wall = noiseTexture('#63666b', 10);
    wall.repeat.set(3, 2);
    return {
      wood: new THREE.MeshStandardMaterial({ map: wood, roughness: 0.48 }),
      woodSmall: new THREE.MeshStandardMaterial({ map: woodSmall, roughness: 0.5 }),
      carpet: new THREE.MeshStandardMaterial({ map: carpet, roughness: 1 }),
      rug: new THREE.MeshStandardMaterial({ map: rug, roughness: 1 }),
      wall: new THREE.MeshStandardMaterial({ map: wall, roughness: 0.95 }),
      // The box's shell (its outside and the cut edges) is graphite, so the lit room reads as a solid miniature on the page
      outer: new THREE.MeshStandardMaterial({ color: '#1a1a1b', roughness: 1 }),
      cut: new THREE.MeshStandardMaterial({ color: '#2b2c30', roughness: 0.9 }),
      black: new THREE.MeshStandardMaterial({ color: '#141416', roughness: 0.42, metalness: 0.2 }),
      leather: new THREE.MeshStandardMaterial({ color: '#16171a', roughness: 0.38 }),
      metal: new THREE.MeshStandardMaterial({ color: '#202124', roughness: 0.35, metalness: 0.8 }),
      cream: new THREE.MeshStandardMaterial({ color: '#ece6dc', roughness: 0.55 }),
      driver: new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.6 }),
      cone: new THREE.MeshStandardMaterial({ color: '#2a2a2a', roughness: 0.8 }),
      mat: new THREE.MeshStandardMaterial({ color: '#1c2232', roughness: 0.95 }),
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
  const skyMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#cfe0ee', toneMapped: false }), []);
  const bulbMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#fff1d6', toneMapped: false }), []);

  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const ambient = useRef<THREE.AmbientLight>(null);
  const lamp = useRef<THREE.SpotLight>(null);
  const lampFill = useRef<THREE.PointLight>(null);
  const glowMain = useRef<THREE.RectAreaLight>(null);
  const glowUpper = useRef<THREE.RectAreaLight>(null);
  const chair = useRef<THREE.Group>(null);
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
    if (sun.current) sun.current.target = sunTarget;
    if (lamp.current) lamp.current.target = lampTarget;
    glowMain.current?.lookAt(-0.2, 1.2, 2);
    glowUpper.current?.lookAt(-0.2, 1.5, 2);
  }, [sunTarget, lampTarget]);

  useFrame((state) => {
    const s = sample.current;
    const L = s.light;
    if (sun.current) {
      sun.current.intensity = L.sun;
      sun.current.color.set(L.sunColor);
      sunDir.set(L.sunDir[0], L.sunDir[1], L.sunDir[2]).normalize();
      sun.current.position.copy(sunTarget.position).addScaledVector(sunDir, 9);
    }
    if (hemi.current) hemi.current.intensity = L.hemi;
    if (ambient.current) ambient.current.intensity = L.fill;
    if (lamp.current) lamp.current.intensity = L.lamp * 2.2;
    if (lampFill.current) lampFill.current.intensity = L.lamp * 0.12;
    bulbMat.color.setRGB(1, 0.94, 0.84).multiplyScalar(0.25 + Math.min(1, L.lamp / 4) * 1.6);
    skyMat.color.set(L.sky);
    if (glowMain.current) glowMain.current.intensity = s.screens.main === 'off' ? 0 : 7;
    if (glowUpper.current) glowUpper.current.intensity = s.screens.upper === 'off' ? 0 : 5;
    const opts = { clock: clockText(s.hour), blink: still || Math.floor(state.clock.elapsedTime * 2) % 2 === 0, locale };
    screens.main.draw(s.screens.main, opts);
    screens.upper.draw(s.screens.upper, opts);
    screens.tablet.draw(s.screens.tablet, opts);
    if (chair.current) chair.current.rotation.y = Math.PI + s.turn * TURN_TO_CAMERA;
    // the mug leaves the desk while it is in his hand
    if (deskMug.current) deskMug.current.visible = poseWeight(s, 'coffee') <= 0.5;
  });

  const cast = { castShadow: true, receiveShadow: true } as const;
  // Box face order: +x, -x, +y, -y, +z, -z
  const backWallMats: Mat[] = [mats.cut, mats.cut, mats.cut, mats.cut, mats.wall, mats.outer];
  const rightWallMats: Mat[] = [mats.outer, mats.wall, mats.cut, mats.cut, mats.cut, mats.cut];
  const sunMap = lite ? 1024 : 2048;

  return (
    <group>
      {/* Lights */}
      <ambientLight ref={ambient} color="#ffffff" />
      <hemisphereLight ref={hemi} args={['#c9d4e0', '#2a221c', 1]} />
      <directionalLight
        ref={sun}
        castShadow
        shadow-mapSize={[sunMap, sunMap]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.025}
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
      />
      <pointLight ref={lampFill} position={[0.86, 1.15, -1.1]} decay={2} distance={6} color="#ffb977" />
      <rectAreaLight ref={glowMain} position={[-0.2, 1.2, -1.38]} width={0.62} height={0.35} color="#bcd7c4" />
      <rectAreaLight ref={glowUpper} position={[-0.2, 1.72, -1.52]} width={0.6} height={0.34} color="#c9d6e8" />
      <Environment resolution={64} environmentIntensity={0.35}>
        <Lightformer form="rect" intensity={2} position={[4, 2, 0]} scale={[3, 2, 1]} color="#dfe8f0" />
        <Lightformer form="rect" intensity={0.6} position={[-4, 3, 3]} scale={[4, 3, 1]} color="#ffd8b0" />
      </Environment>

      {/* Floor slab, carpet, rug */}
      <mesh {...cast} position={[0.06, -0.08, -0.06]} material={[mats.cut, mats.cut, mats.carpet, mats.cut, mats.cut, mats.cut]}>
        <boxGeometry args={[4.24, 0.16, 3.32]} />
      </mesh>
      <mesh receiveShadow position={[-0.2, 0.006, -0.35]} material={mats.rug}>
        <boxGeometry args={[1.9, 0.012, 1.45]} />
      </mesh>

      {/* Back wall */}
      <mesh {...cast} position={[0.06, 1.3, -1.66]} material={backWallMats}>
        <boxGeometry args={[4.24, 2.6, 0.12]} />
      </mesh>
      {/* Right wall, built around the window opening (z -0.95..0.55, y 0.95..2.25) */}
      <mesh {...cast} position={[2.06, 0.475, -0.06]} material={rightWallMats}>
        <boxGeometry args={[0.12, 0.95, 3.32]} />
      </mesh>
      <mesh {...cast} position={[2.06, 2.425, -0.06]} material={rightWallMats}>
        <boxGeometry args={[0.12, 0.35, 3.32]} />
      </mesh>
      <mesh {...cast} position={[2.06, 1.6, -1.335]} material={rightWallMats}>
        <boxGeometry args={[0.12, 1.3, 0.77]} />
      </mesh>
      <mesh {...cast} position={[2.06, 1.6, 1.075]} material={rightWallMats}>
        <boxGeometry args={[0.12, 1.3, 1.05]} />
      </mesh>
      {/* Window frame, mullions, sky */}
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
      <mesh position={[2.13, 1.6, -0.2]} rotation={[0, -Math.PI / 2, 0]} material={skyMat}>
        <planeGeometry args={[1.6, 1.4]} />
      </mesh>

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
        </group>
      ))}
      {/* Riser */}
      <RoundedBox args={[1.5, 0.03, 0.26]} radius={0.006} position={[-0.2, 0.905, -1.45]} material={mats.woodSmall} {...cast} />
      {[-0.92, 0.52].map((x) => (
        <mesh key={x} {...cast} position={[x, 0.845, -1.45]} material={mats.woodSmall}>
          <boxGeometry args={[0.03, 0.1, 0.24]} />
        </mesh>
      ))}

      {/* Main monitor on the riser */}
      <RoundedBox args={[0.66, 0.39, 0.03]} radius={0.008} position={[-0.2, 1.2, -1.44]} material={mats.black} castShadow />
      <mesh position={[-0.2, 1.2, -1.4245]} material={screens.mainMat}>
        <planeGeometry args={[0.625, 0.352]} />
      </mesh>
      <mesh {...cast} position={[-0.2, 0.99, -1.47]} material={mats.black}>
        <boxGeometry args={[0.04, 0.14, 0.025]} />
      </mesh>
      <mesh {...cast} position={[-0.2, 0.926, -1.46]} material={mats.black}>
        <boxGeometry args={[0.24, 0.012, 0.15]} />
      </mesh>
      {/* Upper monitor on the wall, tipped toward him */}
      <group position={[-0.2, 1.72, -1.555]} rotation={[0.1, 0, 0]}>
        <RoundedBox args={[0.64, 0.38, 0.03]} radius={0.008} material={mats.black} castShadow />
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
          <mesh key={s} {...cast} position={[s * 0.088, 0.17, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.cream}>
            <cylinderGeometry args={[0.048, 0.048, 0.04, 24]} />
          </mesh>
        ))}
      </group>

      {/* Desk mat, keyboard, mouse, mug, duck, tablet */}
      <RoundedBox args={[0.98, 0.004, 0.42]} radius={0.002} position={[-0.22, 0.792, -1.04]} material={mats.mat} receiveShadow />
      <Keys x={-0.3} y={0.803} z={-1.01} w={0.36} d={0.12} rows={5} cols={15} color="#f1ede6" base="#c9c5bd" />
      <mesh {...cast} position={[0.06, 0.803, -1.0]} scale={[0.03, 0.016, 0.05]} material={mats.black}>
        <sphereGeometry args={[1, 20, 12]} />
      </mesh>
      <group ref={deskMug} position={[-0.95, 0.79, -1.0]}>
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
          <RoundedBox args={[0.24, 0.17, 0.008]} radius={0.004} material={mats.black} castShadow />
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
        <mesh castShadow receiveShadow material={mats.woodSmall}>
          <boxGeometry args={[0.62, 0.62, 0.02]} />
        </mesh>
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

      {/* Desk lamp at the right end */}
      <group position={[1.12, 0.79, -1.42]}>
        <mesh castShadow position={[0, 0.012, 0]} material={mats.black}>
          <cylinderGeometry args={[0.07, 0.075, 0.024, 24]} />
        </mesh>
        <mesh castShadow position={[0, 0.22, 0]} rotation={[0, 0, 0.12]} material={mats.black}>
          <cylinderGeometry args={[0.008, 0.008, 0.42, 8]} />
        </mesh>
        <mesh castShadow position={[-0.12, 0.44, 0.1]} rotation={[0.75, 0.6, 1.05]} material={mats.black}>
          <cylinderGeometry args={[0.008, 0.008, 0.38, 8]} />
        </mesh>
        <group position={[-0.26, 0.45, 0.2]} rotation={[0.5, 0, 0.65]}>
          <mesh castShadow material={mats.black}>
            <coneGeometry args={[0.06, 0.12, 24, 1, true]} />
          </mesh>
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

      {/* The chair and Akira, turning together */}
      <group ref={chair} position={CHAIR}>
        <RoundedBox args={[0.5, 0.08, 0.48]} radius={0.03} position={[0, 0.44, 0]} material={mats.leather} {...cast} />
        <RoundedBox args={[0.48, 0.78, 0.08]} radius={0.035} position={[0, 0.9, -0.27]} rotation={[-0.12, 0, 0]} material={mats.leather} {...cast} />
        <RoundedBox args={[0.26, 0.12, 0.06]} radius={0.03} position={[0, 1.2, -0.27]} rotation={[-0.12, 0, 0]} material={mats.black} castShadow />
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.29, 0, 0.02]}>
            <mesh castShadow position={[0, 0.56, -0.04]} material={mats.black}>
              <boxGeometry args={[0.03, 0.2, 0.04]} />
            </mesh>
            <RoundedBox args={[0.07, 0.025, 0.26]} radius={0.01} position={[0, 0.67, 0]} material={mats.black} castShadow />
          </group>
        ))}
        <mesh castShadow position={[0, 0.26, 0]} material={mats.metal}>
          <cylinderGeometry args={[0.028, 0.028, 0.32, 12]} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <group key={i} rotation={[0, a, 0]}>
              <mesh castShadow position={[0, 0.08, 0.15]} material={mats.black}>
                <boxGeometry args={[0.04, 0.03, 0.3]} />
              </mesh>
              <mesh castShadow position={[0, 0.03, 0.29]} material={mats.black}>
                <sphereGeometry args={[0.028, 12, 8]} />
              </mesh>
            </group>
          );
        })}
        <Akira sample={sample} still={still} />
      </group>
    </group>
  );
}
