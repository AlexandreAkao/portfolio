import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';
import SocialLinks from '@components/ui/SocialLinks';
import CurrentCompanies from '@components/ui/CurrentCompanies';
import KeepWords from '@components/ui/KeepWords';
import DesignInvite from '@components/ui/DesignInvite';
import { cvUrl } from '@data/social';
import ErrorBoundary from '@components/ui/ErrorBoundary';

function EditorialHeroInner() {
  const locale = useLocale();
  const name = t('hero.name', locale);
  const title = t('hero.title', locale);
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const nameY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const subtitleY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  const words = name.split(' ');

  return (
    <div ref={ref} className="relative flex min-h-screen items-center overflow-hidden">
      {/* Watermark number */}
      <span className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 select-none text-[clamp(10rem,25vw,18rem)] font-bold leading-none text-text/4 hidden sm:block md:right-12"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        01
      </span>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 md:px-12">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-3 text-sm uppercase tracking-[0.3em] text-text-secondary sm:mb-6"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {t('hero.greeting', locale)}
        </motion.p>

        <motion.h1
          style={{ y: nameY, fontFamily: 'var(--font-heading)' }}
          className="mb-6 text-[clamp(2.5rem,14vw,9rem)] md:text-[clamp(2.5rem,10vw,9rem)] font-bold leading-[0.9] tracking-tight"
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.15 }}
              className="mr-[0.25em] inline-block text-text"
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.div style={{ y: subtitleY }}>
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="h-0.75 w-16 origin-left bg-accent md:w-24"
            />
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="text-lg text-text-secondary md:text-xl"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <KeepWords text={title} />
            </motion.h2>
          </div>
          {/* From 640px, indented to the role's first letter: the rule (w-16 / md:w-24) plus the 1rem gap */}
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-2 text-sm text-text-secondary sm:pl-20 md:pl-28 md:text-base"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <CurrentCompanies locale={locale} companyClassName="font-medium text-text" />
          </motion.p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-6 sm:mt-8 max-w-lg text-base leading-relaxed text-text-secondary"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {t('hero.tagline', locale)}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="mt-8 flex flex-wrap gap-4 sm:mt-10"
        >
          <a
            href="#projects"
            className="border-2 border-text px-5 py-3 text-sm font-semibold uppercase tracking-wider text-text transition-colors hover:border-accent hover:bg-accent hover:text-on-accent sm:px-8"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {t('hero.cta.work', locale)}
          </a>
          <a
            href={cvUrl}
            download
            className="border-2 border-accent px-5 py-3 text-sm font-semibold uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-on-accent sm:px-8"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {t('hero.cta.cv', locale)}
          </a>
        </motion.div>

        <SocialLinks delay={1.2} className="mt-8" />
        <DesignInvite world="editorial" locale={locale} delay={1.4} className="mt-6" />
      </div>
    </div>
  );
}

export default function EditorialHero() {
  return (
    <ErrorBoundary>
      <EditorialHeroInner />
    </ErrorBoundary>
  );
}
