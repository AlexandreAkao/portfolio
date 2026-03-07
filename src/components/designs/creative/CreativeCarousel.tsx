import { motion, useInView } from 'motion/react';
import { useRef, useState } from 'react';
import type { Experience } from '@data/experience';
import { useLocale } from '@i18n/useLocale';

interface Props {
  experiences: Experience[];
}

function flattenExperiences(experiences: Experience[]): Experience[] {
  const flat: Experience[] = [];
  for (const exp of experiences) {
    if (exp.subEntries) {
      flat.push(...exp.subEntries);
    } else {
      flat.push(exp);
    }
  }
  return flat;
}

export default function CreativeCarousel({ experiences }: Props) {
  const locale = useLocale();
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const flatExps = flattenExperiences(experiences);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
        {flatExps.map((exp, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              active === i
                ? 'bg-accent text-white shadow-lg'
                : 'border border-border text-text-secondary hover:border-accent'
            }`}
          >
            {exp.company.replace('AmbevTech - ', '')}
          </button>
        ))}
      </div>

      <motion.div
        key={active}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-card border border-border bg-card p-8 shadow-lg"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-text">{flatExps[active].company}</h3>
            <p className="text-lg text-accent">{flatExps[active].role[locale]}</p>
          </div>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-sm text-accent">
            {flatExps[active].period}
          </span>
        </div>

        <p className="mb-4 text-text-secondary">{flatExps[active].summary[locale]}</p>

        {flatExps[active].bullets[locale].length > 0 && (
          <ul className="mb-6 space-y-2">
            {flatExps[active].bullets[locale].map((bullet, j) => (
              <li key={j} className="flex items-start gap-2 text-text-secondary">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {bullet}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2">
          {flatExps[active].tech.map((t) => (
            <span
              key={t}
              className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
            >
              {t}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
