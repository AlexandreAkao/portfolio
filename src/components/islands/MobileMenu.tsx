import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';

interface Props {
  isBlog?: boolean;
}

const sectionLinks = [
  { key: 'nav.about', href: '#about' },
  { key: 'nav.experience', href: '#experience' },
  { key: 'nav.skills', href: '#skills' },
  { key: 'nav.projects', href: '#projects' },
  { key: 'nav.contact', href: '#contact' },
];

const blogLinks = [{ key: 'nav.home', href: '/' }];

export default function MobileMenu({ isBlog = false }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const locale = useLocale();

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => setOpen(false), []);

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

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [close]);

  const links = isBlog ? blogLinks : sectionLinks;

  return (
    <div className="md:hidden">
      {/* Hamburger / X button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative z-60 flex h-8 w-8 flex-col items-center justify-center gap-1.5"
        aria-label={open ? 'Close menu' : 'Open menu'}
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
                onClick={close}
                aria-hidden="true"
              />

              {/* Slide-in panel */}
              <motion.nav
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed right-0 top-0 z-50 flex h-full w-64 flex-col bg-bg border-l border-border shadow-xl"
                aria-label="Mobile navigation"
              >
                <div className="flex flex-col gap-1 px-6 pt-20">
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
                    href="/blog"
                    onClick={close}
                    className="rounded-lg px-3 py-3 text-base font-medium text-text-secondary transition-colors hover:bg-accent/10 hover:text-accent"
                  >
                    {t('nav.blog', locale)}
                  </a>
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
