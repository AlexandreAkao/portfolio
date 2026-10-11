import { useState } from 'react';
import type { Experience } from '@data/experience';
import { useLocale } from '@i18n/useLocale';
import { t, type Locale } from '@i18n/utils';
import { withServerLocale } from '@i18n/withServerLocale';

interface Props {
  experiences: Experience[];
}

const isActive = (e: Experience) => e.period.en.endsWith('Present');

/** The role's result line, and its bullets and stack behind a toggle of its own. */
function Details({ entry, locale }: { entry: Experience; locale: Locale }) {
  const [expanded, setExpanded] = useState(false);
  const bullets = entry.bullets[locale];
  const hasDetails = bullets.length > 0 || entry.tech.length > 0;
  return (
    <>
      {entry.impact && (
        <p className="term-res">
          <span>{'=> '}</span>
          {entry.impact[locale]}
        </p>
      )}
      {hasDetails && (
        <button type="button" className="term-tog" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? `[-] ${t('experience.collapse', locale)}` : `[+] ${t('experience.details', locale)}`}
        </button>
      )}
      {expanded && (
        <>
          {bullets.length > 0 && (
            <ul className="term-bl">
              {bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
          {entry.tech.length > 0 && (
            <ul className="term-tags">
              {entry.tech.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}

/** `cat experience.log`: a job per entry, AmbevTech's projects printed as a tree. */
function TerminalExperience({ experiences }: Props) {
  const locale = useLocale();
  return (
    <div>
      {experiences.map((exp) => (
        <article key={exp.company} className="term-job">
          <h3 className="term-jh">
            <span className="term-per term-muted" data-active={isActive(exp) || undefined}>
              {exp.period[locale]}
            </span>
            <b>{exp.company}</b>
            <span className="font-normal">{exp.role[locale]}</span>
          </h3>
          {exp.summary[locale] && <p className="term-sum">{exp.summary[locale]}</p>}
          {!exp.subEntries && <Details entry={exp} locale={locale} />}
          {exp.subEntries && (
            <div className="term-tree">
              {exp.subEntries.map((sub, j, all) => {
                const last = j === all.length - 1;
                return (
                  <div key={sub.company}>
                    <h4 className="term-jh">
                      <span className="term-br" aria-hidden="true">
                        {last ? '└──' : '├──'}
                      </span>
                      <b>{sub.company.replace('AmbevTech - ', '')}</b>
                      <span className="term-per term-muted" data-active={isActive(sub) || undefined}>
                        {sub.period[locale]}
                      </span>
                    </h4>
                    <div className="term-leaf" data-last={last || undefined}>
                      <p className="term-sum">{sub.summary[locale]}</p>
                      <Details entry={sub} locale={locale} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

export default withServerLocale(TerminalExperience);
