import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { designs, designIds, defaultDesign } from '@data/designs';
import { safeGetItem, safeSetItem } from '@/lib/storage';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';
import ErrorBoundary from '@components/ui/ErrorBoundary';
import { withServerLocale } from '@i18n/withServerLocale';

const sortedDesigns = designs.sort((a, b) => a.order - b.order);
const designMap = Object.fromEntries(designs.map((d) => [d.id, d]));

// A switch is likely once the switcher is touched; hidden worlds start loading
// their code now (see src/lib/client-intro.ts) so the switch hydrates fast.
function announceIntent() {
  document.dispatchEvent(new CustomEvent('site-design:intent'));
}

function DesignToggleInner() {
  const locale = useLocale();
  const [design, setDesign] = useState(defaultDesign);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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

  // Escape closes the list and hands focus back to the trigger.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const switchDesign = (id: string) => {
    if (id === design) {
      setOpen(false);
      return;
    }

    const apply = () => {
      document.documentElement.dataset.design = id;
      safeSetItem('design', id);
      setDesign(id);
      // Islands hydrated while their world was hidden measured a zero-size
      // layout; scroll-linked motion re-measures on resize, so announce one.
      window.dispatchEvent(new Event('resize'));
    };

    // The intro curtain stages the switch as the incoming world's exit gesture;
    // it declines under reduced motion or while another curtain is running.
    const curtain = window.siteIntro?.quickChange;
    if (curtain && curtain(id, apply)) {
      // covered and revealed by the curtain
    } else if (document.startViewTransition) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
    setOpen(false);
  };

  // The hero's invitation (DesignInvite) asks for a world by id; the switch itself stays here.
  const switchRef = useRef(switchDesign);
  switchRef.current = switchDesign;
  useEffect(() => {
    const onRequest = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (designIds.includes(id)) switchRef.current(id);
    };
    document.addEventListener('site-design:switch', onRequest);
    return () => document.removeEventListener('site-design:switch', onRequest);
  }, []);

  const config = designMap[design];

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        onClick={() => {
          setOpen(!open);
          announceIntent();
        }}
        onPointerEnter={announceIntent}
        onFocus={announceIntent}
        className="flex h-11 items-center gap-2 rounded-full border border-border bg-bg-secondary px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-accent md:h-auto"
        aria-label={`${t('design.switch', locale)} (${t('design.current', locale)}: ${config?.label})`}
        aria-expanded={open}
        aria-controls="design-options"
      >
        {/* The word says what the control does at every width; the world's glyph and name join it from lg */}
        <span className="font-mono text-xs uppercase tracking-wider">
          <span className="lg:hidden">{t('design.label', locale)}</span>
          <span className="hidden lg:inline">
            {config?.icon} {config?.label}
          </span>
        </span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="design-options"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-bg-secondary shadow-lg"
          >
            <p className="border-b border-border px-3 py-2 text-xs text-text-secondary">
              {t('design.intro', locale).replace('{n}', String(designIds.length))}
            </p>
            <ul aria-label={t('design.options', locale)}>
              {sortedDesigns.map((d) => (
                <li key={d.id}>
                  <button
                    onClick={() => switchDesign(d.id)}
                    aria-pressed={d.id === design}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent/10 hover:text-accent ${
                      d.id === design ? 'text-accent' : 'text-text-secondary'
                    }`}
                  >
                    <span className="w-6 font-mono text-xs" aria-hidden="true">{d.icon}</span>
                    <span className="tracking-wide">{d.label}</span>
                    {d.id === design && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-auto" aria-hidden="true">
                        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DesignToggle() {
  return (
    <ErrorBoundary>
      <DesignToggleInner />
    </ErrorBoundary>
  );
}

export default withServerLocale(DesignToggle);
