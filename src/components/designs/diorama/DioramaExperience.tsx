import { useState, useId } from 'react';
import type { Experience } from '@data/experience';
import { useLocale } from '@i18n/useLocale';
import { t, type Locale } from '@i18n/utils';
import { withServerLocale } from '@i18n/withServerLocale';
import { STATIONS, clockText, stationForCompany } from './day';

interface Props {
  experiences: Experience[];
}

const hourOf = (company: string) => STATIONS.find((s) => s.id === stationForCompany(company))!.hour;

/** AmbevTech's sub-entries stand as roles of their own, in the day's order: the camera's path fixes each hour, not the data's order. */
function flatten(experiences: Experience[]): { entry: Experience; employer?: string }[] {
  return experiences
    .flatMap((e) => (e.subEntries ? e.subEntries.map((s) => ({ entry: s, employer: e.company })) : [{ entry: e }]))
    .sort((a, b) => hourOf(a.entry.company) - hourOf(b.entry.company));
}

/** One role as one hour: the chapter markup of DioramaChapter.astro, the hour in the margin, the role beside it. */
function Hour({ entry, employer, locale }: { entry: Experience; employer?: string; locale: Locale }) {
  const id = stationForCompany(entry.company);
  const station = STATIONS.find((s) => s.id === id)!;
  const hour = clockText(station.hour);
  const [open, setOpen] = useState(false);
  const panel = useId();
  const bullets = entry.bullets[locale];
  const hasDetails = bullets.length > 0 || entry.tech.length > 0;
  const name = employer ? `${employer} · ${entry.company.replace('AmbevTech - ', '')}` : entry.company;
  return (
    <section className="dio-chapter dio-chapter--role" data-diorama-chapter={id} id={`dio-${id}`} data-diorama-hour={hour}>
      <div className="dio-card">
        {/* The hour in the page's margin on wide screens (the clock shows it on phones); the scene for assistive tech */}
        <p className="dio-hour">
          <time dateTime={hour}>{hour}</time> <span className="dio-hour__scene">{t(`diorama.scene.${id}`, locale)}</span>
        </p>
        <div className="dio-card__body">
          <h3 className="dio-card__title dio-role-name">{name}</h3>
          <p className="dio-role-line">
            {entry.role[locale]} <span>· {entry.period[locale]}</span>
          </p>
          {entry.impact && <p className="dio-impact">{entry.impact[locale]}</p>}
          {entry.summary[locale] && <p className="dio-summary">{entry.summary[locale]}</p>}
          {hasDetails && (
            <>
              <button type="button" className="dio-toggle" aria-expanded={open} aria-controls={panel} onClick={() => setOpen(!open)}>
                {open ? t('experience.collapse', locale) : t('experience.details', locale)}
              </button>
              <div id={panel} hidden={!open} className="dio-details">
                {bullets.length > 0 && (
                  <ul className="dio-bullets">
                    {bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
                {entry.tech.length > 0 && (
                  <ul className="dio-tags">
                    {entry.tech.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/** The career as six hours of the working day, each reached by the camera on its own object. */
function DioramaExperience({ experiences }: Props) {
  const locale = useLocale();
  return (
    <div className="dio-experience">
      {/* On wide screens the section's heading in the day's page; on phones the role cards speak alone */}
      <h2 className="dio-section-title">{t('experience.title', locale)}</h2>
      {flatten(experiences).map(({ entry, employer }) => (
        <Hour key={entry.company} entry={entry} employer={employer} locale={locale} />
      ))}
    </div>
  );
}

export default withServerLocale(DioramaExperience);
