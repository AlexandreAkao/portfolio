import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';
import { cvUrls, email } from '@data/social';

/**
 * What a hero shows if its island fails: the name, the role and both ways to
 * act, in the active world's tokens and without any of its motion.
 */
export default function HeroFallback() {
  const locale = useLocale();
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6">
      <h1 className="font-heading text-5xl font-bold text-text">{t('hero.name', locale)}</h1>
      <p className="mt-4 text-xl text-text-secondary">{t('hero.title', locale)}</p>
      <div className="mt-8 flex flex-wrap gap-4 text-sm font-medium">
        <a href={cvUrls[locale]} download className="rounded-btn border border-accent px-5 py-3 text-text">
          {t('hero.cta.cv', locale)}
        </a>
        <a href={`mailto:${email}`} className="rounded-btn border border-border px-5 py-3 text-text">
          {t('social.email', locale)}
        </a>
      </div>
    </div>
  );
}
