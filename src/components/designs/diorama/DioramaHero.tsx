import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';
import CurrentCompanies from '@components/ui/CurrentCompanies';
import KeepWords from '@components/ui/KeepWords';
import DesignInvite from '@components/ui/DesignInvite';
import { cvUrls, email, socialLinks } from '@data/social';
import ErrorBoundary from '@components/ui/ErrorBoundary';
import HeroFallback from '@components/ui/HeroFallback';
import { withServerLocale } from '@i18n/withServerLocale';
import { STATIONS, clockText } from './day';
import { registerLabel } from './scene/labels';

// The stage pulls in Three.js: it loads only while Diorama is the world on screen
const Stage = lazy(() => import('./scene/Stage'));

/** The hours the day's navigation offers: every station with an object to pin a label on. */
const DAY = STATIONS.filter((s) => s.label);
const STILL = '/images/diorama/room-0800.webp';

/** WebGL2 or nothing: a probe context, released at once. */
function webglAvailable() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

/** Rendered by the stage's error boundary: the still stays and the day nav becomes a list. */
function StageFailed({ onFail }: { onFail: () => void }) {
  useEffect(onFail, [onFail]);
  return null;
}

/**
 * 08:00, the first hour of the day and the first chapter. The copy stands left
 * (below the band on phones); the room fills the stage behind it, fixed for the
 * whole page. Until the live room has drawn its first frames, and whenever
 * WebGL is missing or fails, an in-house still of this hour stands in. The day's
 * navigation is one list of links the stage pins over their objects; the clock
 * is decoration that the stage keeps on the hour.
 */
function DioramaHeroInner() {
  const locale = useLocale();
  const socials = socialLinks.filter((s) => !s.url.startsWith('mailto:'));
  const clock = useRef<HTMLParagraphElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  // The stage is mounted only while Diorama is the world on screen: switching away frees the WebGL context
  const [active, setActive] = useState(false);
  const activeNow = useRef(false);
  const [webgl, setWebgl] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const [lite, setLite] = useState(false);
  const [still, setStill] = useState(false);

  const onDrawn = useCallback(() => setDrawn(true), []);
  const fail = useCallback(() => {
    setWebgl(false);
    setDrawn(false);
  }, []);

  useEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setLite(window.matchMedia('(max-width: 767px)').matches);
    setWebgl(webglAvailable());
    const html = document.documentElement;
    const onDesign = () => {
      activeNow.current = html.dataset.design === 'diorama';
      setActive(activeNow.current);
      if (!activeNow.current) setDrawn(false);
    };
    onDesign();
    const designWatch = new MutationObserver(onDesign);
    designWatch.observe(html, {
      attributes: true,
      attributeFilter: ['data-design'],
    });
    // A context lost while the room is on screen hands the stage back to the still
    const el = stage.current;
    const onLost = () => {
      if (activeNow.current) fail();
    };
    el?.addEventListener('webglcontextlost', onLost, true);
    setReady(true);
    return () => {
      designWatch.disconnect();
      el?.removeEventListener('webglcontextlost', onLost, true);
    };
  }, [fail]);

  const live = ready && active && webgl;
  const mode = !ready ? 'pending' : webgl ? 'pinned' : 'list';

  return (
    <div className="dio-hero" data-diorama-chapter="arrival" id="dio-arrival" data-diorama-hour="08:00">
      <div className="dio-stage" ref={stage} aria-hidden="true">
        <img className="dio-still" src={STILL} alt="" width={1600} height={1000} loading="lazy" decoding="async" data-gone={drawn ? '' : undefined} />
        {live && (
          <ErrorBoundary fallback={<StageFailed onFail={fail} />}>
            <Suspense fallback={null}>
              <Stage lite={lite} still={still} onReady={onDrawn} clock={clock} locale={locale} />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>

      <div className="dio-hero__inner">
        <div className="dio-hero__copy">
          <p className="dio-kicker">
            <time dateTime="08:00">08:00</time> · {t('diorama.scene.arrival', locale)}
          </p>
          <h1 className="dio-name">{t('hero.name', locale)}</h1>
          <p className="dio-role">
            <KeepWords text={t('hero.title', locale)} />
          </p>
          <p className="dio-now">
            <CurrentCompanies locale={locale} companyClassName="dio-now__company" />
          </p>
          {/* The actions before the tagline: on a 320x568 phone they must clear the fold under the band */}
          <p className="dio-actions">
            <a className="dio-btn dio-btn--lamp" href={`mailto:${email}`}>
              {t('social.email', locale)}
            </a>
            <a className="dio-btn" href="#experience">
              {t('hero.cta.work', locale)}
            </a>
            <a className="dio-btn" href={cvUrls[locale]} download>
              {t('hero.cta.cv', locale)}
            </a>
          </p>
          <p className="dio-tagline">{t('hero.tagline', locale)}</p>
          <p className="dio-socials">
            {socials.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer">
                {s.name}
              </a>
            ))}
          </p>
          <DesignInvite world="diorama" locale={locale} className="dio-invite" />
        </div>
      </div>

      {/* After the copy: keyboard and screen-reader users meet the name and the actions first, then the day */}
      <p className="dio-clock" ref={clock} aria-hidden="true">
        08:00
      </p>

      <nav className="dio-day" aria-label={t('diorama.day', locale)} data-mode={mode}>
        <ol>
          {DAY.map((s) => (
            <li key={s.id}>
              <a href={`#dio-${s.id}`} ref={(el) => registerLabel(s.id, el)}>
                <time dateTime={clockText(s.hour)}>{clockText(s.hour)}</time>{' '}
                <span className="dio-day__name">{t(`diorama.scene.${s.id}`, locale)}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

function DioramaHero() {
  return (
    <ErrorBoundary fallback={<HeroFallback />}>
      <DioramaHeroInner />
    </ErrorBoundary>
  );
}

export default withServerLocale(DioramaHero);
