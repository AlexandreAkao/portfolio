import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

/* ------------------------------------------------------------------ */
/* Night Shift scene materials. They live inside the WebGL canvases    */
/* and their CSS fallbacks, never in UI chrome (Blue Spot is the one   */
/* colour that is also the world's UI accent).                         */
/* ------------------------------------------------------------------ */

export const ASPHALT = '#17191c';
export const CONCRETE = '#23262a';
export const TARMAC = '#30363d';
export const STEEL = '#3b4450';
export const BEAM = '#4a5563';
export const CARDBOARD = '#5b4b3a';
export const SAFETY_YELLOW = '#f5c400';
export const SODIUM = '#ff9a2e';
export const BLUE_SPOT = '#3f8cff';
export const PACKET_CORE = '#dbe9ff';

/** True while this world is the one on <html data-design>. */
export function useActiveDesign(id: string) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const read = () => setActive(document.documentElement.dataset.design === id);
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-design'] });
    return () => obs.disconnect();
  }, [id]);
  return active;
}

/**
 * Calls back once the scene has drawn two frames, so a canvas can stay
 * invisible until it holds a real picture instead of an uncleared buffer.
 */
export function FirstFrames({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current > 2) return;
    frames.current += 1;
    if (frames.current === 2) onReady();
  });
  return null;
}

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
