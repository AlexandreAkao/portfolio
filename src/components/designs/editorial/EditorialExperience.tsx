import { useId, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import type { Experience } from '@data/experience';
import { useLocale } from '@i18n/useLocale';
import { t, type Locale } from '@i18n/utils';
import { withServerLocale } from '@i18n/withServerLocale';

interface Props {
  experiences: Experience[];
}

/**
 * One role as a news item: its result is the lede, always in view; the bullets
 * and the stack sit behind "details", each role with its own toggle.
 */
function Story({ entry, locale, lede }: { entry: Experience; locale: Locale; lede: 'impact' | 'summary' }) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const hasDetails = entry.bullets[locale].length > 0 || entry.tech.length > 0;
  const leadText = lede === 'impact' && entry.impact ? entry.impact[locale] : entry.summary[locale];
  const context = lede === 'impact' && entry.impact ? entry.summary[locale] : null;

  return (
    <>
      {leadText && (
        <p className="max-w-[36rem] text-lg font-medium leading-snug text-text">{leadText}</p>
      )}
      {context && <p className="mt-2 max-w-[36rem] text-sm leading-relaxed text-text-secondary">{context}</p>}

      {hasDetails && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls={detailsId}
          className="mt-3 text-sm font-medium capitalize text-text underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent"
        >
          {t(expanded ? 'experience.collapse' : 'experience.details', locale)}
        </button>
      )}

      {expanded && (
        <div id={detailsId}>
          {entry.bullets[locale].length > 0 && (
            <ul className="mt-3 max-w-[36rem] space-y-1">
              {entry.bullets[locale].map((bullet, j) => (
                <li key={j} className="text-sm text-text-secondary">
                  <span aria-hidden="true" className="mr-2 text-accent">&mdash;</span>
                  {bullet}
                </li>
              ))}
            </ul>
          )}
          {entry.tech.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {entry.tech.map((techItem) => (
                <span
                  key={techItem}
                  className="border-b border-text-secondary/30 pb-0.5 text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
                >
                  {techItem}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function ExperienceEntry({ exp, index }: { exp: Experience; index: number }) {
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const num = String(index + 1).padStart(2, '0');

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative"
    >
      {/* Separator line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: index * 0.1 }}
        className="mb-8 h-px origin-left bg-border"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_2fr] md:gap-8">
        {/* Left column: number + dateline */}
        <div>
          <span
            className="mb-2 block text-[clamp(3rem,5vw,4.5rem)] font-bold leading-none text-text/6"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {num}
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary">{exp.period[locale]}</p>
        </div>

        {/* Right column: headline, role, lede */}
        <div>
          <h3
            className="mb-1 text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-text"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {exp.company}
          </h3>
          <p className="mb-4 text-base font-medium text-accent">{exp.role[locale]}</p>

          {exp.subEntries ? (
            <>
              {exp.summary[locale] && (
                <p className="max-w-[36rem] text-base leading-relaxed text-text-secondary">{exp.summary[locale]}</p>
              )}
              {exp.subEntries.map((entry) => (
                <div key={entry.company} className="mt-8 border-l border-border pl-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary">{entry.period[locale]}</p>
                  <p className="mt-1 text-xl font-bold text-text" style={{ fontFamily: 'var(--font-heading)' }}>
                    {entry.company.replace('AmbevTech - ', '')}
                  </p>
                  <p className="mb-3 text-sm font-medium text-accent">{entry.role[locale]}</p>
                  <Story entry={entry} locale={locale} lede="impact" />
                </div>
              ))}
            </>
          ) : (
            <Story entry={exp} locale={locale} lede="impact" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EditorialExperience({ experiences }: Props) {
  return (
    <div className="space-y-12">
      {experiences.map((exp, i) => (
        <ExperienceEntry key={i} exp={exp} index={i} />
      ))}
    </div>
  );
}

export default withServerLocale(EditorialExperience);
