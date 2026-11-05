import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from '@i18n/useLocale';
import { t, type Locale } from '@i18n/utils';
import CurrentCompanies from '@components/ui/CurrentCompanies';
import KeepWords from '@components/ui/KeepWords';
import DesignInvite from '@components/ui/DesignInvite';
import { cvUrls, email, socialLinks } from '@data/social';
import ErrorBoundary from '@components/ui/ErrorBoundary';
import HeroFallback from '@components/ui/HeroFallback';
import { withServerLocale } from '@i18n/withServerLocale';
import { COMPANY_STATION, STATIONS, clockText, type StationId } from './day';
import { registerLabel } from './scene/labels';

// The stage pulls in Three.js: it mounts only while Diorama is the world on screen
const loadStage = () => import('./scene/Stage');
const Stage = lazy(loadStage);

/** The hours the day's navigation offers: every hour after this one, 09:00 to 22:00. */
const DAY = STATIONS.slice(1);
const STILL = '/images/diorama/room-0800.webp';
/** The still is cropped to the room, so it is laid in its box the way the live room is fitted: whole, centred. */
const STILL_SIZE = { width: 1200, height: 1219 };

/** What each hour holds, for the day's index: a section, or the company of a role. */
const SECTION: Partial<Record<StationId, string>> = {
  coffee: 'nav.about',
  study: 'nav.education',
  skills: 'nav.skills',
  projects: 'nav.projects',
  night: 'nav.contact',
};
const COMPANY = Object.fromEntries(Object.entries(COMPANY_STATION).map(([company, id]) => [id, company.replace(' - ', ' · ')])) as Partial<Record<StationId, string>>;
const holds = (id: StationId, locale: Locale) => {
  const key = SECTION[id];
  return key ? t(key, locale) : (COMPANY[id] ?? '');
};

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

function heroReady() {
  document.dispatchEvent(new CustomEvent('site-hero:ready', { detail: 'diorama' }));
}

/**
 * No live room to build: the page opens on the still, and the curtain need not wait for it.
 * The session remembers (SiteIntro reads it), so a later switch does not try again in the dark.
 */
function noArrival() {
  delete document.documentElement.dataset.dioIntro;
  delete document.documentElement.dataset.dioRoom;
  try {
    sessionStorage.setItem('dio-no-room', '1');
  } catch {
    // Storage out of reach already reads as "no room" in SiteIntro
  }
  heroReady();
}

// This module loads once the visitor touches the switcher (client:intro warms hidden heroes) or Diorama is on
// screen: the room's code starts then, so a first switch's arrival waits as little as it can
if (typeof window !== 'undefined' && webglAvailable()) void loadStage().catch(() => {});

/** Rendered by the stage's error boundary: the still stays and the day nav becomes a list. */
function StageFailed({ onFail }: { onFail: () => void }) {
  useEffect(onFail, [onFail]);
  return null;
}

/**
 * 08:00, the first hour of the day and the first chapter. Wide screens split the
 * page: the room stands in a fixed panel on the left, and the day is a paper page
 * on the right that scrolls like a planner, every hour in its margin. This hour
 * heads the page: the name, the actions, and the day's index (every hour after
 * this one, what it holds and its scene). On phones the room is a band under the
 * header for the whole page and the index becomes labels the stage pins over
 * their objects, one hour at a time. The live room and its clock fade in together
 * over the bare ground once it has drawn its first frames; an in-house still of
 * this hour stands in only when WebGL is missing or fails, or the room is very
 * late. The clock is decoration that the stage keeps on the hour.
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
  const webglNow = useRef(false);
  const [webgl, setWebgl] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const [lite, setLite] = useState(false);
  const [still, setStill] = useState(false);

  const onDrawn = useCallback(() => setDrawn(true), []);
  // The arrival's curtain holds until this hero says its room is on screen (see SiteIntro), once the page shows it too
  useEffect(() => {
    if (drawn) heroReady();
  }, [drawn]);
  const fail = useCallback(() => {
    webglNow.current = false;
    setWebgl(false);
    setDrawn(false);
    noArrival();
  }, []);

  useEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setLite(window.matchMedia('(max-width: 767px)').matches);
    webglNow.current = webglAvailable();
    setWebgl(webglNow.current);
    const html = document.documentElement;
    const onDesign = () => {
      activeNow.current = html.dataset.design === 'diorama';
      setActive(activeNow.current);
      if (!activeNow.current) setDrawn(false);
      else if (!webglNow.current) noArrival();
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
      <div className="dio-stage" ref={stage} aria-hidden="true" data-drawn={drawn ? '' : undefined}>
        <img className="dio-still" src={STILL} alt="" width={STILL_SIZE.width} height={STILL_SIZE.height} loading="lazy" decoding="async" data-gone={drawn ? '' : undefined} />
        {live && (
          <ErrorBoundary fallback={<StageFailed onFail={fail} />}>
            <Suspense fallback={null}>
              <Stage lite={lite} still={still} onReady={onDrawn} clock={clock} locale={locale} />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>

      <div className="dio-hero__inner">
        {/* The hour in the page's margin on wide screens (the clock shows it on phones); the scene for assistive tech */}
        <p className="dio-hour">
          <time dateTime="08:00">08:00</time> <span className="dio-hour__scene">{t('diorama.scene.arrival', locale)}</span>
        </p>
        <div className="dio-hero__copy">
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
        </div>

        {/* After the copy: keyboard and screen-reader users meet the name and the actions first, then the day */}
        <nav className="dio-day" aria-label={t('diorama.day', locale)} data-mode={mode}>
          <ol>
            {DAY.map((s) => (
              <li key={s.id}>
                <a href={`#dio-${s.id}`} ref={(el) => registerLabel(s.id, el)}>
                  <time dateTime={clockText(s.hour)}>{clockText(s.hour)}</time>{' '}
                  <span className="dio-day__what">{holds(s.id, locale)}</span>{' '}
                  <span className="dio-day__name">{t(`diorama.scene.${s.id}`, locale)}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="dio-hero__more">
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

      <p className="dio-clock" ref={clock} aria-hidden="true">
        08:00
      </p>
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
