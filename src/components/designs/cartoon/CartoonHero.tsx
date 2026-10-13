import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';
import CurrentCompanies from '@components/ui/CurrentCompanies';
import KeepWords from '@components/ui/KeepWords';
import DesignInvite from '@components/ui/DesignInvite';
import { cvUrls, email, socialLinks } from '@data/social';
import ErrorBoundary from '@components/ui/ErrorBoundary';
import HeroFallback from '@components/ui/HeroFallback';
import { withServerLocale } from '@i18n/withServerLocale';
import Caricature from './Caricature';
import Lettering from './Lettering';

/**
 * The title card. The name is lettered to fill its column, and Akira, standing
 * beside it, paints the role's band with a roller. The entrance is CSS
 * (cartoon.css): letters drop in on twos, the painter pops in, the band is
 * rolled on. It waits while the intro curtain is up and replays whenever the
 * world is switched on.
 */
function CartoonHeroInner() {
  const locale = useLocale();
  const socials = socialLinks.filter((s) => !s.url.startsWith('mailto:'));

  return (
    <div className="cartoon-hero">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* The name fills its column; the band runs to the roller; the painter stands beside both */}
        <div className="cartoon-title">
          <div className="cartoon-title__name">
            <h1 className="cartoon-name">
              <Lettering text={t('hero.name', locale)} lines />
            </h1>
          </div>
          <p className="cartoon-role">
            <span className="cartoon-stripe">
              <KeepWords text={t('hero.title', locale)} />
            </span>
          </p>
          <span className="cartoon-painter" data-cartoon-painter>
            <span className="cartoon-disc" aria-hidden="true" />
            <Caricature pose="roller" className="cartoon-painter__art" />
          </span>
        </div>

        <div className="cartoon-hero__rest">
          <p className="cartoon-now">
            <CurrentCompanies locale={locale} companyClassName="font-semibold" />
          </p>
          <p className="cartoon-tagline">{t('hero.tagline', locale)}</p>
          <p className="cartoon-actions">
            <a className="cartoon-ticket cartoon-ticket--fill" href={`mailto:${email}`}>
              {t('social.email', locale)}
            </a>
            <a className="cartoon-ticket" href="#experience">
              {t('hero.cta.work', locale)}
            </a>
            <a className="cartoon-ticket" href={cvUrls[locale]} download>
              {t('hero.cta.cv', locale)}
            </a>
          </p>
          <p className="cartoon-socials">
            {socials.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer">
                {s.name}
              </a>
            ))}
          </p>
          <DesignInvite world="cartoon" locale={locale} className="cartoon-invite" />
        </div>
      </div>
    </div>
  );
}

function CartoonHero() {
  return (
    <ErrorBoundary fallback={<HeroFallback />}>
      <CartoonHeroInner />
    </ErrorBoundary>
  );
}

export default withServerLocale(CartoonHero);
