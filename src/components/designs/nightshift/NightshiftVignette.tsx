import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { hasWebGL, useActiveDesign } from './scene';
import type { VignetteKind } from './NightshiftVignetteScene';

const Scene = lazy(() => import('./NightshiftVignetteScene'));

interface Props {
  kind: VignetteKind;
  className?: string;
}

/**
 * A bay for one manifest vignette. The WebGL scene mounts only while this
 * world is active and the bay is near the viewport, and unmounts when it
 * scrolls away, so a page of six models never holds six live contexts.
 */
export default function NightshiftVignette({ kind, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const active = useActiveDesign('nightshift');

  useEffect(() => {
    setWebgl(hasWebGL());
  }, []);

  // Without WebGL there is no object to show, so there is no bay either: the
  // manifest reads as text rather than beside a dead box.
  if (webgl === false) return null;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: '200px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const show = near && active && webgl;

  return (
    <div ref={ref} className={`relative overflow-hidden border border-border bg-bg ${className}`} aria-hidden="true">
      {show ? (
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <Scene kind={kind} />
          </Suspense>
        </div>
      ) : null}
    </div>
  );
}
