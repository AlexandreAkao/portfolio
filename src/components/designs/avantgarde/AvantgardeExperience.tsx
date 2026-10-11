import { useId, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import type { Experience } from '@data/experience';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';
import { withServerLocale } from '@i18n/withServerLocale';

interface Props {
  experiences: Experience[];
}

function ExperienceCard({ exp, index }: { exp: Experience; index: number }) {
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();

  const allEntries = exp.subEntries ?? [exp];
  const results = allEntries.filter((entry) => entry.impact);
  const hasDetails = allEntries.some((entry) => entry.bullets[locale].length > 0 || entry.tech.length > 0);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative overflow-hidden rounded-card border-l-[3px] border-accent bg-card p-6 md:p-8"
    >
      {/* Year watermark */}
      <span className="pointer-events-none absolute right-4 top-0 select-none font-heading text-[120px] font-bold leading-none text-text/4">
        {exp.period.en.match(/\d{4}/g)?.pop()}
      </span>

      <div className="relative z-10">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-accent">
          {exp.period[locale]}
        </p>
        <h3 className="mb-1 font-heading text-xl font-bold text-text">
          {exp.company}
        </h3>
        <p className="mb-3 text-sm text-text-secondary">{exp.role[locale]}</p>

        {exp.summary[locale] && (
          <p className="mb-4 max-w-prose text-sm leading-relaxed text-text-secondary">
            {exp.summary[locale]}
          </p>
        )}

        {/* The result stays on the card; the bullets and the stack wait behind "details" */}
        {results.length > 0 && (
          <ul className="max-w-prose space-y-2">
            {results.map((entry) => (
              <li key={entry.company} className="font-medium leading-snug text-text">
                {exp.subEntries && (
                  <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    {entry.company.replace('AmbevTech - ', '')}
                  </span>
                )}
                {entry.impact![locale]}
              </li>
            ))}
          </ul>
        )}

        {hasDetails && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls={detailsId}
            className="-mx-2 mt-2 inline-flex min-h-11 items-center px-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent transition-colors hover:text-accent-hover md:mt-4 md:min-h-0"
          >
            {t(expanded ? 'experience.collapse' : 'experience.details', locale)}
          </button>
        )}

        {expanded && (
          <div id={detailsId}>
            {allEntries.map((entry, i) => (
              <div
                key={i}
                className={exp.subEntries ? 'mt-4 border-l border-border pl-4' : 'mt-2'}
              >
                {exp.subEntries && (
                  <>
                    <p className="text-xs font-medium text-accent">{entry.period[locale]}</p>
                    <p className="font-heading text-sm font-semibold text-text">
                      {entry.company.replace('AmbevTech - ', '')}
                    </p>
                    <p className="mb-1 text-xs text-text-secondary">
                      {entry.role[locale]}
                    </p>
                    <p className="mb-2 max-w-prose text-sm text-text-secondary">
                      {entry.summary[locale]}
                    </p>
                  </>
                )}

                {entry.bullets[locale].length > 0 && (
                  <ul className="mt-2 max-w-prose space-y-1 text-sm">
                    {entry.bullets[locale].map((bullet, j) => (
                      <motion.li
                        key={j}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: j * 0.04 }}
                        className="text-sm text-text-secondary"
                      >
                        <span className="mr-2 text-accent">{'>'}</span>
                        {bullet}
                      </motion.li>
                    ))}
                  </ul>
                )}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {entry.tech.map((techItem, j) => (
                    <motion.span
                      key={techItem}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.1 + j * 0.02 }}
                      className="rounded-btn border border-border bg-bg-secondary px-2 py-0.5 text-xs text-text-secondary"
                    >
                      {techItem}
                    </motion.span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AvantgardeExperience({ experiences }: Props) {
  return (
    <div className="space-y-6">
      {experiences.map((exp, i) => (
        <ExperienceCard key={i} exp={exp} index={i} />
      ))}
    </div>
  );
}

export default withServerLocale(AvantgardeExperience);
