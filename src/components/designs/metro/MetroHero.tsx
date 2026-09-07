import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';
import SocialLinks from '@components/ui/SocialLinks';
import ErrorBoundary from '@components/ui/ErrorBoundary';

const MONO = "'Overpass Mono', monospace";
const EASE = [0.16, 1, 0.3, 1] as const;

/** Content column that clears the fixed rail on desktop and centres like the rest of the page. */
function Shell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div>
      <div className={`mx-auto max-w-6xl px-6 ${className}`}>{children}</div>
    </div>
  );
}

function Turnstile({ href, download, variant, children }: { href: string; download?: boolean; variant: 'primary' | 'secondary'; children: ReactNode }) {
  const primary = variant === 'primary';
  return (
    <a
      href={href}
      download={download}
      className="group inline-flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {/* Pivot post: the tripod turns a third of a rotation when the arm is pushed */}
      <span
        aria-hidden="true"
        className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full sm:h-11 sm:w-11 ${
          primary ? 'bg-accent text-white group-hover:bg-accent-hover' : 'border-2 border-text bg-bg text-text'
        } transition-colors`}
      >
        <span className="relative block h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-[120deg] group-focus-visible:rotate-[120deg]">
          {[0, 120, 240].map((deg) => (
            <span
              key={deg}
              className="absolute left-1/2 top-1/2 h-0.5 w-2 origin-left rounded-full bg-current"
              style={{ transform: `translateY(-50%) rotate(${deg}deg)` }}
            />
          ))}
          <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
        </span>
      </span>
      {/* Push arm: the label rides the arm and gives when pushed */}
      <span
        className={`-ml-2 flex h-10 items-center rounded-r-btn pl-4 pr-3 font-heading text-xs font-bold uppercase tracking-[0.04em] transition-[transform,background-color,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-focus-visible:translate-x-1 sm:h-11 sm:pl-5 sm:pr-5 sm:text-sm ${
          primary ? 'bg-accent text-white group-hover:bg-accent-hover' : 'border-2 border-l-0 border-text text-text group-hover:bg-text group-hover:text-bg'
        }`}
      >
        {children}
      </span>
    </a>
  );
}

function MetroHeroInner() {
  const locale = useLocale();
  const labels =
    locale === 'pt' ? { destination: 'Destino', route: 'Rota' } : { destination: 'Destination', route: 'Route' };

  return (
    <div className="flex min-h-screen flex-col justify-center py-16">
      {/* Platform sign: the name on the line's colour */}
      <div className="w-full bg-accent py-8 md:py-10">
        <Shell>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="font-heading text-[clamp(2.5rem,7vw,6rem)] font-black uppercase leading-[0.95] tracking-[-0.01em] text-white"
          >
            {t('hero.name', locale)}
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
            className="mt-5 h-px w-full origin-left bg-white/70"
          />
        </Shell>
      </div>

      {/* Timetable */}
      <Shell className="mt-10">
        <dl className="space-y-4 md:grid md:grid-cols-[9rem_1fr] md:gap-x-6 md:gap-y-6 md:space-y-0">
          <div className="md:contents">
          <motion.dt
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
            className="mr-3 inline align-baseline text-xs uppercase tracking-[0.12em] text-text-secondary md:mr-0 md:block md:pt-2"
            style={{ fontFamily: MONO }}
          >
            {labels.destination}
          </motion.dt>
          <motion.dd
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
            className="inline font-heading text-xl font-bold leading-tight text-text md:block md:text-2xl"
          >
            {t('hero.title', locale)}
          </motion.dd>
          </div>

          <div className="md:contents">
          <motion.dt
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
            className="mr-3 inline align-baseline text-xs uppercase tracking-[0.12em] text-text-secondary md:mr-0 md:block md:pt-1"
            style={{ fontFamily: MONO }}
          >
            {labels.route}
          </motion.dt>
          <motion.dd
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
            className="inline text-base leading-[1.6] text-text-secondary md:block md:max-w-xl md:text-lg"
          >
            {t('hero.tagline', locale)}
          </motion.dd>
          </div>
        </dl>

        {/* Turnstiles */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <Turnstile href="#projects" variant="primary">
            {t('hero.cta.work', locale)}
          </Turnstile>
          <Turnstile href="/resume/Alexandre_Akira_en_CV.pdf" download variant="secondary">
            {t('hero.cta.cv', locale)}
          </Turnstile>
        </motion.div>

        <SocialLinks delay={0.7} className="mt-8" />
      </Shell>
    </div>
  );
}

export default function MetroHero() {
  return (
    <ErrorBoundary>
      <MetroHeroInner />
    </ErrorBoundary>
  );
}
