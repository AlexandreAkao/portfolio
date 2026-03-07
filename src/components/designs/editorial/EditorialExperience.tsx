import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import type { Experience } from '@data/experience';
import { useLocale } from '@i18n/useLocale';

interface Props {
  experiences: Experience[];
}

function ExperienceEntry({ exp, index }: { exp: Experience; index: number }) {
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const allEntries = exp.subEntries ?? [exp];
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
        {/* Left column: period + number */}
        <div>
          <span
            className="mb-2 block text-[clamp(3rem,5vw,4.5rem)] font-bold leading-none text-text/[0.06]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {num}
          </span>
          <p className="text-sm text-text-secondary">{exp.period}</p>
        </div>

        {/* Right column: content */}
        <div>
          <h3
            className="mb-1 text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-text"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {exp.company}
          </h3>
          <p className="mb-3 text-base font-medium text-accent">
            {exp.role[locale]}
          </p>

          {exp.summary[locale] && (
            <p className="mb-4 max-w-xl text-sm leading-relaxed text-text-secondary">
              {exp.summary[locale]}
            </p>
          )}

          {allEntries.map((entry, i) => (
            <div
              key={i}
              className={exp.subEntries ? 'mt-6 border-l-2 border-accent/30 pl-4' : ''}
            >
              {exp.subEntries && (
                <>
                  <p className="text-xs text-text-secondary">{entry.period}</p>
                  <p
                    className="text-lg font-semibold text-text"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {entry.company.replace('AmbevTech - ', '')}
                  </p>
                  <p className="mb-1 text-sm font-medium text-accent">
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
                    <li key={j} className="text-sm text-text-secondary">
                      <span className="mr-2 text-accent">&mdash;</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}

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
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function EditorialExperience({ experiences }: Props) {
  return (
    <div className="space-y-12">
      {experiences.map((exp, i) => (
        <ExperienceEntry key={i} exp={exp} index={i} />
      ))}
    </div>
  );
}
