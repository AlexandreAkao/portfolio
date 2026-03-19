import { motion } from 'motion/react';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';
import SocialLinks from '@components/ui/SocialLinks';
import ErrorBoundary from '@components/ui/ErrorBoundary';

function ArcadeHeroInner() {
  const locale = useLocale();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-4 text-lg text-text-secondary"
      >
        {t('hero.greeting', locale)}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-2 font-heading text-5xl uppercase text-text md:text-7xl"
      >
        {t('hero.name', locale)}
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6 font-heading text-2xl uppercase text-accent md:text-4xl"
      >
        {t('hero.title', locale)}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-8 max-w-xl text-lg text-text-secondary"
      >
        {t('hero.tagline', locale)}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-wrap gap-4"
      >
        <a
          href="#projects"
          className="rounded-btn border-2 border-accent bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#0f0d0e] transition-colors hover:bg-accent-hover"
        >
          {t('hero.cta.work', locale)}
        </a>
        <a
          href="/resume/Alexandre_Akira_en_CV.pdf"
          download
          className="rounded-btn border-2 border-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-accent transition-colors hover:bg-accent/10"
        >
          {t('hero.cta.cv', locale)}
        </a>
      </motion.div>

      <SocialLinks delay={0.8} className="mt-8 justify-center" />
    </div>
  );
}

export default function ArcadeHero() {
  return (
    <ErrorBoundary>
      <ArcadeHeroInner />
    </ErrorBoundary>
  );
}
