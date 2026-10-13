import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';
import CurrentCompanies from '@components/ui/CurrentCompanies';
import KeepWords from '@components/ui/KeepWords';
import DesignInvite from '@components/ui/DesignInvite';
import { cvUrls, email, socialLinks } from '@data/social';
import ErrorBoundary from '@components/ui/ErrorBoundary';
import HeroFallback from '@components/ui/HeroFallback';
import { withServerLocale } from '@i18n/withServerLocale';
import EnterGlyph from './EnterGlyph';

// The set pulls in Three.js: it loads only once this hero is on screen
const ClaySet = lazy(() => import('./ClaySet'));

/**
 * The first screen. The copy stands left on the painted sweep, its actions
 * pressed as clay keycaps; the live Three.js set fills the rest: Akira has got
 * up from his desk to wave. A perf meter in the corner, like a dev overlay,
 * reads what the camera runs at: 12 FPS, 83 ms a frame. The copy pops in on twos
 * (clay.css) once the curtain has lifted.
 */
function ClayHeroInner() {
  const locale = useLocale();
  const socials = socialLinks.filter((s) => !s.url.startsWith('mailto:'));
  const stage = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(true);
  const [still, setStill] = useState(false);
  const [lite, setLite] = useState(false);
  const [wide, setWide] = useState(true);
  // The set is mounted only while Clay is the world on screen: switching away frees the WebGL context
  const [active, setActive] = useState(false);

  useEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setLite(window.matchMedia('(max-width: 767px)').matches);
    // From 1024px the set stands behind the copy; below, it is its own block (clay.css)
    const wideQuery = window.matchMedia('(min-width: 1024px)');
    setWide(wideQuery.matches);
    const onWide = (e: MediaQueryListEvent) => setWide(e.matches);
    wideQuery.addEventListener('change', onWide);
    const html = document.documentElement;
    const onDesign = () => setActive(html.dataset.design === 'clay');
    onDesign();
    const designWatch = new MutationObserver(onDesign);
    designWatch.observe(html, { attributes: true, attributeFilter: ['data-design'] });
    setReady(true);
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    // Off screen, the camera stops rolling
    const io = new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting), { threshold: 0 });
    if (stage.current) io.observe(stage.current);
    return () => {
      window.removeEventListener('pointermove', onMove);
      wideQuery.removeEventListener('change', onWide);
      designWatch.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div className="clay-hero">
      <div className="clay-hero__stage" ref={stage} aria-hidden="true">
        {ready && active && (
          <ErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <ClaySet pointer={pointer} still={still} lite={lite} framing={wide ? 'side' : 'centre'} running={running} />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>

      <div className="clay-hero__copy mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="clay-hero__col">
          <h1 className="clay-name">{t('hero.name', locale)}</h1>
          <p className="clay-role">
            <KeepWords text={t('hero.title', locale)} />
          </p>
          <p className="clay-now">
            <CurrentCompanies locale={locale} companyClassName="font-bold" />
          </p>
          <p className="clay-tagline">{t('hero.tagline', locale)}</p>
          <p className="clay-actions">
            <a className="clay-key clay-key--pink clay-key--enter" href={`mailto:${email}`}>
              {t('social.email', locale)}
              <EnterGlyph />
            </a>
            <a className="clay-key clay-key--orange" href="#experience">
              {t('hero.cta.work', locale)}
            </a>
            <a className="clay-key clay-key--lilac" href={cvUrls[locale]} download>
              {t('hero.cta.cv', locale)}
            </a>
          </p>
          <p className="clay-socials">
            {socials.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer">
                {s.name}
              </a>
            ))}
          </p>
          <DesignInvite world="clay" locale={locale} className="clay-invite" />
        </div>
      </div>

      {!still && (
        <p className="clay-fps" aria-hidden="true">
          <span className="clay-fps__value">12 FPS</span>
          <span>83 ms</span>
        </p>
      )}
    </div>
  );
}

function ClayHero() {
  return (
    <ErrorBoundary fallback={<HeroFallback />}>
      <ClayHeroInner />
    </ErrorBoundary>
  );
}

export default withServerLocale(ClayHero);
