import { useState } from 'react';
import type { Experience } from '@data/experience';
import { useLocale } from '@i18n/useLocale';
import { t, type Locale } from '@i18n/utils';
import { withServerLocale } from '@i18n/withServerLocale';

interface Props {
  experiences: Experience[];
}

const isActive = (e: Experience) => e.period.en.endsWith('Present');

/** One role as a screen credit: the company lettered, the role and run beneath, the result, details behind a ticket. */
function Credit({ entry, locale, employer }: { entry: Experience; locale: Locale; employer?: string }) {
  const sub = !!employer;
  const [open, setOpen] = useState(false);
  const bullets = entry.bullets[locale];
  const hasDetails = bullets.length > 0 || entry.tech.length > 0;
  const Heading = sub ? 'h4' : 'h3';
  const name = sub ? entry.company.replace('AmbevTech - ', '') : entry.company;
  return (
    <article className={sub ? 'cartoon-credit cartoon-credit--sub' : 'cartoon-credit'}>
      <Heading className="cartoon-credit__name">{name}</Heading>
      <p className="cartoon-credit__role cartoon-caps">
        {entry.role[locale]}
        {employer && <span className="block">{employer}</span>}
      </p>
      <p className="cartoon-credit__when">
        <span>{entry.period[locale]}</span>
        {isActive(entry) && <span className="cartoon-showing">{t('cartoon.showing', locale)}</span>}
      </p>
      {entry.impact && <p className="cartoon-credit__impact">{entry.impact[locale]}</p>}
      {entry.summary[locale] && <p className="cartoon-credit__sum">{entry.summary[locale]}</p>}
      {hasDetails && (
        <button type="button" className="cartoon-ticket cartoon-ticket--sm" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? `− ${t('experience.collapse', locale)}` : `+ ${t('experience.details', locale)}`}
        </button>
      )}
      {open && (
        <>
          {bullets.length > 0 && (
            <ul className="cartoon-credit__bullets">
              {bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
          {entry.tech.length > 0 && (
            <ul className="cartoon-tags">
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

/**
 * The career as the credits, in the data's own order. The roles still running
 * share one card, billed side by side with an ampersand, as co-stars are; the
 * projects of a role with sub-entries follow under its name, then the earlier roles.
 */
function CartoonExperience({ experiences }: Props) {
  const locale = useLocale();
  // The roles running now open the list; they are billed together
  const firstPast = experiences.findIndex((e) => !isActive(e));
  const lead = experiences.slice(0, firstPast === -1 ? experiences.length : firstPast);
  const rest = experiences.slice(lead.length);
  const groups = lead.filter((e) => e.subEntries);

  return (
    <div className="cartoon-credits">
      <div className="cartoon-pair">
        {lead.map((exp, i) => (
          <div key={exp.company} className="contents">
            {i > 0 && (
              <span className="cartoon-and" aria-hidden="true">
                &amp;
              </span>
            )}
            <Credit entry={exp} locale={locale} />
          </div>
        ))}
      </div>

      {groups.map((exp) => (
        <section key={exp.company} aria-label={exp.company} className="cartoon-group">
          <div className="cartoon-rule" aria-hidden="true" />
          <div className="cartoon-group__grid cartoon-group__grid--3">
            {exp.subEntries!.map((sub) => (
              <Credit key={sub.company} entry={sub} locale={locale} employer={exp.company} />
            ))}
          </div>
        </section>
      ))}

      {rest.length > 0 && (
        <div className="cartoon-group">
          <div className="cartoon-rule" aria-hidden="true" />
          <div className="cartoon-group__grid">
            {rest.map((exp) => (
              <Credit key={exp.company} entry={exp} locale={locale} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default withServerLocale(CartoonExperience);
