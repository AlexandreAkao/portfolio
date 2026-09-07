import { useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import type { Experience } from '@data/experience';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';

interface Props {
  experiences: Experience[];
}

const MONO = "'Overpass Mono', monospace";
const EASE = [0.16, 1, 0.3, 1] as const;

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((bullet, i) => (
        <li
          key={i}
          className="relative pl-4 text-sm leading-relaxed text-text-secondary before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent"
        >
          {bullet}
        </li>
      ))}
    </ul>
  );
}

function Tech({ items }: { items: string[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className="rounded-btn border border-border px-2 py-0.5 text-xs text-text-secondary">
          {item}
        </span>
      ))}
    </div>
  );
}

function DetailsToggle({ expanded, onToggle, id }: { expanded: boolean; onToggle: () => void; id: string }) {
  const locale = useLocale();
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-controls={id}
      className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-accent transition-colors hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      style={{ fontFamily: MONO }}
    >
      <span
        aria-hidden="true"
        className={`block h-2 w-2 rounded-full border-2 border-accent transition-colors ${expanded ? 'bg-accent' : 'bg-white'}`}
      />
      {expanded ? t('experience.collapse', locale) : t('experience.details', locale)}
    </button>
  );
}

function Details({ id, expanded, bullets }: { id: string; expanded: boolean; bullets: string[] }) {
  return (
    <AnimatePresence initial={false}>
      {expanded && (
        <motion.div
          id={id}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="overflow-hidden"
        >
          <Bullets items={bullets} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stop({ exp, index }: { exp: Experience; index: number }) {
  const locale = useLocale();
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [expanded, setExpanded] = useState(false);
  const detailsId = `metro-exp-${index}`;
  const hasBullets = exp.bullets[locale].length > 0;

  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: EASE }}
      className="relative pb-12 pl-10 last:pb-0"
    >
      {/* Stop on the line */}
      <span aria-hidden="true" className="absolute left-[-5px] top-[0.35rem] h-3.5 w-3.5 rounded-full border-[3px] border-accent bg-white" />

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="font-heading text-2xl font-black uppercase leading-tight text-text">{exp.company}</h3>
        <span className="text-xs uppercase tracking-[0.12em] text-text-secondary" style={{ fontFamily: MONO }}>
          {exp.period}
        </span>
      </div>
      <p className="mt-1 font-bold text-accent">{exp.role[locale]}</p>
      {exp.summary[locale] && <p className="mt-2 text-text-secondary">{exp.summary[locale]}</p>}

      {exp.subEntries ? (
        <ul className="relative mt-6 space-y-8 pl-6">
          {/* Connector for the branch */}
          <span aria-hidden="true" className="absolute bottom-2 left-0 top-2 w-0.5 bg-accent/40" />
          {exp.subEntries.map((entry, j) => (
            <Connection key={j} entry={entry} id={`${detailsId}-${j}`} />
          ))}
        </ul>
      ) : (
        <>
          {hasBullets && <DetailsToggle expanded={expanded} onToggle={() => setExpanded((v) => !v)} id={detailsId} />}
          {hasBullets && <Details id={detailsId} expanded={expanded} bullets={exp.bullets[locale]} />}
          <Tech items={exp.tech} />
        </>
      )}
    </motion.li>
  );
}

function Connection({ entry, id }: { entry: Experience; id: string }) {
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const hasBullets = entry.bullets[locale].length > 0;

  return (
    <li className="relative">
      <span aria-hidden="true" className="absolute left-[-1.75rem] top-[0.3rem] h-2.5 w-2.5 rounded-full border-2 border-accent bg-white" />
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h4 className="font-heading text-lg font-black uppercase leading-tight text-text">
          {entry.company.replace('AmbevTech - ', '')}
        </h4>
        <span className="text-xs uppercase tracking-[0.12em] text-text-secondary" style={{ fontFamily: MONO }}>
          {entry.period}
        </span>
      </div>
      <p className="text-sm font-bold text-accent">{entry.role[locale]}</p>
      {entry.summary[locale] && <p className="mt-1.5 text-sm text-text-secondary">{entry.summary[locale]}</p>}
      {hasBullets && <DetailsToggle expanded={expanded} onToggle={() => setExpanded((v) => !v)} id={id} />}
      {hasBullets && <Details id={id} expanded={expanded} bullets={entry.bullets[locale]} />}
      <Tech items={entry.tech} />
    </li>
  );
}

export default function MetroExperience({ experiences }: Props) {
  return (
    <ol className="relative">
      {/* The line segment through this station's stops */}
      <span aria-hidden="true" className="absolute bottom-2 left-0 top-2 w-1 rounded-full bg-accent" />
      {experiences.map((exp, i) => (
        <Stop key={i} exp={exp} index={i} />
      ))}
    </ol>
  );
}
