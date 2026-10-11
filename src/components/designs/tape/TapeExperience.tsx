import { useState } from 'react';
import type { Experience } from '@data/experience';
import { useLocale } from '@i18n/useLocale';
import { t, type Locale } from '@i18n/utils';
import { withServerLocale } from '@i18n/withServerLocale';
import { Cross } from './marks';

interface Props {
  experiences: Experience[];
}

const isActive = (e: Experience) => e.period.en.endsWith('Present');

/** One role in a punched window: period and state on its edge, the result, details hung on pins. */
function RoleWindow({ entry, locale, sub = false }: { entry: Experience; locale: Locale; sub?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const bullets = entry.bullets[locale];
  const hasDetails = bullets.length > 0 || entry.tech.length > 0;
  const active = isActive(entry);
  const Heading = sub ? 'h4' : 'h3';
  return (
    <article className="tape-win">
      <div className="tape-win__head tape-caps">
        <span>{entry.period[locale]}</span>
        <span className="tape-mark" data-active={active || undefined}>
          {active ? t('tape.active', locale) : (
            <>
              <Cross className="mr-1.5 inline-block align-[-1px]" />
              {t('tape.done', locale)}
            </>
          )}
        </span>
      </div>
      <Heading>{sub ? entry.company.replace('AmbevTech - ', '') : entry.company}</Heading>
      <p className="tape-role tape-caps">{entry.role[locale]}</p>
      {entry.summary[locale] && <p className="tape-sum">{entry.summary[locale]}</p>}
      {entry.impact && <p className="tape-res">{'=> '}{entry.impact[locale]}</p>}
      {hasDetails && (
        <button type="button" className="tape-tog" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? `[-] ${t('experience.collapse', locale)}` : `[+] ${t('experience.details', locale)}`}
        </button>
      )}
      {expanded && (
        <>
          {bullets.length > 0 && (
            <ul className="tape-pins">
              {bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
          {entry.tech.length > 0 && (
            <ul className="tape-tags tape-caps">
              {entry.tech.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </article>
  );
}

/** Every role as a window; AmbevTech's projects hang under its own tape label. */
function TapeExperience({ experiences }: Props) {
  const locale = useLocale();
  return (
    <div className="grid gap-4">
      {experiences.map((exp) =>
        exp.subEntries ? (
          <section key={exp.company} aria-label={exp.company} className="grid gap-3">
            <p className="tape-caps m-0 mt-4 flex flex-wrap items-baseline gap-x-4">
              <span className="bg-accent px-2 py-0.5 text-on-accent">{exp.company}</span>
              <span className="text-[var(--text-secondary)]">
                {exp.role[locale]} · {exp.period[locale]}
              </span>
            </p>
            <p className="m-0 max-w-[62ch] text-[var(--text-secondary)]">{exp.summary[locale]}</p>
            <div className="grid gap-3 sm:pl-6">
              {exp.subEntries.map((sub) => (
                <RoleWindow key={sub.company} entry={sub} locale={locale} sub />
              ))}
            </div>
          </section>
        ) : (
          <RoleWindow key={exp.company} entry={exp} locale={locale} />
        ),
      )}
    </div>
  );
}

export default withServerLocale(TapeExperience);
