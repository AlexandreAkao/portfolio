import { useEffect, useRef, useState, useCallback } from 'react';
import ErrorBoundary from '@components/ui/ErrorBoundary';

/**
 * Avant-garde's cursor ring: a 32px lime ring that trails the native cursor on
 * fine pointers and grows to 48px over interactive elements. The native cursor
 * stays visible, so pointer size and contrast settings keep working.
 */
function AvantgardeCursorInner() {
  const [active, setActive] = useState(false);
  const circleRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const circlePos = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);
  const hoveringRef = useRef(false);
  // Hover grows the ring by scale, eased in the frame loop, so nothing re-lays out.
  const scale = useRef(1);

  const animate = useCallback(() => {
    const circle = circleRef.current;
    if (!circle) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    // Hover: the 32px ring grows to 48px
    scale.current += ((hoveringRef.current ? 1.5 : 1) - scale.current) * 0.2;

    // The ring follows with lerp delay
    circlePos.current.x += (mouse.current.x - circlePos.current.x) * 0.15;
    circlePos.current.y += (mouse.current.y - circlePos.current.y) * 0.15;
    circle.style.transform = `translate(${circlePos.current.x}px, ${circlePos.current.y}px) translate(-50%, -50%) scale(${scale.current})`;

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
      // If mouse already moved before becoming active, show the ring immediately
      if (mouse.current.x !== -100) {
        circlePos.current = { ...mouse.current };
        requestAnimationFrame(() => {
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
    <div
      ref={circleRef}
      aria-hidden="true"
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
  );
}

export default function AvantgardeCursor() {
  return (
    <ErrorBoundary>
      <AvantgardeCursorInner />
    </ErrorBoundary>
  );
}
