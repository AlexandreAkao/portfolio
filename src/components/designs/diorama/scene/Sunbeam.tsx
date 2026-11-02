/**
 * The window's light made visible: a faint shaft from the opening to the patch it lights on
 * the floor, warm while the sun is up and high enough, cool under the moon, with motes of dust
 * drifting down through it. The shaft follows the light's direction every frame.
 *
 * Both live on layer 1, which the ambient occlusion pass leaves out (a shaft of light occludes
 * nothing); the camera sees layer 1 always.
 */
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { DaySample } from '../day';

/** The window's opening below the blind, on the inner face of the right wall. */
const WIN = { x: 2.0, y0: 0.97, y1: 1.98, z0: -0.95, z1: 0.55 };
const MOTES = 70;
const WARM = new THREE.Color('#ffcf98');
const COOL = new THREE.Color('#9fb6ff');
export const BEAM_LAYER = 1;

const clamp = (x: number) => Math.min(1, Math.max(0, x));

/** A soft round dot, for the motes. */
function dotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(c);
}

export default function Sunbeam({ sample, still }: { sample: MutableRefObject<DaySample>; still: boolean }) {
  const camera = useThree((s) => s.camera);
  const beam = useRef<THREE.Mesh>(null);
  const dust = useRef<THREE.Points>(null);

  const shaft = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(8 * 3), 3));
    // the window end bright, the floor end faint
    const colors = new Float32Array(8 * 4);
    for (let i = 0; i < 8; i++) colors.set([1, 1, 1, i < 4 ? 1 : 0.22], i * 4);
    g.setAttribute('color', new THREE.BufferAttribute(colors, 4));
    // the four sides: window corner i and i+1 to their floor corners
    g.setIndex([0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7]);
    const material = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
    return { g, material };
  }, []);

  const motes = useMemo(() => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const seeds = Array.from({ length: MOTES }, () => ({ u: rnd(), v: rnd(), t: rnd(), speed: 0.6 + rnd() * 0.8, phase: rnd() * Math.PI * 2 }));
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MOTES * 3), 3));
    const material = new THREE.PointsMaterial({ map: dotTexture(), size: 0.011, sizeAttenuation: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    return { seeds, g, material };
  }, []);

  useEffect(() => {
    camera.layers.enable(BEAM_LAYER);
    beam.current?.layers.set(BEAM_LAYER);
    dust.current?.layers.set(BEAM_LAYER);
  }, [camera]);

  useEffect(
    () => () => {
      shaft.g.dispose();
      shaft.material.dispose();
      motes.g.dispose();
      motes.material.dispose();
    },
    [shaft, motes],
  );

  const work = useMemo(() => ({ dir: new THREE.Vector3(), travel: new THREE.Vector3() }), []);

  useFrame((state) => {
    const L = sample.current.light;
    const dir = work.dir.set(L.sunDir[0], L.sunDir[1], L.sunDir[2]).normalize();
    // Visible while the light comes down through the window at a slant: not when it grazes in flat, not at noon
    const slant = clamp((dir.y - 0.25) / 0.35) * (1 - clamp((dir.y - 0.62) / 0.3));
    const warm = (L.sun / 6.6) * slant;
    const cool = (L.moon / 1.9) * slant * 0.75;
    const k = Math.max(warm, cool);
    shaft.material.opacity = 0.07 * k;
    shaft.material.color.copy(warm >= cool ? WARM : COOL);
    motes.material.opacity = 0.75 * k;
    motes.material.color.copy(shaft.material.color);
    const visible = k > 0.01;
    if (beam.current) beam.current.visible = visible;
    if (dust.current) dust.current.visible = visible;
    if (!visible) return;

    // The shaft: each window corner and where the light from it meets the floor
    const travel = work.travel.copy(dir).negate();
    const corners: [number, number][] = [
      [WIN.y0, WIN.z0],
      [WIN.y1, WIN.z0],
      [WIN.y1, WIN.z1],
      [WIN.y0, WIN.z1],
    ];
    const pos = shaft.g.attributes.position as THREE.BufferAttribute;
    corners.forEach(([y, z], i) => {
      const t = y / -travel.y;
      pos.setXYZ(i, WIN.x, y, z);
      pos.setXYZ(i + 4, WIN.x + travel.x * t, 0.002, z + travel.z * t);
    });
    pos.needsUpdate = true;
    shaft.g.computeBoundingSphere();

    // The motes drift down the shaft, each wavering a little on its way
    const time = still ? 0 : state.clock.elapsedTime;
    const mp = motes.g.attributes.position as THREE.BufferAttribute;
    motes.seeds.forEach((m, i) => {
      const t = (m.t + time * 0.012 * m.speed) % 1;
      const y = WIN.y0 + m.v * (WIN.y1 - WIN.y0);
      const z = WIN.z0 + m.u * (WIN.z1 - WIN.z0);
      const reach = (y / -travel.y) * (0.08 + t * 0.85);
      mp.setXYZ(
        i,
        WIN.x + travel.x * reach + Math.sin(time * 0.4 + m.phase) * 0.02,
        y + travel.y * reach + Math.sin(time * 0.31 + m.phase * 1.7) * 0.015,
        z + travel.z * reach + Math.cos(time * 0.37 + m.phase) * 0.02,
      );
    });
    mp.needsUpdate = true;
    motes.g.computeBoundingSphere();
  });

  return (
    <group>
      <mesh ref={beam} geometry={shaft.g} material={shaft.material} renderOrder={3} frustumCulled={false} />
      <points ref={dust} geometry={motes.g} material={motes.material} renderOrder={4} frustumCulled={false} />
    </group>
  );
}
