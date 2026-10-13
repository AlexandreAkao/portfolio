import { motion } from 'motion/react';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';
import SocialLinks from '@components/ui/SocialLinks';
import CurrentCompanies from '@components/ui/CurrentCompanies';
import KeepWords from '@components/ui/KeepWords';
import DesignInvite from '@components/ui/DesignInvite';
import { cvUrls } from '@data/social';
import ErrorBoundary from '@components/ui/ErrorBoundary';
import HeroFallback from '@components/ui/HeroFallback';
import { withServerLocale } from '@i18n/withServerLocale';

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
        className="mb-2 font-heading text-2xl uppercase text-accent md:mb-3 md:text-4xl"
      >
        <KeepWords text={t('hero.title', locale)} />
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-4 text-base text-text-secondary md:mb-6"
      >
        <CurrentCompanies locale={locale} companyClassName="font-semibold text-text" />
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-6 max-w-xl text-base text-text-secondary md:mb-8 md:text-lg"
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
          href="#experience"
          className="rounded-btn border-2 border-accent bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#0f0d0e] transition-colors hover:bg-accent-hover"
        >
          {t('hero.cta.work', locale)}
        </a>
        <a
          href={cvUrls[locale]}
          download
          className="rounded-btn border-2 border-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-accent transition-colors hover:bg-accent/10"
        >
          {t('hero.cta.cv', locale)}
        </a>
      </motion.div>

      <SocialLinks delay={0.8} className="mt-8 justify-center" />
      <DesignInvite world="arcade" locale={locale} delay={1.0} className="mt-6" />
    </div>
  );
}

function ArcadeHero() {
  return (
    <ErrorBoundary fallback={<HeroFallback />}>
      <ArcadeHeroInner />
    </ErrorBoundary>
  );
}

export default withServerLocale(ArcadeHero);
