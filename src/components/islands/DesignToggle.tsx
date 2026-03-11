import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { designs, designIds, defaultDesign } from '@data/designs';
import { safeGetItem, safeSetItem } from '@/lib/storage';
import ErrorBoundary from '@components/ui/ErrorBoundary';

const sortedDesigns = designs.sort((a, b) => a.order - b.order);
const designMap = Object.fromEntries(designs.map((d) => [d.id, d]));

function DesignToggleInner() {
  const [design, setDesign] = useState(defaultDesign);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = safeGetItem('design');
    if (stored && designIds.includes(stored)) setDesign(stored);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const switchDesign = (id: string) => {
    if (id === design) {
      setOpen(false);
      return;
    }

    const apply = () => {
      document.documentElement.dataset.design = id;
      safeSetItem('design', id);
      setDesign(id);
    };

    if (document.startViewTransition) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
    setOpen(false);
  };

  const config = designMap[design];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-border bg-bg-secondary px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
        aria-label={`Switch design (current: ${config?.label})`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="font-mono text-xs uppercase tracking-wider">
          {config?.icon} <span className="hidden lg:inline">{config?.label}</span>
        </span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            aria-label="Design options"
            className="absolute right-0 top-full z-50 mt-2 min-w-40 overflow-hidden rounded-lg border border-border bg-bg-secondary shadow-lg"
          >
            {sortedDesigns.map((d) => (
              <li key={d.id} role="option" aria-selected={d.id === design}>
                <button
                  onClick={() => switchDesign(d.id)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent/10 hover:text-accent ${
                    d.id === design ? 'text-accent' : 'text-text-secondary'
                  }`}
                >
                  <span className="w-6 font-mono text-xs">{d.icon}</span>
                  <span className="tracking-wide">{d.label}</span>
                  {d.id === design && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-auto">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DesignToggle() {
  return (
    <ErrorBoundary>
      <DesignToggleInner />
    </ErrorBoundary>
  );
}
