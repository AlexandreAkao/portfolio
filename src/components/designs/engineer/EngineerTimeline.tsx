import { motion, useInView } from 'motion/react';
import { useRef, useState } from 'react';
import type { Experience } from '@data/experience';
import { useLocale } from '@i18n/useLocale';
import { t, type Locale } from '@i18n/utils';
import { withServerLocale } from '@i18n/withServerLocale';

interface Props {
  experiences: Experience[];
}

/** One role's result, always shown, and its details (bullets and stack) behind a toggle of its own. */
function EntryDetails({ entry, locale }: { entry: Experience; locale: Locale }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = entry.bullets[locale].length > 0 || entry.tech.length > 0;

  return (
    <>
      {entry.impact && (
        <p className="mt-2 font-mono text-sm text-text">
          <span className="text-accent">{'=> '}</span>
          {entry.impact[locale]}
        </p>
      )}

      {hasDetails && (
        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="mt-2 font-mono text-xs text-accent hover:underline"
        >
          {expanded ? `[-] ${t('experience.collapse', locale)}` : `[+] ${t('experience.details', locale)}`}
        </button>
      )}

      {expanded && (
        <>
          {entry.bullets[locale].length > 0 && (
            <ul className="mt-2 max-w-prose space-y-1">
              {entry.bullets[locale].map((bullet, j) => (
                <li key={j} className="text-sm text-text-secondary">
                  <span className="text-accent">{'>'}</span> {bullet}
                </li>
              ))}
            </ul>
          )}

          {entry.tech.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {entry.tech.map((tech) => (
                <span key={tech} className="rounded-xs border border-border px-2 py-0.5 font-mono text-xs text-text-secondary">
                  {tech}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

function TimelineEntry({ exp, index }: { exp: Experience; index: number }) {
  const locale = useLocale();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const allEntries = exp.subEntries ? exp.subEntries : [exp];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative pl-8"
    >
      <div className="absolute left-0 top-2 h-3 w-3 rounded-full border-2 border-accent bg-bg" />
      <div className="absolute left-1.25 top-5 h-full w-px bg-border" />

      <div className="pb-8">
        <p className="font-mono text-xs text-accent">{exp.period[locale]}</p>
        <h3 className="font-mono text-lg font-bold text-text">{exp.company}</h3>
        <p className="font-mono text-sm text-text-secondary">{exp.role[locale]}</p>
        {exp.summary[locale] && (
          <p className="mt-2 max-w-prose text-sm text-text-secondary">{exp.summary[locale]}</p>
        )}

        {allEntries.map((entry, i) => (
          <div key={i} className={exp.subEntries ? 'mt-4 border-l border-border pl-4' : 'mt-2'}>
            {exp.subEntries && (
              <>
                <p className="font-mono text-xs text-accent">{entry.period[locale]}</p>
                <p className="font-mono text-sm font-semibold text-text">{entry.company.replace('AmbevTech - ', '')}</p>
                <p className="text-xs text-text-secondary">{entry.role[locale]}</p>
                <p className="mt-1 max-w-prose text-sm text-text-secondary">{entry.summary[locale]}</p>
              </>
            )}

            <EntryDetails entry={entry} locale={locale} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function EngineerTimeline({ experiences }: Props) {
  return (
    <div className="relative">
      {experiences.map((exp, i) => (
        <TimelineEntry key={i} exp={exp} index={i} />
      ))}
    </div>
  );
}

export default withServerLocale(EngineerTimeline);
