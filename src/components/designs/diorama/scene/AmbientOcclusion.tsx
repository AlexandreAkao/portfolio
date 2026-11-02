/**
 * Ambient occlusion for the room (desktop only): the soft darkening where things
 * meet (a book against its shelf, the PC under the desk, the corner of two walls)
 * that a baked miniature has and plain real-time light does not.
 *
 * It takes over the frame (useFrame priority 1). Three's GTAOPass works out the
 * occlusion from the scene's normals and depth into a texture; the room then
 * renders as usual, straight to the canvas, keeping its antialiasing and its
 * tone mapping (the screens stay untouched by it); last, a full-screen quad
 * multiplies the occlusion over the picture. The pass's own scene render already
 * drew the shadow maps, so the room's render reuses them.
 */
import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';

/** How much of the occlusion reaches the picture (1 = all of it). */
const STRENGTH = 0.85;
/** The occlusion is soft by nature: worked out at one pixel per CSS pixel at most (a quarter of the work on a retina screen). */
const MAX_DPR = 1;

export default function AmbientOcclusion() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);

  const pass = useMemo(() => {
    const p = new GTAOPass(scene, camera, 1, 1);
    p.output = GTAOPass.OUTPUT.Off;
    // In the room's units (metres): a reach of about a hand's width
    p.updateGtaoMaterial({ radius: 0.22, distanceExponent: 1.6, thickness: 1.5, scale: 1.1, samples: 16, distanceFallOff: 1 });
    p.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
    return p;
  }, [scene, camera]);

  const overlay = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      uniforms: { tAO: { value: pass.pdRenderTarget.texture }, strength: { value: STRENGTH } },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader:
        'uniform sampler2D tAO; uniform float strength; varying vec2 vUv; void main() { float ao = texture2D(tAO, vUv).r; gl_FragColor = vec4(vec3(mix(1.0, ao, strength)), 1.0); }',
      // destination x source: the picture darkens where the occlusion is below 1
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.ZeroFactor,
      blendDst: THREE.SrcColorFactor,
      depthTest: false,
      depthWrite: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    quad.frustumCulled = false;
    const layer = new THREE.Scene();
    layer.add(quad);
    return { layer, camera: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), quad, material };
  }, [pass]);

  useEffect(() => {
    const k = Math.min(dpr, MAX_DPR);
    pass.setSize(Math.round(size.width * k), Math.round(size.height * k));
  }, [pass, size, dpr]);

  useEffect(
    () => () => {
      pass.dispose();
      overlay.quad.geometry.dispose();
      overlay.material.dispose();
    },
    [pass, overlay],
  );

  useFrame(() => {
    // Occlusion first: its normal pass also renders this frame's shadow maps
    pass.render(gl, null as unknown as THREE.WebGLRenderTarget, null as unknown as THREE.WebGLRenderTarget, 0, false);
    gl.setRenderTarget(null);
    const shadows = gl.shadowMap.autoUpdate;
    gl.shadowMap.autoUpdate = false;
    gl.render(scene, camera);
    gl.shadowMap.autoUpdate = shadows;
    const clear = gl.autoClear;
    gl.autoClear = false;
    gl.render(overlay.layer, overlay.camera);
    gl.autoClear = clear;
  }, 1);

  return null;
}
