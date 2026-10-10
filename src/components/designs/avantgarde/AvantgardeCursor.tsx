import { useEffect, useRef, useState, useCallback } from 'react';
import ErrorBoundary from '@components/ui/ErrorBoundary';

function AvantgardeCursorInner() {
  const [active, setActive] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const circlePos = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);
  const hoveringRef = useRef(false);
  // Hover grows the ring and shrinks the dot by scale, eased in the frame loop, so nothing re-lays out.
  const scale = useRef({ dot: 1, circle: 1 });

  const animate = useCallback(() => {
    const dot = dotRef.current;
    const circle = circleRef.current;
    if (!dot || !circle) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    // Hover: the 8px dot shrinks to 4px and the 32px ring grows to 48px
    const isHovering = hoveringRef.current;
    scale.current.dot += ((isHovering ? 0.5 : 1) - scale.current.dot) * 0.25;
    scale.current.circle += ((isHovering ? 1.5 : 1) - scale.current.circle) * 0.2;

    // Dot follows mouse exactly
    dot.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y}px) translate(-50%, -50%) scale(${scale.current.dot})`;

    // Circle follows with lerp delay
    circlePos.current.x += (mouse.current.x - circlePos.current.x) * 0.15;
    circlePos.current.y += (mouse.current.y - circlePos.current.y) * 0.15;
    circle.style.transform = `translate(${circlePos.current.x}px, ${circlePos.current.y}px) translate(-50%, -50%) scale(${scale.current.circle})`;

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const syncVisibility = () => {
      setActive(document.documentElement.dataset.design === 'avantgarde');
    };
    syncVisibility();

    let hasMoved = false;

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!hasMoved) {
        hasMoved = true;
        circlePos.current = { x: e.clientX, y: e.clientY };
        if (dotRef.current) dotRef.current.style.opacity = '1';
        if (circleRef.current) circleRef.current.style.opacity = '1';
      }
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], input, textarea, select, canvas')) {
        hoveringRef.current = true;
      }
    };

    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], input, textarea, select, canvas')) {
        hoveringRef.current = false;
      }
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);

    const observer = new MutationObserver(syncVisibility);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-design'],
    });

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (active) {
      // If mouse already moved before becoming active, show cursor immediately
      if (mouse.current.x !== -100) {
        circlePos.current = { ...mouse.current };
        requestAnimationFrame(() => {
          if (dotRef.current) dotRef.current.style.opacity = '1';
          if (circleRef.current) circleRef.current.style.opacity = '1';
        });
      }
      rafRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, animate]);

  if (!active) return null;

  return (
    <>
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: 'var(--accent)',
          pointerEvents: 'none',
          zIndex: 10000,
          opacity: 0,
        }}
      />
      <div
        ref={circleRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1px solid var(--accent)',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 10000,
          transition: 'opacity 0.2s',
        }}
      />
    </>
  );
}

export default function AvantgardeCursor() {
  return (
    <ErrorBoundary>
      <AvantgardeCursorInner />
    </ErrorBoundary>
  );
}
