/**
 * Dev tool, not shipped: paints the Clay surface tile (public/images/clay/clay-surface.webp)
 * on a seamless 512px canvas: fine grain, thumb presses, fingerprints, tool marks.
 * To regenerate: mount it client:only="react" on a temporary page, wait for
 * window.__tile, screenshot the canvas, encode with cwebp.
 */
import { useEffect, useRef } from 'react';
import { seeded } from '../clayTextures';

const S = 512;

/** Draw fn at (x, y) and at each wrap-around copy, so the tile has no seams. */
function wrap(x: number, y: number, r: number, fn: (x: number, y: number) => void) {
  for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
    const cx = x + ox;
    const cy = y + oy;
    if (cx + r < 0 || cx - r > S || cy + r < 0 || cy - r > S) continue;
    fn(cx, cy);
  }
}

export default function TileRender() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    const rnd = seeded(29);
    ctx.fillStyle = 'rgb(128,128,128)';
    ctx.fillRect(0, 0, S, S);
    // Fine grain of handled clay
    const img = ctx.getImageData(0, 0, S, S);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (rnd() - 0.5) * 18;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 128 + n;
    }
    ctx.putImageData(img, 0, 0);
    // Thumb presses: shallow dents lit from the top left (shadowed rim up-left, lit rim down-right)
    for (let k = 0; k < 9; k++) {
      const x = rnd() * S;
      const y = rnd() * S;
      const rx = 26 + rnd() * 26;
      const ry = rx * (0.6 + rnd() * 0.25);
      const rot = rnd() * Math.PI;
      wrap(x, y, rx + 4, (cx, cy) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.scale(1, ry / rx);
        const g = ctx.createRadialGradient(-rx * 0.25, -rx * 0.25, rx * 0.2, 0, 0, rx);
        g.addColorStop(0, 'rgba(0,0,0,0.16)');
        g.addColorStop(0.7, 'rgba(0,0,0,0.06)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, rx * 0.96, 0.1 * Math.PI, 0.75 * Math.PI);
        ctx.stroke();
        ctx.restore();
      });
    }
    // Fingerprints: loops of ridges, a groove and its lit lip, pressed where the animator held the clay
    for (let f = 0; f < 7; f++) {
      const x = rnd() * S;
      const y = rnd() * S;
      const rot = rnd() * Math.PI;
      const size = 34 + rnd() * 22;
      wrap(x, y, size + 6, (cx, cy) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        for (let r = 3; r < size; r += 3.6) {
          const start = rnd() * 0.5;
          const end = Math.PI * 2 - rnd() * 0.9;
          ctx.beginPath();
          ctx.ellipse(0, 0, r * 0.7, r, 0, start, end);
          ctx.strokeStyle = 'rgba(0,0,0,0.34)';
          ctx.lineWidth = 1.4;
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(0.9, 0.9, r * 0.7, r, 0, start, end);
          ctx.strokeStyle = 'rgba(255,255,255,0.24)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();
      });
    }
    // Tool marks: the flat of a modelling stick dragged across
    for (let s = 0; s < 8; s++) {
      const x = rnd() * S;
      const y = rnd() * S;
      const len = 60 + rnd() * 90;
      const a = rnd() * Math.PI;
      const bend = (rnd() - 0.5) * 40;
      wrap(x, y, len, (cx, cy) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(a);
        for (const [dy, col, w] of [[0, 'rgba(0,0,0,0.2)', 3], [3, 'rgba(255,255,255,0.18)', 2]] as const) {
          ctx.beginPath();
          ctx.moveTo(-len / 2, dy);
          ctx.quadraticCurveTo(0, dy + bend, len / 2, dy);
          ctx.strokeStyle = col;
          ctx.lineWidth = w;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
        ctx.restore();
      });
    }
    (window as unknown as { __tile: string }).__tile = c.toDataURL('image/png');
  }, []);
  return <canvas ref={ref} width={S} height={S} style={{ width: S, height: S }} />;
}
