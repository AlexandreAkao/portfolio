import { useEffect, useRef, useState } from 'react';
import type { Experience } from '@data/experience';
import { useLocale } from '@i18n/useLocale';
import { t, type Locale } from '@i18n/utils';
import { withServerLocale } from '@i18n/withServerLocale';
import { ToggleGlyph } from './EnterGlyph';

interface Props {
  experiences: Experience[];
}

const isActive = (e: Experience) => e.period.en.endsWith('Present');
/** Each window was pressed by hand: its own patch of the surface and its own corners */
const pressed = (n: number) =>
  ({
    '--tx': `${(n * 137) % 320}px`,
    '--ty': `${(n * 211) % 320}px`,
    '--press': [
      '28px 14px 32px 12px / 14px 28px 12px 34px',
      '14px 30px 16px 26px / 28px 14px 32px 14px',
      '32px 18px 22px 12px / 16px 34px 20px 28px',
    ][n % 3],
  }) as React.CSSProperties;
/** "Seva / Appointally" -> "seva-appointally", the file the role is written in */
const fileName = (name: string) => `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.md`;

/**
 * One role as one editor window pressed in clay: three clay lights and the
 * role's file in the tab, the company large, role and run beneath, a role
 * still running marked Active. The result is set first; the bullets and the
 * stack open behind a keycap. Its commit sits on the branch coil at the left.
 */
function Window({ entry, locale, employer, n }: { entry: Experience; locale: Locale; employer?: string; n: number }) {
  const sub = !!employer;
  const [open, setOpen] = useState(false);
  const bullets = entry.bullets[locale];
  const hasDetails = bullets.length > 0 || entry.tech.length > 0;
  const Heading = sub ? 'h4' : 'h3';
  const name = sub ? entry.company.replace('AmbevTech - ', '') : entry.company;
  const active = isActive(entry);
  return (
    <article
      className={`clay-window${sub ? ' clay-window--sub' : ''}${active ? ' clay-window--active' : ''}`}
      style={pressed(n)}
      data-clay-window
    >
      <span className="clay-window__commit" aria-hidden="true" />
      <div className="clay-window__bar" aria-hidden="true">
        <span className="clay-window__lights">
          <i />
          <i />
          <i />
        </span>
        <span className="clay-window__tab">{fileName(name)}</span>
      </div>
      <div className="clay-window__body">
        <Heading className="clay-window__name">{name}</Heading>
        {employer && <p className="clay-window__employer">{employer}</p>}
        <p className="clay-window__meta">
          <span>{entry.role[locale]}</span>
          <span className="clay-window__period">{entry.period[locale]}</span>
          {active && <span className="clay-active">{t('clay.active', locale)}</span>}
        </p>
        {entry.impact && <p className="clay-window__impact">{entry.impact[locale]}</p>}
        {entry.summary[locale] && <p className="clay-window__sum">{entry.summary[locale]}</p>}
        {hasDetails && (
          <button type="button" className="clay-key clay-key--sm clay-key--white" aria-expanded={open} onClick={() => setOpen(!open)}>
            <ToggleGlyph open={open} />
            {open ? t('experience.collapse', locale) : t('experience.details', locale)}
          </button>
        )}
        {open && (
          <>
            {bullets.length > 0 && (
              <ul className="clay-window__bullets">
                {bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
            {entry.tech.length > 0 && (
              <ul className="clay-beads">
                {entry.tech.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </article>
  );
}

/**
 * The career as a git log rolled in clay: one branch coil runs down the left,
 * each role a commit on it with its window beside it, in the data's own order.
 * The roles still running come first; a role with sub-entries branches them
 * off under its window. Each window pops in on twos as it comes on screen.
 */
function ClayExperience({ experiences }: Props) {
  const locale = useLocale();
  const root = useRef<HTMLDivElement>(null);
  const firstPast = experiences.findIndex((e) => !isActive(e));
  const lead = experiences.slice(0, firstPast === -1 ? experiences.length : firstPast);
  const rest = experiences.slice(lead.length);

  useEffect(() => {
    const windows = root.current?.querySelectorAll<HTMLElement>('[data-clay-window]');
    if (!windows?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.in = '';
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.25 },
    );
    windows.forEach((w) => io.observe(w));
    return () => io.disconnect();
  }, []);

  return (
    <div className="clay-log" ref={root}>
      {lead.map((exp, i) => (
        <div key={exp.company} className="clay-log__entry">
          <Window entry={exp} locale={locale} n={i * 4} />
          {exp.subEntries && (
            <section aria-label={exp.company} className="clay-log__branch">
              <span className="clay-log__stem" aria-hidden="true" />
              {exp.subEntries.map((sub, j) => (
                <Window key={sub.company} entry={sub} locale={locale} employer={exp.company} n={i * 4 + j + 1} />
              ))}
            </section>
          )}
        </div>
      ))}
      {rest.map((exp, i) => (
        <div key={exp.company} className="clay-log__entry">
          <Window entry={exp} locale={locale} n={20 + i * 3} />
        </div>
      ))}
    </div>
  );
}

export default withServerLocale(ClayExperience);
