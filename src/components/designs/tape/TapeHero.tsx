import { motion } from 'motion/react';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';
import CurrentCompanies from '@components/ui/CurrentCompanies';
import KeepWords from '@components/ui/KeepWords';
import DesignInvite from '@components/ui/DesignInvite';
import { cvUrl, email, socialLinks } from '@data/social';
import ErrorBoundary from '@components/ui/ErrorBoundary';
import HeroFallback from '@components/ui/HeroFallback';
import { withServerLocale } from '@i18n/withServerLocale';
import TapeStrip from './TapeStrip';
import { Flag } from './marks';

const ease = [0.16, 1, 0.3, 1] as const;

function TapeHeroInner() {
  const locale = useLocale();
  const socials = socialLinks.filter((s) => !s.url.startsWith('mailto:'));
  // The tape punches the name and the role, in real ASCII
  const punched = `${t('hero.name', 'en').toUpperCase()} . ${t('hero.title', 'en').toUpperCase()} . `;

  return (
    <div className="tape flex min-h-screen flex-col justify-center gap-8 pb-16 pt-24">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-[1.3fr_1fr] md:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="tape-win"
        >
          <h1 className="m-0 font-heading text-[clamp(3rem,8vw,6rem)] font-black uppercase leading-[0.88]">
            {t('hero.name', locale)}
          </h1>
          <p className="tape-caps mb-0 mt-3 text-[clamp(1.05rem,2.2vw,1.45rem)]">
            <KeepWords text={t('hero.title', locale)} />
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="self-center"
        >
          <p className="tape-caps m-0 text-[var(--text-secondary)]">
            <CurrentCompanies locale={locale} companyClassName="text-accent" />
          </p>
          <p className="tape-caps mt-6 flex flex-wrap gap-3">
            <a className="tape-key" href={`mailto:${email}`}>
              {t('social.email', locale)}
            </a>
            <a className="tape-key tape-key--out" href="#experience">
              {t('hero.cta.work', locale)}
            </a>
            <a className="tape-key tape-key--out" href={cvUrl} download>
              {t('hero.cta.cv', locale)}
            </a>
          </p>
          <p className="tape-caps mt-5 flex flex-wrap gap-x-5 gap-y-2">
            {socials.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="text-text underline decoration-accent decoration-2 underline-offset-4 hover:text-accent">
                {s.name}
              </a>
            ))}
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="m-0 max-w-[52ch] text-[1.25rem] text-[var(--text-secondary)] md:col-span-2"
        >
          {t('hero.tagline', locale)}
        </motion.p>
      </div>

      {/* The tape feeds in from the right and stops, already punched; the folded flag marks where the reader starts */}
      <div className="relative" aria-hidden="true">
        <div className="tape-band">
          <motion.div initial={{ x: '35%' }} animate={{ x: 0 }} transition={{ duration: 0.9, ease }}>
            <TapeStrip text={punched} columns={240} />
          </motion.div>
        </div>
        <motion.span
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.8, ease }}
          className="tape-hero__flag"
        >
          <Flag />
        </motion.span>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
        <DesignInvite world="tape" locale={locale} delay={0.5} className="tape-caps text-[0.9375rem]!" />
      </div>
    </div>
  );
}

function TapeHero() {
  return (
    <ErrorBoundary fallback={<HeroFallback />}>
      <TapeHeroInner />
    </ErrorBoundary>
  );
}

export default withServerLocale(TapeHero);
