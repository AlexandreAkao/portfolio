/**
 * Canvas-drawn textures for the diorama: the monstera leaf sprite (also used
 * by the screens' wallpaper), butcher-block wood, wall noise, the pink
 * monstera print on the wall; then the lived-in detail: the carpet, the
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

/**
 * Butcher block, as in the reference photo: strips of uneven width glued side by side, each a
 * slightly different warm tone that drifts along its length, a quiet grain, the odd end joint.
 * `veneer` is the finer, calmer board for the speakers, shelves and small pieces.
 */
export function woodTexture(variant: 'block' | 'veneer' = 'block'): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  const block = variant === 'block';
  let seed = block ? 19 : 43;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const warm = new THREE.Color('#a0582a');
  const light = new THREE.Color('#c27a3e');
  const tone = new THREE.Color();
  let x = 0;
  let k = 0;
  while (x < c.width) {
    const w = Math.round((block ? 30 : 46) * (0.6 + rnd()));
    // a low drift across the board, then each strip's own small step in lightness
    const drift = 0.5 + 0.5 * Math.sin(k * 0.55 + rnd() * 0.8);
    tone.copy(warm).lerp(light, drift).multiplyScalar(1 + (rnd() - 0.5) * (block ? 0.16 : 0.08));
    const top = `#${tone.getHexString()}`;
    const bottom = `#${tone.clone().multiplyScalar(0.92 + rnd() * 0.12).getHexString()}`;
    const g = ctx.createLinearGradient(0, 0, 0, c.height);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, w, c.height);
    // grain: fine wavering lines along the strip
    const lines = block ? 7 : 5;
    for (let i = 0; i < lines; i++) {
      ctx.strokeStyle = `rgba(52,24,8,${(block ? 0.05 : 0.035) + rnd() * 0.04})`;
      ctx.lineWidth = 0.6 + rnd() * 1.4;
      const gx = x + rnd() * w;
      const bend = (rnd() - 0.5) * 6;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.bezierCurveTo(gx + bend, c.height * 0.33, gx - bend, c.height * 0.66, gx + bend * 0.5, c.height);
      ctx.stroke();
    }
    // the glue line, and in a block an end joint here and there along the strip
    ctx.fillStyle = `rgba(36,14,4,${block ? 0.22 : 0.1})`;
    ctx.fillRect(x + w - 1, 0, 1, c.height);
    if (block && rnd() > 0.55) {
      const y = rnd() * c.height;
      ctx.fillStyle = 'rgba(36,14,4,0.28)';
      ctx.fillRect(x, y, w - 1, 1.5);
    }
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

/**
 * Wall-to-wall carpet: a low charcoal pile with soft, broad shifts of tone and no seams, so the
 * floor reads as a material rather than an editor's grid. Tiles without wrapping edges.
 */
export function carpetTexture(): THREE.CanvasTexture {
  const size = 512;
  const [c, ctx] = canvas(size, size);
  const rnd = seeded(11);
  ctx.fillStyle = '#585b60';
  ctx.fillRect(0, 0, size, size);
  // broad mottling, drawn at every wrap offset so the tile repeats without an edge
  for (let i = 0; i < 26; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    const r = 40 + rnd() * 110;
    const light = rnd() > 0.5;
    for (const dx of [-size, 0, size]) {
      for (const dy of [-size, 0, size]) {
        const g = ctx.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
        g.addColorStop(0, light ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.05)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x + dx - r, y + dy - r, r * 2, r * 2);
      }
    }
  }
  // the pile: fine grain, a touch warmer in the highlights
  const img = ctx.getImageData(0, 0, size, size);
  for (let p = 0; p < img.data.length; p += 4) {
    const v = (rnd() - 0.5) * 18;
    img.data[p] += v + 1;
    img.data[p + 1] += v;
    img.data[p + 2] += v - 1;
  }
  ctx.putImageData(img, 0, 0);
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
  /** Someone in town turns a light on or off: one window flips, the texture re-uploads. */
  flicker: (rnd: number) => void;
} {
  const slots: { x: number; y: number; on: boolean; colour: string }[] = [];
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
        const warm = rnd() > 0.2;
        const a = 0.55 + rnd() * 0.45;
        const colour = warm ? `rgba(255,${185 + Math.floor(rnd() * 45)},${105 + Math.floor(rnd() * 45)},${a})` : `rgba(170,200,255,${a})`;
        const on = rnd() < awake;
        slots.push({ x: wx, y: wy, on, colour });
        if (on) {
          lx.fillStyle = colour;
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
  const lights = tex(l);
  const flicker = (r: number) => {
    const slot = slots[Math.floor(r * slots.length) % slots.length];
    if (!slot) return;
    slot.on = !slot.on;
    lx.fillStyle = slot.on ? slot.colour : '#000';
    lx.fillRect(slot.x, slot.y, 5, 7);
    lights.needsUpdate = true;
  };
  return { skyline: tex(s), lights, flicker };
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
