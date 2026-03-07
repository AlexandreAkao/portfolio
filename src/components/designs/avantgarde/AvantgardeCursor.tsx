import { useEffect, useRef, useState, useCallback } from 'react';

export default function AvantgardeCursor() {
  const [active, setActive] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const circlePos = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);
  const hoveringRef = useRef(false);

  const animate = useCallback(() => {
    const dot = dotRef.current;
    const circle = circleRef.current;
    if (!dot || !circle) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    // Dot follows mouse exactly
    dot.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y}px) translate(-50%, -50%)`;

    // Circle follows with lerp delay
    circlePos.current.x += (mouse.current.x - circlePos.current.x) * 0.15;
    circlePos.current.y += (mouse.current.y - circlePos.current.y) * 0.15;
    circle.style.transform = `translate(${circlePos.current.x}px, ${circlePos.current.y}px) translate(-50%, -50%)`;

    // Hover scale
    const isHovering = hoveringRef.current;
    dot.style.width = dot.style.height = isHovering ? '4px' : '8px';
    circle.style.width = circle.style.height = isHovering ? '48px' : '32px';

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
          transition: 'width 0.15s, height 0.15s',
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
          transition: 'width 0.2s, height 0.2s, opacity 0.2s',
        }}
      />
    </>
  );
}
