import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

type Design = 'engineer' | 'creative';

export default function DesignToggle() {
  const [design, setDesign] = useState<Design>('engineer');

  useEffect(() => {
    const stored = localStorage.getItem('design') as Design | null;
    if (stored) setDesign(stored);
  }, []);

  const toggle = () => {
    const next: Design = design === 'engineer' ? 'creative' : 'engineer';

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        document.documentElement.dataset.design = next;
        localStorage.setItem('design', next);
        setDesign(next);
      });
    } else {
      document.documentElement.dataset.design = next;
      localStorage.setItem('design', next);
      setDesign(next);
    }
  };

  return (
    <button
      onClick={toggle}
      className="relative flex items-center gap-2 rounded-full border border-border bg-bg-secondary px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
      aria-label={`Switch to ${design === 'engineer' ? 'creative' : 'engineer'} design`}
    >
      <motion.span
        key={design}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="font-mono text-xs uppercase tracking-wider"
      >
        {design === 'engineer' ? '{ } Engineer' : '~ Creative'}
      </motion.span>
    </button>
  );
}
