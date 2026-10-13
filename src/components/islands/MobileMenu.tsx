import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';
import { cvUrls, email } from '@data/social';
import { withServerLocale } from '@i18n/withServerLocale';

interface Props {
  isBlog?: boolean;
}

const sectionLinks = [
  { key: 'nav.about', href: '#about' },
  { key: 'nav.experience', href: '#experience' },
  { key: 'nav.education', href: '#education' },
  { key: 'nav.skills', href: '#skills' },
  { key: 'nav.projects', href: '#projects' },
  { key: 'nav.contact', href: '#contact' },
];


function MobileMenu({ isBlog = false }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const locale = useLocale();

  useEffect(() => setMounted(true), []);

  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  // Dismissing without choosing a link hands focus back to the toggle.
  const dismiss = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // While open: Escape closes, and Tab cycles inside the panel instead of reaching the page behind it.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismiss();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = panelRef.current.querySelectorAll<HTMLElement>('a[href], button');
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, dismiss]);

  const homeLinks = [{ key: 'nav.home', href: locale === 'pt' ? '/pt/' : '/' }];
  const links = isBlog ? homeLinks : sectionLinks;

  return (
    <div className="md:hidden">
      {/* Hamburger / X button */}
      <button
        ref={toggleRef}
        onClick={() => setOpen(!open)}
        className="relative z-60 flex h-11 w-11 flex-col items-center justify-center gap-1.5"
        aria-label={t(open ? 'menu.close' : 'menu.open', locale)}
        aria-expanded={open}
      >
        <motion.span
          animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
          className="block h-0.5 w-5 bg-text"
        />
        <motion.span
          animate={open ? { opacity: 0 } : { opacity: 1 }}
          className="block h-0.5 w-5 bg-text"
        />
        <motion.span
          animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
          className="block h-0.5 w-5 bg-text"
        />
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black/50"
                onClick={dismiss}
                aria-hidden="true"
              />

              {/* Slide-in panel */}
              <motion.div
                ref={panelRef}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed right-0 top-0 z-50 flex h-full w-64 flex-col bg-bg border-l border-border shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-label={t('menu.label', locale)}
              >
                {/* The panel covers the header's toggle, so it carries its own close button */}
                <div className="flex justify-end px-3 pt-2.5">
                  <button
                    onClick={dismiss}
                    autoFocus
                    aria-label={t('menu.close', locale)}
                    className="flex h-11 w-11 items-center justify-center rounded-btn text-text transition-colors hover:bg-accent/10 hover:text-accent"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>

                <nav className="flex flex-col gap-1 px-6 pt-4">
                  {links.map((link) => (
                    <a
                      key={link.key}
                      href={link.href}
                      onClick={close}
                      className="rounded-lg px-3 py-3 text-base font-medium text-text-secondary transition-colors hover:bg-accent/10 hover:text-accent"
                    >
                      {t(link.key, locale)}
                    </a>
                  ))}

                  <span className="my-2 h-px bg-border" />

                  <a
                    href={locale === 'pt' ? '/pt/blog/' : '/blog/'}
                    onClick={close}
                    className="rounded-lg px-3 py-3 text-base font-medium text-text-secondary transition-colors hover:bg-accent/10 hover:text-accent"
                  >
                    {t('nav.blog', locale)}
                  </a>
                </nav>

                {/* The two ways to act on what the page showed: the CV and a direct email */}
                <div className="mt-auto flex flex-col gap-2 border-t border-border px-6 py-6">
                  <a
                    href={cvUrls[locale]}
                    download
                    className="rounded-btn border border-accent px-4 py-3 text-center text-sm font-semibold text-text transition-colors hover:bg-accent/10"
                  >
                    {t('hero.cta.cv', locale)}
                  </a>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-text-secondary transition-colors hover:bg-accent/10 hover:text-accent"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <span>
                      {email.split('@')[0]}
                      <wbr />@{email.split('@')[1]}
                    </span>
                  </a>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export default withServerLocale(MobileMenu);
