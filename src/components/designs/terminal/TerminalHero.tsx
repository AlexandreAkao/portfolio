import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useLocale } from '@i18n/useLocale';
import { t, type Locale } from '@i18n/utils';
import CurrentCompanies from '@components/ui/CurrentCompanies';
import KeepWords from '@components/ui/KeepWords';
import DesignInvite from '@components/ui/DesignInvite';
import { cvUrl, email, socialLinks } from '@data/social';
import ErrorBoundary from '@components/ui/ErrorBoundary';
import HeroFallback from '@components/ui/HeroFallback';
import { withServerLocale } from '@i18n/withServerLocale';

interface Props {
  /** "Last login" date, formatted on the server so hydration never disagrees with it */
  login: Record<Locale, string>;
}

/** The session the hero plays: four commands, each followed by its output, then a waiting prompt. */
const script = ['whoami', 'name', 'cat now.txt', 'now', 'echo $TAGLINE', 'tagline', 'ls ~/links', 'links', 'invite', 'prompt'] as const;
const commands: Partial<Record<(typeof script)[number], string>> = {
  whoami: 'whoami',
  'cat now.txt': 'cat now.txt',
  'echo $TAGLINE': 'echo $TAGLINE',
  'ls ~/links': 'ls ~/links',
};
const DONE = { step: script.length, chars: 0 };

function Prompt({ children, cursor = false, style }: { children?: ReactNode; cursor?: boolean; style?: CSSProperties }) {
  return (
    <p className="term-pl" style={style}>
      <span className="term-u">akira@portfolio</span>:<span className="term-w">~</span>$ <span className="term-cmd">{children}</span>
      {cursor && <span className="term-cursor" aria-hidden="true" />}
    </p>
  );
}

function TerminalHeroInner({ login }: Props) {
  const locale = useLocale();
  // The server renders the finished session (so it reads without JavaScript);
  // once hydrated, the session replays: each command types, then prints.
  const [pos, setPos] = useState(DONE);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let step = 0;
    let chars = 0;
    let timer: number;
    setPos({ step: 0, chars: 0 });
    const tick = () => {
      const cmd = commands[script[step]];
      if (step >= script.length - 1) return;
      if (cmd !== undefined && chars < cmd.length) {
        chars += 1;
        setPos({ step, chars });
        timer = window.setTimeout(tick, 26);
        return;
      }
      step += 1;
      chars = 0;
      setPos({ step, chars });
      timer = window.setTimeout(tick, cmd !== undefined ? 70 : 55);
    };
    const begin = () => {
      timer = window.setTimeout(tick, 120);
    };
    // Under a running intro curtain the session waits at its first prompt, so the
    // curtain lifts onto exactly the frame it ends on; typing starts after.
    const intro = document.documentElement.dataset.intro;
    if (intro === 'wait' || intro === 'play' || intro === 'reveal' || intro === 'quick') {
      document.addEventListener('site-intro:done', begin, { once: true });
    } else {
      begin();
    }
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('site-intro:done', begin);
    };
  }, []);

  // The intro curtain ends on that frame (the login line and an empty prompt) and
  // waits for it: once the replay has reset, the curtain can lift onto it.
  useEffect(() => {
    if (pos.step === 0 && pos.chars === 0) document.dispatchEvent(new CustomEvent('site-hero:ready', { detail: 'terminal' }));
  }, [pos]);

  const index = (id: (typeof script)[number]) => script.indexOf(id);
  const shown = (id: (typeof script)[number]): CSSProperties | undefined =>
    index(id) < pos.step || (commands[id] !== undefined && index(id) === pos.step) || (id === 'prompt' && pos.step >= index(id))
      ? undefined
      : { visibility: 'hidden' };
  const typed = (id: (typeof script)[number]) => {
    const cmd = commands[id] ?? '';
    return index(id) === pos.step ? cmd.slice(0, pos.chars) : cmd;
  };
  const typing = (id: (typeof script)[number]) => index(id) === pos.step;
  const socials = socialLinks.filter((s) => !s.url.startsWith('mailto:'));

  return (
    <div className="term mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-24">
      <p className="term-muted mb-5">
        {t('term.lastLogin', locale)}: {login[locale]} {t('term.on', locale)} ttys001
      </p>

      <Prompt style={shown('whoami')} cursor={typing('whoami')}>{typed('whoami')}</Prompt>
      <h1 style={shown('name')} className="mt-2 text-[clamp(2.4rem,7vw,4.6rem)] font-bold leading-none tracking-[-0.02em] text-[var(--bright)]">
        {t('hero.name', locale)}
      </h1>
      <p style={shown('name')} className="mt-2 text-[clamp(1.1rem,2.6vw,1.6rem)]">
        <KeepWords text={t('hero.title', locale)} />
      </p>

      <Prompt style={shown('cat now.txt')} cursor={typing('cat now.txt')}>{typed('cat now.txt')}</Prompt>
      <p style={shown('now')} className="term-out">
        <CurrentCompanies locale={locale} companyClassName="term-bright font-bold" />
      </p>

      <Prompt style={shown('echo $TAGLINE')} cursor={typing('echo $TAGLINE')}>{typed('echo $TAGLINE')}</Prompt>
      <p style={shown('tagline')} className="term-out">{t('hero.tagline', locale)}</p>

      <Prompt style={shown('ls ~/links')} cursor={typing('ls ~/links')}>{typed('ls ~/links')}</Prompt>
      <p style={shown('links')} className="term-out mt-1 flex flex-wrap items-center gap-x-[3ch] gap-y-3">
        <a className="term-btn" href={cvUrl} download aria-label={`cv.pdf, ${t('hero.cta.cv', locale)}`}>
          cv.pdf
        </a>
        <a className="term-btn term-btn--go" href={`mailto:${email}`}>
          email
        </a>
        <a className="term-btn" href="#experience" aria-label={t('hero.cta.work', locale)}>
          work/
        </a>
        {socials.map((s) => (
          <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer">
            {s.name.toLowerCase()}
          </a>
        ))}
      </p>
      <div style={shown('invite')}>
        <DesignInvite world="terminal" locale={locale} className="term-muted mt-3 text-[1em]!" />
      </div>
      <Prompt style={shown('prompt')} cursor />
    </div>
  );
}

function TerminalHero(props: Props) {
  return (
    <ErrorBoundary fallback={<HeroFallback />}>
      <TerminalHeroInner {...props} />
    </ErrorBoundary>
  );
}

export default withServerLocale(TerminalHero);
