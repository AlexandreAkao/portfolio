import { useState } from 'react';
import type { Experience } from '@data/experience';
import { useLocale } from '@i18n/useLocale';
import { t, type Locale } from '@i18n/utils';
import { withServerLocale } from '@i18n/withServerLocale';
import { Figures } from './rfc';

interface Props {
  experiences: Experience[];
}

const isActive = (e: Experience) => e.period.en.endsWith('Present');

/** One numbered entry: heading with its status, role and period, summary, the `=>` result, and its own details. */
function Entry({ entry, num, sub, locale }: { entry: Experience; num: string; sub?: boolean; locale: Locale }) {
  const [expanded, setExpanded] = useState(false);
  const bullets = entry.bullets[locale];
  const hasDetails = bullets.length > 0 || entry.tech.length > 0;
  const Heading = sub ? 'h4' : 'h3';
  const active = isActive(entry);

  return (
    <article className={sub ? 'rfc-sub' : undefined}>
      <Heading className="rfc-h">
        <span className="rfc-n">{num}</span>
        <span>{sub ? entry.company.replace('AmbevTech - ', '') : entry.company}</span>
        <span className="rfc-st" data-active={active || undefined}>
          {t('rfc.status', locale)}: {t(active ? 'rfc.active' : 'rfc.historic', locale)}
        </span>
      </Heading>
      <p className="rfc-by">
        {entry.role[locale]}, {entry.period[locale]}
      </p>
      {entry.summary[locale] && (
        <p className="rfc-ind">
          <Figures text={entry.summary[locale]} />
        </p>
      )}
      {entry.impact && (
        <p className="rfc-ind">
          <b>{'=> '}</b>
          <Figures text={entry.impact[locale]} />
        </p>
      )}
      {hasDetails && (
        <p className="rfc-ind">
          <button type="button" className="rfc-tog" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
            {expanded ? `[-] ${t('experience.collapse', locale)}` : `[+] ${t('experience.details', locale)}`}
          </button>
        </p>
      )}
      {expanded && (
        <>
          {bullets.length > 0 && (
            <ul className="rfc-ind rfc-bl">
              {bullets.map((b) => (
                <li key={b}>
                  <Figures text={b} />
                </li>
              ))}
            </ul>
          )}
          {entry.tech.length > 0 && (
            <p className="rfc-ind rfc-muted">
              {t('rfc.stack', locale)}: {entry.tech.join(', ')}.
            </p>
          )}
        </>
      )}
    </article>
  );
}

/** Section 2 of the draft: every role numbered, sub-roles one level deeper. */
function EngineerTimeline({ experiences }: Props) {
  const locale = useLocale();
  return (
    <div>
      {experiences.map((exp, i) => {
        const num = `2.${i + 1}.`;
        if (!exp.subEntries) return <Entry key={exp.company} entry={exp} num={num} locale={locale} />;
        return (
          <div key={exp.company}>
            <Entry entry={exp} num={num} locale={locale} />
            {exp.subEntries.map((s, j) => (
              <Entry key={s.company} entry={s} num={`${num}${j + 1}.`} sub locale={locale} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default withServerLocale(EngineerTimeline);
