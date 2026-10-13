/** Clay: the surfaces the set is made of, painted on a canvas at load (no image files). */
import * as THREE from 'three';

/** A seeded random, so every load builds the same set. */
export function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pressed clay: fine grain, fingerprint whorls and the odd tool smear, as a bump map. */
export function clayBump(): THREE.CanvasTexture {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const rnd = seeded(7);
  ctx.fillStyle = 'rgb(128,128,128)';
  ctx.fillRect(0, 0, size, size);
  // Grain
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rnd() - 0.5) * 26;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = 128 + n;
  }
  ctx.putImageData(img, 0, 0);
  ctx.filter = 'blur(1.2px)';
  ctx.drawImage(c, 0, 0);
  ctx.filter = 'none';
  // Fingerprints: loose concentric loops pressed in
  for (let f = 0; f < 7; f++) {
    const cx = rnd() * size;
    const cy = rnd() * size;
    const rot = rnd() * Math.PI;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    for (let r = 4; r < 46; r += 3.2) {
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.72, r, 0, rnd() * 0.6, Math.PI * 2 - rnd() * 0.8);
      ctx.strokeStyle = `rgba(${rnd() > 0.5 ? '90,90,90' : '170,170,170'},${0.35 + rnd() * 0.2})`;
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }
    ctx.restore();
  }
  // Tool smears
  for (let s = 0; s < 14; s++) {
    ctx.beginPath();
    const x = rnd() * size;
    const y = rnd() * size;
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + (rnd() - 0.5) * 80, y + (rnd() - 0.5) * 80, x + (rnd() - 0.5) * 120, y + (rnd() - 0.5) * 120);
    ctx.strokeStyle = `rgba(${rnd() > 0.5 ? '100,100,100' : '160,160,160'},0.4)`;
    ctx.lineWidth = 2 + rnd() * 3;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.5, 1.5);
  return tex;
}

/** Painted backdrop paper: a slow mottled wash so the sweep never reads as a flat fill. */
export function backdropMap(base: string): THREE.CanvasTexture {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const rnd = seeded(19);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  // Blobs drawn with their wrap-around copies, so the tile has no seams.
  for (let i = 0; i < 220; i++) {
    const r = 20 + rnd() * 70;
    const x = rnd() * size;
    const y = rnd() * size;
    ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.016)' : 'rgba(0,0,0,0.02)';
    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        ctx.beginPath();
        ctx.arc(x + ox, y + oy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}
