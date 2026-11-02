/**
 * The room is hundreds of small static meshes (books, shelves, pots, rods,
 * outlets...). Drawn one by one, in the main pass and again in each shadow map,
 * they cost the phone's CPU more than their pixels cost its GPU. Once mounted,
 * this folds every static mesh under it into one mesh per material look, so the
 * room draws in a few dozen calls.
 *
 * On the way every plain box gets softened edges (a rounded box of the same
 * size), so shelves, panels, legs and frames catch a line of light along each
 * edge like a finished model instead of meeting at razor corners.
 *
 * Left alone: anything under an object marked `userData.live` (it moves or
 * hides: the chair and Akira, the mug, the clock's hands), instanced and
 * multi-material meshes, transparent materials (they sort per mesh), and any
 * material marked `userData.live` (the frame loop animates it, so it keeps its
 * own identity in the merge).
 */
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/** The edge radius a plain box gets: 6mm, never more than a quarter of its thinnest side. */
const BEVEL = 0.006;

/** A plain box as the same box with rounded edges; any other geometry as it is. */
function soften(source: THREE.BufferGeometry): THREE.BufferGeometry {
  if (!(source instanceof THREE.BoxGeometry) || source instanceof RoundedBoxGeometry) return source;
  const { width, height, depth } = source.parameters;
  const r = Math.min(BEVEL, Math.min(width, height, depth) * 0.25);
  return r > 0.0008 ? new RoundedBoxGeometry(width, height, depth, 2, r) : source;
}

/** Materials that look the same merge together, whichever JSX created them. */
function look(material: THREE.Material): string {
  if (material.userData.live || !(material instanceof THREE.MeshStandardMaterial)) return material.uuid;
  const m = material;
  return [
    'std',
    m.color.getHexString(),
    m.roughness,
    m.metalness,
    m.emissive.getHexString(),
    m.emissiveIntensity,
    m.side,
    m.alphaTest,
    m.map?.uuid ?? '',
    m.envMapIntensity,
    m.flatShading,
  ].join('|');
}

/** Position, normal and uv only, non-indexed, so every geometry can join any other. */
function normalise(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  const source = soften(geometry);
  const g = source.index ? source.toNonIndexed() : source.clone();
  if (source !== geometry) source.dispose();
  for (const name of Object.keys(g.attributes)) {
    if (name !== 'position' && name !== 'normal' && name !== 'uv') g.deleteAttribute(name);
  }
  if (!g.attributes.normal) g.computeVertexNormals();
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
  g.clearGroups();
  return g;
}

/** `version` re-merges when what the children render changes (the lite room drops a few pieces). */
export default function StaticMerge({ children, version }: { children: ReactNode; version?: string | number | boolean }) {
  const ref = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.updateWorldMatrix(true, true);
    const toRoot = root.matrixWorld.clone().invert();
    const buckets = new Map<
      string,
      {
        material: THREE.Material;
        cast: boolean;
        receive: boolean;
        geometries: THREE.BufferGeometry[];
        meshes: THREE.Mesh[];
      }
    >();

    const walk = (o: THREE.Object3D) => {
      if (o.userData.live) return;
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && !(o as THREE.InstancedMesh).isInstancedMesh && mesh.visible && !Array.isArray(mesh.material) && !mesh.material.transparent) {
        const key = `${look(mesh.material)}|${mesh.castShadow}|${mesh.receiveShadow}`;
        let bucket = buckets.get(key);
        if (!bucket) {
          bucket = {
            material: mesh.material,
            cast: mesh.castShadow,
            receive: mesh.receiveShadow,
            geometries: [],
            meshes: [],
          };
          buckets.set(key, bucket);
        }
        const g = normalise(mesh.geometry);
        g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(toRoot, mesh.matrixWorld));
        bucket.geometries.push(g);
        bucket.meshes.push(mesh);
      }
      for (const child of o.children) walk(child);
    };
    for (const child of root.children) walk(child);

    const merged: THREE.Mesh[] = [];
    const hidden: THREE.Mesh[] = [];
    for (const b of buckets.values()) {
      const geometry = mergeGeometries(b.geometries, false);
      b.geometries.forEach((g) => g.dispose());
      if (!geometry) continue;
      const mesh = new THREE.Mesh(geometry, b.material);
      mesh.castShadow = b.cast;
      mesh.receiveShadow = b.receive;
      root.add(mesh);
      merged.push(mesh);
      for (const m of b.meshes) {
        m.visible = false;
        hidden.push(m);
      }
    }

    return () => {
      for (const m of merged) {
        root.remove(m);
        m.geometry.dispose();
      }
      for (const m of hidden) m.visible = true;
    };
  }, [version]);

  return <group ref={ref}>{children}</group>;
}
