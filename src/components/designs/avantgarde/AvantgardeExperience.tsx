import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import type { Experience } from '@data/experience';
import { useLocale } from '@i18n/useLocale';

interface Props {
  experiences: Experience[];
}

function ExperienceCard({ exp, index }: { exp: Experience; index: number }) {
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const allEntries = exp.subEntries ?? [exp];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative overflow-hidden rounded-[var(--radius-card)] border-l-[3px] border-accent bg-card p-6 md:p-8"
    >
      {/* Year watermark */}
      <span className="pointer-events-none absolute right-4 top-0 select-none font-heading text-[120px] font-bold leading-none text-text/[0.04]">
        {exp.period.split(' ').pop()}
      </span>

      <div className="relative z-10">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-accent">
          {exp.period}
        </p>
        <h3 className="mb-1 font-heading text-xl font-bold text-text">
          {exp.company}
        </h3>
        <p className="mb-3 text-sm text-text-secondary">{exp.role[locale]}</p>

        {exp.summary[locale] && (
          <p className="mb-4 text-sm leading-relaxed text-text-secondary">
            {exp.summary[locale]}
          </p>
        )}

        {allEntries.map((entry, i) => (
          <div
            key={i}
            className={exp.subEntries ? 'mt-4 border-l border-border pl-4' : ''}
          >
            {exp.subEntries && (
              <>
                <p className="text-xs font-medium text-accent">{entry.period}</p>
                <p className="font-heading text-sm font-semibold text-text">
                  {entry.company.replace('AmbevTech - ', '')}
                </p>
                <p className="mb-1 text-xs text-text-secondary">
                  {entry.role[locale]}
                </p>
                <p className="mb-2 text-sm text-text-secondary">
                  {entry.summary[locale]}
                </p>
              </>
            )}

            {entry.bullets[locale].length > 0 && (
              <ul className="mt-2 space-y-1">
                {entry.bullets[locale].map((bullet, j) => (
                  <motion.li
                    key={j}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.3 + j * 0.05 }}
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
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.2, delay: 0.4 + j * 0.03 }}
                  className="rounded-[var(--radius-btn)] border border-border bg-bg-secondary px-2 py-0.5 text-xs text-text-secondary"
                >
                  {techItem}
                </motion.span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function AvantgardeExperience({ experiences }: Props) {
  return (
    <div className="space-y-6">
      {experiences.map((exp, i) => (
        <ExperienceCard key={i} exp={exp} index={i} />
      ))}
    </div>
  );
}
