import { motion, useInView } from 'motion/react';
import { useRef, useState } from 'react';
import type { Experience } from '@data/experience';
import { useLocale } from '@i18n/useLocale';

interface Props {
  experiences: Experience[];
}

const CARD_COLORS = ['#0ba95b', '#12b5e5', '#f38ba3', '#7b5ea7', '#ed203d', '#fcba28'];
const EMOJIS = ['🚀', '⚡', '💼', '🔥', '🎯', '💡'];

function ExperienceCard({ exp, index }: { exp: Experience; index: number }) {
  const locale = useLocale();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [expanded, setExpanded] = useState(false);
  const color = CARD_COLORS[index % CARD_COLORS.length];
  const emoji = EMOJIS[index % EMOJIS.length];

  const allEntries = exp.subEntries ? exp.subEntries : [exp];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="rounded-card p-6"
      style={{ backgroundColor: color }}
    >
      <div className="text-2xl">{emoji}</div>
      <p className="mt-2 text-xs font-bold uppercase tracking-wider opacity-70" style={{ color: '#0f0d0e' }}>
        {exp.period}
      </p>
      <h3 className="mt-1 font-heading text-lg uppercase" style={{ color: '#0f0d0e' }}>
        {exp.company}
      </h3>
      <p className="text-sm font-medium" style={{ color: '#0f0d0e' }}>
        {exp.role[locale]}
      </p>
      {exp.summary[locale] && (
        <p className="mt-2 text-sm opacity-80" style={{ color: '#0f0d0e' }}>
          {exp.summary[locale]}
        </p>
      )}

      {allEntries.some((e) => e.bullets[locale].length > 0) && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-xs font-bold uppercase tracking-wider underline"
          style={{ color: '#0f0d0e' }}
        >
          {expanded ? '▲ collapse' : '▼ details'}
        </button>
      )}

      {expanded &&
        allEntries.map((entry, i) => (
          <div key={i} className={exp.subEntries ? 'mt-3 border-l-2 border-[#0f0d0e]/20 pl-3' : 'mt-2'}>
            {exp.subEntries && (
              <>
                <p className="text-xs font-bold uppercase opacity-70" style={{ color: '#0f0d0e' }}>
                  {entry.period}
                </p>
                <p className="text-sm font-bold" style={{ color: '#0f0d0e' }}>
                  {entry.company.replace('AmbevTech - ', '')}
                </p>
                <p className="text-xs" style={{ color: '#0f0d0e' }}>{entry.role[locale]}</p>
              </>
            )}
            {entry.bullets[locale].length > 0 && (
              <ul className="mt-2 space-y-1">
                {entry.bullets[locale].map((bullet, j) => (
                  <li key={j} className="text-sm" style={{ color: '#0f0d0e' }}>
                    → {bullet}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-2 flex flex-wrap gap-1">
              {entry.tech.map((techName) => (
                <span
                  key={techName}
                  className="rounded-full bg-[#0f0d0e]/15 px-2 py-0.5 text-xs font-medium"
                  style={{ color: '#0f0d0e' }}
                >
                  {techName}
                </span>
              ))}
            </div>
          </div>
        ))}
    </motion.div>
  );
}

export default function ArcadeExperience({ experiences }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {experiences.map((exp, i) => (
        <ExperienceCard key={i} exp={exp} index={i} />
      ))}
    </div>
  );
}
