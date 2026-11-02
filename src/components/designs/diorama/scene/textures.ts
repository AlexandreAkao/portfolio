/**
 * Canvas-drawn textures for the diorama: the monstera leaf sprite (also used
 * by the screens' wallpaper), butcher-block wood, carpet and wall noise, and
 * the pink monstera print on the wall.
 */
import * as THREE from 'three';

function leafPath(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-s * 0.78, -s * 0.02, -s * 0.74, -s * 0.86, 0, -s);
  ctx.bezierCurveTo(s * 0.74, -s * 0.86, s * 0.78, -s * 0.02, 0, 0);
  ctx.closePath();
}

function shade(hex: string, k: number) {
  const c = new THREE.Color(hex);
  c.multiplyScalar(k);
  return `#${c.getHexString()}`;
}

/** A monstera leaf on its own transparent canvas, base at the bottom centre. */
export function leafCanvas(fill: string, vein: string, size = 512): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  const s = size * 0.92;
  ctx.translate(size / 2, size * 0.97);
  leafPath(ctx, s);
  const g = ctx.createLinearGradient(-s * 0.5, 0, s * 0.5, -s);
  g.addColorStop(0, fill);
  g.addColorStop(1, shade(fill, 1.25));
  ctx.fillStyle = g;
  ctx.fill();
  // Fenestrations: slits cut in from the edge toward the midrib, and holes
  ctx.globalCompositeOperation = 'destination-out';
  ctx.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const y = -s * (0.16 + i * 0.105);
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * s * 0.95, y - s * 0.09);
      ctx.quadraticCurveTo(side * s * 0.5, y - s * 0.02, side * s * (0.2 + (i % 2) * 0.06), y + s * 0.02);
      ctx.lineWidth = s * (0.03 + (i % 3) * 0.006);
      ctx.stroke();
    }
    if (i > 0 && i < 6) {
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(side * s * 0.13, y + s * 0.045, s * 0.022, s * 0.012, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.globalCompositeOperation = 'source-atop';
  ctx.strokeStyle = vein;
  ctx.lineWidth = s * 0.012;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(s * 0.02, -s * 0.5, 0, -s * 0.97);
  ctx.stroke();
  return c;
}

/** Butcher block: strips of warm wood with a little grain. */
export function woodTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  const tones = ['#9a5a2c', '#b06a35', '#8a4e26', '#c07a3e', '#a4612f', '#7d4520', '#b87440'];
  let x = 0;
  let k = 0;
  while (x < c.width) {
    const w = 22 + ((k * 37) % 19);
    ctx.fillStyle = tones[(k * 5) % tones.length];
    ctx.fillRect(x, 0, w, c.height);
    for (let i = 0; i < 9; i++) {
      ctx.strokeStyle = `rgba(40,18,6,${0.05 + ((i * 13 + k) % 7) * 0.012})`;
      ctx.lineWidth = 1 + (i % 3);
      const gx = x + ((i * 7 + k * 3) % w);
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.bezierCurveTo(gx + 3, c.height * 0.3, gx - 3, c.height * 0.7, gx + 2, c.height);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(30,12,4,0.35)';
    ctx.fillRect(x + w - 1, 0, 1, c.height);
    x += w;
    k++;
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/** A flat colour with seeded grey noise, for carpet, rug and the walls. */
export function noiseTexture(base: string, amount = 18, size = 256): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  const img = ctx.getImageData(0, 0, size, size);
  let seed = 7;
  for (let i = 0; i < img.data.length; i += 4) {
    seed = (seed * 16807) % 2147483647;
    const n = (seed / 2147483647 - 0.5) * amount;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** The pink monstera print on the wall. */
export function printTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 340;
  c.height = 440;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#efe7e1';
  ctx.fillRect(0, 0, c.width, c.height);
  const leaf = leafCanvas('#e58fa0', '#f6d3da', 400);
  ctx.save();
  ctx.translate(170, 330);
  ctx.rotate(-0.35);
  ctx.drawImage(leaf, -150, -290, 300, 300);
  ctx.restore();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
