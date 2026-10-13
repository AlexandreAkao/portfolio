/**
 * Dev tool, not shipped: renders one frame of the clay puppet on a transparent
 * 400x560 canvas, for the stills in public/images/clay/akira-{wave,point}.webp.
 * To regenerate: mount it client:only="react" on a temporary page under
 * src/pages, open it with ?pose=wave|point&frame=N, wait for window.__still,
 * screenshot the canvas with omitBackground, then lay the frames side by side
 * (magick +append) and encode with cwebp. Wave uses frames 0-7, point 0-2.
 */
import { useEffect, useMemo, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import ClayAkira, { type ClayPose } from '../ClayAkira';
import { clayBump, seeded } from '../clayTextures';

function Ready() {
  const gl = useThree((s) => s.gl);
  const advance = useThree((s) => s.advance);
  useEffect(() => {
    let n = 0;
    const tick = () => {
      advance(performance.now());
      if (++n < 4) requestAnimationFrame(tick);
      else (window as unknown as { __still: string }).__still = gl.domElement.toDataURL('image/png');
    };
    requestAnimationFrame(tick);
  }, [gl, advance]);
  return null;
}

export default function StillRender() {
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const pose = (params.get('pose') ?? 'wave') as ClayPose;
  const frame = Number(params.get('frame') ?? 0);
  const clay = useMemo(() => {
    const t = clayBump();
    const r = seeded(frame * 13 + 5);
    t.offset.set(r() * 0.02, r() * 0.02);
    return t;
  }, [frame]);
  const camX = pose === 'point' ? 0.3 : -0.12;
  return (
    <div style={{ width: 400, height: 560 }}>
      <Canvas
        frameloop="never"
        shadows="percentage"
        dpr={1}
        gl={{ alpha: true, preserveDrawingBuffer: true, antialias: true, toneMapping: THREE.NeutralToneMapping }}
        camera={{ fov: 30, position: [camX, 1.22, 5.3], near: 0.1, far: 50 }}
        onCreated={({ camera }) => camera.lookAt(camX, 1.1, 0)}
      >
        <hemisphereLight args={['#ffffff', '#0d6e67', 0.9]} />
        <directionalLight position={[-3.5, 6.5, 5]} intensity={2.4} color="#fff3e2" castShadow shadow-mapSize={[2048, 2048]} shadow-radius={6} shadow-bias={-0.0004} shadow-normalBias={0.02} />
        <directionalLight position={[5, 2, 4]} intensity={0.5} color="#dff6ff" />
        <directionalLight position={[2, 4, -5]} intensity={1.4} color="#ffffff" />
        <Environment resolution={64} environmentIntensity={0.35} frames={1}>
          <Lightformer form="rect" intensity={2} position={[-3, 4, 4]} scale={[4, 3, 1]} />
          <Lightformer form="rect" intensity={1} position={[4, 2, 3]} scale={[3, 3, 1]} />
        </Environment>
        <ContactShadows position={[0, 0.001, 0]} scale={2.2} blur={2.4} far={1.2} opacity={0.5} resolution={512} frames={1} color="#06403b" />
        <group rotation={[0, pose === 'point' ? 0.22 : -0.12, 0]}>
          <ClayAkira pose={pose} clayMap={clay} frame={frame} />
        </group>
        <Ready />
      </Canvas>
    </div>
  );
}
