import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';
import CurrentCompanies from '@components/ui/CurrentCompanies';
import KeepWords from '@components/ui/KeepWords';
import DesignInvite from '@components/ui/DesignInvite';
import { cvUrl, email, socialLinks } from '@data/social';
import ErrorBoundary from '@components/ui/ErrorBoundary';
import HeroFallback from '@components/ui/HeroFallback';
import { withServerLocale } from '@i18n/withServerLocale';
import { RFC_FILE } from './rfc';
import type { Locale } from '@i18n/utils';

interface Props {
  /** The draft's date (month and year of the build), formatted on the server */
  date: Record<Locale, string>;
}

/** The table of contents: section, its number, and the page its seam gives it. */
const toc = [
  { n: '1.', key: 'rfc.intro', href: '#about', page: 2 },
  { n: '2.', key: 'experience.title', href: '#experience', page: 3 },
  { n: '3.', key: 'education.title', href: '#education', page: 4 },
  { n: '4.', key: 'skills.title', href: '#skills', page: 5 },
  { n: '5.', key: 'projects.title', href: '#projects', page: 6 },
  { n: '6.', key: 'rfc.address', href: '#contact', page: 7 },
  { n: '7.', key: 'rfc.references', href: '#references', page: 8 },
];

/** The pager draws the first screen top to bottom, one block after another, like a terminal printing. */
function Line({ i, children, className = '', inline = false }: { i: number; children: ReactNode; className?: string; inline?: boolean }) {
  const Tag = inline ? motion.span : motion.div;
  return (
    <Tag
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.01, delay: 0.05 + i * 0.045 }}
      className={inline ? `block ${className}` : className}
    >
      {children}
    </Tag>
  );
}

function EngineerHeroInner({ date }: Props) {
  const locale = useLocale();
  const socials = socialLinks.filter((s) => !s.url.startsWith('mailto:'));

  return (
    <div className="px-6 pb-12 pt-14 md:pt-20">
      <div className="rfc-col">
        <Line i={0}>
          <p className="mb-10 text-text-secondary">
            <b className="text-text">$</b> less {RFC_FILE}
          </p>
        </Line>
        <Line i={1} className="flex justify-between gap-6 text-text-secondary">
          <p>
            {t('rfc.submission', locale)}
            <br />
            {t('rfc.draft', locale)}
            <br />
            {t('rfc.intended', locale)}
          </p>
          <p className="text-right">
            A. Akira
            <br />
            {date[locale]}
          </p>
        </Line>

        <h1 className="my-12 text-center font-bold md:my-14">
          <Line i={2} inline className="text-[clamp(2.1rem,6vw,3.4rem)] leading-[1.05] tracking-[-0.01em]">
            {t('hero.name', locale)}
          </Line>
          <Line i={3} inline className="mt-2.5 text-[clamp(1.05rem,2.4vw,1.35rem)] font-normal">
            <KeepWords text={t('hero.title', locale)} />
          </Line>
        </h1>

        <Line i={4}>
          <h2 className="rfc-h">{t('rfc.abstract', locale)}</h2>
          <p className="rfc-ind">{t('hero.tagline', locale)}</p>
        </Line>
        <Line i={5}>
          <h2 className="rfc-h">{t('rfc.memo', locale)}</h2>
          <p className="rfc-ind">
            <CurrentCompanies locale={locale} companyClassName="font-bold" />.
          </p>
        </Line>
        <Line i={6}>
          <p className="rfc-ind mt-4 flex flex-wrap items-baseline gap-x-[2.4ch] gap-y-2">
            <a className="rfc-key" href={`mailto:${email}`}>
              {t('social.email', locale)}
            </a>
            <a href={cvUrl} download>
              {t('hero.cta.cv', locale)}
            </a>
            {socials.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer">
                {s.name}
              </a>
            ))}
          </p>
          <DesignInvite world="engineer" locale={locale} className="rfc-ind text-[1em]!" />
        </Line>
        <Line i={7}>
          <h2 className="rfc-h">{t('rfc.toc', locale)}</h2>
          <nav aria-label={t('rfc.toc', locale)} className="rfc-ind">
            {toc.map((item) => (
              <a key={item.href} href={item.href} className="rfc-ldr">
                <span>
                  {item.n}&nbsp;&nbsp;{t(item.key, locale)}
                </span>
                <i aria-hidden="true" />
                <span>{item.page}</span>
              </a>
            ))}
          </nav>
        </Line>
      </div>
    </div>
  );
}

function EngineerHero(props: Props) {
  return (
    <ErrorBoundary fallback={<HeroFallback />}>
      <EngineerHeroInner {...props} />
    </ErrorBoundary>
  );
}

export default withServerLocale(EngineerHero);
