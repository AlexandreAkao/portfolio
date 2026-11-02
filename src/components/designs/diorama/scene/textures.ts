/**
 * Canvas-drawn textures for the diorama: the monstera leaf sprite (also used
 * by the screens' wallpaper), butcher-block wood, wall noise, the pink
 * monstera print on the wall; then the lived-in detail: carpet tiles, the
 * woven rug, the dotted desk mat, the drilled pegboard, the window's sky and
 * town, two prints, the polaroids, and the soft footprints of contact shadow.
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

/* ------------------------------------------------------------ lived-in detail */

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
}

function tex(c: HTMLCanvasElement, repeat = false): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** A seeded random in [0, 1), so every visit draws the same room. */
export function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Carpet tiles, as in the reference: square tiles laid in alternating pile direction, a fleck in each. */
export function carpetTexture(): THREE.CanvasTexture {
  const size = 512;
  const [c, ctx] = canvas(size, size);
  const rnd = seeded(11);
  const n = 4;
  const t = size / n;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      ctx.fillStyle = (i + j) % 2 ? '#5b5e63' : '#55585d';
      ctx.fillRect(i * t, j * t, t, t);
      // pile direction: fine stripes, turned a quarter on every other tile
      ctx.strokeStyle = 'rgba(255,255,255,0.025)';
      ctx.lineWidth = 1;
      for (let k = 2; k < t; k += 4) {
        ctx.beginPath();
        if ((i + j) % 2) {
          ctx.moveTo(i * t + k, j * t);
          ctx.lineTo(i * t + k, j * t + t);
        } else {
          ctx.moveTo(i * t, j * t + k);
          ctx.lineTo(i * t + t, j * t + k);
        }
        ctx.stroke();
      }
    }
  }
  const img = ctx.getImageData(0, 0, size, size);
  for (let p = 0; p < img.data.length; p += 4) {
    const v = (rnd() - 0.5) * 22;
    img.data[p] += v;
    img.data[p + 1] += v;
    img.data[p + 2] += v;
  }
  ctx.putImageData(img, 0, 0);
  ctx.strokeStyle = 'rgba(20,20,22,0.35)';
  ctx.lineWidth = 2;
  for (let k = 0; k <= n; k++) {
    ctx.beginPath();
    ctx.moveTo(k * t, 0);
    ctx.lineTo(k * t, size);
    ctx.moveTo(0, k * t);
    ctx.lineTo(size, k * t);
    ctx.stroke();
  }
  return tex(c, true);
}

/** A flat-woven rug: oatmeal field, ink border, a band of small diamonds, fringe-free. */
export function rugTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(760, 580);
  const W = c.width;
  const H = c.height;
  ctx.fillStyle = '#cfc5b4';
  ctx.fillRect(0, 0, W, H);
  // weave
  for (let y = 0; y < H; y += 3) {
    ctx.fillStyle = y % 6 ? 'rgba(80,60,40,0.05)' : 'rgba(255,255,255,0.05)';
    ctx.fillRect(0, y, W, 1);
  }
  const band = (inset: number, width: number, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.strokeRect(inset + width / 2, inset + width / 2, W - 2 * inset - width, H - 2 * inset - width);
  };
  band(0, 26, '#2c2b2e');
  band(40, 6, '#2c2b2e');
  band(54, 3, '#b8763f');
  // diamonds along the inner field
  ctx.fillStyle = '#2c2b2e';
  const diamond = (x: number, y: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r, y);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x - r, y);
    ctx.closePath();
    ctx.fill();
  };
  for (let x = 90; x < W - 70; x += 34) {
    diamond(x, 84, 7);
    diamond(x, H - 84, 7);
  }
  for (let y = 118; y < H - 100; y += 34) {
    diamond(84, y, 7);
    diamond(W - 84, y, 7);
  }
  // a large quiet lozenge in the middle
  ctx.strokeStyle = 'rgba(44,43,46,0.5)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(W / 2, H / 2 - 120);
  ctx.lineTo(W / 2 + 190, H / 2);
  ctx.lineTo(W / 2, H / 2 + 120);
  ctx.lineTo(W / 2 - 190, H / 2);
  ctx.closePath();
  ctx.stroke();
  return tex(c);
}

/** The desk mat from the reference: deep navy felt with a scatter of small pale dots. */
export function matTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(1024, 440);
  ctx.fillStyle = '#1c2232';
  ctx.fillRect(0, 0, c.width, c.height);
  const rnd = seeded(5);
  ctx.fillStyle = 'rgba(232,226,214,0.85)';
  for (let y = 22; y < c.height; y += 44) {
    for (let x = 22 + ((y / 44) % 2) * 22; x < c.width; x += 44) {
      ctx.beginPath();
      ctx.arc(x + (rnd() - 0.5) * 6, y + (rnd() - 0.5) * 6, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, c.width - 6, c.height - 6);
  return tex(c);
}

/** Pegboard: the wood with a grid of drilled holes. */
export function pegboardTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(512, 512);
  const grain = woodTexture().image as HTMLCanvasElement;
  ctx.drawImage(grain, 0, 0, 512, 512);
  ctx.fillStyle = 'rgba(232,180,120,0.18)';
  ctx.fillRect(0, 0, 512, 512);
  for (let y = 20; y < 512; y += 32) {
    for (let x = 20; x < 512; x += 32) {
      ctx.fillStyle = 'rgba(18,10,6,0.85)';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,220,180,0.18)';
      ctx.beginPath();
      ctx.arc(x + 1, y + 2, 5, 0, Math.PI);
      ctx.fill();
    }
  }
  return tex(c);
}

/** The window's sky: a white-to-pale vertical gradient the hour's sky colour multiplies. */
export function skyTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(8, 256);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#9aa6b8');
  g.addColorStop(0.55, '#e4e8ee');
  g.addColorStop(1, '#ffffff');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 8, 256);
  return tex(c);
}

/** The near row of the town's roofs, left to right. */
function town(W: number, H: number, rnd: () => number) {
  const roofs: { x: number; w: number; h: number }[] = [];
  let x = -10;
  while (x < W) {
    const w = 46 + rnd() * 90;
    const h = H * (0.18 + rnd() * 0.32);
    roofs.push({ x, w, h });
    x += w + 4 + rnd() * 10;
  }
  return roofs;
}

/**
 * The town outside the window, in two layers: its silhouette (roofs, a water tank, trees in
 * front; white on clear, tinted by the hour) and its lights (windows and stars on black, added
 * at night).
 */
export function townTextures(): {
  skyline: THREE.CanvasTexture;
  lights: THREE.CanvasTexture;
} {
  const W = 640;
  const H = 560;
  const rnd = seeded(23);
  const roofs = town(W, H, rnd);
  const [s, sx] = canvas(W, H);
  const [l, lx] = canvas(W, H);
  lx.fillStyle = '#000';
  lx.fillRect(0, 0, W, H);
  // far row, paler
  sx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 9; i++) {
    const w = 60 + rnd() * 80;
    const fx = (i / 9) * W + rnd() * 30;
    const h = H * (0.32 + rnd() * 0.22);
    sx.fillRect(fx, H - h, w, h);
  }
  // near row, solid, with roofs and windows
  sx.fillStyle = '#ffffff';
  for (const r of roofs) {
    const top = H - r.h;
    sx.fillRect(r.x, top, r.w, r.h);
    if (rnd() > 0.55) {
      // a pitched roof
      sx.beginPath();
      sx.moveTo(r.x - 3, top);
      sx.lineTo(r.x + r.w / 2, top - 22 - rnd() * 14);
      sx.lineTo(r.x + r.w + 3, top);
      sx.closePath();
      sx.fill();
    } else if (rnd() > 0.6) {
      // a water tank on the roof
      sx.fillRect(r.x + r.w * 0.3, top - 16, 18, 16);
    }
    // windows, lit at night in the lights layer
    // each building keeps a few rooms awake, in its own window grid
    const pitchX = 14 + Math.floor(rnd() * 8);
    const pitchY = 18 + Math.floor(rnd() * 8);
    const awake = 0.12 + rnd() * 0.2;
    for (let wy = top + 10 + rnd() * 6; wy < H - 34; wy += pitchY) {
      for (let wx = r.x + 6 + rnd() * 4; wx < r.x + r.w - 10; wx += pitchX) {
        if (rnd() < awake) {
          const warm = rnd() > 0.2;
          const a = 0.55 + rnd() * 0.45;
          lx.fillStyle = warm ? `rgba(255,${185 + Math.floor(rnd() * 45)},${105 + Math.floor(rnd() * 45)},${a})` : `rgba(170,200,255,${a})`;
          lx.fillRect(wx, wy, 5, 7);
        }
      }
    }
  }
  // trees in front: clustered blobs
  for (let tx = -20; tx < W + 20; tx += 26 + rnd() * 30) {
    const r = 22 + rnd() * 26;
    const ty = H - r * 0.6 - rnd() * 18;
    sx.beginPath();
    sx.arc(tx, ty, r, 0, Math.PI * 2);
    sx.arc(tx + r * 0.7, ty + 8, r * 0.8, 0, Math.PI * 2);
    sx.fill();
  }
  sx.fillRect(0, H - 30, W, 30);
  // stars, only in the lights layer
  for (let i = 0; i < 34; i++) {
    const a = 0.3 + rnd() * 0.6;
    lx.fillStyle = `rgba(255,255,255,${a})`;
    const sxp = rnd() * W;
    const syp = rnd() * H * 0.38;
    const d = rnd() > 0.9 ? 2 : 1.2;
    lx.fillRect(sxp, syp, d, d);
  }
  return { skyline: tex(s), lights: tex(l) };
}

/** Two prints for the right wall: a system diagram in blueprint, and mid-century shapes in the room's colours. */
export function posterTexture(kind: 'diagram' | 'shapes'): THREE.CanvasTexture {
  const [c, ctx] = canvas(300, 400);
  if (kind === 'diagram') {
    ctx.fillStyle = '#1f3b63';
    ctx.fillRect(0, 0, 300, 400);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let k = 0; k < 400; k += 20) {
      ctx.beginPath();
      ctx.moveTo(0, k);
      ctx.lineTo(300, k);
      ctx.moveTo(k, 0);
      ctx.lineTo(k, 400);
      ctx.stroke();
    }
    ctx.strokeStyle = '#e8eef7';
    ctx.lineWidth = 3;
    const boxes: [number, number, number, number][] = [
      [110, 40, 80, 44],
      [30, 150, 80, 44],
      [190, 150, 80, 44],
      [110, 260, 80, 44],
      [30, 330, 70, 36],
      [200, 330, 70, 36],
    ];
    for (const [x, y, w, h] of boxes) ctx.strokeRect(x, y, w, h);
    const line = (x0: number, y0: number, x1: number, y1: number) => {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    };
    line(150, 84, 70, 150);
    line(150, 84, 230, 150);
    line(70, 194, 150, 260);
    line(230, 194, 150, 260);
    line(150, 304, 65, 330);
    line(150, 304, 235, 330);
    ctx.fillStyle = '#f2a65a';
    for (const [x, y] of [
      [150, 84],
      [70, 194],
      [230, 194],
      [150, 304],
    ]) {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = '#efe7da';
    ctx.fillRect(0, 0, 300, 400);
    ctx.fillStyle = '#2f6a3a';
    ctx.beginPath();
    ctx.arc(110, 150, 82, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2a65a';
    ctx.fillRect(130, 170, 120, 150);
    ctx.fillStyle = '#17181b';
    ctx.beginPath();
    ctx.moveTo(40, 340);
    ctx.lineTo(140, 230);
    ctx.lineTo(240, 340);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c05a3a';
    ctx.beginPath();
    ctx.arc(230, 90, 30, 0, Math.PI * 2);
    ctx.fill();
  }
  return tex(c);
}

/** A soft dark footprint for baked-looking contact shadow: a rounded rect (or a disc) blurred to clear, black in alpha. */
export function aoTexture(kind: 'rect' | 'disc' | 'edge'): THREE.CanvasTexture {
  const size = 256;
  const [c, ctx] = canvas(size, size);
  if (kind === 'edge') {
    // dark along the top edge (the wall's foot), clear by the bottom
    const g = ctx.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.25, 'rgba(0,0,0,0.45)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  } else if (kind === 'disc') {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.45, 'rgba(0,0,0,0.7)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  } else {
    // the shadow of a rect drawn off-canvas, so only its blur lands on it (works in every browser)
    ctx.shadowColor = 'rgba(0,0,0,1)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = size * 2;
    ctx.fillStyle = '#000';
    const m = 42;
    ctx.beginPath();
    ctx.roundRect(m - size * 2, m, size - 2 * m, size - 2 * m, 24);
    ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  return t;
}

/** A small photo for a polaroid on the string of lights: a place in a few flat colours. */
export function photoTexture(kind: number): THREE.CanvasTexture {
  const [c, ctx] = canvas(64, 64);
  const scenes: [string, string, string][] = [
    ['#9fc3e6', '#3c7a4a', '#f4f1e8'],
    ['#f2a65a', '#c05a3a', '#2c2b2e'],
    ['#7fb3c9', '#2f6a8a', '#e9e1d2'],
    ['#d6c7a1', '#6b4a7a', '#f3efe6'],
  ];
  const [sky, land, sun] = scenes[kind % scenes.length];
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(44, 20, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = land;
  ctx.beginPath();
  ctx.moveTo(0, 64);
  ctx.lineTo(0, 40);
  ctx.quadraticCurveTo(20, 28 + kind * 3, 36, 42);
  ctx.quadraticCurveTo(50, 50, 64, 38);
  ctx.lineTo(64, 64);
  ctx.closePath();
  ctx.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
